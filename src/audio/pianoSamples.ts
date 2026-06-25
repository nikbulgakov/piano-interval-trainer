export type PianoSample = {
  name: string;
  midiNote: number;
  url: string;
};

export const PIANO_SAMPLES: PianoSample[] = [
  { name: "C3", midiNote: 48, url: "/audio/piano/salamander/C3.mp3" },
  { name: "Ds3", midiNote: 51, url: "/audio/piano/salamander/Ds3.mp3" },
  { name: "Fs3", midiNote: 54, url: "/audio/piano/salamander/Fs3.mp3" },
  { name: "A3", midiNote: 57, url: "/audio/piano/salamander/A3.mp3" },
  { name: "C4", midiNote: 60, url: "/audio/piano/salamander/C4.mp3" },
  { name: "Ds4", midiNote: 63, url: "/audio/piano/salamander/Ds4.mp3" },
  { name: "Fs4", midiNote: 66, url: "/audio/piano/salamander/Fs4.mp3" },
  { name: "A4", midiNote: 69, url: "/audio/piano/salamander/A4.mp3" },
  { name: "C5", midiNote: 72, url: "/audio/piano/salamander/C5.mp3" },
  { name: "Ds5", midiNote: 75, url: "/audio/piano/salamander/Ds5.mp3" },
  { name: "Fs5", midiNote: 78, url: "/audio/piano/salamander/Fs5.mp3" },
  { name: "A5", midiNote: 81, url: "/audio/piano/salamander/A5.mp3" },
  { name: "C6", midiNote: 84, url: "/audio/piano/salamander/C6.mp3" },
];

export function getNearestPianoSample(midiNote: number): {
  sample: PianoSample;
  playbackRate: number;
} {
  const sample = PIANO_SAMPLES.reduce((nearest, candidate) => {
    const nearestDistance = Math.abs(midiNote - nearest.midiNote);
    const candidateDistance = Math.abs(midiNote - candidate.midiNote);

    return candidateDistance < nearestDistance ? candidate : nearest;
  }, PIANO_SAMPLES[0]);

  return {
    sample,
    playbackRate: 2 ** ((midiNote - sample.midiNote) / 12),
  };
}
