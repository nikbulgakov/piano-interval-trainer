import { getIntervalInfo, getPitchClassInfo } from "../domain/music";
import {
  DEFAULT_SYNTH_SETTINGS,
  clampSynthVolume,
  isSynthPreset,
  type SynthSettings,
} from "../audio/synthSettings";

export type NoteNotation = "solfege" | "letter";
export type IntervalNotation = "name" | "symbol";
export type InterfaceLanguage = "ru" | "en";

export type AppPreferences = {
  interfaceLanguage: InterfaceLanguage;
  noteNotation: NoteNotation;
  intervalNotation: IntervalNotation;
  synth: SynthSettings;
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  interfaceLanguage: "ru",
  noteNotation: "solfege",
  intervalNotation: "name",
  synth: DEFAULT_SYNTH_SETTINGS,
};

const STORAGE_KEY = "piano-interval-trainer.preferences.v1";

type PreferencesStorage = Pick<Storage, "getItem" | "setItem">;

function isInterfaceLanguage(value: unknown): value is InterfaceLanguage {
  return value === "ru" || value === "en";
}

function parseNoteNotation(value: unknown): NoteNotation | null {
  if (value === "solfege" || value === "russian") {
    return "solfege";
  }

  if (value === "letter" || value === "latin") {
    return "letter";
  }

  return null;
}

export function formatNoteName(
  pitchClass: number,
  notation: NoteNotation,
  language: InterfaceLanguage,
): string {
  const note = getPitchClassInfo(pitchClass);

  return notation === "solfege"
    ? note.solfegeNames[language]
    : note.letterName;
}

export function formatIntervalName(
  semitones: number,
  notation: IntervalNotation,
  language: InterfaceLanguage,
): string {
  const interval = getIntervalInfo(semitones);

  if (!interval) {
    return "";
  }

  return notation === "name"
    ? interval.names[language].full
    : interval.names[language].short;
}

export function loadAppPreferencesFromStorage(
  storage: PreferencesStorage,
): AppPreferences {
  try {
    const storedPreferences = storage.getItem(STORAGE_KEY);

    if (!storedPreferences) {
      return { ...DEFAULT_APP_PREFERENCES };
    }

    const parsedPreferences: unknown = JSON.parse(storedPreferences);

    if (
      typeof parsedPreferences === "object" &&
      parsedPreferences !== null &&
      "noteNotation" in parsedPreferences &&
      "intervalNotation" in parsedPreferences &&
      (parsedPreferences.intervalNotation === "name" ||
        parsedPreferences.intervalNotation === "symbol")
    ) {
      const noteNotation = parseNoteNotation(parsedPreferences.noteNotation);

      if (!noteNotation) {
        return { ...DEFAULT_APP_PREFERENCES };
      }

      const storedSynth =
        "synth" in parsedPreferences &&
        typeof parsedPreferences.synth === "object" &&
        parsedPreferences.synth !== null
          ? parsedPreferences.synth
          : null;

      return {
        interfaceLanguage:
          "interfaceLanguage" in parsedPreferences &&
          isInterfaceLanguage(parsedPreferences.interfaceLanguage)
            ? parsedPreferences.interfaceLanguage
            : DEFAULT_APP_PREFERENCES.interfaceLanguage,
        noteNotation,
        intervalNotation: parsedPreferences.intervalNotation,
        synth: {
          enabled:
            storedSynth && "enabled" in storedSynth
              ? storedSynth.enabled === true
              : DEFAULT_SYNTH_SETTINGS.enabled,
          preset:
            storedSynth &&
            "preset" in storedSynth &&
            isSynthPreset(storedSynth.preset)
              ? storedSynth.preset
              : DEFAULT_SYNTH_SETTINGS.preset,
          volume:
            storedSynth &&
            "volume" in storedSynth &&
            typeof storedSynth.volume === "number"
              ? clampSynthVolume(storedSynth.volume)
              : DEFAULT_SYNTH_SETTINGS.volume,
        },
      };
    }
  } catch {
    // localStorage can be unavailable in restrictive browser modes.
  }

  return { ...DEFAULT_APP_PREFERENCES };
}

export function loadAppPreferences(): AppPreferences {
  return loadAppPreferencesFromStorage(window.localStorage);
}

export function saveAppPreferencesToStorage(
  preferences: AppPreferences,
  storage: PreferencesStorage,
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Preferences remain active for the current tab if persistence is blocked.
  }
}

export function saveAppPreferences(preferences: AppPreferences): void {
  saveAppPreferencesToStorage(preferences, window.localStorage);
}
