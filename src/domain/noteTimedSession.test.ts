import { describe, expect, it } from "vitest";
import type { PitchClass } from "./music";
import {
  advanceNoteTimedSessionToTime,
  createNoteTimedSession,
  updateNoteTimedSessionForNotes,
  type NoteTimedSessionState,
} from "./noteTimedSession";

const notes = [0, 2] as const;
const startedAt = 1_000;
const period = 3_000;

function armSession(
  state: NoteTimedSessionState,
  pitchClasses: readonly PitchClass[] = notes,
): NoteTimedSessionState {
  return updateNoteTimedSessionForNotes(
    state,
    [],
    startedAt,
    pitchClasses,
    () => 0,
  );
}

describe("note timed session", () => {
  it("starts with an absolute next-prompt deadline", () => {
    const state = createNoteTimedSession(notes, startedAt, period, () => 0);

    expect(state.nextPromptAt).toBe(4_000);
    expect(state.phase).toBe("waiting-for-release");
    expect(armSession(state).phase).toBe("awaiting-answer");
  });

  it("shows the next note immediately after a correct answer", () => {
    const armed = armSession(
      createNoteTimedSession(notes, startedAt, period, () => 0),
    );
    const firstTask = armed.bag.current;
    const next = updateNoteTimedSessionForNotes(
      armed,
      firstTask === 0 ? [60] : [62],
      2_000,
      notes,
      () => 0,
    );

    expect(next.correctAnswers).toBe(1);
    expect(next.bag.current).not.toBe(firstTask);
    expect(next.phase).toBe("waiting-for-release");
    expect(next.feedback).toBe("correct");
    expect(next.nextPromptAt).toBe(5_000);
  });

  it("requires release before the immediate next note can be answered", () => {
    const armed = armSession(
      createNoteTimedSession(notes, startedAt, period, () => 0),
    );
    const firstTask = armed.bag.current;
    const correctNote = firstTask === 0 ? 60 : 62;
    const next = updateNoteTimedSessionForNotes(
      armed,
      [correctNote],
      2_000,
      notes,
      () => 0,
    );
    const stillHeld = updateNoteTimedSessionForNotes(
      next,
      [correctNote],
      2_100,
      notes,
      () => 0,
    );
    const released = updateNoteTimedSessionForNotes(
      stillHeld,
      [],
      2_200,
      notes,
      () => 0,
    );

    expect(stillHeld.correctAnswers).toBe(1);
    expect(released.phase).toBe("awaiting-answer");
    expect(released.feedback).toBe("neutral");
  });

  it("counts an unresolved note as missed at the deadline", () => {
    const initial = armSession(
      createNoteTimedSession(notes, startedAt, period, () => 0),
    );
    const next = advanceNoteTimedSessionToTime(
      initial,
      4_000,
      [],
      notes,
      () => 0,
    );

    expect(next.missedTasks).toBe(1);
  });

  it("requires release when keys are held across a prompt boundary", () => {
    const initial = armSession(
      createNoteTimedSession(notes, startedAt, period, () => 0),
    );
    const next = advanceNoteTimedSessionToTime(
      initial,
      4_000,
      [60],
      notes,
      () => 0,
    );
    const stillHeld = updateNoteTimedSessionForNotes(
      next,
      [60],
      4_100,
      notes,
      () => 0,
    );
    const released = updateNoteTimedSessionForNotes(
      stillHeld,
      [],
      4_200,
      notes,
      () => 0,
    );

    expect(next.phase).toBe("waiting-for-release");
    expect(stillHeld.correctAnswers).toBe(0);
    expect(released.phase).toBe("awaiting-answer");
  });

  it("counts one wrong attempt until all keys are released", () => {
    const initial = armSession(
      createNoteTimedSession([0], startedAt, period, () => 0),
      [0],
    );
    const wrong = updateNoteTimedSessionForNotes(
      initial,
      [62],
      2_000,
      [0],
      () => 0,
    );
    const stillHeld = updateNoteTimedSessionForNotes(
      wrong,
      [62, 64],
      2_100,
      [0],
      () => 0,
    );
    const unlocked = updateNoteTimedSessionForNotes(
      stillHeld,
      [],
      2_200,
      [0],
      () => 0,
    );

    expect(wrong.wrongAttempts).toBe(1);
    expect(stillHeld.wrongAttempts).toBe(1);
    expect(unlocked.attemptLocked).toBe(false);
  });
});
