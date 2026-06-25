import { isNoteInPracticeRange } from "./keyboard";
import type { IntervalSemitones, PitchClass } from "./music";
import {
  drawNextTask,
  isExactTaskAnswer,
  type TaskBagState,
} from "./tasks";

export type TimedPhase =
  | "waiting-for-release"
  | "awaiting-answer";

export type TimedFeedback = "neutral" | "incorrect" | "correct";

export type TimedSessionState = {
  bag: TaskBagState;
  phase: TimedPhase;
  feedback: TimedFeedback;
  correctAnswers: number;
  wrongAttempts: number;
  missedTasks: number;
  attemptLocked: boolean;
  nextPromptAt: number;
  promptPeriodMilliseconds: number;
  taskSerial: number;
};

function getNotesInRange(activeNotes: Iterable<number>): number[] {
  return Array.from(new Set(activeNotes))
    .filter(isNoteInPracticeRange)
    .sort((left, right) => left - right);
}

export function createTimedSession(
  pitchClasses: readonly PitchClass[],
  intervalSemitones: readonly IntervalSemitones[],
  startedAt: number,
  promptPeriodMilliseconds: number,
  random: () => number = Math.random,
): TimedSessionState {
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
    missedTasks: 0,
    attemptLocked: false,
    nextPromptAt: startedAt + promptPeriodMilliseconds,
    promptPeriodMilliseconds,
    taskSerial: 0,
  };
}

export function updateTimedSessionForNotes(
  state: TimedSessionState,
  activeNotes: Iterable<number>,
  now: number,
  pitchClasses: readonly PitchClass[],
  intervalSemitones: readonly IntervalSemitones[],
  random: () => number = Math.random,
): TimedSessionState {
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
      bag: drawNextTask(
        state.bag,
        pitchClasses,
        intervalSemitones,
        random,
      ),
      phase: "waiting-for-release",
      feedback: "correct",
      correctAnswers: state.correctAnswers + 1,
      attemptLocked: false,
      nextPromptAt: now + state.promptPeriodMilliseconds,
      taskSerial: state.taskSerial + 1,
    };
  }

  return {
    ...state,
    feedback: "incorrect",
    wrongAttempts: state.wrongAttempts + 1,
    attemptLocked: true,
  };
}

export function advanceTimedSessionToTime(
  state: TimedSessionState,
  now: number,
  activeNotes: Iterable<number>,
  pitchClasses: readonly PitchClass[],
  intervalSemitones: readonly IntervalSemitones[],
  random: () => number = Math.random,
): TimedSessionState {
  if (now < state.nextPromptAt) {
    return state;
  }

  const notesInRange = getNotesInRange(activeNotes);
  let nextState = state;

  while (now >= nextState.nextPromptAt) {
    nextState = {
      ...nextState,
      bag: drawNextTask(
        nextState.bag,
        pitchClasses,
        intervalSemitones,
        random,
      ),
      phase:
        notesInRange.length === 0
          ? "awaiting-answer"
          : "waiting-for-release",
      feedback: "neutral",
      missedTasks: nextState.missedTasks + 1,
      attemptLocked: false,
      nextPromptAt:
        nextState.nextPromptAt + nextState.promptPeriodMilliseconds,
      taskSerial: nextState.taskSerial + 1,
    };
  }

  return nextState;
}
