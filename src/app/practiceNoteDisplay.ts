import { getPitchClassInfo } from "../domain/music";
import type { InterfaceLanguage, NoteNotation } from "./appPreferences";

export type PracticeNoteDisplay = {
  letterName: string;
  solfegeNames: {
    ru: string;
    en: string;
  };
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
  const letterVariants = splitNameVariants(note.letterName);
  const variantIndex = letterVariants.length > 1
    ? Math.floor(random() * letterVariants.length)
    : 0;

  return {
    letterName: pickSingleName(note.letterName, variantIndex),
    solfegeNames: {
      ru: pickSingleName(note.solfegeNames.ru, variantIndex),
      en: pickSingleName(note.solfegeNames.en, variantIndex),
    },
  };
}

export function formatPracticeNoteDisplay(
  display: PracticeNoteDisplay,
  notation: NoteNotation,
  language: InterfaceLanguage,
): string {
  return notation === "solfege"
    ? display.solfegeNames[language]
    : display.letterName;
}
