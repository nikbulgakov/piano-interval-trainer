import { describe, expect, it } from "vitest";
import {
  getIntervalInfo,
  getPitchClassInfo,
  INTERVALS,
  normalizePitchClass,
  PITCH_CLASSES,
} from "./music";

describe("music catalog", () => {
  it("contains 12 pitch classes in chromatic order", () => {
    expect(PITCH_CLASSES).toHaveLength(12);
    expect(PITCH_CLASSES.map((note) => note.value)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
  });

  it("contains all intervals from m2 to P8 without unison", () => {
    expect(INTERVALS).toHaveLength(12);
    expect(INTERVALS.map((interval) => interval.semitones)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(getIntervalInfo(3)?.names.ru.short).toBe("м3");
    expect(getIntervalInfo(3)?.names.en.short).toBe("m3");
    expect(getIntervalInfo(3)?.names.en.full).toBe("minor third");
    expect(getIntervalInfo(7)?.names.ru.short).toBe("ч5");
    expect(getIntervalInfo(7)?.names.en.short).toBe("P5");
    expect(getIntervalInfo(7)?.names.en.full).toBe("perfect fifth");
    expect(getIntervalInfo(6)?.names.ru.short).toBe("тритон");
    expect(getIntervalInfo(6)?.names.en.full).toBe("tritone");
    expect(getIntervalInfo(0)).toBeUndefined();
  });

  it("normalizes MIDI notes to pitch classes", () => {
    expect(normalizePitchClass(60)).toBe(0);
    expect(normalizePitchClass(71)).toBe(11);
    expect(normalizePitchClass(-1)).toBe(11);
    expect(getPitchClassInfo(13).letterName).toBe("C♯/D♭");
  });
});
