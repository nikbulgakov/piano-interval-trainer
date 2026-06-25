const MIDI_INPUT_STORAGE_KEY = "piano-interval-trainer:midi-input-id";

type MidiInputStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

function getDefaultStorage(): MidiInputStorage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function loadStoredMidiInputId(
  storage: MidiInputStorage | null = getDefaultStorage(),
): string {
  if (!storage) {
    return "";
  }

  try {
    return storage.getItem(MIDI_INPUT_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveStoredMidiInputId(
  inputId: string,
  storage: MidiInputStorage | null = getDefaultStorage(),
) {
  if (!storage) {
    return;
  }

  try {
    if (inputId) {
      storage.setItem(MIDI_INPUT_STORAGE_KEY, inputId);
    } else {
      storage.removeItem(MIDI_INPUT_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable in private mode or blocked by browser policy.
  }
}
