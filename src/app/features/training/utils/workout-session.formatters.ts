import {
  Drill,
  DrillType,
  WorkoutTemplate,
} from '../models/curriculum.model';

export function formatDrillMeta(drill: Drill): string | null {
  if (drill.prescription) {
    return drill.prescription;
  }

  if (drill.durationConfig) {
    return formatMinutes(drill.durationConfig.durationSeconds);
  }

  if (drill.roundsConfig) {
    return `${drill.roundsConfig.rounds} rounds x ${formatMinutes(
      drill.roundsConfig.roundSeconds,
    )} with ${drill.roundsConfig.restBetweenRoundsSeconds} sec rest`;
  }

  return null;
}

export function drillActionLabel(drill: Drill): string {
  if (drill.type === 'reps') {
    return 'Mark Complete';
  }

  return 'Start';
}

export function drillActionIcon(drill: Drill): string {
  if (drill.type === 'reps') {
    return 'checkmark-circle-outline';
  }

  return 'play-outline';
}

export function drillProgressText(
  workoutTemplate: WorkoutTemplate,
  completedDrillCount: number,
): string {
  const drillCount = workoutTemplate.drills.length;

  return `${completedDrillCount} of ${drillCount} drills complete`;
}

export function formatClock(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatRest(seconds: number): string {
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;

    return `${minutes} min`;
  }

  return `${seconds} sec`;
}

export function coreTechnique(drill: Drill): string {
  return drill.coreTechnique ?? drill.title;
}

export function timerClock(drill: Drill): string {
  if (drill.durationConfig) {
    return formatClock(drill.durationConfig.durationSeconds);
  }

  if (drill.roundsConfig) {
    return formatClock(drill.roundsConfig.roundSeconds);
  }

  return '0:00';
}

export function timerLabel(drill: Drill): string {
  if (drill.roundsConfig) {
    return `Round 1 of ${drill.roundsConfig.rounds}`;
  }

  return 'Work timer';
}

export function restText(drill: Drill, defaultRestSeconds: number): string {
  if (drill.roundsConfig) {
    return `${formatRest(
      drill.roundsConfig.restBetweenRoundsSeconds,
    )} between rounds`;
  }

  return `${formatRest(defaultRestSeconds)} default rest`;
}

export function drillTypeLabel(type: DrillType): string {
  if (type === 'reps') {
    return 'Reps';
  }

  if (type === 'duration') {
    return 'Timed';
  }

  return 'Rounds';
}

function formatMinutes(durationSeconds: number): string {
  if (durationSeconds % 60 === 0) {
    return `${durationSeconds / 60} min`;
  }

  return `${durationSeconds} sec`;
}
