import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_APP_PREFERENCES,
  formatIntervalName,
  formatNoteName,
  loadAppPreferencesFromStorage,
  saveAppPreferencesToStorage,
} from "./appPreferences";

function createStorage(initialValue: string | null = null) {
  return {
    getItem: vi.fn(() => initialValue),
    setItem: vi.fn(),
  };
}

describe("app preferences", () => {
  it("uses Russian interface language by default", () => {
    expect(DEFAULT_APP_PREFERENCES.interfaceLanguage).toBe("ru");
  });

  it("loads a saved English interface language", () => {
    const storage = createStorage(
      JSON.stringify({
        noteNotation: "letter",
        intervalNotation: "symbol",
        interfaceLanguage: "en",
      }),
    );

    expect(loadAppPreferencesFromStorage(storage).interfaceLanguage).toBe("en");
  });

  it("falls back to Russian when saved interface language is invalid", () => {
    const storage = createStorage(
      JSON.stringify({
        noteNotation: "letter",
        intervalNotation: "symbol",
        interfaceLanguage: "de",
      }),
    );

    expect(loadAppPreferencesFromStorage(storage).interfaceLanguage).toBe("ru");
  });

  it("saves the selected interface language", () => {
    const storage = createStorage();

    saveAppPreferencesToStorage(
      {
        ...DEFAULT_APP_PREFERENCES,
        interfaceLanguage: "en",
      },
      storage,
    );

    const savedValue = storage.setItem.mock.calls[0]?.[1];

    expect(savedValue ? JSON.parse(savedValue).interfaceLanguage : null).toBe(
      "en",
    );
  });

  it("formats intervals using notation and interface language", () => {
    expect(formatIntervalName(3, "name", "ru")).toBe("малая терция");
    expect(formatIntervalName(3, "symbol", "ru")).toBe("м3");
    expect(formatIntervalName(7, "name", "en")).toBe("perfect fifth");
    expect(formatIntervalName(7, "symbol", "en")).toBe("P5");
    expect(formatIntervalName(6, "symbol", "ru")).toBe("тритон");
  });

  it("formats note names using global note notation and interface language", () => {
    expect(formatNoteName(1, "solfege", "ru")).toBe("До♯/Ре♭");
    expect(formatNoteName(1, "solfege", "en")).toBe("Do♯/Re♭");
    expect(formatNoteName(1, "letter", "ru")).toBe("C♯/D♭");
    expect(formatNoteName(1, "letter", "en")).toBe("C♯/D♭");
  });

  it("migrates old note notation values from local storage", () => {
    expect(
      loadAppPreferencesFromStorage(
        createStorage(
          JSON.stringify({
            noteNotation: "russian",
            intervalNotation: "name",
          }),
        ),
      ).noteNotation,
    ).toBe("solfege");

    expect(
      loadAppPreferencesFromStorage(
        createStorage(
          JSON.stringify({
            noteNotation: "latin",
            intervalNotation: "name",
          }),
        ),
      ).noteNotation,
    ).toBe("letter");
  });
});
