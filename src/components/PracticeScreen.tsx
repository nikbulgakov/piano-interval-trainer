import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  formatIntervalName,
  type AppPreferences,
} from "../app/appPreferences";
import { getText } from "../app/i18n";
import {
  createPracticeNoteDisplay,
  formatPracticeNoteDisplay,
} from "../app/practiceNoteDisplay";
import {
  createSequentialSession,
  updateSequentialSessionForNotes,
  type SequentialSessionState,
} from "../domain/sequentialSession";
import {
  createSessionSummary,
  type SessionSummary,
} from "../domain/sessionSummary";
import { formatDuration, getRemainingMilliseconds } from "../domain/time";
import {
  advanceTimedSessionToTime,
  createTimedSession,
  updateTimedSessionForNotes,
  type TimedSessionState,
} from "../domain/timedSession";
import type { TrainingConfig } from "../domain/trainingConfig";
import type { MidiStatus } from "../midi/useMidiInput";
import { PianoKeyboard } from "./PianoKeyboard";

type PracticeScreenProps = {
  config: TrainingConfig;
  activeNotes: ReadonlySet<number>;
  midiStatus: MidiStatus;
  onFinish: (summary: SessionSummary) => void;
  onReturnToSetup: () => void;
  preferences: AppPreferences;
};

type PracticeRuntime =
  | {
      mode: "sequential";
      now: number;
      session: SequentialSessionState;
    }
  | {
      mode: "timed";
      now: number;
      session: TimedSessionState;
    };

export function PracticeScreen({
  config,
  activeNotes,
  midiStatus,
  onFinish,
  onReturnToSetup,
  preferences,
}: PracticeScreenProps) {
  const t = (key: Parameters<typeof getText>[1]) =>
    getText(preferences.interfaceLanguage, key);
  const [timing] = useState(() => {
    const startedAt = performance.now();

    return {
      startedAt,
      endsAt: startedAt + config.durationMinutes * 60_000,
    };
  });
  const [runtime, setRuntime] = useState<PracticeRuntime>(() => {
    const now = performance.now();

    if (config.mode === "timed") {
      return {
        mode: "timed",
        now,
        session: createTimedSession(
          config.pitchClasses,
          config.intervalSemitones,
          timing.startedAt,
          config.promptPeriodSeconds * 1000,
        ),
      };
    }

    return {
      mode: "sequential",
      now,
      session: createSequentialSession(
        config.pitchClasses,
        config.intervalSemitones,
      ),
    };
  });
  const finishedRef = useRef(false);
  const taskTitleRef = useRef<HTMLHeadingElement>(null);
  const midiIsReady = midiStatus === "ready";
  const plannedDurationSeconds = config.durationMinutes * 60;
  const remainingMilliseconds = getRemainingMilliseconds(
    timing.endsAt,
    runtime.now,
  );
  const currentTask = runtime.session.bag.current;
  const rootDisplayKey = currentTask
    ? `${runtime.session.taskSerial}:${currentTask.rootPitchClass}`
    : "";
  const millisecondsUntilNextPrompt =
    runtime.mode === "timed"
      ? getRemainingMilliseconds(
          runtime.session.nextPromptAt,
          runtime.now,
        )
      : null;
  const rootDisplay = useMemo(
    () => {
      if (!rootDisplayKey || !currentTask) {
        return null;
      }

      return createPracticeNoteDisplay(currentTask.rootPitchClass);
    },
    [currentTask, rootDisplayKey],
  );
  const rootName = rootDisplay
    ? formatPracticeNoteDisplay(
        rootDisplay,
        preferences.noteNotation,
        preferences.interfaceLanguage,
      )
    : "";
  const intervalName = currentTask
    ? formatIntervalName(
        currentTask.intervalSemitones,
        preferences.intervalNotation,
        preferences.interfaceLanguage,
      )
    : "";

  useEffect(() => {
    taskTitleRef.current?.focus();
  }, []);

  const finish = useCallback(
    (stoppedEarly: boolean) => {
      if (finishedRef.current) {
        return;
      }

      finishedRef.current = true;
      const elapsedSeconds = Math.min(
        plannedDurationSeconds,
        (performance.now() - timing.startedAt) / 1000,
      );

      onFinish(
        createSessionSummary(
          {
            correctAnswers: runtime.session.correctAnswers,
            wrongAttempts: runtime.session.wrongAttempts,
            missedTasks:
              runtime.mode === "timed" ? runtime.session.missedTasks : 0,
          },
          plannedDurationSeconds,
          elapsedSeconds,
          stoppedEarly,
        ),
      );
    },
    [onFinish, plannedDurationSeconds, runtime, timing.startedAt],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRuntime((currentRuntime) => {
        const now = performance.now();

        if (currentRuntime.mode === "timed") {
          return {
            ...currentRuntime,
            now,
            session: advanceTimedSessionToTime(
              currentRuntime.session,
              Math.min(now, timing.endsAt),
              activeNotes,
              config.pitchClasses,
              config.intervalSemitones,
            ),
          };
        }

        return { ...currentRuntime, now };
      });
    }, 200);

    return () => window.clearInterval(timer);
  }, [
    activeNotes,
    config.intervalSemitones,
    config.pitchClasses,
    timing.endsAt,
  ]);

  useEffect(() => {
    if (remainingMilliseconds === 0) {
      finish(false);
    }
  }, [finish, remainingMilliseconds]);

  useEffect(() => {
    if (!midiIsReady) {
      return;
    }

    const settleTimer = window.setTimeout(() => {
      setRuntime((currentRuntime) => {
        if (currentRuntime.mode === "timed") {
          const now = performance.now();
          const sessionNow = Math.min(now, timing.endsAt);
          const advancedSession = advanceTimedSessionToTime(
            currentRuntime.session,
            sessionNow,
            activeNotes,
            config.pitchClasses,
            config.intervalSemitones,
          );

          return {
            ...currentRuntime,
            now,
            session:
              now >= timing.endsAt
                ? advancedSession
                : updateTimedSessionForNotes(
                    advancedSession,
                    activeNotes,
                    now,
                    config.pitchClasses,
                    config.intervalSemitones,
                  ),
          };
        }

        return {
          ...currentRuntime,
          session: updateSequentialSessionForNotes(
            currentRuntime.session,
            activeNotes,
            config.pitchClasses,
            config.intervalSemitones,
          ),
        };
      });
    }, 45);

    return () => window.clearTimeout(settleTimer);
  }, [
    activeNotes,
    config.intervalSemitones,
    config.pitchClasses,
    midiIsReady,
    timing.endsAt,
  ]);

  let feedbackText = t("practice.feedback.intervalInitial");
  let feedbackTone = "neutral";

  if (!midiIsReady) {
    feedbackText = t("practice.feedback.midiDisconnected");
    feedbackTone = "warning";
  } else if (runtime.session.feedback === "correct") {
    feedbackText =
      runtime.mode === "timed"
        ? t("practice.feedback.timedCorrect")
        : t("practice.feedback.sequentialCorrect");
    feedbackTone = "correct";
  } else if (runtime.session.feedback === "incorrect") {
    feedbackText = t("practice.feedback.intervalIncorrect");
    feedbackTone = "incorrect";
  } else if (runtime.session.phase === "waiting-for-release") {
    feedbackText = t("practice.feedback.releaseToStart");
  }

  return (
    <main className="practice-shell">
      <header className="practice-topbar">
        <div>
          <p className="eyebrow">
            {runtime.mode === "timed"
              ? t("common.timedMode")
              : t("common.sequentialMode")}
          </p>
          <p className="practice-score">
            {t("common.scoreCorrect")}: {runtime.session.correctAnswers} ·{" "}
            {t("common.errors")}:{" "}
            {runtime.session.wrongAttempts}
            {runtime.mode === "timed" && (
              <>
                {" "}
                · {t("common.missed")}: {runtime.session.missedTasks}
              </>
            )}
          </p>
        </div>
        <time className="session-timer" aria-label={t("practice.remainingTime")}>
          {formatDuration(remainingMilliseconds)}
        </time>
        <button
          className="stop-button"
          onClick={() => finish(true)}
          type="button"
        >
          {t("common.stop")}
        </button>
      </header>

      <section className="task-stage" aria-labelledby="practice-task-title">
        <p className="eyebrow">{t("practice.intervalPrompt")}</p>
        <p aria-atomic="true" aria-live="assertive" className="visually-hidden">
          {t("practice.promptLive")} {rootName}, {intervalName}
        </p>
        <h1
          className="practice-root"
          id="practice-task-title"
          ref={taskTitleRef}
          tabIndex={-1}
        >
          {rootName}
        </h1>
        <p className="practice-interval">{intervalName}</p>
        {millisecondsUntilNextPrompt !== null && (
          <p className="prompt-countdown">
            {t("practice.nextPromptIn")}{" "}
            {formatDuration(millisecondsUntilNextPrompt)}
          </p>
        )}
        <p
          className={`practice-feedback feedback-${feedbackTone}`}
          aria-live="polite"
        >
          {feedbackText}
        </p>
        {!midiIsReady && (
          <button
            className="practice-recovery-button"
            onClick={onReturnToSetup}
            type="button"
          >
            {t("practice.returnToConnection")}
          </button>
        )}
      </section>

      <PianoKeyboard activeNotes={activeNotes} preferences={preferences} />
    </main>
  );
}
