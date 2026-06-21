# Solo Wrestler

Solo Wrestler is a personal solo wrestling curriculum app. Its language describes a locked training path, the user's current place in that path, and the state of drills and workouts during training.

## Language

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

**Work**:
The timed effort portion of a duration-based or round-based drill.
_Avoid_: Active, timer active

**Rest**:
The timed recovery portion between work intervals or drills.
_Avoid_: Break, recovery
