import { describe, expect, it, vi } from "vitest";
import {
  loadStoredMidiInputId,
  saveStoredMidiInputId,
} from "./midiInputStorage";

function createStorage(initialValue: string | null = null) {
  return {
    getItem: vi.fn(() => initialValue),
    removeItem: vi.fn(),
    setItem: vi.fn(),
  };
}

describe("midi input storage", () => {
  it("loads the saved MIDI input id", () => {
    const storage = createStorage("keyboard-1");

    expect(loadStoredMidiInputId(storage)).toBe("keyboard-1");
  });

  it("saves a selected MIDI input id", () => {
    const storage = createStorage();

    saveStoredMidiInputId("keyboard-2", storage);

    expect(storage.setItem).toHaveBeenCalledWith(
      "piano-interval-trainer:midi-input-id",
      "keyboard-2",
    );
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("clears the saved MIDI input id when selection is empty", () => {
    const storage = createStorage("keyboard-1");

    saveStoredMidiInputId("", storage);

    expect(storage.removeItem).toHaveBeenCalledWith(
      "piano-interval-trainer:midi-input-id",
    );
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("falls back to empty id when storage throws", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    };

    expect(loadStoredMidiInputId(storage)).toBe("");
  });
});
