import type { SynthPreset, SynthSettings } from "./synthSettings";

type PianoSampleStatus = "ready" | "failed";

export type SynthVoiceMode = "sample" | "oscillator" | "none";

export function getSynthVoiceMode(
  preset: SynthPreset,
  pianoSampleStatus: PianoSampleStatus,
): SynthVoiceMode {
  if (preset !== "piano") {
    return "oscillator";
  }

  return pianoSampleStatus === "ready" ? "sample" : "none";
}

export function shouldPreloadPianoSamples(
  settings: SynthSettings,
  hasAudioContext: boolean,
): boolean {
  return settings.enabled && settings.preset === "piano" && hasAudioContext;
}
