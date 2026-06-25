import { describe, expect, it } from "vitest";
import { getSynthVoiceMode, shouldPreloadPianoSamples } from "./synthVoiceMode";

describe("synth voice mode", () => {
  it("uses samples for piano when a sample is available", () => {
    expect(getSynthVoiceMode("piano", "ready")).toBe("sample");
  });

  it("does not fall back to the old oscillator sound for piano sample failures", () => {
    expect(getSynthVoiceMode("piano", "failed")).toBe("none");
  });

  it("uses oscillators for non-piano presets", () => {
    expect(getSynthVoiceMode("synth", "failed")).toBe("oscillator");
    expect(getSynthVoiceMode("electric-piano", "failed")).toBe("oscillator");
  });

  it("does not preload piano samples before an audio context exists", () => {
    expect(
      shouldPreloadPianoSamples(
        { enabled: true, preset: "piano", volume: 0.7 },
        false,
      ),
    ).toBe(false);
  });

  it("preloads piano samples after an audio context exists", () => {
    expect(
      shouldPreloadPianoSamples(
        { enabled: true, preset: "piano", volume: 0.7 },
        true,
      ),
    ).toBe(true);
  });
});
