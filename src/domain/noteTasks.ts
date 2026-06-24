import { isNoteInPracticeRange } from "./keyboard";
import { normalizePitchClass, type PitchClass } from "./music";

export type NoteTaskBagState = {
  current: PitchClass | null;
  remaining: PitchClass[];
};

function randomIndex(maxInclusive: number, random: () => number): number {
  const candidate = Math.floor(random() * (maxInclusive + 1));
  return Math.max(0, Math.min(maxInclusive, candidate));
}

export function isExactNoteAnswer(
  activeNotes: Iterable<number>,
  targetPitchClass: PitchClass,
): boolean {
  const notesInRange = Array.from(new Set(activeNotes)).filter(
    isNoteInPracticeRange,
  );

  return (
    notesInRange.length === 1 &&
    normalizePitchClass(notesInRange[0] ?? -1) === targetPitchClass
  );
}

export function createShuffledNoteBag(
  pitchClasses: readonly PitchClass[],
  previousTask: PitchClass | null = null,
  random: () => number = Math.random,
): PitchClass[] {
  const tasks = Array.from(new Set(pitchClasses));

  for (let index = tasks.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index, random);
    [tasks[index], tasks[swapIndex]] = [tasks[swapIndex], tasks[index]];
  }

  if (tasks.length > 1 && tasks[0] === previousTask) {
    const replacementIndex = tasks.findIndex((task) => task !== previousTask);

    if (replacementIndex > 0) {
      [tasks[0], tasks[replacementIndex]] = [
        tasks[replacementIndex],
        tasks[0],
      ];
    }
  }

  return tasks;
}

export function drawNextNoteTask(
  state: NoteTaskBagState,
  pitchClasses: readonly PitchClass[],
  random: () => number = Math.random,
): NoteTaskBagState {
  const bag =
    state.remaining.length > 0
      ? [...state.remaining]
      : createShuffledNoteBag(pitchClasses, state.current, random);
  const current = bag.shift() ?? null;

  return { current, remaining: bag };
}
