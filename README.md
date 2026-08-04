# KineMech

A single-file, in-browser kinematics and kinetostatics solver for 2D
pin/slider mechanisms. Build a linkage by placing joints and links, drive it,
and get exact position, velocity, and acceleration at every instant —
including non-Grashof rockers, multi-loop mechanisms, and ternary links. No
install, no build step: open `MechanismAnalyzer.html` in a browser.

## What it solves

- General planar pin-jointed and slider mechanisms — not limited to the
  textbook four-bar/slider-crank closed forms. Multi-loop topologies, ternary
  (or higher) links, and rotating-slot (pin-in-slotted-lever) joints all work
  through the same general constraint solver.
- Full position/velocity/acceleration at the current crank angle, via
  Newton–Raphson on the constraint vector Φ(q) and the same Jacobian reused
  for the velocity and acceleration linear solves.
- Degrees-of-freedom check before solving — refuses to solve an
  under/over-constrained sketch instead of guessing a configuration.
- Dead-point / non-Grashof detection — reports a toggle position instead of
  silently failing or jumping branches.
- Grashof classification and transmission-angle quality (min/max over a full
  crank revolution), for a plain pin-jointed four-bar.
- Optional kinetostatic dynamics — per-link mass/inertia/CG, gravity, and
  applied point loads/torques feed one frictionless Newton–Euler linear
  system per pose, giving every joint reaction and the crank torque needed to
  sustain the current ω₂/α₂ — plus an exploded free-body-diagram view and
  full-cycle peak reactions/torque.

## Workflow

1. **Joints** — place pin or slider joints.
2. **Links** — connect joints into rigid bodies (binary, ternary, …).
3. **Roles** — pick the ground link and the driving (crank) link.
4. **Geometry** — optionally trace over a background image: calibrate scale
   from two points + a known real distance, then pin exact driving
   dimensions (length/angle) that refine the sketch without moving the
   traced overlay.
5. **Drive** — set crank angle, angular velocity ω₂, angular acceleration α₂,
   and — optionally — per-link mass/inertia/CG, gravity, and applied point
   loads/torques for the dynamics solve.
6. **Solve** — animate, inspect per-joint velocity/acceleration vectors and
   (once masses are set) joint reactions/input torque, view
   velocity/acceleration polygons and the exploded free-body diagram
   alongside the mechanism, check Grashof/transmission-angle quality, and
   chart any joint/link/shaking-force quantity over a full cycle against
   crank angle or time.

Ten built-in presets (four-bar, change-point four-bar, slider-crank in both
crank-driven and slider-driven form, elliptic trammel, Whitworth quick-return,
crank-shaper with and without mass, four-bar with mass+gravity, five-cylinder
radial engine) load in one click and double as the solver's regression
fixtures — each exercises a distinct part of the solver.

## I/O

- **`.mechbld`** — self-contained JSON save (joints, links, roles, drive
  state, dimensions, calibration, embedded background image). Round-trips
  through Save/Load here, and is the same format the companion Mechanism
  Synthesizer tool exports, so a synthesized four-bar opens directly here for
  full velocity/acceleration analysis.
- **Autosave** — mirrors the mechanism into localStorage as you build; an
  unexpected crash or refresh offers the last autosaved snapshot back as a
  download instead of losing it.
- **CSV export** — any full-cycle plot (position/velocity/acceleration/
  reactions/torque/shaking force) exports to CSV.
- **GIF export** — captures one drive cycle (mechanism + polygon panel if
  open) as an animated GIF.
- **Distributable build** (optional) — `npm run build` precompiles the JSX
  into `dist/MechanismAnalyzer.html`, skipping the ~1MB babel-standalone
  fetch/JIT-compile on every load; `npm run build:offline` additionally
  inlines React/ReactDOM/gif.js into `dist/MechanismAnalyzer.offline.html`, a
  single file that runs with no network access at all.
