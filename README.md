[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21843047.svg)](https://doi.org/10.5281/zenodo.21843047)

![KineMech — planar mechanism analysis and synthesis](og-image.png)

# KineMech

KineMech is a browser-based tool for analysis and synthesis of planar pin and slider mechanisms.

It includes two integrated tools:

- **Analyzer:** builds a mechanism from joints and links and performs position, velocity, acceleration, and optional kinetostatic analysis.
- **Synthesizer:** designs four-bar and offset slider-crank mechanisms from prescribed motion, path, function, or quick-return requirements.

Both tools use the same mechanism representation, allowing a synthesized mechanism to be transferred directly to the analyzer.

![KineMech example](radial_engine.gif)

## Analysis

The analyzer supports general planar mechanisms rather than being limited to standard four-bar and slider-crank equations.

### Kinematic analysis

- Pin, slider, fixed-center gear pairs, and rotating-slot joints.
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

### Additional synthesis features

Each synthesis mode:

- Reports the Grashof classification.
- Reports minimum and maximum transmission angles.
- Animates the resulting mechanism.
- Can export the mechanism as a GIF.

Four-bar synthesis modes can also display the two Roberts-Chebyshev cognates, which generate the same coupler curve.

A synthesized mechanism can be sent directly to the analyzer for further kinematic and kinetostatic analysis.

## Workflow

The analyzer follows a step-by-step mechanism construction workflow.

1. **Joints**  
   Place pin, slider, or gear joints.

2. **Links**  
   Define connections between joints. A rigid link can connect two or more joints, allowing binary, ternary, and higher-order links. Linear springs/dampers connect two joints, while torsional elements connect two links or a link and ground.

3. **Roles**  
   Select the ground link and driving link.

4. **Geometry**  
   Optionally trace a mechanism from a background image. Scale can be calibrated using two points and a known distance. Exact dimensions can then be specified for driving joints without moving the traced image.

   For gear joints, the pitch radius, mesh partner, and external or internal mesh are specified.

5. **Elements**  
   Specify mass, inertia, and center of gravity for moving links and sliders. Spring and damper properties can also be defined.

6. **Drive**  
   Specify crank angle, angular velocity, and angular acceleration. For a slider driver, linear velocity and acceleration can be specified instead. Applied forces, torques, and gravity can be included when mass properties are available.

7. **Solve**  
   Animate the mechanism and inspect position, velocity, acceleration, joint reactions, and input torque. Velocity and acceleration polygons, free-body diagrams, and full-cycle plots are also available.

## Presets

The application includes ten built-in mechanisms:

- Four-bar
- Change-point four-bar
- Crank-driven slider-crank
- Slider-driven slider-crank
- Spring-returned slider-crank
- Whitworth quick-return
- Crank-shaper with mass
- Four-bar with mass and gravity
- Geared four-bar
- Five-cylinder radial engine

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
