import {
  formatIntervalName,
  formatNoteName,
  type AppPreferences,
} from "../app/appPreferences";
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
  const configIsValid = isTrainingConfigValid(config);
  const midiIsReady = midiStatus === "ready";
  const canStart = configIsValid && midiIsReady;
  const noteNames = config.pitchClasses
    .map((pitchClass) => formatNoteName(pitchClass, preferences.noteNotation))
    .join(", ");
  const intervalNames = config.intervalSemitones
    .map((semitones) =>
      formatIntervalName(semitones, preferences.intervalNotation),
    )
    .join(", ");

  let readinessMessage = "Все готово к тренировке.";

  if (!configIsValid) {
    readinessMessage = "Исправьте отмеченные настройки.";
  } else if (!midiIsReady) {
    readinessMessage = "Сначала подключите MIDI-клавиатуру.";
  }

  return (
    <aside className="start-card" aria-labelledby="start-title">
      <div>
        <p className="eyebrow">Готовность</p>
        <h2 id="start-title">Начать тренировку</h2>
      </div>

      <dl className="start-summary">
        <div>
          <dt>Ноты</dt>
          <dd>{noteNames || "Не выбраны"}</dd>
        </div>
        <div>
          <dt>Интервалы</dt>
          <dd>{intervalNames || "Не выбраны"}</dd>
        </div>
        <div>
          <dt>Режим</dt>
          <dd>
            {config.mode === "sequential" ? "Последовательный" : "На время"}
          </dd>
        </div>
        <div>
          <dt>Длительность</dt>
          <dd>{config.durationMinutes} мин</dd>
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
        Начать тренировку
      </button>
    </aside>
  );
}
