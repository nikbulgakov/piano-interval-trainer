import { describe, expect, it } from "vitest";
import { getNearestPianoSample, PIANO_SAMPLES } from "./pianoSamples";

describe("piano samples", () => {
  it("uses the local Salamander sample set in minor thirds", () => {
    expect(PIANO_SAMPLES.map((sample) => sample.name)).toEqual([
      "C3",
      "Ds3",
      "Fs3",
      "A3",
      "C4",
      "Ds4",
      "Fs4",
      "A4",
      "C5",
      "Ds5",
      "Fs5",
      "A5",
      "C6",
    ]);
  });

  it("finds the nearest sample for notes inside the practice range", () => {
    expect(getNearestPianoSample(48).sample.name).toBe("C3");
    expect(getNearestPianoSample(50).sample.name).toBe("Ds3");
    expect(getNearestPianoSample(83).sample.name).toBe("C6");
  });

  it("returns playback rate relative to the selected sample pitch", () => {
    expect(getNearestPianoSample(48).playbackRate).toBeCloseTo(1, 5);
    expect(getNearestPianoSample(49).playbackRate).toBeCloseTo(2 ** (1 / 12), 5);
    expect(getNearestPianoSample(83).playbackRate).toBeCloseTo(2 ** (-1 / 12), 5);
  });
});
