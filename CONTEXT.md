# Solo Wrestler

Solo Wrestler is a personal solo wrestling curriculum app. Its language describes a locked training path, the user's current place in that path, and the state of drills and workouts during training.

## Language

**Today**:
The main screen that shows the user's current place in the curriculum and what to train next.
_Avoid_: Home, dashboard

**Workout**:
A training unit in the curriculum that can be current, locked, or completed.
_Avoid_: Tile, node

**Workout Template**:
A reusable workout structure that defines what the user trains when a workout repeats across the curriculum.
_Avoid_: Routine, program

**Workout Instance**:
A specific occurrence of a workout template at a place in the curriculum sequence.
_Avoid_: Copy, scheduled workout

**Completed Workout Log Entry**:
A saved historical record for a completed workout, including its completion details separate from the curriculum workout instance.
_Avoid_: Workout instance, history item

**Drill**:
An ordered training block inside a workout that the user completes before moving to the next block. A drill may be measured by time, reps, or rounds.
_Avoid_: Exercise, section, block

**Cue**:
A short coaching reminder that tells the user what to focus on during a drill.
_Avoid_: Instruction, explanation

**Drill Detail**:
Optional compact supporting information for a drill when a cue alone is not enough.
_Avoid_: Long description, tutorial

**Technique Video**:
An optional video demonstration attached to a drill that helps the user understand its technique.
_Avoid_: Instructional video, tutorial

**Estimated Duration**:
The expected time a drill or workout should take, separate from the work required to complete it.
_Avoid_: Timer, time limit

**Phase**:
A major section of the curriculum that contains weeks in sequence.
_Avoid_: Level, module

**Phase Principle**:
A concise motto-like principle that defines what safe, correct training means throughout a phase.
_Avoid_: Motto, tip, note

**Week**:
A curriculum grouping that contains workouts in sequence.
_Avoid_: Stage, block

**Progression Focus**:
The training emphasis for a week that tells the user how to perform repeated workouts at that point in the phase.
_Avoid_: Difficulty, level, modifier

**Completed**:
A drill or workout the user has finished.
_Avoid_: Done, cleared

**Current**:
The next workout available to the user in the curriculum sequence.
_Avoid_: Unlocked

**Locked**:
A future workout that is visible but not yet available to start.
_Avoid_: Disabled

**In-progress**:
A workout the user has started but not finished.
_Avoid_: Active workout

**Canceled Workout**:
An in-progress workout the user abandons without completing it, saving it, creating a history entry, or advancing the curriculum. A workout can be canceled at any point while it is in progress.
_Avoid_: Ended workout, discarded workout

**Workout Session**:
The user's live interaction with an In-progress Workout, including Current Drill, timer state, Rest, and valid actions.
_Avoid_: Active workout state, workout facade

**Work**:
The timed effort portion of a duration-based or round-based drill.
_Avoid_: Active, timer active

**Rest**:
The timed recovery portion between work intervals or drills.
_Avoid_: Break, recovery

**Default Rest**:
The app-wide standard timed recovery used between drills unless a workout or drill specifies otherwise.
_Avoid_: Global rest timer, default break
