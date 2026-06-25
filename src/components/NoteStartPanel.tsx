import { formatNoteName, type AppPreferences } from "../app/appPreferences";
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
  const configIsValid = isNoteTrainingConfigValid(config);
  const midiIsReady = midiStatus === "ready";
  const canStart = configIsValid && midiIsReady;
  const noteNames = config.pitchClasses
    .map((pitchClass) => formatNoteName(pitchClass, preferences.noteNotation))
    .join(", ");

  let readinessMessage = "Все готово к тренировке.";

  if (!configIsValid) {
    readinessMessage = "Исправьте отмеченные настройки.";
  } else if (!midiIsReady) {
    readinessMessage = "Сначала подключите MIDI-клавиатуру.";
  }

  return (
    <aside className="start-card" aria-labelledby="note-start-title">
      <div>
        <p className="eyebrow">Готовность</p>
        <h2 id="note-start-title">Начать тренировку</h2>
      </div>

      <dl className="start-summary">
        <div>
          <dt>Ноты</dt>
          <dd>{noteNames || "Не выбраны"}</dd>
        </div>
        <div>
          <dt>Режим</dt>
          <dd>Последовательный</dd>
        </div>
        <div>
          <dt>Длительность</dt>
          <dd>{config.durationMinutes} мин</dd>
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
        Начать тренировку
      </button>
    </aside>
  );
}
