import {
  formatIntervalName,
  formatNoteName,
  type AppPreferences,
} from "../app/appPreferences";
import { getText } from "../app/i18n";
import {
  isTrainingConfigValid,
  type TrainingConfig,
} from "../domain/trainingConfig";
import type { MidiStatus } from "../midi/useMidiInput";

type StartPanelProps = {
  config: TrainingConfig;
  midiStatus: MidiStatus;
  onStart: () => void;
  preferences: AppPreferences;
};

export function StartPanel({
  config,
  midiStatus,
  onStart,
  preferences,
}: StartPanelProps) {
  const t = (key: Parameters<typeof getText>[1]) =>
    getText(preferences.interfaceLanguage, key);
  const configIsValid = isTrainingConfigValid(config);
  const midiIsReady = midiStatus === "ready";
  const canStart = configIsValid && midiIsReady;
  const noteNames = config.pitchClasses
    .map((pitchClass) =>
      formatNoteName(
        pitchClass,
        preferences.noteNotation,
        preferences.interfaceLanguage,
      ),
    )
    .join(", ");
  const intervalNames = config.intervalSemitones
    .map((semitones) =>
      formatIntervalName(
        semitones,
        preferences.intervalNotation,
        preferences.interfaceLanguage,
      ),
    )
    .join(", ");

  let readinessMessage = t("setup.startReady");

  if (!configIsValid) {
    readinessMessage = t("setup.startFixSettings");
  } else if (!midiIsReady) {
    readinessMessage = t("setup.startConnectMidi");
  }

  return (
    <aside className="start-card" aria-labelledby="start-title">
      <div>
        <p className="eyebrow">{t("common.ready")}</p>
        <h2 id="start-title">{t("setup.start")}</h2>
      </div>

      <dl className="start-summary">
        <div>
          <dt>{t("common.notes")}</dt>
          <dd>{noteNames || t("common.notSelected")}</dd>
        </div>
        <div>
          <dt>{t("common.intervals")}</dt>
          <dd>{intervalNames || t("common.notSelected")}</dd>
        </div>
        <div>
          <dt>{t("setup.summary.mode")}</dt>
          <dd>
            {config.mode === "sequential"
              ? t("common.sequential")
              : t("common.timed")}
          </dd>
        </div>
        <div>
          <dt>{t("common.duration")}</dt>
          <dd>
            {config.durationMinutes} {t("common.minutesShort")}
          </dd>
        </div>
      </dl>

      <p
        aria-live="polite"
        className={`readiness-message${canStart ? " is-ready" : ""}`}
        id="start-readiness"
      >
        <span aria-hidden="true" />
        {readinessMessage}
      </p>
      <button
        aria-describedby="start-readiness"
        className="primary-button start-button"
        disabled={!canStart}
        onClick={onStart}
        type="button"
      >
        {t("setup.start")}
      </button>
    </aside>
  );
}
