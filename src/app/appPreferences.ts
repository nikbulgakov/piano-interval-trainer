import { getIntervalInfo, getPitchClassInfo } from "../domain/music";

export type NoteNotation = "russian" | "latin";
export type IntervalNotation = "name" | "symbol";

export type AppPreferences = {
  noteNotation: NoteNotation;
  intervalNotation: IntervalNotation;
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  noteNotation: "russian",
  intervalNotation: "name",
};

const STORAGE_KEY = "piano-interval-trainer.preferences.v1";

export function formatNoteName(
  pitchClass: number,
  notation: NoteNotation,
): string {
  const note = getPitchClassInfo(pitchClass);

  return notation === "russian" ? note.russianName : note.latinName;
}

export function formatIntervalName(
  semitones: number,
  notation: IntervalNotation,
): string {
  const interval = getIntervalInfo(semitones);

  if (!interval) {
    return "";
  }

  return notation === "name" ? interval.russianName : interval.shortName;
}

export function loadAppPreferences(): AppPreferences {
  try {
    const storedPreferences = window.localStorage.getItem(STORAGE_KEY);

    if (!storedPreferences) {
      return { ...DEFAULT_APP_PREFERENCES };
    }

    const parsedPreferences: unknown = JSON.parse(storedPreferences);

    if (
      typeof parsedPreferences === "object" &&
      parsedPreferences !== null &&
      "noteNotation" in parsedPreferences &&
      "intervalNotation" in parsedPreferences &&
      (parsedPreferences.noteNotation === "russian" ||
        parsedPreferences.noteNotation === "latin") &&
      (parsedPreferences.intervalNotation === "name" ||
        parsedPreferences.intervalNotation === "symbol")
    ) {
      return {
        noteNotation: parsedPreferences.noteNotation,
        intervalNotation: parsedPreferences.intervalNotation,
      };
    }
  } catch {
    // localStorage can be unavailable in restrictive browser modes.
  }

  return { ...DEFAULT_APP_PREFERENCES };
}

export function saveAppPreferences(preferences: AppPreferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Preferences remain active for the current tab if persistence is blocked.
  }
}
