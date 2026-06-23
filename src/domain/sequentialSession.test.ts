import { describe, expect, it } from "vitest";
import {
  createSequentialSession,
  updateSequentialSessionForNotes,
  type SequentialSessionState,
} from "./sequentialSession";
import { createSessionSummary } from "./sessionSummary";

const roots = [0] as const;
const intervals = [3, 4] as const;

function armSession(state: SequentialSessionState): SequentialSessionState {
  return updateSequentialSessionForNotes(state, [], roots, intervals, () => 0);
}

describe("sequential session", () => {
  it("starts with a task and waits for released keys", () => {
    const state = createSequentialSession(roots, intervals, () => 0);

    expect(state.bag.current).not.toBeNull();
    expect(state.phase).toBe("waiting-for-release");
    expect(armSession(state).phase).toBe("awaiting-answer");
  });

  it("counts one error per held combination", () => {
    const armed = armSession(createSequentialSession([0], [3], () => 0));
    const wrong = updateSequentialSessionForNotes(
      armed,
      [60, 64],
      [0],
      [3],
    );
    const stillHeld = updateSequentialSessionForNotes(
      wrong,
      [60, 64, 67],
      [0],
      [3],
    );

    expect(wrong.feedback).toBe("incorrect");
    expect(wrong.wrongAttempts).toBe(1);
    expect(stillHeld.wrongAttempts).toBe(1);
  });

  it("unlocks a new attempt after fewer than two keys remain", () => {
    const armed = armSession(createSequentialSession([0], [3], () => 0));
    const wrong = updateSequentialSessionForNotes(
      armed,
      [60, 64],
      [0],
      [3],
    );
    const releasedOne = updateSequentialSessionForNotes(
      wrong,
      [60],
      [0],
      [3],
    );
    const correct = updateSequentialSessionForNotes(
      releasedOne,
      [60, 63],
      [0],
      [3],
    );

    expect(releasedOne.attemptLocked).toBe(false);
    expect(releasedOne.feedback).toBe("neutral");
    expect(correct.feedback).toBe("correct");
    expect(correct.correctAnswers).toBe(1);
  });

  it("changes the task only after all keys are released", () => {
    const armed = armSession(createSequentialSession(roots, intervals, () => 0));
    const firstTask = armed.bag.current;
    const correctNotes =
      firstTask?.intervalSemitones === 3 ? [60, 63] : [60, 64];
    const solved = updateSequentialSessionForNotes(
      armed,
      correctNotes,
      roots,
      intervals,
      () => 0,
    );
    const oneHeld = updateSequentialSessionForNotes(
      solved,
      [60],
      roots,
      intervals,
      () => 0,
    );
    const next = updateSequentialSessionForNotes(
      oneHeld,
      [],
      roots,
      intervals,
      () => 0,
    );

    expect(solved.phase).toBe("solved-waiting-for-release");
    expect(oneHeld.bag.current).toEqual(firstTask);
    expect(next.phase).toBe("awaiting-answer");
    expect(next.bag.current).not.toEqual(firstTask);
  });

  it("rejects a chord with an extra in-range key", () => {
    const armed = armSession(createSequentialSession([0], [3], () => 0));
    const result = updateSequentialSessionForNotes(
      armed,
      [60, 63, 67],
      [0],
      [3],
    );

    expect(result.feedback).toBe("incorrect");
    expect(result.correctAnswers).toBe(0);
    expect(result.wrongAttempts).toBe(1);
  });
});

describe("session summary", () => {
  it("calculates rounded accuracy and elapsed time", () => {
    const state: SequentialSessionState = {
      ...createSequentialSession([0], [3], () => 0),
      correctAnswers: 2,
      wrongAttempts: 1,
    };

    expect(
      createSessionSummary(
        {
          correctAnswers: state.correctAnswers,
          wrongAttempts: state.wrongAttempts,
          missedTasks: 0,
        },
        300,
        42.6,
        true,
      ),
    ).toMatchObject({
      plannedDurationSeconds: 300,
      elapsedSeconds: 43,
      correctAnswers: 2,
      wrongAttempts: 1,
      missedTasks: 0,
      accuracyPercent: 67,
      stoppedEarly: true,
    });
  });
});
