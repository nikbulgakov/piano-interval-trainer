import { useEffect, useRef } from "react";
import { getText, type TextKey } from "../app/i18n";
import type { SessionSummary } from "../domain/sessionSummary";
import { formatDuration } from "../domain/time";

type ResultsScreenProps = {
  summary: SessionSummary;
  onReturn: () => void;
  returnLabel: string;
  exerciseLabel: string;
  showMissedTasks: boolean;
  language: Parameters<typeof getText>[0];
};

export function ResultsScreen({
  summary,
  onReturn,
  returnLabel,
  exerciseLabel,
  showMissedTasks,
  language,
}: ResultsScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const t = (key: TextKey) => getText(language, key);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <main className="results-shell">
      <section className="results-card" aria-labelledby="results-title">
        <p className="eyebrow">{exerciseLabel}</p>
        <h1 id="results-title" ref={titleRef} tabIndex={-1}>
          {t("common.results")}
        </h1>
        <p className="results-subtitle">
          {summary.stoppedEarly
            ? t("results.finishedEarly")
            : t("results.finishedOnTime")}
        </p>

        <dl
          className={`results-grid${showMissedTasks ? "" : " without-misses"}`}
        >
          <div>
            <dt>{t("common.sessionTime")}</dt>
            <dd>{formatDuration(summary.elapsedSeconds * 1000)}</dd>
          </div>
          <div>
            <dt>{t("common.scoreCorrect")}</dt>
            <dd>{summary.correctAnswers}</dd>
          </div>
          <div>
            <dt>{t("common.errors")}</dt>
            <dd>{summary.wrongAttempts}</dd>
          </div>
          {showMissedTasks && (
            <div>
              <dt>{t("common.missed")}</dt>
              <dd>{summary.missedTasks}</dd>
            </div>
          )}
          <div>
            <dt>{t("common.scoreAccuracy")}</dt>
            <dd>{summary.accuracyPercent}%</dd>
          </div>
        </dl>

        <button className="primary-button results-button" onClick={onReturn} type="button">
          {returnLabel}
        </button>
      </section>
    </main>
  );
}
