import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppPreferences } from "../app/appPreferences";
import { getText } from "../app/i18n";
import {
  createPracticeNoteDisplay,
  formatPracticeNoteDisplay,
} from "../app/practiceNoteDisplay";
import {
  createNoteSequentialSession,
  updateNoteSequentialSessionForNotes,
  type NoteSequentialSessionState,
} from "../domain/noteSequentialSession";
import {
  advanceNoteTimedSessionToTime,
  createNoteTimedSession,
  updateNoteTimedSessionForNotes,
  type NoteTimedSessionState,
} from "../domain/noteTimedSession";
import type { NoteTrainingConfig } from "../domain/noteTrainingConfig";
import {
  createSessionSummary,
  type SessionSummary,
} from "../domain/sessionSummary";
import { formatDuration, getRemainingMilliseconds } from "../domain/time";
import type { MidiStatus } from "../midi/useMidiInput";
import { PianoKeyboard } from "./PianoKeyboard";

type NotePracticeScreenProps = {
  config: NoteTrainingConfig;
  activeNotes: ReadonlySet<number>;
  midiStatus: MidiStatus;
  onFinish: (summary: SessionSummary, showMissedTasks: boolean) => void;
  onReturnToSetup: () => void;
  preferences: AppPreferences;
};

type NotePracticeRuntime =
  | {
      mode: "sequential";
      now: number;
      session: NoteSequentialSessionState;
    }
  | {
      mode: "timed";
      now: number;
      session: NoteTimedSessionState;
    };

export function NotePracticeScreen({
  config,
  activeNotes,
  midiStatus,
  onFinish,
  onReturnToSetup,
  preferences,
}: NotePracticeScreenProps) {
  const t = (key: Parameters<typeof getText>[1]) =>
    getText(preferences.interfaceLanguage, key);
  const [timing] = useState(() => {
    const startedAt = performance.now();

    return {
      startedAt,
      endsAt: startedAt + config.durationMinutes * 60_000,
    };
  });
  const [runtime, setRuntime] = useState<NotePracticeRuntime>(() => {
    const now = performance.now();

    if (config.mode === "timed") {
      return {
        mode: "timed",
        now,
        session: createNoteTimedSession(
          config.pitchClasses,
          timing.startedAt,
          config.promptPeriodSeconds * 1000,
        ),
      };
    }

    return {
      mode: "sequential",
      now,
      session: createNoteSequentialSession(config.pitchClasses),
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
  const targetPitchClass = runtime.session.bag.current;
  const noteDisplayKey =
    targetPitchClass === null
      ? ""
      : `${runtime.session.taskSerial}:${targetPitchClass}`;
  const millisecondsUntilNextPrompt =
    runtime.mode === "timed"
      ? getRemainingMilliseconds(runtime.session.nextPromptAt, runtime.now)
      : null;
  const noteDisplay = useMemo(
    () => {
      if (!noteDisplayKey || targetPitchClass === null) {
        return null;
      }

      return createPracticeNoteDisplay(targetPitchClass);
    },
    [noteDisplayKey, targetPitchClass],
  );
  const noteName = noteDisplay
    ? formatPracticeNoteDisplay(
        noteDisplay,
        preferences.noteNotation,
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
        runtime.mode === "timed",
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
            session: advanceNoteTimedSessionToTime(
              currentRuntime.session,
              Math.min(now, timing.endsAt),
              activeNotes,
              config.pitchClasses,
            ),
          };
        }

        return {
          ...currentRuntime,
          now,
        };
      });
    }, 200);

    return () => window.clearInterval(timer);
  }, [activeNotes, config.pitchClasses, timing.endsAt]);

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
          const advancedSession = advanceNoteTimedSessionToTime(
            currentRuntime.session,
            sessionNow,
            activeNotes,
            config.pitchClasses,
          );

          return {
            ...currentRuntime,
            now,
            session:
              now >= timing.endsAt
                ? advancedSession
                : updateNoteTimedSessionForNotes(
                    advancedSession,
                    activeNotes,
                    now,
                    config.pitchClasses,
                  ),
          };
        }

        return {
          ...currentRuntime,
          session: updateNoteSequentialSessionForNotes(
            currentRuntime.session,
            activeNotes,
            config.pitchClasses,
          ),
        };
      });
    }, 45);

    return () => window.clearTimeout(settleTimer);
  }, [activeNotes, config.pitchClasses, midiIsReady, timing.endsAt]);

  let feedbackText = t("practice.feedback.noteInitial");
  let feedbackTone = "neutral";

  if (!midiIsReady) {
    feedbackText = t("practice.feedback.midiDisconnected");
    feedbackTone = "warning";
  } else if (runtime.session.feedback === "correct") {
    feedbackText =
      runtime.mode === "timed"
        ? t("practice.feedback.noteTimedCorrect")
        : t("practice.feedback.noteSequentialCorrect");
    feedbackTone = "correct";
  } else if (runtime.session.feedback === "incorrect") {
    feedbackText = t("practice.feedback.noteIncorrect");
    feedbackTone = "incorrect";
  } else if (runtime.session.phase === "waiting-for-release") {
    feedbackText = t("practice.feedback.releaseToStart");
  }

  return (
    <main className="practice-shell">
      <header className="practice-topbar">
        <div>
          <p className="eyebrow">
            {t("common.noteTraining")} ·{" "}
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

      <section className="task-stage" aria-labelledby="note-practice-title">
        <p className="eyebrow">{t("practice.findNote")}</p>
        <p aria-atomic="true" aria-live="assertive" className="visually-hidden">
          {t("practice.promptLive")} {noteName}
        </p>
        <h1
          className="practice-root note-practice-root"
          id="note-practice-title"
          ref={taskTitleRef}
          tabIndex={-1}
        >
          {noteName}
        </h1>
        <p className="note-practice-hint">
          {runtime.mode === "timed" && millisecondsUntilNextPrompt !== null
            ? `${t("practice.noteTimedHintPrefix")} ${formatDuration(
                millisecondsUntilNextPrompt,
              )}`
            : t("practice.noteHint")}
        </p>
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
