# PRD: Solo Wrestler MVP

## 1. Product Overview

**Product name:** Solo Wrestler
**Tagline:** Follow a real wrestling curriculum, adapted for solo training.

Solo Wrestler is a personal mobile app built with Ionic, Capacitor, and Angular. The app helps the user follow a locked, phase-based solo wrestling curriculum based on the USA Wrestling Core Curriculum and adapted for self-defense and BJJ preparation.

The MVP focuses on one curriculum path, starting with **Phase 1: Foundations**. The user completes workouts in order, follows drill cards, watches embedded technique videos, uses timers where needed, marks drills complete, and logs workout difficulty and optional notes.

---

## 2. Product Goal

The goal of the MVP is to create a simple, structured app that answers one question:

> “What wrestling workout should I do today, and how do I complete it correctly?”

The app should reduce decision fatigue and make solo wrestling practice feel like a real curriculum instead of a random list of drills.

---

## 3. Target User

### Primary User

A beginner wrestling learner training alone with minimal equipment.

### User Profile

- Wants to learn wrestling fundamentals
- Trains at home or alone
- Has a mat and wrestling dummy
- Main goal: self-defense
- Secondary goal: BJJ preparation
- Does not want a complicated wrestling encyclopedia
- Wants a structured path to follow

---

## 4. Core Product Principles

1. **KISS**

   - Keep the app simple, direct, and easy to use during training.

2. **Curriculum-first**

   - The app should feel like a guided course, not an exercise library.

3. **Follow the order**

   - Workouts are locked and completed in sequence.

4. **Minimal screen clutter**

   - Drill instructions should be short cues, not long explanations.

5. **Stay inside the app**

   - Technique videos must open inside the app, not externally.

---

## 5. MVP Scope

### Included in MVP

- Ionic + Capacitor + Angular app
- Bottom tab navigation
- First launch intro screen
- One-time safety disclaimer
- Today screen
- Curriculum screen
- Active workout screen
- Progress screen
- About screen
- Local-only storage
- Locked workout order
- Resumable in-progress workout
- Drill-by-drill completion tracking
- Reps-based drills
- Duration-based drills
- Round-based drills
- Rest timer between drills
- Round timer with rest between rounds
- Sound and vibration alerts while app is open
- Embedded in-app YouTube video modal
- Workout completion screen
- Whole-workout difficulty rating
- Optional workout note
- USA Wrestling attribution and link
- Equipment information
- Future phases shown as Coming Soon

### Excluded from MVP

- User accounts
- Cloud sync
- Backend
- Admin panel
- Custom workout builder
- Technique library
- AI coaching
- Form analysis
- Affiliate links
- Editing completed workout notes
- Replaying completed workouts
- Background notifications
- Public sharing
- Social features
- Multiple curriculum tracks

---

## 6. App Navigation

The app uses bottom tabs:

1. **Today**
2. **Curriculum**
3. **Progress**
4. **About**

---

## 7. First Launch Flow

### Goal

Introduce the app and show the safety disclaimer once.

### Flow

1. User opens the app for the first time.
2. Intro screen appears.
3. User sees product name and tagline.
4. User continues to safety disclaimer.
5. User taps **I Understand**.
6. App opens the Today screen.
7. Future app launches open directly to Today.

### Intro Screen Copy

**Solo Wrestler**
Follow a real wrestling curriculum, adapted for solo training.

Build wrestling fundamentals step by step using a curriculum based on USA Wrestling and adapted for solo practice, self-defense, and BJJ preparation.

Button:

**Continue**

### Safety Disclaimer Copy

Train only on a safe mat surface. Do not dive head-first. Keep your head up and protect your neck. This app is for general training guidance, not professional coaching or medical advice.

Button:

**I Understand**

---

## 8. Today Screen

### Purpose

Show the user exactly what to do next.

### Content

The Today screen displays:

- Current phase
- Current progress
- Current unlocked workout
- Start or Resume button
- Required equipment card

### Default State Example

**Phase 1: Foundations**
3 of 12 workouts completed
Current: Week 2 · Workout A

Button:

**Start Workout**

Equipment:

**Mat + wrestling dummy**

### In-Progress State Example

**Resume Workout**
Week 2 · Workout A
4 of 6 drills completed

Button:

**Resume**

### Rules

- If no workout is in progress, show the current unlocked workout.
- If a workout is in progress, show Resume Workout.
- Only one workout can be in progress at a time.
- Completed workouts count toward phase progress.
- In-progress workouts do not count as completed.

---

## 9. Curriculum Screen

### Purpose

Show the full curriculum structure and locked progression.

### Content

The Curriculum screen displays:

- Phase 1: Foundations
- 6-week structure
- 2 workouts per week
- Workout completion status
- Locked future workouts
- Future phases as Coming Soon

### Phase 1 Structure

**Phase 1: Foundations**
6 weeks · 2 workouts/week · 12 total workouts

Workout templates:

- Workout A: Mechanics
- Workout B: Application

The same two workouts repeat weekly for 6 weeks.

### Example Layout

| Week   | Workout A | Workout B |
| ------ | --------- | --------- |
| Week 1 | Completed | Completed |
| Week 2 | Current   | Locked    |
| Week 3 | Locked    | Locked    |
| Week 4 | Locked    | Locked    |
| Week 5 | Locked    | Locked    |
| Week 6 | Locked    | Locked    |

### Future Phase Example

**Phase 2**
Coming Soon

### Locking Rules

- Workouts must be completed in order.
- The current workout is unlocked.
- Future workouts are visible but locked.
- Completed workouts are viewable.
- Completed workouts are not replayable in MVP.

---

## 10. Active Workout Screen

### Purpose

Guide the user through the current workout.

### Layout

The workout screen displays:

- Phase name
- Week and workout label
- Workout title
- Required equipment
- Ordered list of drill cards
- Workout completion button

### Example Header

**Phase 1: Foundations**
Week 1 · Workout A
**Mechanics**

Equipment: Mat + wrestling dummy

---

## 11. Drill Card

### Purpose

Display one drill clearly without clutter.

### Drill Card Content

Each drill card includes:

- Drill title
- Prescription
- Core technique label
- Minimal cue
- Watch button
- Start or Mark Complete button
- Completion state
- Rest information if applicable

### Reps Drill Example

**Penetration Step**
5 sets × 5 reps each side
Core technique: Penetration Step
Cue: Step deep. Stay tall.

Buttons:

- **Watch**
- **Mark Complete**

### Duration Drill Example

**Stance & Motion**
5 min
Core technique: Stance & Motion
Cue: Stay low. Don’t cross feet.

Buttons:

- **Watch**
- **Start**

### Round Drill Example

**Shadow Double Leg**
5 rounds × 1 min
Rest: 30 sec between rounds
Core technique: Double Leg
Cue: Level change first. Head up.

Buttons:

- **Watch**
- **Start**

---

## 12. Drill Types

### 12.1 Reps Drill

Used for drills measured by sets and reps.

Example:

- 5 sets × 5 reps each side
- 3 sets × 10 reps
- 20 clean reps

Behavior:

- No timer is required.
- User manually completes the work.
- User taps **Mark Complete**.
- Drill is marked complete.
- Rest timer starts if configured.

---

### 12.2 Duration Drill

Used for drills measured by time.

Example:

- 5 minutes
- 10 minutes

Behavior:

- User taps **Start**.
- Timer starts.
- User can pause, resume, or reset.
- When timer ends, sound and vibration trigger.
- User taps **Mark Complete**.
- Rest timer starts if configured.

Timer controls:

- Pause
- Resume
- Reset

---

### 12.3 Round Drill

Used for drills with repeated rounds.

Example:

- 5 rounds × 1 minute
- 30 seconds rest between rounds

Behavior:

- User taps **Start** once.
- Round 1 starts.
- When round ends, sound and vibration trigger.
- Rest starts automatically.
- When rest ends, sound and vibration trigger.
- Next round starts automatically.
- Flow continues until all rounds are complete.
- User taps **Mark Complete**.
- Rest timer between drills starts if configured.

Timer controls:

- Pause
- Resume
- Reset

---

## 13. Rest Timer Rules

### Between Rounds

- Auto-continue within the same drill.
- Example: Round 1 → Rest → Round 2.
- User does not need to manually start each round.

### Between Drills

- Do not auto-start the next drill.
- User should remain in control.
- The next drill is highlighted after rest finishes.
- User manually starts or completes the next drill.

### Rest Controls

During rest, user can:

- Skip rest
- Add +30 seconds

### Alerts

- Sound alert when timer ends
- Vibration alert when timer ends
- Alerts only work while app is open
- Background notifications are not part of MVP

---

## 14. Video Behavior

### Purpose

Allow the user to quickly view the relevant USA Wrestling technique without leaving the app.

### Requirements

- Each drill has one video.
- Videos open inside the app.
- Videos open in a modal.
- User can close the video and return to the workout.
- Videos should not open externally in YouTube.
- Opening a video pauses a running workout timer.
- Closing the video resumes only the timer that was running before it opened, preserving its phase and remaining time.
- Video playback starts automatically when supported and may enter landscape fullscreen.
- Backgrounding the app pauses playback and keeps the modal open; the workout timer remains paused until the modal closes in the foreground.
- Finishing a video does not close the modal or resume the workout timer.
- Reopening a video starts it from the beginning.
- Playback uses YouTube Privacy-Enhanced Mode.
- A video that fails to initialize within 15 seconds shows Retry and Close actions without opening an external fallback.

### Video Button

Button label:

**Watch**

### Video Source Rule

Each drill should use the most relevant USA Wrestling curriculum video.

For adapted drills, use the closest core technique video.

Example:

- Drill: Jab Feint → Double Leg
- Core technique: Double Leg
- Video: Double Leg video

---

## 15. Workout Completion

### Requirements

User can complete the workout only after all drills are marked complete.

### Completion Flow

1. User completes all drills.
2. Finish Workout button becomes available.
3. User taps **Finish Workout**.
4. Completion screen opens.
5. User selects workout difficulty.
6. User optionally adds a note.
7. User taps **Save Workout**.
8. Workout is saved locally.
9. Next workout unlocks.

### Difficulty Options

- Easy
- Good
- Hard

### Notes

- Notes are optional.
- Notes are saved with the completed workout.
- Notes cannot be edited in MVP.

---

## 16. Progress Screen

### Purpose

Show a simple read-only training log.

### Content

The Progress screen displays completed workouts.

Each item shows:

- Phase
- Week
- Workout
- Completion date
- Difficulty

### Example

- Week 1 · Workout A — Good
- Week 1 · Workout B — Hard
- Week 2 · Workout A — Easy

### Completed Workout Detail

When opened, a completed workout shows:

- Workout title
- Date completed
- Difficulty
- Notes
- Completed drill list

### Rules

- Completed workouts are viewable.
- Completed workouts are read-only.
- Completed workouts are not replayable in MVP.
- Notes are not editable in MVP.

---

## 17. About Screen

### Purpose

Explain what the app is, credit USA Wrestling, show equipment, and include safety guidance.

### About Copy

Solo Wrestler is a personal wrestling curriculum app based on the USA Wrestling Core Curriculum and adapted for solo training with minimal equipment.

The goal is to build wrestling fundamentals step by step, with a focus on self-defense first and BJJ preparation second.

Technique videos and curriculum inspiration come from USA Wrestling’s public curriculum resources.

Button:

**View USA Wrestling Core Curriculum**

URL:

`https://www.usawmembership.com/usa_wrestling_core_curriculum`

### Equipment Section

Required equipment:

- Wrestling/grappling mat
- Wrestling dummy

Optional equipment:

- Knee pads

### Safety Note

Train only on a safe mat surface. Do not dive head-first. Keep your head up and protect your neck. This app is for general training guidance, not professional coaching or medical advice.

---

## 18. Visual Direction

### Style

The app should feel like:

> Olympic wrestling scoreboard + modern training app.

### Visual Identity

Use wrestling-inspired red and blue.

### Suggested Direction

- Dark background
- White text
- Red and blue accent colors
- Card-based workout layout
- Clear status indicators
- Serious athletic look
- No flashy MMA aesthetic
- No cluttered fitness dashboard

### Status Colors

Example:

- Completed: blue or green checkmark
- Current: red/blue highlight
- Locked: muted gray
- Rest/timer active: strong accent color

---

## 19. Local Storage Requirements

The app stores all data locally.

### Store Locally

- First launch completed
- Safety disclaimer accepted
- Current unlocked workout
- In-progress workout
- Completed drill states
- Completed workouts
- Difficulty rating
- Workout notes

### No Backend

MVP does not require:

- authentication
- database
- sync
- cloud backup
- server-side curriculum management

---

## 20. Suggested Data Model

### Curriculum

```ts
export interface Curriculum {
  id: string;
  title: string;
  description: string;
  phases: CurriculumPhase[];
}
```

### Curriculum Phase

```ts
export interface CurriculumPhase {
  id: string;
  title: string;
  description: string;
  status: "available" | "coming-soon";
  weeks: CurriculumWeek[];
}
```

### Curriculum Week

```ts
export interface CurriculumWeek {
  id: string;
  weekNumber: number;
  workouts: WorkoutInstance[];
}
```

### Workout Instance

```ts
export interface WorkoutInstance {
  id: string;
  weekNumber: number;
  workoutTemplateId: string;
  label: string;
  title: string;
  status: "locked" | "current" | "completed";
}
```

### Workout Template

```ts
export interface WorkoutTemplate {
  id: string;
  label: string;
  title: string;
  focus: string;
  estimatedMinutes: {
    min: number;
    max: number;
  };
  equipment: string[];
  drills: Drill[];
}
```

### Drill

```ts
export interface Drill {
  id: string;
  title: string;
  type: "reps" | "duration" | "rounds";
  prescription?: string;
  cue: string;
  details?: string[];
  options?: string[];
  optionInstruction?: string;
  coreTechnique?: string;
  videoUrl?: string;
  estimatedDuration?: {
    seconds: number;
  };
  repsConfig?: RepsDrillConfig;
  durationConfig?: DurationDrillConfig;
  roundsConfig?: RoundsDrillConfig;
}
```

App-wide default rest:

```ts
export const DEFAULT_REST_SECONDS = 120;
```

This applies after every completed drill except the final drill, after warm-up, and after a timed round drill completes in addition to between-round rest. Users can skip rest or add 30 seconds.

### Reps Drill Config

```ts
export interface RepsDrillConfig {
  sets?: number;
  reps?: number;
  perSide?: boolean;
}
```

### Duration Drill Config

```ts
export interface DurationDrillConfig {
  durationSeconds: number;
}
```

### Rounds Drill Config

```ts
export interface RoundsDrillConfig {
  rounds: number;
  roundSeconds: number;
  restBetweenRoundsSeconds: number;
}
```

### In-Progress Workout

```ts
export interface InProgressWorkout {
  workoutInstanceId: string;
  startedAt: string;
  completedDrillIds: string[];
}
```

### Completed Workout

```ts
export interface CompletedWorkout {
  workoutInstanceId: string;
  completedAt: string;
  difficulty: "easy" | "good" | "hard";
  notes?: string;
  completedDrillIds: string[];
}
```

---

## 21. Phase 1: Foundations

### Phase Description

Phase 1 builds the base for a safe, controlled double-leg takedown: stance, motion, level change, penetration step, double-leg entry, finish, and safe disengagement.

### Phase Principle

Enter safely, change levels, keep posture, control both legs, turn the corner, finish on top.

### Structure

- 6 weeks
- 2 workouts per week
- 12 total workouts
- Same two workout templates repeated weekly

### Workout A

**Title:** Mechanics
**Focus:** Stance, motion, level change, penetration step, shadow double leg, dummy finish.
**Estimated duration:** 35-45 minutes
**Equipment:** Mat, wrestling dummy

Drills:

1. Warm-up
   5 minutes
   Cue: Move easy. Protect your neck.
   Details: light bouncing, hip circles, low-impact sprawls, shoulder rolls.
2. Stance and motion
   5 minutes
   Cue: Small steps. Do not cross your feet.
   Details: move forward, backward, left, and right in stance; small steps; do not cross your feet.
3. Level change drill
   3 sets x 10 reps
   Estimated duration: 5 minutes
   Cue: Drop your hips. Stay tall.
4. Penetration step drill
   5 sets x 10 reps
   Estimated duration: 10 minutes
   Cue: Step deep. Stay tall.
   Details: step, knee touch, trail leg up, posture tall.
5. Shadow double leg
   5 rounds x 1 minute with 30 seconds rest between rounds
   Cue: Level change first. Head up.
   Details: move around the mat, feint with hands, level change, penetration step, finish by turning the corner.
6. Dummy finish
   10 minutes
   Cue: Land safely on top.
   Details: start with the dummy already low or leaning, connect shoulder to the dummy, wrap both legs or body, turn the corner, land safely on top.

### Workout B

**Title:** Application
**Focus:** Boxing-to-shot entry, double leg on dummy, safe finish, self-defense exit.
**Estimated duration:** 35-45 minutes
**Equipment:** Mat, wrestling dummy

Drills:

1. Warm-up
   5 minutes
   Cue: Move easy. Protect your neck.
   Details: light bouncing, hip circles, low-impact sprawls, shoulder rolls.
2. Stance and entry
   5 minutes
   Cue: Level change suddenly.
   Details: move in stance, then suddenly level change.
3. Boxing-to-shot entry
   10 minutes
   Cue: Enter safely behind your hands.
   Option instruction: Practice simple entries. Keep the strike as a distraction, not a combination.
   Options: jab feint -> level change -> double leg; jab-cross cover -> step in -> double leg; hands high shell -> level change -> double leg.
4. Double leg on dummy
   20 clean reps
   Estimated duration: 15 minutes
   Cue: Quality over speed.
   Details: head up, hips under you, control both legs or body, turn the corner, finish on top.
5. Self-defense exit drill
   10 minutes
   Cue: Finish safe, then leave or control.
   Option instruction: Choose one exit and practice that.
   Options: land on top -> hands posted -> stand up and back away; land on top -> knee on belly or control for 2 seconds -> disengage; land on top -> move to safe side control position for BJJ.

### Weekly Progression Focus

- Weeks 1-2: Slow mechanics only. Make every rep clean.
- Weeks 3-4: Add boxing feints and faster entries. No wild blasting.
- Weeks 5-6: Start from movement, finish quickly, then disengage.

---

## 22. Success Criteria

The MVP is successful if the user can:

1. Open the app and understand what workout to do next.
2. Start the current unlocked workout.
3. Follow all drill cards in order.
4. Watch technique videos inside the app.
5. Use duration and round timers.
6. Mark drills complete.
7. Use rest timers between drills.
8. Finish a workout only after all drills are complete.
9. Save difficulty and optional notes.
10. Resume an unfinished workout.
11. See completed workouts in Progress.
12. View the curriculum order and locked future workouts.
13. Access equipment info, safety guidance, and USA Wrestling attribution.

---

## 23. User Stories

### First Launch

As a user, I want to see a short intro and safety disclaimer so that I understand the app’s purpose and basic safety expectations.

### Today

As a user, I want to see my current workout immediately so that I know exactly what to train.

### Curriculum

As a user, I want to see the curriculum order so that I understand my progression.

### Locked Workouts

As a user, I want future workouts to be locked so that I follow the curriculum properly.

### Active Workout

As a user, I want to see drill cards in order so that I can complete the workout step by step.

### Technique Video

As a user, I want to watch the technique video inside the app so that I do not lose focus by leaving the app.

### Timer

As a user, I want timers for time-based drills so that I can train without using a separate timer.

### Round Timer

As a user, I want round-based drills to handle rounds and rest automatically so that I can focus on training.

### Drill Completion

As a user, I want to mark each drill complete so that I can track my progress through the workout.

### Rest Timer

As a user, I want a rest timer after drills so that I know when to continue.

### Workout Completion

As a user, I want to save workout difficulty and notes so that I can remember how the session felt.

### Progress

As a user, I want to view completed workouts so that I can see my training history.

---

## 24. Acceptance Criteria

### First Launch

- User sees intro screen on first app open.
- User sees safety disclaimer before accessing workouts.
- User can accept disclaimer.
- Disclaimer is not shown again after acceptance.

### Today Screen

- Current phase is shown.
- Completed workout count is shown.
- Current workout is shown.
- Equipment card is shown.
- Start button opens active workout.
- Resume button appears if workout is in progress.

### Curriculum Screen

- Phase 1 is visible.
- 6 weeks are visible.
- Workout A and B are visible for each week.
- Completed workouts show completed state.
- Current workout is unlocked.
- Future workouts are locked.
- Phase 2 appears as Coming Soon.

### Active Workout

- Drill cards are shown in order.
- Each drill shows title, prescription, core technique, cue, and video button.
- Reps drills can be manually marked complete.
- Duration drills have timer controls.
- Round drills support rounds and rest.
- Completed drills show completed state.
- Workout cannot be finished until all drills are complete.

### Video Modal

- Tapping Watch opens an in-app video modal.
- Video does not open externally.
- User can close the modal and return to the workout.
- A running workout timer pauses while the modal is open and resumes from the same phase and remaining time when the modal closes.
- A timer that was already paused does not resume when the modal closes.
- The modal remains open after playback finishes and while the app is backgrounded.
- The player supports landscape fullscreen playback.
- Failed or timed-out playback can be retried or closed inside the modal.

### Timers

- Duration timer supports start, pause, resume, and reset.
- Round timer supports start, pause, resume, and reset.
- Sound and vibration trigger when timer ends.
- Background notifications are not required.

### Rest Timer

- Rest starts after drill completion if configured.
- User can skip rest.
- User can add +30 seconds.
- Next drill does not auto-start after between-drill rest.

### Completion

- User selects Easy, Good, or Hard.
- User can optionally add a note.
- Saving workout marks it completed.
- Saving workout unlocks next workout.
- Completed workout appears in Progress.

### Progress

- Completed workouts are listed.
- Completed workout detail is read-only.
- Notes cannot be edited.
- Completed workouts cannot be replayed in MVP.

### About

- About copy is displayed.
- Required equipment is displayed.
- Safety note is displayed.
- USA Wrestling curriculum link is displayed.

---

## 25. Future Considerations

Not part of MVP, but possible later:

- Phase 2 and additional phases
- Technique library
- Recommended gear page
- Affiliate links
- Custom workout builder
- Cloud sync
- Authentication
- Analytics
- Video download/offline mode
- User-created notes per drill
- Edit workout notes
- Replay completed workouts
- Background timer notifications
- AI coaching summaries
- Form review
- Public release version
- Multiple curriculum tracks

---

## 26. MVP Summary

Solo Wrestler MVP is a simple, locked solo wrestling curriculum app.

The first version should do one thing extremely well:

> Show the current workout, guide the user through the drills, track completion, and move the user forward through a real curriculum.

No extra features should be added until this core loop feels excellent.
