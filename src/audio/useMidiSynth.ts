import { useEffect, useRef } from "react";
import { isNoteInPracticeRange } from "../domain/keyboard";
import type { MidiNoteEvent } from "../midi/midiAdapter";
import {
  getMidiNoteFrequency,
  getNoteGain,
  type SynthSettings,
} from "./synthSettings";

type AudioContextConstructor = typeof AudioContext;

type SynthVoice = {
  oscillators: OscillatorNode[];
  gain: GainNode;
};

type PresetConfig = {
  oscillatorTypes: OscillatorType[];
  detuneCents: number[];
  attackSeconds: number;
  decaySeconds: number;
  sustainLevel: number;
  releaseSeconds: number;
  outputScale: number;
};

const PRESET_CONFIG: Record<SynthSettings["preset"], PresetConfig> = {
  piano: {
    oscillatorTypes: ["triangle", "sine"],
    detuneCents: [0, 7],
    attackSeconds: 0.008,
    decaySeconds: 0.32,
    sustainLevel: 0.22,
    releaseSeconds: 0.12,
    outputScale: 0.22,
  },
  synth: {
    oscillatorTypes: ["sawtooth"],
    detuneCents: [0],
    attackSeconds: 0.015,
    decaySeconds: 0.08,
    sustainLevel: 0.82,
    releaseSeconds: 0.1,
    outputScale: 0.14,
  },
  "electric-piano": {
    oscillatorTypes: ["sine", "triangle"],
    detuneCents: [0, 12],
    attackSeconds: 0.01,
    decaySeconds: 0.22,
    sustainLevel: 0.38,
    releaseSeconds: 0.18,
    outputScale: 0.2,
  },
};

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.AudioContext ?? null;
}

function stopVoice(
  context: AudioContext,
  voice: SynthVoice,
  releaseSeconds: number,
): void {
  const now = context.currentTime;
  const stopTime = now + releaseSeconds + 0.03;

  voice.gain.gain.cancelScheduledValues(now);
  voice.gain.gain.setTargetAtTime(0.0001, now, Math.max(0.01, releaseSeconds));
  voice.oscillators.forEach((oscillator) => oscillator.stop(stopTime));
}

export function useMidiSynth(
  noteEvent: MidiNoteEvent | null,
  activeNotes: Set<number>,
  settings: SynthSettings,
): void {
  const contextRef = useRef<AudioContext | null>(null);
  const voicesRef = useRef<Map<number, SynthVoice>>(new Map());
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;

    if (!settings.enabled) {
      const context = contextRef.current;

      if (!context) {
        return;
      }

      const releaseSeconds =
        PRESET_CONFIG[settingsRef.current.preset].releaseSeconds;
      voicesRef.current.forEach((voice) =>
        stopVoice(context, voice, releaseSeconds),
      );
      voicesRef.current.clear();
    }
  }, [settings]);

  useEffect(() => {
    if (!noteEvent) {
      return;
    }

    const activeSettings = settingsRef.current;

    if (!isNoteInPracticeRange(noteEvent.note)) {
      return;
    }

    const existingContext = contextRef.current;

    if (noteEvent.type === "noteoff") {
      const voice = voicesRef.current.get(noteEvent.note);

      if (existingContext && voice) {
        stopVoice(
          existingContext,
          voice,
          PRESET_CONFIG[activeSettings.preset].releaseSeconds,
        );
      }

      voicesRef.current.delete(noteEvent.note);
      return;
    }

    if (!activeSettings.enabled) {
      return;
    }

    const AudioContextClass = getAudioContextConstructor();

    if (!AudioContextClass) {
      return;
    }

    const context = existingContext ?? new AudioContextClass();
    contextRef.current = context;

    if (context.state === "suspended") {
      void context.resume();
    }

    const existingVoice = voicesRef.current.get(noteEvent.note);

    if (existingVoice) {
      stopVoice(
        context,
        existingVoice,
        PRESET_CONFIG[activeSettings.preset].releaseSeconds,
      );
      voicesRef.current.delete(noteEvent.note);
    }

    const config = PRESET_CONFIG[activeSettings.preset];
    const now = context.currentTime;
    const frequency = getMidiNoteFrequency(noteEvent.note);
    const peakGain =
      getNoteGain({
        velocity: noteEvent.velocity,
        volume: activeSettings.volume,
      }) * config.outputScale;
    const sustainGain = peakGain * config.sustainLevel;
    const gain = context.createGain();
    const oscillators = config.oscillatorTypes.map((type, index) => {
      const oscillator = context.createOscillator();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.detune.setValueAtTime(config.detuneCents[index] ?? 0, now);
      oscillator.connect(gain);

      return oscillator;
    });

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + config.attackSeconds);
    gain.gain.setTargetAtTime(
      Math.max(0.0001, sustainGain),
      now + config.attackSeconds,
      config.decaySeconds,
    );
    gain.connect(context.destination);
    oscillators.forEach((oscillator) => oscillator.start(now));
    voicesRef.current.set(noteEvent.note, { oscillators, gain });
  }, [noteEvent]);

  useEffect(() => {
    const context = contextRef.current;

    if (!context) {
      return;
    }

    const releaseSeconds =
      PRESET_CONFIG[settingsRef.current.preset].releaseSeconds;

    voicesRef.current.forEach((voice, midiNote) => {
      if (!activeNotes.has(midiNote)) {
        stopVoice(context, voice, releaseSeconds);
        voicesRef.current.delete(midiNote);
      }
    });
  }, [activeNotes]);

  useEffect(() => {
    const voices = voicesRef.current;

    return () => {
      const context = contextRef.current;

      if (!context) {
        return;
      }

      voices.forEach((voice) => stopVoice(context, voice, 0.05));
      voices.clear();
    };
  }, []);
}
