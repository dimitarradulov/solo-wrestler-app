import {
  Drill,
  DrillType,
  WorkoutTemplate,
} from '../../curriculum/model/curriculum.model';

export function toYouTubeEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      const videoId = url.pathname.split('/').filter(Boolean)[0];

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (hostname !== 'youtube.com' && hostname !== 'm.youtube.com') {
      return null;
    }

    if (url.pathname.startsWith('/embed/')) {
      const videoId = url.pathname.split('/').filter(Boolean)[1];

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    const videoId = url.searchParams.get('v');

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export type MockDrillState = 'completed' | 'current' | 'queued';

export function trackDrill(index: number, drill: Drill): string {
  return `${index}-${drill.id}`;
}

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

export function drillState(index: number): MockDrillState {
  if (index === 0) {
    return 'completed';
  }

  if (index === 1) {
    return 'current';
  }

  return 'queued';
}

export function drillStateLabel(index: number): string {
  const currentDrillState = drillState(index);

  if (currentDrillState === 'completed') {
    return 'Complete';
  }

  if (currentDrillState === 'current') {
    return 'Current';
  }

  return 'Queued';
}

export function currentDrillTitle(workoutTemplate: WorkoutTemplate): string {
  return (
    workoutTemplate.drills[1]?.title ??
    workoutTemplate.drills[0]?.title ??
    'None'
  );
}

export function formatEquipment(
  workoutTemplate: WorkoutTemplate | null,
): string {
  if (workoutTemplate === null) {
    return '';
  }

  return workoutTemplate.equipment.join(' + ');
}

export function formatRest(seconds: number): string {
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;

    return `${minutes} min`;
  }

  return `${seconds} sec`;
}

export function formatClock(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function coreTechnique(drill: Drill): string {
  return drill.coreTechnique ?? drill.title;
}

export function hasTimerPreview(drill: Drill): boolean {
  return drill.type === 'duration' || drill.type === 'rounds';
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
