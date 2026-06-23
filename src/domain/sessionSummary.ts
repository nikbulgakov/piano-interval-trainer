export type SessionCounters = {
  correctAnswers: number;
  wrongAttempts: number;
  missedTasks: number;
};

export type SessionSummary = SessionCounters & {
  plannedDurationSeconds: number;
  elapsedSeconds: number;
  accuracyPercent: number;
  stoppedEarly: boolean;
};

export function createSessionSummary(
  counters: SessionCounters,
  plannedDurationSeconds: number,
  elapsedSeconds: number,
  stoppedEarly: boolean,
): SessionSummary {
  const attempts =
    counters.correctAnswers + counters.wrongAttempts + counters.missedTasks;
  const accuracyPercent =
    attempts === 0
      ? 0
      : Math.round((counters.correctAnswers / attempts) * 100);

  return {
    ...counters,
    plannedDurationSeconds,
    elapsedSeconds: Math.max(0, Math.round(elapsedSeconds)),
    accuracyPercent,
    stoppedEarly,
  };
}

