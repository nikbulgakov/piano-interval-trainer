import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_APP_PREFERENCES,
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
        noteNotation: "latin",
        intervalNotation: "symbol",
        interfaceLanguage: "en",
      }),
    );

    expect(loadAppPreferencesFromStorage(storage).interfaceLanguage).toBe("en");
  });

  it("falls back to Russian when saved interface language is invalid", () => {
    const storage = createStorage(
      JSON.stringify({
        noteNotation: "latin",
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
});
