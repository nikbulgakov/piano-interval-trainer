import { useEffect, useRef } from "react";
import { isNoteInPracticeRange } from "../domain/keyboard";
import type { MidiNoteEvent } from "../midi/midiAdapter";
import { getNearestPianoSample, PIANO_SAMPLES } from "./pianoSamples";
import {
  getMidiNoteFrequency,
  getNoteGain,
  type SynthSettings,
} from "./synthSettings";
import { getSynthVoiceMode, shouldPreloadPianoSamples } from "./synthVoiceMode";

type AudioContextConstructor = typeof AudioContext;

type SynthVoice = {
  sources: AudioScheduledSourceNode[];
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
  voice.sources.forEach((source) => source.stop(stopTime));
}

function fetchAudioBuffer(
  context: AudioContext,
  url: string,
  cache: Map<string, Promise<AudioBuffer>>,
): Promise<AudioBuffer> {
  const cachedBuffer = cache.get(url);

  if (cachedBuffer) {
    return cachedBuffer;
  }

  const bufferPromise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load audio sample: ${url}`);
      }

      return response.arrayBuffer();
    })
    .then((arrayBuffer) => context.decodeAudioData(arrayBuffer));

  cache.set(url, bufferPromise);

  return bufferPromise;
}

function preloadPianoSamples(
  context: AudioContext,
  cache: Map<string, Promise<AudioBuffer>>,
): void {
  PIANO_SAMPLES.forEach((pianoSample) => {
    void fetchAudioBuffer(context, pianoSample.url, cache).catch(() => {
      // A failed sample should not silently switch the piano preset back to
      // the old oscillator sound. The individual note will stay silent.
    });
  });
}

function startOscillatorVoice(
  context: AudioContext,
  midiNote: number,
  peakGain: number,
  config: PresetConfig,
  voices: Map<number, SynthVoice>,
): void {
  const now = context.currentTime;
  const frequency = getMidiNoteFrequency(midiNote);
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
  voices.set(midiNote, { sources: oscillators, gain });
}

export function useMidiSynth(
  noteEvent: MidiNoteEvent | null,
  activeNotes: Set<number>,
  settings: SynthSettings,
): void {
  const contextRef = useRef<AudioContext | null>(null);
  const voicesRef = useRef<Map<number, SynthVoice>>(new Map());
  const voiceRequestIdsRef = useRef<Map<number, number>>(new Map());
  const sampleCacheRef = useRef<Map<string, Promise<AudioBuffer>>>(new Map());
  const activeNotesRef = useRef(activeNotes);
  const settingsRef = useRef(settings);

  useEffect(() => {
    activeNotesRef.current = activeNotes;
  }, [activeNotes]);

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

    if (shouldPreloadPianoSamples(settings, Boolean(contextRef.current))) {
      const context = contextRef.current;

      if (!context) {
        return;
      }

      preloadPianoSamples(context, sampleCacheRef.current);
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
      voiceRequestIdsRef.current.set(
        noteEvent.note,
        (voiceRequestIdsRef.current.get(noteEvent.note) ?? 0) + 1,
      );

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

    const contextReady =
      context.state === "suspended"
        ? context.resume().catch(() => undefined)
        : Promise.resolve();

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
    const peakGain =
      getNoteGain({
        velocity: noteEvent.velocity,
        volume: activeSettings.volume,
      }) * config.outputScale;
    const requestId = (voiceRequestIdsRef.current.get(noteEvent.note) ?? 0) + 1;

    voiceRequestIdsRef.current.set(noteEvent.note, requestId);

    if (activeSettings.preset === "piano") {
      const { sample, playbackRate } = getNearestPianoSample(noteEvent.note);

      void Promise.all([
        contextReady,
        fetchAudioBuffer(context, sample.url, sampleCacheRef.current),
      ])
        .then(([, audioBuffer]) => {
          if (
            !settingsRef.current.enabled ||
            settingsRef.current.preset !== "piano" ||
            !activeNotesRef.current.has(noteEvent.note) ||
            voiceRequestIdsRef.current.get(noteEvent.note) !== requestId ||
            getSynthVoiceMode("piano", "ready") !== "sample"
          ) {
            return;
          }

          const sampleNow = context.currentTime;
          const gain = context.createGain();
          const source = context.createBufferSource();

          source.buffer = audioBuffer;
          source.playbackRate.setValueAtTime(playbackRate, sampleNow);
          gain.gain.setValueAtTime(0.0001, sampleNow);
          gain.gain.linearRampToValueAtTime(peakGain, sampleNow + 0.008);
          gain.gain.setTargetAtTime(
            Math.max(0.0001, peakGain * config.sustainLevel),
            sampleNow + 0.02,
            config.decaySeconds,
          );
          source.connect(gain);
          gain.connect(context.destination);
          source.start(sampleNow);
          const voice = { sources: [source], gain };

          source.onended = () => {
            if (voicesRef.current.get(noteEvent.note) === voice) {
              voicesRef.current.delete(noteEvent.note);
            }
          };

          voicesRef.current.set(noteEvent.note, voice);
          preloadPianoSamples(context, sampleCacheRef.current);
        })
        .catch(() => {
          if (getSynthVoiceMode("piano", "failed") === "none") {
            return;
          }
        });

      return;
    }

    startOscillatorVoice(
      context,
      noteEvent.note,
      peakGain,
      config,
      voicesRef.current,
    );
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
