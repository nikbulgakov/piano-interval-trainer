import { useCallback, useEffect, useRef, useState } from "react";
import { formatNoteName, type AppPreferences } from "../app/appPreferences";
import {
  createNoteSequentialSession,
  updateNoteSequentialSessionForNotes,
  type NoteSequentialSessionState,
} from "../domain/noteSequentialSession";
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
  onFinish: (summary: SessionSummary) => void;
  onReturnToSetup: () => void;
  preferences: AppPreferences;
};

type NotePracticeRuntime = {
  now: number;
  session: NoteSequentialSessionState;
};

export function NotePracticeScreen({
  config,
  activeNotes,
  midiStatus,
  onFinish,
  onReturnToSetup,
  preferences,
}: NotePracticeScreenProps) {
  const [timing] = useState(() => {
    const startedAt = performance.now();

    return {
      startedAt,
      endsAt: startedAt + config.durationMinutes * 60_000,
    };
  });
  const [runtime, setRuntime] = useState<NotePracticeRuntime>(() => ({
    now: performance.now(),
    session: createNoteSequentialSession(config.pitchClasses),
  }));
  const finishedRef = useRef(false);
  const taskTitleRef = useRef<HTMLHeadingElement>(null);
  const midiIsReady = midiStatus === "ready";
  const plannedDurationSeconds = config.durationMinutes * 60;
  const remainingMilliseconds = getRemainingMilliseconds(
    timing.endsAt,
    runtime.now,
  );
  const targetPitchClass = runtime.session.bag.current;
  const noteName =
    targetPitchClass === null
      ? ""
      : formatNoteName(targetPitchClass, preferences.noteNotation);

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
            missedTasks: 0,
          },
          plannedDurationSeconds,
          elapsedSeconds,
          stoppedEarly,
        ),
      );
    },
    [onFinish, plannedDurationSeconds, runtime.session, timing.startedAt],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRuntime((currentRuntime) => ({
        ...currentRuntime,
        now: performance.now(),
      }));
    }, 200);

    return () => window.clearInterval(timer);
  }, []);

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
      setRuntime((currentRuntime) => ({
        ...currentRuntime,
        session: updateNoteSequentialSessionForNotes(
          currentRuntime.session,
          activeNotes,
          config.pitchClasses,
        ),
      }));
    }, 45);

    return () => window.clearTimeout(settleTimer);
  }, [activeNotes, config.pitchClasses, midiIsReady]);

  let feedbackText = "Нажмите одну клавишу с этой нотой.";
  let feedbackTone = "neutral";

  if (!midiIsReady) {
    feedbackText = "MIDI-клавиатура отключена. Подключите её снова.";
    feedbackTone = "warning";
  } else if (runtime.session.feedback === "correct") {
    feedbackText = "Правильно. Отпустите клавишу для следующего задания.";
    feedbackTone = "correct";
  } else if (runtime.session.feedback === "incorrect") {
    feedbackText = "Не та нота — отпустите клавиши и попробуйте ещё.";
    feedbackTone = "incorrect";
  } else if (runtime.session.phase === "waiting-for-release") {
    feedbackText = "Отпустите клавиши, чтобы начать.";
  }

  return (
    <main className="practice-shell">
      <header className="practice-topbar">
        <div>
          <p className="eyebrow">Поиск нот · Последовательный режим</p>
          <p className="practice-score">
            Правильно: {runtime.session.correctAnswers} · Ошибок:{" "}
            {runtime.session.wrongAttempts}
          </p>
        </div>
        <time className="session-timer" aria-label="Оставшееся время">
          {formatDuration(remainingMilliseconds)}
        </time>
        <button
          className="stop-button"
          onClick={() => finish(true)}
          type="button"
        >
          Завершить
        </button>
      </header>

      <section className="task-stage" aria-labelledby="note-practice-title">
        <p className="eyebrow">Найдите ноту</p>
        <p aria-atomic="true" aria-live="assertive" className="visually-hidden">
          Задание: {noteName}
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
          Нажмите одну клавишу в любой октаве.
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
            Вернуться к подключению
          </button>
        )}
      </section>

      <PianoKeyboard activeNotes={activeNotes} preferences={preferences} />
    </main>
  );
}
