import { useEffect, useRef } from "react";
import type { SessionSummary } from "../domain/sessionSummary";
import { formatDuration } from "../domain/time";

type ResultsScreenProps = {
  summary: SessionSummary;
  onReturn: () => void;
};

export function ResultsScreen({ summary, onReturn }: ResultsScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <main className="results-shell">
      <section className="results-card" aria-labelledby="results-title">
        <p className="eyebrow">Тренировка завершена</p>
        <h1 id="results-title" ref={titleRef} tabIndex={-1}>
          Результат
        </h1>
        <p className="results-subtitle">
          {summary.stoppedEarly
            ? "Сессия завершена досрочно."
            : "Запланированное время истекло."}
        </p>

        <dl className="results-grid">
          <div>
            <dt>Время</dt>
            <dd>{formatDuration(summary.elapsedSeconds * 1000)}</dd>
          </div>
          <div>
            <dt>Правильно</dt>
            <dd>{summary.correctAnswers}</dd>
          </div>
          <div>
            <dt>Ошибки</dt>
            <dd>{summary.wrongAttempts}</dd>
          </div>
          <div>
            <dt>Пропуски</dt>
            <dd>{summary.missedTasks}</dd>
          </div>
          <div>
            <dt>Точность</dt>
            <dd>{summary.accuracyPercent}%</dd>
          </div>
        </dl>

        <button className="primary-button results-button" onClick={onReturn} type="button">
          К настройке интервалов
        </button>
      </section>
    </main>
  );
}
