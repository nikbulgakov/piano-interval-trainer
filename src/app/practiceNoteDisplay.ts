import { getPitchClassInfo } from "../domain/music";
import type { NoteNotation } from "./appPreferences";

export type PracticeNoteDisplay = {
  latinName: string;
  russianName: string;
};

function splitNameVariants(name: string): string[] {
  return name.split("/");
}

function pickSingleName(name: string, index: number): string {
  const variants = name.split("/");

  if (variants.length < 2) {
    return name;
  }

  return variants[index] ?? variants[0] ?? name;
}

export function createPracticeNoteDisplay(
  pitchClass: number,
  random: () => number = Math.random,
): PracticeNoteDisplay {
  const note = getPitchClassInfo(pitchClass);
  const latinVariants = splitNameVariants(note.latinName);
  const variantIndex =
    latinVariants.length > 1
      ? Math.floor(random() * latinVariants.length)
      : 0;

  return {
    latinName: pickSingleName(note.latinName, variantIndex),
    russianName: pickSingleName(note.russianName, variantIndex),
  };
}

export function formatPracticeNoteDisplay(
  display: PracticeNoteDisplay,
  notation: NoteNotation,
): string {
  return notation === "russian" ? display.russianName : display.latinName;
}
