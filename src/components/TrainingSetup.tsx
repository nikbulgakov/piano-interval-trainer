import { INTERVALS, PITCH_CLASSES } from "../domain/music";
import {
  validateTrainingConfig,
  type TrainingConfig,
} from "../domain/trainingConfig";

type TrainingSetupProps = {
  config: TrainingConfig;
  onChange: (config: TrainingConfig) => void;
};

export function TrainingSetup({ config, onChange }: TrainingSetupProps) {
  const errors = validateTrainingConfig(config);

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
          <p className="eyebrow">Настройка</p>
          <h2 id="setup-title">Что тренируем</h2>
        </div>
        <span className="selection-summary">
          Нот: {config.pitchClasses.length} · Интервалов:{" "}
          {config.intervalSemitones.length}
        </span>
      </div>

      <fieldset
        aria-describedby={errors.pitchClasses ? "pitch-classes-error" : undefined}
        className="setup-group"
      >
        <div className="group-heading">
          <legend>Исходные ноты</legend>
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
              Выбрать все
            </button>
            <button
              className="text-button"
              onClick={() => onChange({ ...config, pitchClasses: [] })}
              type="button"
            >
              Снять
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
                <span>{note.russianName}</span>
                <small>{note.latinName}</small>
              </button>
            );
          })}
        </div>
        {errors.pitchClasses && (
          <p className="field-error" id="pitch-classes-error">
            {errors.pitchClasses}
          </p>
        )}
      </fieldset>

      <fieldset
        aria-describedby={errors.intervalSemitones ? "intervals-error" : undefined}
        className="setup-group"
      >
        <div className="group-heading">
          <legend>Интервалы</legend>
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
              Выбрать все
            </button>
            <button
              className="text-button"
              onClick={() => onChange({ ...config, intervalSemitones: [] })}
              type="button"
            >
              Снять
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
                <span>{interval.russianName}</span>
                <small>{interval.shortName}</small>
              </button>
            );
          })}
        </div>
        {errors.intervalSemitones && (
          <p className="field-error" id="intervals-error">
            {errors.intervalSemitones}
          </p>
        )}
      </fieldset>

      <div className="session-settings">
        <fieldset className="setup-group compact-group">
          <legend>Режим</legend>
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
                <strong>Последовательный</strong>
                <small>Новое задание после правильного ответа</small>
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
                <strong>На время</strong>
                <small>Следующее задание сразу после ответа или по таймеру</small>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="number-fields">
          <label className="number-field">
            <span>Длительность, мин</span>
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
                {errors.durationMinutes}
              </small>
            )}
          </label>

          {config.mode === "timed" && (
            <label className="number-field">
              <span>Время на задание, сек</span>
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
                  {errors.promptPeriodSeconds}
                </small>
              )}
            </label>
          )}
        </div>
      </div>
    </section>
  );
}
