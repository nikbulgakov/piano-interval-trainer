import { formatNoteName, type AppPreferences } from "../app/appPreferences";
import { PITCH_CLASSES } from "../domain/music";
import {
  validateNoteTrainingConfig,
  type NoteTrainingConfig,
} from "../domain/noteTrainingConfig";

type NoteTrainingSetupProps = {
  config: NoteTrainingConfig;
  onChange: (config: NoteTrainingConfig) => void;
  preferences: AppPreferences;
};

export function NoteTrainingSetup({
  config,
  onChange,
  preferences,
}: NoteTrainingSetupProps) {
  const errors = validateNoteTrainingConfig(config);

  const togglePitchClass = (
    pitchClass: (typeof PITCH_CLASSES)[number]["value"],
  ) => {
    const isSelected = config.pitchClasses.includes(pitchClass);
    const pitchClasses = isSelected
      ? config.pitchClasses.filter((value) => value !== pitchClass)
      : [...config.pitchClasses, pitchClass].sort((left, right) => left - right);

    onChange({ ...config, pitchClasses });
  };

  return (
    <section className="training-card" aria-labelledby="note-setup-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Настройка</p>
          <h2 id="note-setup-title">Какие ноты ищем</h2>
        </div>
        <span className="selection-summary">
          Выбрано: {config.pitchClasses.length}
        </span>
      </div>

      <fieldset
        aria-describedby={
          errors.pitchClasses ? "note-pitch-classes-error" : undefined
        }
        className="setup-group"
      >
        <div className="group-heading">
          <legend>Ноты</legend>
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
                <span>
                  {formatNoteName(note.value, preferences.noteNotation)}
                </span>
              </button>
            );
          })}
        </div>

        {errors.pitchClasses && (
          <p className="field-error" id="note-pitch-classes-error">
            {errors.pitchClasses}
          </p>
        )}
      </fieldset>

      <div className="session-settings note-session-settings">
        <div className="note-mode-summary">
          <strong>Последовательный режим</strong>
          <span>Следующая нота появляется после правильного ответа.</span>
        </div>

        <div className="number-fields single-number-field">
          <label className="number-field">
            <span>Длительность, мин</span>
            <input
              aria-describedby={
                errors.durationMinutes ? "note-duration-error" : undefined
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
              <small className="field-error" id="note-duration-error">
                {errors.durationMinutes}
              </small>
            )}
          </label>
        </div>
      </div>
    </section>
  );
}
