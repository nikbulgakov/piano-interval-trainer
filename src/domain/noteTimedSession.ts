import { isNoteInPracticeRange } from "./keyboard";
import type { PitchClass } from "./music";
import {
  drawNextNoteTask,
  isExactNoteAnswer,
  type NoteTaskBagState,
} from "./noteTasks";

export type NoteTimedPhase = "waiting-for-release" | "awaiting-answer";

export type NoteTimedFeedback = "neutral" | "incorrect" | "correct";

export type NoteTimedSessionState = {
  bag: NoteTaskBagState;
  phase: NoteTimedPhase;
  feedback: NoteTimedFeedback;
  correctAnswers: number;
  wrongAttempts: number;
  missedTasks: number;
  attemptLocked: boolean;
  nextPromptAt: number;
  promptPeriodMilliseconds: number;
};

function getNotesInRange(activeNotes: Iterable<number>): number[] {
  return Array.from(new Set(activeNotes)).filter(isNoteInPracticeRange);
}

export function createNoteTimedSession(
  pitchClasses: readonly PitchClass[],
  startedAt: number,
  promptPeriodMilliseconds: number,
  random: () => number = Math.random,
): NoteTimedSessionState {
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
    missedTasks: 0,
    attemptLocked: false,
    nextPromptAt: startedAt + promptPeriodMilliseconds,
    promptPeriodMilliseconds,
  };
}

export function updateNoteTimedSessionForNotes(
  state: NoteTimedSessionState,
  activeNotes: Iterable<number>,
  now: number,
  pitchClasses: readonly PitchClass[],
  random: () => number = Math.random,
): NoteTimedSessionState {
  const notesInRange = getNotesInRange(activeNotes);

  if (state.phase === "waiting-for-release") {
    if (notesInRange.length === 0) {
      return {
        ...state,
        phase: "awaiting-answer",
        feedback: state.feedback === "correct" ? "neutral" : state.feedback,
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
      bag: drawNextNoteTask(state.bag, pitchClasses, random),
      phase: "waiting-for-release",
      feedback: "correct",
      correctAnswers: state.correctAnswers + 1,
      attemptLocked: false,
      nextPromptAt: now + state.promptPeriodMilliseconds,
    };
  }

  return {
    ...state,
    feedback: "incorrect",
    wrongAttempts: state.wrongAttempts + 1,
    attemptLocked: true,
  };
}

export function advanceNoteTimedSessionToTime(
  state: NoteTimedSessionState,
  now: number,
  activeNotes: Iterable<number>,
  pitchClasses: readonly PitchClass[],
  random: () => number = Math.random,
): NoteTimedSessionState {
  if (now < state.nextPromptAt) {
    return state;
  }

  const notesInRange = getNotesInRange(activeNotes);
  let nextState = state;

  while (now >= nextState.nextPromptAt) {
    nextState = {
      ...nextState,
      bag: drawNextNoteTask(nextState.bag, pitchClasses, random),
      phase:
        notesInRange.length === 0
          ? "awaiting-answer"
          : "waiting-for-release",
      feedback: "neutral",
      missedTasks: nextState.missedTasks + 1,
      attemptLocked: false,
      nextPromptAt:
        nextState.nextPromptAt + nextState.promptPeriodMilliseconds,
    };
  }

  return nextState;
}
