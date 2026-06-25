import { describe, expect, it } from "vitest";
import {
  createNoteSequentialSession,
  updateNoteSequentialSessionForNotes,
} from "./noteSequentialSession";

describe("note sequential session", () => {
  it("increments task serial only after the solved note is released", () => {
    const initial = createNoteSequentialSession([1], () => 0);
    const armed = updateNoteSequentialSessionForNotes(
      initial,
      [],
      [1],
      () => 0,
    );
    const solved = updateNoteSequentialSessionForNotes(
      armed,
      [61],
      [1],
      () => 0,
    );
    const next = updateNoteSequentialSessionForNotes(
      solved,
      [],
      [1],
      () => 0,
    );

    expect(solved.taskSerial).toBe(armed.taskSerial);
    expect(next.taskSerial).toBe(armed.taskSerial + 1);
  });
});
