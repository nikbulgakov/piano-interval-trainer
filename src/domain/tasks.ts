import {
  PRACTICE_MAX_NOTE,
  PRACTICE_MIN_NOTE,
  isNoteInPracticeRange,
} from "./keyboard";
import {
  type IntervalSemitones,
  type PitchClass,
  normalizePitchClass,
} from "./music";

export type TrainingTask = {
  rootPitchClass: PitchClass;
  intervalSemitones: IntervalSemitones;
};

export type MidiPair = readonly [lower: number, upper: number];

export type TaskBagState = {
  current: TrainingTask | null;
  remaining: TrainingTask[];
};

export function isSameTask(
  left: TrainingTask | null,
  right: TrainingTask | null,
): boolean {
  return (
    left !== null &&
    right !== null &&
    left.rootPitchClass === right.rootPitchClass &&
    left.intervalSemitones === right.intervalSemitones
  );
}

export function buildTaskPool(
  pitchClasses: readonly PitchClass[],
  intervalSemitones: readonly IntervalSemitones[],
): TrainingTask[] {
  const seen = new Set<string>();
  const tasks: TrainingTask[] = [];

  for (const rootPitchClass of pitchClasses) {
    for (const interval of intervalSemitones) {
      const key = `${rootPitchClass}:${interval}`;

      if (!seen.has(key)) {
        seen.add(key);
        tasks.push({ rootPitchClass, intervalSemitones: interval });
      }
    }
  }

  return tasks;
}

export function getValidMidiPairs(
  task: TrainingTask,
  minNote = PRACTICE_MIN_NOTE,
  maxNote = PRACTICE_MAX_NOTE,
): MidiPair[] {
  const pairs: MidiPair[] = [];

  for (let lower = minNote; lower <= maxNote; lower += 1) {
    const upper = lower + task.intervalSemitones;

    if (
      normalizePitchClass(lower) === task.rootPitchClass &&
      upper <= maxNote
    ) {
      pairs.push([lower, upper]);
    }
  }

  return pairs;
}

export function isExactTaskAnswer(
  activeNotes: Iterable<number>,
  task: TrainingTask,
): boolean {
  const notesInRange = Array.from(new Set(activeNotes))
    .filter(isNoteInPracticeRange)
    .sort((left, right) => left - right);

  if (notesInRange.length !== 2) {
    return false;
  }

  const [lower, upper] = notesInRange;

  return (
    lower !== undefined &&
    upper !== undefined &&
    normalizePitchClass(lower) === task.rootPitchClass &&
    upper - lower === task.intervalSemitones
  );
}

function randomIndex(maxInclusive: number, random: () => number): number {
  const candidate = Math.floor(random() * (maxInclusive + 1));
  return Math.max(0, Math.min(maxInclusive, candidate));
}

export function createShuffledTaskBag(
  pitchClasses: readonly PitchClass[],
  intervalSemitones: readonly IntervalSemitones[],
  previousTask: TrainingTask | null = null,
  random: () => number = Math.random,
): TrainingTask[] {
  const tasks = buildTaskPool(pitchClasses, intervalSemitones);

  for (let index = tasks.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index, random);
    [tasks[index], tasks[swapIndex]] = [tasks[swapIndex], tasks[index]];
  }

  if (tasks.length > 1 && isSameTask(tasks[0] ?? null, previousTask)) {
    const replacementIndex = tasks.findIndex(
      (task) => !isSameTask(task, previousTask),
    );

    if (replacementIndex > 0) {
      [tasks[0], tasks[replacementIndex]] = [
        tasks[replacementIndex],
        tasks[0],
      ];
    }
  }

  return tasks;
}

export function drawNextTask(
  state: TaskBagState,
  pitchClasses: readonly PitchClass[],
  intervalSemitones: readonly IntervalSemitones[],
  random: () => number = Math.random,
): TaskBagState {
  const bag =
    state.remaining.length > 0
      ? [...state.remaining]
      : createShuffledTaskBag(
          pitchClasses,
          intervalSemitones,
          state.current,
          random,
        );
  const current = bag.shift() ?? null;

  return { current, remaining: bag };
}

