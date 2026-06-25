export type SynthPreset = "piano" | "synth" | "electric-piano";

export type SynthSettings = {
  enabled: boolean;
  preset: SynthPreset;
  volume: number;
};

export const SYNTH_PRESETS: SynthPreset[] = [
  "piano",
  "synth",
  "electric-piano",
];

export const DEFAULT_SYNTH_SETTINGS: SynthSettings = {
  enabled: true,
  preset: "piano",
  volume: 0.7,
};

export function isSynthPreset(value: unknown): value is SynthPreset {
  return (
    value === "piano" || value === "synth" || value === "electric-piano"
  );
}

export function clampSynthVolume(volume: number): number {
  if (!Number.isFinite(volume)) {
    return DEFAULT_SYNTH_SETTINGS.volume;
  }

  return Math.min(1, Math.max(0, volume));
}

export function getNoteGain({
  velocity,
  volume,
}: {
  velocity: number;
  volume: number;
}): number {
  const normalizedVelocity = Math.min(127, Math.max(0, velocity)) / 127;

  return normalizedVelocity * clampSynthVolume(volume);
}

export function getMidiNoteFrequency(midiNote: number): number {
  return 440 * 2 ** ((midiNote - 69) / 12);
}
