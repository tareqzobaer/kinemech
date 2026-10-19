[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21843046.svg)](https://doi.org/10.5281/zenodo.21843046)

![KineMech: planar mechanism kinematics, dynamics and synthesis](og-image.png)

# KineMech

KineMech is a free, browser-based simulator for planar mechanisms. It is not limited to the textbook four-bar and slider-crank: it solves general mechanisms of any topology, including multi-loop linkages and six-bars, gear trains, pin-in-slot joints, and cams with several followers. For any of them it computes the kinematics, the joint forces, and, since version 4.0, the **full dynamics**: the motion a mechanism actually makes under applied torques, motors, gravity, springs, dampers and flywheels. It also synthesizes linkages and designs cam profiles.

Run it at **[kinemech.app](https://kinemech.app/)**. Nothing to install and no account: it runs entirely in the browser.

| | What you get |
| --- | --- |
| **Kinematics** | Position, velocity and acceleration of every joint and link, with Coriolis terms, polygons, dead points and change points |
| **Forces** | Joint reactions and the input torque a motion needs (kinetostatics), cam contact and gear mesh forces, shaking force, free-body diagrams, balancing |
| **Dynamics** | The motion an applied torque or force gives (forward dynamics), with motors, speed controllers, time-varying loads, energy balance and flywheel sizing |
| **Synthesis** | Four-bar motion, path and function generation, quick-return mechanisms, six-bar dwell mechanisms |
| **Cams** | Plate, cylindrical and linear cam profiles from rise-dwell-fall programs, with pressure angle and undercut checks |

It includes three integrated tools:

- **Analyzer:** builds a mechanism from joints and links, then solves its kinematics, its joint forces, and its motion under applied loads.
- **Synthesizer:** designs four-bar, offset slider-crank, and six-bar mechanisms from prescribed motion, path, function, quick-return, or dwell requirements.
- **Profiler:** generates plate, cylindrical, or linear cam profiles from a motion program and checks them for pressure angle and undercut.

All three tools use the same mechanism representation. A synthesized mechanism can be transferred directly to the analyzer, and a cam profile designed in the Profiler can be paired with a follower joint there for full force analysis and simulation of the contact.

![KineMech example](jensen.gif)

## Analysis

The analyzer supports general planar mechanisms rather than being limited to standard four-bar and slider-crank equations.

### Kinematic analysis

- Pin, slider, fixed-center gear pairs, rotating-slot joints, and cam-follower pairs.
- Several cams and gears on one shaft: a cam on a crankshaft, a camshaft geared to the crank, or a stack of cams on one camshaft.
- Several followers on one cam: identical copies placed at any angle around it, or followers of a different type or roller size riding the same profile.
- Conjugate cam pairs, where a second cam holds the follower from the other side so no return spring is needed.
- Multi-loop mechanisms and binary, ternary, and higher-order links.
- Position analysis using a general constraint formulation.
- Velocity and acceleration analysis using the same constraint Jacobian.
- Newton-Raphson solution of the constraint equations.
- Automatic degrees-of-freedom checking before solving.
- Dead-point and non-Grashof detection.
- Grashof classification for four-bar mechanisms.
- Minimum and maximum transmission angle over a complete crank revolution.
- Visualization of velocity and acceleration vectors and polygons.
- Slotted links drawn as a bar with the slot cut where the pin travels and the sliding block riding in it.
- Full-cycle plots of position, velocity, and acceleration.

### Kinetostatic analysis

The analyzer performs frictionless kinetostatic analysis when mass and inertia properties are specified: it answers "what effort does this motion need?"

For each moving link, the user can define:

- Mass
- Mass moment of inertia
- Center of gravity

The analysis can include:

- Gravity
- Applied point forces
- Applied torques
- Linear springs and dampers
- Torsional springs and dampers

The solver determines joint reactions and the input torque required to maintain the prescribed angular velocity and acceleration. Results can be viewed using an exploded free-body diagram and full-cycle plots of reactions, torque, and shaking force.

A counterweight can be added to the driving crank to reduce this shaking force. The exact rotating-mass solution is computed directly, then a numerical search refines its placement to minimize the whole mechanism's shaking force rather than just the crank's own, and a before/after comparison is reported. The search shows its progress while it runs and can be stopped early, keeping the best placement found so far.

For a conjugate cam pair, the analysis shows which cam carries the load at each instant and lists the crossover angles where the load moves from one cam to the other. With clearance in a real pair, those are the angles where it knocks.

Here the motion is prescribed, and the analysis finds the forces and torque required to produce it. To go the other way, and find the motion a given torque produces, use the dynamics simulation below.

### Dynamics simulation

New in version 4.0. Instead of prescribing the input's motion, apply an effort to it and KineMech simulates the motion that results. This is forward dynamics: it answers "what motion does this effort give?"

The effort on the crank (or on a driven slider) can be:

- None, to watch the mechanism coast or fall under gravity
- A constant torque or force
- A DC motor, whose torque falls linearly from stall to zero at the no-load speed
- A speed controller that pushes toward a target speed within a torque limit
- A table over time or over the input angle, typed in or pasted from a spreadsheet

Loads and couples on the links can follow their own tables over time or crank angle, for example a gas force on a piston over the power stroke.

Every joint type, spring, damper, load and counterweight that the force analysis handles is also in the simulation, because the simulation uses the same analysis: it asks it twice per step for the inertia seen at the input and everything else, then integrates the input's motion with a fixed fourth-order or an adaptive fifth-order method. The pose is solved exactly at every step, so the loops never drift open.

A run gives:

- A time slider and true-time playback, with every view (polygons, free-body diagram, reactions, cam contact) live at each instant.
- Plots against time of the input's angle, speed and acceleration, the applied effort, the inertia seen at the input, the energies, and every reaction and element force.
- Kinetic and potential energy, the work put in, the energy lost in dampers, and an energy balance that should read about zero.
- A CSV of the whole run and an animated GIF evenly spaced in time.

A run stops, located in time and explained in plain words, rather than continue past a point where the model no longer holds:

- **Follower jump:** a spring-closed cam follower leaves its cam.
- **Change point:** the linkage reaches a pose where it could continue in either assembly.
- **Input limit:** a rocking input reaches the end of its swing, or a driven slider the end of its stroke. Optionally the run carries on through it by following a link that keeps turning, so a slider-driven engine with a flywheel can run through its dead centres.

**Flywheels.** A flywheel can be sized from the constant-speed force cycle for a chosen coefficient of speed fluctuation, then simulated under the cycle's mean torque, and the measured fluctuation is shown beside the chosen one. The gap between them is the cost of the constant-speed assumption.

**Units.** Masses are in kg, inertias in kg·m², forces in N and spring rates in N/m. A physical length unit (m, cm, mm, in or ft) can be set for the drawing, so a mechanism drawn in millimetres gives the same forces and motion as the same mechanism in metres.

The simulation agrees with an independent constrained Lagrange solver to about 1e-11, and its energy balance converges at fourth order in the step size.

## Synthesis

The synthesizer provides several mechanism synthesis methods and can transfer the resulting mechanism directly to the analyzer.

### Motion generation

Prescribe two, three, or four coupler positions. Each position can be given as point A and an angle, or as points A and B.

The synthesis uses geometric constructions based on perpendicular bisectors and circle intersections. Alternate moving pivots can also be selected, allowing different four-bar configurations to be evaluated for Grashof condition and transmission angle.

The pivots can be chosen in several ways:

- **Two positions:** each ground pivot can sit anywhere on its perpendicular bisector. It can be dragged along the bisector, or placed by how far its link turns between the two positions. The canvas marks that swing at each pivot.
- **Rocker output:** with two positions, the coupler body itself becomes the output rocker, pivoted at its rotation pole and driven by a crank-rocker whose crank pivot lies on the chord through the two rocker positions. A rocker that swings through a given angle between two positions, the classic pure-rotation case, is entered by placing point A at the rocker's pivot in both positions and point B at the rocker's two ends.
- **Specified fixed pivots:** with three positions, the ground pivots are chosen and the moving pivots are found by inversion.
- **Prescribed rotations:** with three positions, the crank rotations β₂, β₃ and rocker rotations γ₂, γ₃ from position 1 are entered directly, and the moving pivots follow from the dyad equations. The canvas shows each angle where it is measured.

When the resulting four-bar's input cannot turn fully, a **driver dyad** can be added: a crank-rocker that rocks the input link between its extreme positions, giving a six-bar driven by a full-turn crank.

Circuit, branch, and order defects are classified for every precision position, from the closed-form range of the input angle rather than from a sampled sweep.

### Path generation

Two approaches are available.

**Precision points**

Specify three or four points that the coupler point must pass through. Coupler orientations can also be prescribed. For four prescribed positions, the corresponding moving pivots can be determined from the Burmester curve.

The **Solve free choices** option searches the available geometric choices for a mechanism that satisfies the specified points while considering:

- Grashof condition
- Transmission angle
- Circuit, branch, and order defects
- Optional crank-angle requirements

Prescribed crank angles are met exactly, not approximately: the coupler point reaches each precision point at its own crank angle. The crank's direction of rotation and, for four points, the assembly branch can be chosen.

**Target curve**

A complete path can be imported as:

- `.kinepath`
- `x,y` CSV
- A traced path sent directly from the analyzer

It can also be drawn on the canvas: clicked points are joined by a smooth spline, open or closed. The points stay on the canvas after the curve is finished, so the spline can be reshaped by dragging a point or typing its coordinates.

The synthesizer searches for a four-bar mechanism by varying link lengths, coupler-point location, and placement. Since the target curve is generally not reproduced exactly, the result reports the RMS and maximum path error and identifies the location of the maximum error.

The search is deterministic, so identical inputs produce the same result.

### Function generation

Function generation is implemented using Freudenstein's equation with three, four, or five precision points, with optional Chebyshev spacing. With four points the rocker's starting angle is also solved for, and with five points both starting angles are. When several linkages pass through the points, they are ranked and each can be inspected. The resulting structural error is reported over the specified domain.

### Quick-return synthesis

Four quick-return mechanisms share one time ratio Q:

- **Offset slider-crank**, from a required stroke, using the inscribed-angle construction.
- **Four-bar crank-rocker**, from a rocker length and swing angle.
- **Drag-link six-bar**, a double-crank four-bar driving a slider.
- **Whitworth six-bar**, a crank driving a slotted lever, which drives a slider.

The achieved time ratio, stroke, and swing are measured by turning the crank a full revolution and are reported next to the requested values.

### Dwell synthesis

Searches for a Stephenson III six-bar mechanism whose output link holds nearly stationary over part of the input revolution, then swings through the rest of it. This is an approximate mechanical alternative to a cam. The search reports the achieved hold window and output swing, and the resulting mechanism can be sent to the analyzer like any other synthesized linkage.

A double dwell holds the output still twice per revolution. The coupler curve needs two near-circular arcs of the same radius, and the output pivot sits where the output link can reach the center of either arc. The swing between the two holds is prescribed, and both hold windows and the achieved swing are reported.

### Additional synthesis features

Each synthesis mode:

- Reports the Grashof classification.
- Reports minimum and maximum transmission angles.
- Animates the resulting mechanism.
- Can export the mechanism as a GIF.

Four-bar synthesis modes can also display the two Roberts-Chebyshev cognates, which generate the same coupler curve.

In motion and path generation, the canvas can show the construction geometry behind a result, and a values switch prints coordinates next to point labels and the size of each marked angle.

A synthesized mechanism can be sent directly to the analyzer for further kinematic and kinetostatic analysis. This includes the six-bars, slotted links, and rocker outputs, not only the four-bars.

## Cam design

The Profiler generates a cam profile from a motion program: a sequence of rise, dwell, and fall segments, each assigned a motion law from uniform, parabolic, simple harmonic, cycloidal, modified trapezoid, modified sine, or 3-4-5 and 4-5-6-7 polynomial. The program is checked against the fundamental law of cam design before a profile is generated.

Three cam families are supported:

- Plate (radial disk) cams.
- Cylindrical (grooved drum) cams.
- Linear (translating) cams.

For plate cams, the follower can be a knife edge, roller, flat face, or spherical face, mounted in-line, offset, or pivoted. The generated profile is checked for pressure angle against the usual translating/pivoted limits and for undercut (or, for a flat face, for the concavity it cannot follow).

A cam designed in the Profiler can be paired with a follower joint in the analyzer, where the contact is treated as a frictionless higher pair: the solver reports the contact force along the common normal, detects follower jump, and includes any return spring holding the pair closed. The Profiler can also animate the cam turning under its follower and export the result as a GIF.

A cam in the analyzer is not limited to one follower or one shaft:

- **Shared shafts.** A cam or gear can be mounted on another fixed pivot's shaft, so several cams and gears turn together as one body.
- **Another follower on the same cam.** An exact copy of a cam's follower can be added at any angle around it. It runs the same program, shifted by that angle.
- **A follower of another type.** A follower of a different type or roller size, such as a rocker in the same groove as a translating follower, rides the cam's existing profile. It has no program of its own: its motion is solved from where its roller touches the profile at every angle.
- **Conjugate cams.** A second cam on the same shaft, with a second roller on the same follower, holds the follower from the other side. Only the first cam is designed; the second one's profile follows from where its roller sits and updates whenever that roller moves.

While a cam is being redesigned in the Profiler, its other followers and its conjugate cam are drawn alongside it, and the profile export includes the conjugate cam's profile next to the first one.

## Workflow

The analyzer follows a step-by-step mechanism construction workflow.

1. **Topology**  
   Place pin, slider, gear, or cam joints. Connect them with rigid links (a link can span two or more joints, allowing binary, ternary, and higher-order links) or with linear/torsional spring-damper elements. Choose which joints are held fixed as the ground. A cam or gear placed on an existing fixed pivot mounts on that pivot's shaft.

2. **Geometry**  
   Optionally trace a mechanism from a background image. Scale can be calibrated using two points and a known distance. Exact dimensions can then be specified for driving joints without moving the traced image. A physical length unit sets what one drawing unit means to the force analysis and the simulation.

   For gear joints, the pitch radius, mesh partner, and external or internal mesh are specified. For cam joints, the base-circle radius sets a starting size, and the full profile is designed in the Profiler, which can be opened directly from the mechanism. A cam's card can also add another follower, a follower of another type, or a conjugate cam.

3. **Elements**  
   Specify mass, inertia, and center of gravity for moving links and sliders, and a flywheel on any link that turns about a fixed pivot. Spring and damper properties can also be defined.

4. **Drive**  
   Choose the driving link or slider, then choose how it is driven. **Prescribe the motion** sets its angle, speed and acceleration (or position, velocity and acceleration for a slider). **Apply a torque** (or force) sets the effort law, the starting speed, and the run's duration, step and method instead. Applied forces, torques, and gravity can be included when mass properties are available, each optionally following a table.

5. **Solve**  
   With prescribed motion, animate the mechanism and inspect position, velocity, acceleration, joint reactions, and input torque. With an applied effort, press **Simulate**, then scrub or play the run in time. Velocity and acceleration polygons, free-body diagrams, plots against crank angle or time, flywheel sizing, and crank balancing are available in both.

## Presets

The application includes seventeen built-in mechanisms, grouped by topic in the example picker:

- **Linkages:** four-bar with coupler point, mass and gravity; change-point four-bar; Hoeken straight-line four-bar; Stephenson III six-bar dwell; Jansen walking linkage (two legs on one crank)
- **Sliders and quick return:** slider-driven slider-crank; Whitworth quick-return; shaper (slotted-lever quick-return)
- **Gears:** geared four-bar
- **Cams:** plate cam driving a bell-crank and slider; plate cam with a flat-faced follower; conjugate cam with an oscillating follower; grooved cam with two followers of different types
- **Forces and motion:** spring-returned slider-crank; five-cylinder radial engine; four-bar released under its own weight (simulated); single-cylinder engine with a gas force and a flywheel (simulated)

These presets also serve as regression cases for different parts of the solver.

## File formats and export

### `.kinemech`

A self-contained JSON mechanism file containing:

- Joints
- Links
- Ground and driving roles
- Drive state, including whether the motion is prescribed or simulated, the effort law, and the simulation settings
- Dimensions
- Calibration data and the physical length unit
- Embedded background image

A simulated run is not saved in the file; it is recomputed when needed. Files from earlier versions open unchanged.

The file can be saved and loaded directly in KineMech. Synthesized mechanisms use the same format and can therefore be opened in the analyzer.

### `.kinepath`

A path file containing:

- Path coordinates
- Optional crank angle at each point
- Path closure information

The analyzer can generate a `.kinepath` file from a traced joint, and the synthesizer can use it for target-curve synthesis.

Standard `x,y[,theta]` CSV files are also supported.

### `.kinemotion`

A follower motion program: displacement and its derivatives against cam angle, with whether it closes over one revolution and whether the output is a translation or a rotation.

The Profiler exports the program behind a designed cam, and the analyzer can export a solved joint or link's own motion as one. Either can be opened in the Profiler, which fits an imported program with a Fourier series before generating a profile from it. Standard CSV is also supported.

### Autosave

The current mechanism is automatically stored in the browser's local storage. After an unexpected refresh or crash, the last autosaved mechanism can be recovered and downloaded.

If the browser blocks local storage, as some private windows do, the tool keeps working and shows that autosave is unavailable, so the work should be saved to a file before closing.

### CSV export

Full-cycle plots can be exported as CSV, including:

- Position
- Velocity
- Acceleration
- Joint reactions
- Input torque
- Shaking force
- Element forces

A simulated run exports against time: the input's angle, speed and acceleration, the applied effort, the inertia seen at the input, the energies and the energy balance, then every reaction and element force.

The Profiler also exports a cam's profile as CSV coordinates, with the conjugate cam's profile alongside when there is one.

### GIF export

A complete drive cycle, or a simulated run with its frames evenly spaced in time, can be exported as an animated GIF, including the mechanism and the velocity/acceleration polygon panel when it is open.

## Citation

If you use KineMech in research or teaching material, please cite it with its Zenodo DOI, [10.5281/zenodo.21843046](https://doi.org/10.5281/zenodo.21843046). `CITATION.cff` carries the current version, 4.0.0.
