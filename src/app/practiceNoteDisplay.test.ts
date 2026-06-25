import { describe, expect, it } from "vitest";
import {
  createPracticeNoteDisplay,
  formatPracticeNoteDisplay,
} from "./practiceNoteDisplay";

describe("practice note display", () => {
  it("keeps white notes unchanged", () => {
    expect(createPracticeNoteDisplay(0, () => 0)).toEqual({
      latinName: "C",
      russianName: "До",
    });
  });

  it("chooses the sharp spelling for a black note", () => {
    expect(createPracticeNoteDisplay(3, () => 0)).toEqual({
      latinName: "D♯",
      russianName: "Ре♯",
    });
  });

  it("chooses the flat spelling for a black note", () => {
    expect(createPracticeNoteDisplay(3, () => 0.99)).toEqual({
      latinName: "E♭",
      russianName: "Ми♭",
    });
  });

  it("formats the stable display using app notation", () => {
    const display = createPracticeNoteDisplay(10, () => 0.99);

    expect(formatPracticeNoteDisplay(display, "latin")).toBe("B♭");
    expect(formatPracticeNoteDisplay(display, "russian")).toBe("Си♭");
  });

  it("keeps latin and russian spellings on the same enharmonic side", () => {
    const values = [0, 0.99];
    const display = createPracticeNoteDisplay(3, () => values.shift() ?? 0);

    expect(display).toEqual({
      latinName: "D♯",
      russianName: "Ре♯",
    });
  });
});
