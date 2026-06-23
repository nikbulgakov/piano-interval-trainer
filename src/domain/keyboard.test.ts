import { describe, expect, it } from "vitest";
import {
  getKeyboardNotes,
  isNoteInPracticeRange,
  PRACTICE_MAX_NOTE,
  PRACTICE_MIN_NOTE,
} from "./keyboard";
import { getPitchClassInfo } from "./music";

describe("keyboard model", () => {
  it("creates exactly three octaves", () => {
    const notes = getKeyboardNotes();

    expect(notes).toHaveLength(36);
    expect(notes[0]?.midiNote).toBe(PRACTICE_MIN_NOTE);
    expect(notes.at(-1)?.midiNote).toBe(PRACTICE_MAX_NOTE);
    expect(notes.filter((note) => !note.isBlack)).toHaveLength(21);
    expect(notes.filter((note) => note.isBlack)).toHaveLength(15);
  });

  it("uses pitch-class names independently from an octave", () => {
    expect(getPitchClassInfo(48).latinName).toBe("C");
    expect(getPitchClassInfo(60).russianName).toBe("До");
    expect(getPitchClassInfo(61).latinName).toBe("C♯/D♭");
  });

  it("checks the configured MIDI range boundaries", () => {
    expect(isNoteInPracticeRange(47)).toBe(false);
    expect(isNoteInPracticeRange(48)).toBe(true);
    expect(isNoteInPracticeRange(83)).toBe(true);
    expect(isNoteInPracticeRange(84)).toBe(false);
  });
});
