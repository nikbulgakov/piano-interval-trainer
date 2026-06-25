import { isNoteInPracticeRange } from "./keyboard";
import type { PitchClass } from "./music";
import {
  drawNextNoteTask,
  isExactNoteAnswer,
  type NoteTaskBagState,
} from "./noteTasks";

export type NoteSequentialPhase =
  | "waiting-for-release"
  | "awaiting-answer"
  | "solved-waiting-for-release";

export type NoteSequentialFeedback = "neutral" | "incorrect" | "correct";

export type NoteSequentialSessionState = {
  bag: NoteTaskBagState;
  phase: NoteSequentialPhase;
  feedback: NoteSequentialFeedback;
  correctAnswers: number;
  wrongAttempts: number;
  attemptLocked: boolean;
  taskSerial: number;
};

export function createNoteSequentialSession(
  pitchClasses: readonly PitchClass[],
  random: () => number = Math.random,
): NoteSequentialSessionState {
  return {
    bag: drawNextNoteTask(
      { current: null, remaining: [] },
      pitchClasses,
      random,
    ),
    phase: "waiting-for-release",
    feedback: "neutral",
    correctAnswers: 0,
    wrongAttempts: 0,
    attemptLocked: false,
    taskSerial: 0,
  };
}

export function updateNoteSequentialSessionForNotes(
  state: NoteSequentialSessionState,
  activeNotes: Iterable<number>,
  pitchClasses: readonly PitchClass[],
  random: () => number = Math.random,
): NoteSequentialSessionState {
  const notesInRange = Array.from(new Set(activeNotes)).filter(
    isNoteInPracticeRange,
  );

  if (state.phase === "waiting-for-release") {
    return notesInRange.length === 0
      ? { ...state, phase: "awaiting-answer" }
      : state;
  }

  if (state.phase === "solved-waiting-for-release") {
    if (notesInRange.length === 0) {
      return {
        ...state,
        bag: drawNextNoteTask(state.bag, pitchClasses, random),
        phase: "awaiting-answer",
        feedback: "neutral",
        attemptLocked: false,
        taskSerial: state.taskSerial + 1,
      };
    }

    return state;
  }

  if (notesInRange.length === 0) {
    if (state.attemptLocked || state.feedback === "incorrect") {
      return { ...state, attemptLocked: false, feedback: "neutral" };
    }

    return state;
  }

  if (state.attemptLocked || state.bag.current === null) {
    return state;
  }

  if (isExactNoteAnswer(notesInRange, state.bag.current)) {
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
