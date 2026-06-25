import { describe, expect, it } from "vitest";
import {
  DEFAULT_SYNTH_SETTINGS,
  getMidiNoteFrequency,
  getNoteGain,
  isSynthPreset,
} from "./synthSettings";

describe("synth settings", () => {
  it("uses sound enabled with piano at 70 percent volume by default", () => {
    expect(DEFAULT_SYNTH_SETTINGS).toEqual({
      enabled: true,
      preset: "piano",
      volume: 0.7,
    });
  });

  it("validates supported synth presets", () => {
    expect(isSynthPreset("piano")).toBe(true);
    expect(isSynthPreset("synth")).toBe(true);
    expect(isSynthPreset("electric-piano")).toBe(true);
    expect(isSynthPreset("organ")).toBe(false);
  });

  it("scales note gain by velocity and master volume", () => {
    expect(getNoteGain({ velocity: 64, volume: 0.5 })).toBeCloseTo(0.252, 3);
    expect(getNoteGain({ velocity: 127, volume: 0.7 })).toBeCloseTo(0.7, 3);
    expect(getNoteGain({ velocity: 0, volume: 0.7 })).toBe(0);
  });

  it("converts MIDI note numbers to equal-tempered frequencies", () => {
    expect(getMidiNoteFrequency(69)).toBeCloseTo(440, 5);
    expect(getMidiNoteFrequency(60)).toBeCloseTo(261.626, 3);
  });
});
