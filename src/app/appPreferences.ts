import { getIntervalInfo, getPitchClassInfo } from "../domain/music";
import {
  DEFAULT_SYNTH_SETTINGS,
  clampSynthVolume,
  isSynthPreset,
  type SynthSettings,
} from "../audio/synthSettings";

export type NoteNotation = "russian" | "latin";
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
  noteNotation: "russian",
  intervalNotation: "name",
  synth: DEFAULT_SYNTH_SETTINGS,
};

const STORAGE_KEY = "piano-interval-trainer.preferences.v1";

type PreferencesStorage = Pick<Storage, "getItem" | "setItem">;

function isInterfaceLanguage(value: unknown): value is InterfaceLanguage {
  return value === "ru" || value === "en";
}

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
      (parsedPreferences.noteNotation === "russian" ||
        parsedPreferences.noteNotation === "latin") &&
      (parsedPreferences.intervalNotation === "name" ||
        parsedPreferences.intervalNotation === "symbol")
    ) {
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
        noteNotation: parsedPreferences.noteNotation,
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
