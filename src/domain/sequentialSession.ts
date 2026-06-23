import { isNoteInPracticeRange } from "./keyboard";
import type { IntervalSemitones, PitchClass } from "./music";
import {
  drawNextTask,
  isExactTaskAnswer,
  type TaskBagState,
} from "./tasks";

export type SequentialPhase =
  | "waiting-for-release"
  | "awaiting-answer"
  | "solved-waiting-for-release";

export type SequentialFeedback = "neutral" | "incorrect" | "correct";

export type SequentialSessionState = {
  bag: TaskBagState;
  phase: SequentialPhase;
  feedback: SequentialFeedback;
  correctAnswers: number;
  wrongAttempts: number;
  attemptLocked: boolean;
};

export function createSequentialSession(
  pitchClasses: readonly PitchClass[],
  intervalSemitones: readonly IntervalSemitones[],
  random: () => number = Math.random,
): SequentialSessionState {
  return {
    bag: drawNextTask(
      { current: null, remaining: [] },
      pitchClasses,
      intervalSemitones,
      random,
    ),
    phase: "waiting-for-release",
    feedback: "neutral",
    correctAnswers: 0,
    wrongAttempts: 0,
    attemptLocked: false,
  };
}

export function updateSequentialSessionForNotes(
  state: SequentialSessionState,
  activeNotes: Iterable<number>,
  pitchClasses: readonly PitchClass[],
  intervalSemitones: readonly IntervalSemitones[],
  random: () => number = Math.random,
): SequentialSessionState {
  const notesInRange = Array.from(new Set(activeNotes))
    .filter(isNoteInPracticeRange)
    .sort((left, right) => left - right);

  if (state.phase === "waiting-for-release") {
    if (notesInRange.length === 0) {
      return { ...state, phase: "awaiting-answer" };
    }

    return state;
  }

  if (state.phase === "solved-waiting-for-release") {
    if (notesInRange.length === 0) {
      return {
        ...state,
        bag: drawNextTask(
          state.bag,
          pitchClasses,
          intervalSemitones,
          random,
        ),
        phase: "awaiting-answer",
        feedback: "neutral",
        attemptLocked: false,
      };
    }

    return state;
  }

  if (notesInRange.length < 2) {
    if (state.attemptLocked || state.feedback === "incorrect") {
      return { ...state, attemptLocked: false, feedback: "neutral" };
    }

    return state;
  }

  if (state.attemptLocked || !state.bag.current) {
    return state;
  }

  if (isExactTaskAnswer(notesInRange, state.bag.current)) {
    return {
      ...state,
      phase: "solved-waiting-for-release",
      feedback: "correct",
      correctAnswers: state.correctAnswers + 1,
      attemptLocked: true,
    };
  }

  return {
    ...state,
    feedback: "incorrect",
    wrongAttempts: state.wrongAttempts + 1,
    attemptLocked: true,
  };
}

