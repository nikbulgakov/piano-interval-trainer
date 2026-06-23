import { describe, expect, it } from "vitest";
import type { IntervalSemitones, PitchClass } from "./music";
import {
  advanceTimedSessionToTime,
  createTimedSession,
  updateTimedSessionForNotes,
  type TimedSessionState,
} from "./timedSession";

const roots = [0] as const;
const intervals = [3, 4] as const;
const startedAt = 1_000;
const period = 3_000;

function armSession(
  state: TimedSessionState,
  pitchClasses: readonly PitchClass[] = roots,
  intervalSemitones: readonly IntervalSemitones[] = intervals,
): TimedSessionState {
  return updateTimedSessionForNotes(
    state,
    [],
    startedAt,
    pitchClasses,
    intervalSemitones,
    () => 0,
  );
}

describe("timed session", () => {
  it("starts with an absolute next-prompt deadline", () => {
    const state = createTimedSession(
      roots,
      intervals,
      startedAt,
      period,
      () => 0,
    );

    expect(state.nextPromptAt).toBe(4_000);
    expect(state.phase).toBe("waiting-for-release");
    expect(armSession(state).phase).toBe("awaiting-answer");
  });

  it("shows the next task immediately after a correct answer", () => {
    const armed = armSession(
      createTimedSession(roots, intervals, startedAt, period, () => 0),
    );
    const firstTask = armed.bag.current;
    const correctNotes =
      firstTask?.intervalSemitones === 3 ? [60, 63] : [60, 64];
    const solvedAt = 2_000;
    const next = updateTimedSessionForNotes(
      armed,
      correctNotes,
      solvedAt,
      roots,
      intervals,
      () => 0,
    );

    expect(next.correctAnswers).toBe(1);
    expect(next.bag.current).not.toEqual(firstTask);
    expect(next.phase).toBe("waiting-for-release");
    expect(next.feedback).toBe("correct");
    expect(next.nextPromptAt).toBe(5_000);
  });

  it("requires release before the immediate next task can be answered", () => {
    const armed = armSession(
      createTimedSession(roots, intervals, startedAt, period, () => 0),
    );
    const firstTask = armed.bag.current;
    const correctNotes =
      firstTask?.intervalSemitones === 3 ? [60, 63] : [60, 64];
    const next = updateTimedSessionForNotes(
      armed,
      correctNotes,
      2_000,
      roots,
      intervals,
      () => 0,
    );
    const stillHeld = updateTimedSessionForNotes(
      next,
      correctNotes,
      2_100,
      roots,
      intervals,
      () => 0,
    );
    const released = updateTimedSessionForNotes(
      stillHeld,
      [],
      2_200,
      roots,
      intervals,
      () => 0,
    );

    expect(stillHeld.correctAnswers).toBe(1);
    expect(released.phase).toBe("awaiting-answer");
    expect(released.feedback).toBe("neutral");
  });

  it("uses the reset deadline after an early correct answer", () => {
    const armed = armSession(
      createTimedSession([0], [3], startedAt, period, () => 0),
      [0],
      [3],
    );
    const next = updateTimedSessionForNotes(
      armed,
      [60, 63],
      2_000,
      [0],
      [3],
      () => 0,
    );
    const beforeResetDeadline = advanceTimedSessionToTime(
      next,
      4_000,
      [],
      [0],
      [3],
      () => 0,
    );
    const atResetDeadline = advanceTimedSessionToTime(
      next,
      5_000,
      [],
      [0],
      [3],
      () => 0,
    );

    expect(beforeResetDeadline).toBe(next);
    expect(atResetDeadline.missedTasks).toBe(1);
  });

  it("counts an unresolved task as missed at the deadline", () => {
    const initial = armSession(
      createTimedSession(roots, intervals, startedAt, period, () => 0),
    );
    const next = advanceTimedSessionToTime(
      initial,
      4_000,
      [],
      roots,
      intervals,
      () => 0,
    );

    expect(next.missedTasks).toBe(1);
  });

  it("requires release when keys are held across a prompt boundary", () => {
    const initial = armSession(
      createTimedSession(roots, intervals, startedAt, period, () => 0),
    );
    const next = advanceTimedSessionToTime(
      initial,
      4_000,
      [60, 63],
      roots,
      intervals,
      () => 0,
    );
    const stillHeld = updateTimedSessionForNotes(
      next,
      [60, 63],
      4_100,
      roots,
      intervals,
    );
    const released = updateTimedSessionForNotes(
      stillHeld,
      [],
      4_200,
      roots,
      intervals,
    );

    expect(next.phase).toBe("waiting-for-release");
    expect(stillHeld.correctAnswers).toBe(0);
    expect(released.phase).toBe("awaiting-answer");
  });

  it("catches up every elapsed fixed deadline after a long delay", () => {
    const initial = armSession(
      createTimedSession(roots, intervals, startedAt, period, () => 0),
    );
    const caughtUp = advanceTimedSessionToTime(
      initial,
      11_500,
      [],
      roots,
      intervals,
      () => 0,
    );

    expect(caughtUp.missedTasks).toBe(3);
    expect(caughtUp.nextPromptAt).toBe(13_000);
  });

  it("counts one wrong attempt until the chord is released", () => {
    const initial = armSession(
      createTimedSession([0], [3], startedAt, period, () => 0),
    );
    const wrong = updateTimedSessionForNotes(
      initial,
      [60, 64],
      2_000,
      [0],
      [3],
    );
    const stillHeld = updateTimedSessionForNotes(
      wrong,
      [60, 64, 67],
      2_100,
      [0],
      [3],
    );
    const unlocked = updateTimedSessionForNotes(
      stillHeld,
      [60],
      2_200,
      [0],
      [3],
    );

    expect(wrong.wrongAttempts).toBe(1);
    expect(stillHeld.wrongAttempts).toBe(1);
    expect(unlocked.attemptLocked).toBe(false);
  });
});
