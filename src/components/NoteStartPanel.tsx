import { formatNoteName, type AppPreferences } from "../app/appPreferences";
import { getText } from "../app/i18n";
import {
  isNoteTrainingConfigValid,
  type NoteTrainingConfig,
} from "../domain/noteTrainingConfig";
import type { MidiStatus } from "../midi/useMidiInput";

type NoteStartPanelProps = {
  config: NoteTrainingConfig;
  midiStatus: MidiStatus;
  onStart: () => void;
  preferences: AppPreferences;
};

export function NoteStartPanel({
  config,
  midiStatus,
  onStart,
  preferences,
}: NoteStartPanelProps) {
  const t = (key: Parameters<typeof getText>[1]) =>
    getText(preferences.interfaceLanguage, key);
  const configIsValid = isNoteTrainingConfigValid(config);
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

  let readinessMessage = t("setup.startReady");

  if (!configIsValid) {
    readinessMessage = t("setup.startFixSettings");
  } else if (!midiIsReady) {
    readinessMessage = t("setup.startConnectMidi");
  }

  return (
    <aside className="start-card" aria-labelledby="note-start-title">
      <div>
        <p className="eyebrow">{t("common.ready")}</p>
        <h2 id="note-start-title">{t("setup.start")}</h2>
      </div>

      <dl className="start-summary">
        <div>
          <dt>{t("common.notes")}</dt>
          <dd>{noteNames || t("common.notSelected")}</dd>
        </div>
        <div>
          <dt>{t("setup.summary.mode")}</dt>
          <dd>
            {config.mode === "timed"
              ? t("common.timed")
              : t("common.sequential")}
          </dd>
        </div>
        {config.mode === "timed" && (
          <div>
            <dt>{t("setup.summary.perNote")}</dt>
            <dd>
              {config.promptPeriodSeconds} {t("common.secondsShort")}
            </dd>
          </div>
        )}
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
        id="note-start-readiness"
      >
        <span aria-hidden="true" />
        {readinessMessage}
      </p>
      <button
        aria-describedby="note-start-readiness"
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
