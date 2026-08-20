[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21843047.svg)](https://doi.org/10.5281/zenodo.21843047)

![KineMech — planar mechanism analysis and synthesis](og-image.png)

# KineMech

KineMech is a browser-based tool for analysis and synthesis of planar pin and slider mechanisms.

It includes three integrated tools:

- **Analyzer:** builds a mechanism from joints and links and performs position, velocity, acceleration, and optional kinetostatic analysis.
- **Synthesizer:** designs four-bar and offset slider-crank mechanisms from prescribed motion, path, function, or quick-return requirements, and six-bar dwell mechanisms from a required hold.
- **Profiler:** generates plate, cylindrical, or linear cam profiles from a motion program and checks them for pressure angle and undercut.

All three tools use the same mechanism representation. A synthesized mechanism can be transferred directly to the analyzer, and a cam profile designed in the Profiler can be paired with a follower joint there for full kinetostatic analysis of the contact.

![KineMech example](quick_return.gif)

## Analysis

The analyzer supports general planar mechanisms rather than being limited to standard four-bar and slider-crank equations.

### Kinematic analysis

- Pin, slider, fixed-center gear pairs, rotating-slot joints, and cam-follower pairs.
- Multi-loop mechanisms and binary, ternary, and higher-order links.
- Position analysis using a general constraint formulation.
- Velocity and acceleration analysis using the same constraint Jacobian.
- Newton-Raphson solution of the constraint equations.
- Automatic degrees-of-freedom checking before solving.
- Dead-point and non-Grashof detection.
- Grashof classification for four-bar mechanisms.
- Minimum and maximum transmission angle over a complete crank revolution.
- Visualization of velocity and acceleration vectors and polygons.
- Full-cycle plots of position, velocity, and acceleration.

### Kinetostatic analysis

The analyzer can also perform frictionless kinetostatic analysis when mass and inertia properties are specified.

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

A counterweight can be added to the driving crank to reduce this shaking force. The exact rotating-mass solution is computed directly, then a numerical search refines its placement to minimize the whole mechanism's shaking force rather than just the crank's own, and a before/after comparison is reported.

This is **kinetostatic analysis**, not forward dynamics. The motion is prescribed, and the analysis determines the forces and torque required to produce that motion.

## Synthesis

The synthesizer provides several mechanism synthesis methods and can transfer the resulting mechanism directly to the analyzer.

### Motion generation

Prescribe two, three, or four coupler positions.

The synthesis uses geometric constructions based on perpendicular bisectors and circle intersections. Alternate moving pivots can also be selected, allowing different four-bar configurations to be evaluated for Grashof condition and transmission angle.

### Path generation

Two approaches are available.

**Precision points**

Specify three or four points that the coupler point must pass through. Coupler orientations can also be prescribed. For four prescribed positions, the corresponding moving pivots can be determined from the Burmester curve.

The **Solve free choices** option searches the available geometric choices for a mechanism that satisfies the specified points while considering:

- Grashof condition
- Transmission angle
- Circuit, branch, and order defects
- Optional crank-angle requirements

**Target curve**

A complete path can be imported as:

- `.kinepath`
- `x,y` CSV
- A traced path sent directly from the analyzer

The synthesizer searches for a four-bar mechanism by varying link lengths, coupler-point location, and placement. Since the target curve is generally not reproduced exactly, the result reports the RMS and maximum path error and identifies the location of the maximum error.

The search is deterministic, so identical inputs produce the same result.

### Function generation

Three-point function generation is implemented using Freudenstein's equation, with optional Chebyshev spacing. The resulting structural error is reported over the specified domain.

### Quick-return synthesis

A slider-crank can be synthesized from:

- Required stroke
- Desired time ratio

The mechanism is obtained using the inscribed-angle construction, and the achieved stroke and time ratio are checked against the specified values.

### Dwell synthesis

Searches for a Stephenson III six-bar mechanism whose output link holds nearly stationary over part of the input revolution, then swings through the rest of it — an approximate mechanical alternative to a cam. The search reports the achieved hold window and output swing, and the resulting mechanism can be sent to the analyzer like any other synthesized linkage.

### Additional synthesis features

Each synthesis mode:

- Reports the Grashof classification.
- Reports minimum and maximum transmission angles.
- Animates the resulting mechanism.
- Can export the mechanism as a GIF.

Four-bar synthesis modes can also display the two Roberts-Chebyshev cognates, which generate the same coupler curve.

A synthesized mechanism can be sent directly to the analyzer for further kinematic and kinetostatic analysis.

## Cam design

The Profiler generates a cam profile from a motion program: a sequence of rise, dwell, and fall segments, each assigned a motion law from uniform, parabolic, simple harmonic, cycloidal, modified trapezoid, modified sine, or 3-4-5 and 4-5-6-7 polynomial. The program is checked against the fundamental law of cam design before a profile is generated.

Three cam families are supported:

- Plate (radial disk) cams.
- Cylindrical (grooved drum) cams.
- Linear (translating) cams.

For plate cams, the follower can be a knife edge, roller, flat face, or spherical face, mounted in-line, offset, or pivoted. The generated profile is checked for pressure angle against the usual translating/pivoted limits and for undercut (or, for a flat face, for the concavity it cannot follow).

A cam designed in the Profiler can be paired with a follower joint in the analyzer, where the contact is treated as a frictionless higher pair: the solver reports the contact force along the common normal, detects follower jump, and includes any return spring holding the pair closed. The Profiler can also animate the cam turning under its follower and export the result as a GIF.

## Workflow

The analyzer follows a step-by-step mechanism construction workflow.

1. **Topology**  
   Place pin, slider, gear, or cam joints. Connect them with rigid links (a link can span two or more joints, allowing binary, ternary, and higher-order links) or with linear/torsional spring-damper elements. Choose which joints are held fixed as the ground.

2. **Geometry**  
   Optionally trace a mechanism from a background image. Scale can be calibrated using two points and a known distance. Exact dimensions can then be specified for driving joints without moving the traced image.

   For gear joints, the pitch radius, mesh partner, and external or internal mesh are specified. For cam joints, the base-circle radius sets a starting size, and the full profile is designed in the Profiler, which can be opened directly from the mechanism.

3. **Elements**  
   Specify mass, inertia, and center of gravity for moving links and sliders. Spring and damper properties can also be defined.

4. **Drive**  
   Choose the driving link, then specify crank angle, angular velocity, and angular acceleration. For a slider driver, linear velocity and acceleration can be specified instead. Applied forces, torques, and gravity can be included when mass properties are available.

5. **Solve**  
   Animate the mechanism and inspect position, velocity, acceleration, joint reactions, and input torque. Velocity and acceleration polygons, free-body diagrams, full-cycle plots, and crank balancing are also available.

## Presets

The application includes twelve built-in mechanisms:

- Four-bar with coupler point, mass, and gravity
- Change-point four-bar
- Hoeken straight-line four-bar
- Spring-returned slider-crank
- Slider-driven slider-crank
- Whitworth quick-return
- Shaper (slotted-lever quick-return)
- Five-cylinder radial engine
- Geared four-bar
- Stephenson III six-bar dwell
- Plate cam driving a bell-crank and slider
- Plate cam with a flat-faced follower

These presets also serve as regression cases for different parts of the solver.

## File formats and export

### `.kinemech`

A self-contained JSON mechanism file containing:

- Joints
- Links
- Ground and driving roles
- Drive state
- Dimensions
- Calibration data
- Embedded background image

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

### CSV export

Full-cycle plots can be exported as CSV, including:

- Position
- Velocity
- Acceleration
- Joint reactions
- Input torque
- Shaking force
- Element forces

### GIF export

A complete drive cycle can be exported as an animated GIF, including the mechanism and the velocity/acceleration polygon panel when it is open.
