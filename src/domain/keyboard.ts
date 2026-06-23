import {
  getPitchClassInfo,
  normalizePitchClass,
  type PitchClass,
  type PitchClassInfo,
} from "./music";

export const PRACTICE_MIN_NOTE = 48;
export const PRACTICE_MAX_NOTE = 83;

export type KeyboardNote = PitchClassInfo & {
  midiNote: number;
  pitchClass: PitchClass;
};

export function getKeyboardNotes(
  minNote = PRACTICE_MIN_NOTE,
  maxNote = PRACTICE_MAX_NOTE,
): KeyboardNote[] {
  if (maxNote < minNote) {
    return [];
  }

  return Array.from({ length: maxNote - minNote + 1 }, (_, index) => {
    const midiNote = minNote + index;
    const pitchClass = normalizePitchClass(midiNote);

    return {
      midiNote,
      pitchClass,
      ...getPitchClassInfo(pitchClass),
    };
  });
}

export function isNoteInPracticeRange(midiNote: number): boolean {
  return midiNote >= PRACTICE_MIN_NOTE && midiNote <= PRACTICE_MAX_NOTE;
}
