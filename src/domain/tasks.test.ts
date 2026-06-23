import { describe, expect, it } from "vitest";
import {
  buildTaskPool,
  createShuffledTaskBag,
  drawNextTask,
  getValidMidiPairs,
  isExactTaskAnswer,
  isSameTask,
  type TaskBagState,
  type TrainingTask,
} from "./tasks";

const cMinorThird: TrainingTask = {
  rootPitchClass: 0,
  intervalSemitones: 3,
};

describe("task pool", () => {
  it("builds each selected note and interval combination once", () => {
    const pool = buildTaskPool([0, 2, 2], [3, 4, 4]);

    expect(pool).toHaveLength(4);
    expect(pool).toEqual([
      { rootPitchClass: 0, intervalSemitones: 3 },
      { rootPitchClass: 0, intervalSemitones: 4 },
      { rootPitchClass: 2, intervalSemitones: 3 },
      { rootPitchClass: 2, intervalSemitones: 4 },
    ]);
  });

  it("does not repeat the previous task at a new bag boundary", () => {
    const previous: TrainingTask = {
      rootPitchClass: 0,
      intervalSemitones: 4,
    };
    const bag = createShuffledTaskBag([0], [3, 4], previous, () => 0);

    expect(isSameTask(bag[0] ?? null, previous)).toBe(false);
  });

  it("visits the whole pool before refilling", () => {
    let state: TaskBagState = { current: null, remaining: [] };
    const drawn: TrainingTask[] = [];

    for (let index = 0; index < 4; index += 1) {
      state = drawNextTask(state, [0, 2], [3, 4], () => 0.25);

      if (state.current) {
        drawn.push(state.current);
      }
    }

    expect(new Set(drawn.map((task) => JSON.stringify(task))).size).toBe(4);
    expect(state.remaining).toHaveLength(0);

    const refilled = drawNextTask(state, [0, 2], [3, 4], () => 0.25);
    expect(isSameTask(refilled.current, state.current)).toBe(false);
  });
});

describe("MIDI answer rules", () => {
  it("builds all valid positions inside the three-octave range", () => {
    expect(getValidMidiPairs(cMinorThird)).toEqual([
      [48, 51],
      [60, 63],
      [72, 75],
    ]);
    expect(
      getValidMidiPairs({ rootPitchClass: 11, intervalSemitones: 12 }),
    ).toEqual([
      [59, 71],
      [71, 83],
    ]);
  });

  it("accepts exactly the requested pair in any input order", () => {
    expect(isExactTaskAnswer([60, 63], cMinorThird)).toBe(true);
    expect(isExactTaskAnswer([63, 60], cMinorThird)).toBe(true);
  });

  it("rejects wrong intervals, missing notes and extra in-range notes", () => {
    expect(isExactTaskAnswer([60, 64], cMinorThird)).toBe(false);
    expect(isExactTaskAnswer([60], cMinorThird)).toBe(false);
    expect(isExactTaskAnswer([60, 63, 67], cMinorThird)).toBe(false);
  });

  it("ignores notes outside the configured practice range", () => {
    expect(isExactTaskAnswer([47, 60, 63, 84], cMinorThird)).toBe(true);
  });
});

