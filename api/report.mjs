// ============================================================================
//  POST /api/report: KineMech feedback, emailed to the maintainer
// ============================================================================
// The app's Send feedback dialog (src/report.js in the source repo) posts one
// JSON report here: a problem or a feature request, with the tool, version,
// browser and, optionally, the user's document as a file. This checks it and
// sends it on as one email through Resend's HTTP API. Nothing is stored.
//
// Set in Vercel, Project > Settings > Environment Variables:
//   RESEND_API_KEY  the Resend API key (re_...)
//   REPORT_TO       the address reports go to
//   REPORT_FROM     optional sender. Until a domain is verified with Resend,
//                   leave it unset: "KineMech <onboarding@resend.dev>" then
//                   delivers, but only to the Resend account's own address,
//                   so REPORT_TO must be that address. With kinemech.app
//                   verified, use e.g. "KineMech <feedback@kinemech.app>".
//
// The page posts to its own origin, which the site's CSP already allows
// (connect-src 'self'). The downloadable builds, opened as files, post to
// https://kinemech.app/api/report from origin "null", so CORS is open to any
// origin: the endpoint is public either way, and these checks are what keep
// it from becoming a way to send mail.
const MAX_BODY = 600_000;        // bytes; the app caps its attachment at 400 kB
const MAX_TEXT = 8000;
const MIN_TEXT = 10;
const TYPES = { problem: "Problem", feature: "Feature request" };
const TOOLS = new Set(["analyzer", "synthesizer", "profiler", "gears", "kinemech"]);
// a soft limit per warm instance. The free plans cap the rest without
// billing: Resend's stops sending at 100 emails a day, and Vercel's Hobby
// plan has a monthly allowance rather than charges.
const WINDOW_MS = 10 * 60 * 1000, PER_WINDOW = 5;
const seen = new Map();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};
const reply = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS },
});
const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");
const oneLine = (v, max) => str(v, max).replace(/[\r\n]+/g, " ").trim();

function tooMany(ip) {
  const now = Date.now();
  const list = (seen.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  seen.set(ip, list);
  if (seen.size > 5000) seen.clear();
  return list.length > PER_WINDOW;
}

// The checked report, or a reason it was refused.
export function check(body) {
  if (!body || typeof body !== "object" || body.kind !== "kinemech-feedback") return { error: "invalid", message: "This is not a KineMech report." };
  if (!TYPES[body.type]) return { error: "invalid", message: "Unknown kind of feedback." };
  const text = str(body.text, MAX_TEXT + 1).trim();
  if (text.length < MIN_TEXT) return { error: "invalid", message: "The description is too short." };
  if (text.length > MAX_TEXT) return { error: "invalid", message: "The description is too long." };
  const email = oneLine(body.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "invalid", message: "The reply address is not an email address." };
  const tool = TOOLS.has(body.tool) ? body.tool : "unknown";
  const a = body.attachment && typeof body.attachment === "object" ? body.attachment : null;
  const attachment = a && typeof a.json === "string" && a.json.length <= 450_000
    ? { name: oneLine(a.name, 80).replace(/[^\w.\-]+/g, "_") || "attachment.json", json: a.json } : null;
  return {
    ok: true, type: body.type, text, email, tool,
    toolName: oneLine(body.toolName, 40) || tool,
    context: body.context && typeof body.context === "object" ? body.context : {},
    version: oneLine(body.app?.version, 40), page: oneLine(body.app?.page, 200),
    env: body.env && typeof body.env === "object" ? body.env : {},
    errors: Array.isArray(body.errors) ? body.errors.slice(0, 3) : [],
    attachment, omitted: a && !attachment ? oneLine(a.omitted || "too large", 80) : null,
  };
}

// The email's subject and plain-text body: the same layout as the dialog's
// "Show everything that will be sent".
export function compose(r) {
  const first = r.text.split(/\r?\n/).find((l) => l.trim()) || "";
  const subject = `[KineMech ${TYPES[r.type]}] ${r.toolName}: ${first.length > 70 ? first.slice(0, 69) + "…" : first}`;
  const ctx = Object.entries(r.context).filter(([, v]) => v != null && v !== "").map(([k, v]) => `${oneLine(k, 30)} ${oneLine(String(v), 60)}`).join(", ");
  const e = r.env;
  const lines = [
    `Kind: ${TYPES[r.type]}`,
    `Tool: ${r.toolName}${ctx ? ` (${ctx})` : ""}`,
    `Version: ${r.version || "unknown"}`,
    `Page: ${r.page || "unknown"}`,
    `Browser: ${oneLine(e.userAgent, 300) || "unknown"}`,
    `Screen: ${oneLine(e.screen, 40) || "unknown"}, viewport ${oneLine(e.viewport, 40) || "unknown"}`,
    `Language: ${oneLine(e.language, 40) || "unknown"}`,
    `Time: ${oneLine(e.time, 40) || "unknown"}`,
    `Reply to: ${r.email || "none given"}`,
    "",
    r.type === "feature" ? "Request:" : "What happened:",
    r.text,
  ];
  if (r.errors.length) {
    lines.push("", "Errors:");
    for (const x of r.errors) lines.push(str(x?.message, 500), ...(x?.stack ? [str(x.stack, 4000)] : []));
  }
  lines.push("", `Attachment: ${r.attachment ? r.attachment.name : r.omitted ? `left out, ${r.omitted}` : "none"}`);
  return { subject, text: lines.join("\n") };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (request.method !== "POST") return reply(405, { ok: false, error: "method" });
    const key = process.env.RESEND_API_KEY, to = process.env.REPORT_TO;
    if (!key || !to) return reply(500, { ok: false, error: "not-configured" });

    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY) return reply(413, { ok: false, error: "too-large" });
    const raw = await request.text();
    if (raw.length > MAX_BODY) return reply(413, { ok: false, error: "too-large" });
    let body;
    try { body = JSON.parse(raw); } catch { return reply(400, { ok: false, error: "invalid", message: "The report is not valid JSON." }); }
    // the dialog's hidden field: a bot filled it in, so drop the report quietly
    if (typeof body?.website === "string" && body.website.trim()) return reply(200, { ok: true });

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
    if (tooMany(ip)) return reply(429, { ok: false, error: "too-many" });

    const r = check(body);
    if (!r.ok) return reply(400, { ok: false, error: r.error, message: r.message });
    const { subject, text } = compose(r);
    const mail = {
      from: process.env.REPORT_FROM || "KineMech <onboarding@resend.dev>",
      to: [to], subject, text,
      ...(r.email ? { reply_to: r.email } : {}),
      ...(r.attachment ? { attachments: [{ filename: r.attachment.name, content: Buffer.from(r.attachment.json, "utf8").toString("base64") }] } : {}),
    };
    let sent;
    try {
      sent = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(mail),
      });
    } catch {
      return reply(502, { ok: false, error: "send-failed" });
    }
    if (!sent.ok) {
      console.error("report: Resend answered", sent.status, await sent.text().catch(() => ""));
      return reply(502, { ok: false, error: "send-failed" });
    }
    return reply(200, { ok: true });
  },
};
