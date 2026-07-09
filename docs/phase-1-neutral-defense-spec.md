# Phase 1 Neutral Defense Specification

Status: Approved for implementation

## Goal

Revise Phase 1 from a double-leg-only progression into balanced neutral foundations for folkstyle and freestyle wrestling. Neutral movement, the Core Attack, and Neutral Defense are all required foundations, although they do not require equal training time.

The product remains wrestling-specific. Boxing, general self-defense, Greco-Roman content, unrelated takedowns, and counteroffense are outside this revision.

## Curriculum scope

Phase 1 continues to use six weeks, two workouts per week, the existing Mechanics/Application template split, and a 35–45 minute workout estimate.

The Core Attack remains the double-leg system. Variations are allowed only when they deepen its setups, entries, finishes, or recovery; single legs and other takedown families are not parallel learning paths.

Neutral Defense consists of down-blocking, sprawling, and returning to a square stance. Phase 1 ends defense in a safe neutral position and does not teach a spin-behind or other counteroffense.

## Phase copy

Description:

> Phase 1 builds balanced neutral foundations for folkstyle and freestyle wrestling: stance and motion, the double-leg attack, down-blocking, sprawling, and returning to stance.

Principle:

> Move in stance, attack with clean mechanics, defend in layers, and return to position.

## Workout A — Mechanics

Focus:

> Stance, motion, level change, penetration step, down-block, shadow double leg, dummy finish.

Keep every existing Workout A drill and its current prescription. Replace “Low-impact sprawls” in the warm-up details with “Bodyweight squats.” Add the down-block drill after stance and motion.

### Down-block

- Type: reps
- Prescription: 3 sets × 10 reps
- Estimated duration: 3 minutes
- Cue: “Hands first. Hips back. Return to stance.”
- Details:
  - Start in stance.
  - Block down as you pull your lead leg away.
  - Keep your head and chest up.
  - Re-square and return to stance.
- Technique Video: USA Wrestling, [Lines of defense](https://www.youtube.com/watch?v=1gk5t5Kqc8w)

The resulting Workout A estimate is 45 minutes. The wrestling dummy remains required.

## Workout B — Application

Focus:

> Entry from motion, shadow double leg, double leg on dummy, sprawl, return to stance.

Remove “Boxing-to-shot entry” and “Self-defense exit drill.” Replace “Low-impact sprawls” in the warm-up details with “Bodyweight squats.” The final drill order is:

1. Warm-up — 5 minutes
2. Stance and entry — 5 minutes
3. Shadow double leg — 7 minutes, using the existing Workout A rounds configuration
4. Double leg on dummy — 15 minutes
5. Sprawl and return to stance — 5 minutes

### Sprawl and return to stance

- Type: reps
- Prescription: 3 sets × 5 reps
- Estimated duration: 5 minutes
- Cue: “Legs back. Hips down. Chest up.”
- Details:
  - Start in stance.
  - Block down and kick both legs back.
  - Drive your hips down without landing on your knees.
  - Re-square and return to stance.
- Technique Video: USA Wrestling, [Sprawl & spin](https://www.youtube.com/watch?v=pfNtYzw97Ew)
- Video Note: “Focus on the sprawl mechanics. The video continues into a go-behind, which is outside this phase.”

The resulting Workout B estimate is 37 minutes. The wrestling dummy remains required for Core Attack practice but must not be presented as an attacking opponent during defensive drills.

## Weekly progression

- Weeks 1–2: “Slow mechanics only. Make every offensive and defensive rep clean.”
- Weeks 3–4: “Start every rep from stance and motion. Connect each movement without rushing.”
- Weeks 5–6: “Increase pace with control. Finish each rep in a strong position.”

Each focus is shared by its two-week pair. No new technique is introduced as the weeks progress.

## Technique Video notes

Add an optional `videoNote` to `Drill`. It narrows which part of a Technique Video applies and is not a general description or disclaimer.

The note must appear above the player on all supported surfaces:

- Web Ionic modal
- Android `TechniqueVideoPlayerActivity`
- iOS `TechniqueVideoPlayerViewController`

Extend the existing player `open` operation to accept `videoId` and optional `videoNote` together in one bridge call. Pass the note as plain text and render it with native text controls on Android and iOS; do not interpolate it into the YouTube player HTML. When no note exists, preserve the current layout without an empty gap.

## Curriculum Revision reset

This change creates a new Curriculum Revision. Follow [ADR 0004](./adr/0004-reset-training-state-for-new-curriculum-revisions.md).

Before any training store hydrates, perform a one-time migration that removes:

- `curriculum.completed-workout-ids`
- `training.completed-workout-log`, including notes
- `training.in-progress-workout`

Do not remove onboarding state or unrelated preferences. Persist the current curriculum revision so the reset cannot repeat on subsequent launches. A fresh installation with no legacy training state must not display a reset notice.

After resetting legacy data, show this notice once:

**Curriculum updated**

> Phase 1 now balances double-leg offense with neutral defense. Your previous progress and workout history, including notes, were reset for the new curriculum.

The notice is informational and requires dismissal, not confirmation.

## Compatibility requirements

- Keep existing workout instance IDs and template IDs so routes and curriculum sequencing remain stable.
- Ensure an old in-progress drill index can never resume against the revised drill sequence; the revision migration must run first.
- Keep `videoNote` optional so existing Technique Videos behave unchanged.
- Keep the native and web player note copy identical.

## Acceptance criteria

- Phase 1 contains no boxing or self-defense language or drills.
- Workout A contains the approved down-block drill and otherwise retains its existing drills.
- Workout B matches the approved five-drill structure.
- Both warm-ups use bodyweight squats instead of low-impact sprawls.
- Weeks 1–6 show the approved Progression Focus copy.
- The sprawl Video Note is visible with the video on web, Android, and iOS.
- Existing training progress, history, notes, and in-progress state reset exactly once; onboarding remains intact.
- Fresh installations do not receive the reset notice.
- Relevant Vitest tests, `npm run lint`, and `ionic build` pass.
- Android and iOS native builds compile after the plugin contract and player layouts change.

