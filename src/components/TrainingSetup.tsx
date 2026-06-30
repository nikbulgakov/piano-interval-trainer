import { INTERVALS, PITCH_CLASSES } from "../domain/music";
import {
  formatIntervalName,
  formatNoteName,
  type AppPreferences,
} from "../app/appPreferences";
import { getText, type TextKey } from "../app/i18n";
import {
  validateTrainingConfig,
  type TrainingConfig,
} from "../domain/trainingConfig";

type TrainingSetupProps = {
  config: TrainingConfig;
  onChange: (config: TrainingConfig) => void;
  preferences: AppPreferences;
};

export function TrainingSetup({
  config,
  onChange,
  preferences,
}: TrainingSetupProps) {
  const errors = validateTrainingConfig(config);
  const t = (key: TextKey) => getText(preferences.interfaceLanguage, key);

  const togglePitchClass = (pitchClass: (typeof PITCH_CLASSES)[number]["value"]) => {
    const isSelected = config.pitchClasses.includes(pitchClass);
    const pitchClasses = isSelected
      ? config.pitchClasses.filter((value) => value !== pitchClass)
      : [...config.pitchClasses, pitchClass].sort((left, right) => left - right);

    onChange({ ...config, pitchClasses });
  };

  const toggleInterval = (
    semitones: (typeof INTERVALS)[number]["semitones"],
  ) => {
    const isSelected = config.intervalSemitones.includes(semitones);
    const intervalSemitones = isSelected
      ? config.intervalSemitones.filter((value) => value !== semitones)
      : [...config.intervalSemitones, semitones].sort(
          (left, right) => left - right,
        );

    onChange({ ...config, intervalSemitones });
  };

  return (
    <section className="training-card" aria-labelledby="setup-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t("common.setup")}</p>
          <h2 id="setup-title">{t("setup.trainingMaterial")}</h2>
        </div>
        <span className="selection-summary">
          {t("setup.notes.count")}: {config.pitchClasses.length} ·{" "}
          {t("setup.intervals.count")}: {config.intervalSemitones.length}
        </span>
      </div>

      <fieldset
        aria-describedby={errors.pitchClasses ? "pitch-classes-error" : undefined}
        className="setup-group"
      >
        <div className="group-heading">
          <legend>{t("setup.notes.legend")}</legend>
          <div className="group-actions">
            <button
              className="text-button"
              onClick={() =>
                onChange({
                  ...config,
                  pitchClasses: PITCH_CLASSES.map((note) => note.value),
                })
              }
              type="button"
            >
              {t("setup.selectAll")}
            </button>
            <button
              className="text-button"
              onClick={() => onChange({ ...config, pitchClasses: [] })}
              type="button"
            >
              {t("setup.clear")}
            </button>
          </div>
        </div>
        <div className="selection-grid note-selection-grid">
          {PITCH_CLASSES.map((note) => {
            const isSelected = config.pitchClasses.includes(note.value);

            return (
              <button
                aria-pressed={isSelected}
                className={`selection-option${isSelected ? " is-selected" : ""}`}
                key={note.value}
                onClick={() => togglePitchClass(note.value)}
                type="button"
              >
                <span>
                  {formatNoteName(
                    note.value,
                    preferences.noteNotation,
                    preferences.interfaceLanguage,
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {errors.pitchClasses && (
          <p className="field-error" id="pitch-classes-error">
            {t(errors.pitchClasses as TextKey)}
          </p>
        )}
      </fieldset>

      <fieldset
        aria-describedby={errors.intervalSemitones ? "intervals-error" : undefined}
        className="setup-group"
      >
        <div className="group-heading">
          <legend>{t("setup.intervals.legend")}</legend>
          <div className="group-actions">
            <button
              className="text-button"
              onClick={() =>
                onChange({
                  ...config,
                  intervalSemitones: INTERVALS.map(
                    (interval) => interval.semitones,
                  ),
                })
              }
              type="button"
            >
              {t("setup.selectAll")}
            </button>
            <button
              className="text-button"
              onClick={() => onChange({ ...config, intervalSemitones: [] })}
              type="button"
            >
              {t("setup.clear")}
            </button>
          </div>
        </div>
        <div className="selection-grid interval-selection-grid">
          {INTERVALS.map((interval) => {
            const isSelected = config.intervalSemitones.includes(
              interval.semitones,
            );

            return (
              <button
                aria-pressed={isSelected}
                className={`selection-option interval-option${isSelected ? " is-selected" : ""}`}
                key={interval.semitones}
                onClick={() => toggleInterval(interval.semitones)}
                type="button"
              >
                <span>
                  {formatIntervalName(
                    interval.semitones,
                    preferences.intervalNotation,
                    preferences.interfaceLanguage,
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {errors.intervalSemitones && (
          <p className="field-error" id="intervals-error">
            {t(errors.intervalSemitones as TextKey)}
          </p>
        )}
      </fieldset>

      <div className="session-settings">
        <fieldset className="setup-group compact-group">
          <legend>{t("setup.mode.legend")}</legend>
          <div className="mode-grid">
            <label className="mode-option">
              <input
                checked={config.mode === "sequential"}
                name="training-mode"
                onChange={() => onChange({ ...config, mode: "sequential" })}
                type="radio"
                value="sequential"
              />
              <span>
                <strong>{t("common.sequential")}</strong>
                <small>{t("setup.mode.sequentialDescription")}</small>
              </span>
            </label>
            <label className="mode-option">
              <input
                checked={config.mode === "timed"}
                name="training-mode"
                onChange={() => onChange({ ...config, mode: "timed" })}
                type="radio"
                value="timed"
              />
              <span>
                <strong>{t("common.timed")}</strong>
                <small>{t("setup.mode.timedDescription")}</small>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="number-fields">
          <label className="number-field">
            <span>{t("setup.durationMinutes")}</span>
            <input
              aria-describedby={
                errors.durationMinutes ? "duration-minutes-error" : undefined
              }
              aria-invalid={Boolean(errors.durationMinutes)}
              max="60"
              min="1"
              onChange={(event) =>
                onChange({
                  ...config,
                  durationMinutes: Number(event.target.value),
                })
              }
              step="1"
              type="number"
              value={config.durationMinutes || ""}
            />
            {errors.durationMinutes && (
              <small className="field-error" id="duration-minutes-error">
                {t(errors.durationMinutes as TextKey)}
              </small>
            )}
          </label>

          {config.mode === "timed" && (
            <label className="number-field">
              <span>{t("setup.promptPeriodSeconds")}</span>
              <input
                aria-describedby={
                  errors.promptPeriodSeconds
                    ? "prompt-period-error"
                    : undefined
                }
                aria-invalid={Boolean(errors.promptPeriodSeconds)}
                max="30"
                min="1"
                onChange={(event) =>
                  onChange({
                    ...config,
                    promptPeriodSeconds: Number(event.target.value),
                  })
                }
                step="1"
                type="number"
                value={config.promptPeriodSeconds || ""}
              />
              {errors.promptPeriodSeconds && (
                <small className="field-error" id="prompt-period-error">
                  {t(errors.promptPeriodSeconds as TextKey)}
                </small>
              )}
            </label>
          )}
        </div>
      </div>
    </section>
  );
}
