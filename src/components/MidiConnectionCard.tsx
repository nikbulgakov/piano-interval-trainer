import { isNoteInPracticeRange } from "../domain/keyboard";
import { getPitchClassInfo } from "../domain/music";
import type { MidiInputInfo, MidiStatus } from "../midi/useMidiInput";

type MidiConnectionCardProps = {
  status: MidiStatus;
  errorMessage: string;
  inputs: MidiInputInfo[];
  selectedInputId: string;
  onSelectInput: (inputId: string) => void;
  activeNotes: ReadonlySet<number>;
  onConnect: () => Promise<void>;
};

const STATUS_TEXT: Record<MidiStatus, string> = {
  idle: "MIDI ещё не подключено",
  requesting: "Запрашиваем доступ…",
  ready: "MIDI подключено",
  "no-inputs": "Доступ получен, но входы не найдены",
  denied: "Доступ к MIDI запрещён",
  unsupported: "Web MIDI не поддерживается",
  error: "Ошибка MIDI",
};

const STATUS_TONE: Record<
  MidiStatus,
  "neutral" | "pending" | "success" | "error"
> = {
  idle: "neutral",
  requesting: "pending",
  ready: "success",
  "no-inputs": "pending",
  denied: "error",
  unsupported: "error",
  error: "error",
};

export function MidiConnectionCard({
  status,
  errorMessage,
  inputs,
  selectedInputId,
  onSelectInput,
  activeNotes,
  onConnect,
}: MidiConnectionCardProps) {
  const visibleActiveNotes = Array.from(activeNotes)
    .filter(isNoteInPracticeRange)
    .sort((left, right) => left - right);
  const canRequestAccess = status !== "requesting" && status !== "unsupported";
  const connectButtonText =
    status === "requesting"
      ? "Подключаем…"
      : status === "denied" || status === "error"
        ? "Повторить подключение"
        : "Подключить MIDI";

  return (
    <section className="midi-card" aria-labelledby="midi-title">
      <div className="midi-card-header">
        <div>
          <p className="eyebrow">Подключение</p>
          <h2 id="midi-title">MIDI-устройство</h2>
        </div>
        <span
          aria-live="polite"
          className={`status-badge status-${STATUS_TONE[status]}`}
          role="status"
        >
          <span className="status-dot" aria-hidden="true" />
          {STATUS_TEXT[status]}
        </span>
      </div>

      <div className="midi-controls">
        {inputs.length > 0 ? (
          <label className="field">
            <span>MIDI-вход</span>
            <select
              onChange={(event) => onSelectInput(event.target.value)}
              value={selectedInputId}
            >
              {inputs.map((input) => (
                <option key={input.id} value={input.id}>
                  {input.manufacturer
                    ? `${input.name} — ${input.manufacturer}`
                    : input.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="connection-hint">
            Подключите клавиатуру по USB, затем разрешите браузеру доступ к
            MIDI.
          </p>
        )}

        {(status === "idle" ||
          status === "denied" ||
          status === "error" ||
          status === "requesting") && (
          <button
            className="primary-button"
            disabled={!canRequestAccess}
            aria-busy={status === "requesting"}
            onClick={() => void onConnect()}
            type="button"
          >
            {connectButtonText}
          </button>
        )}
      </div>

      {status === "unsupported" && (
        <p className="inline-message error-message" role="alert">
          Откройте приложение в актуальном Chrome или Edge через localhost или
          HTTPS.
        </p>
      )}
      {status === "no-inputs" && (
        <p className="inline-message" role="status">
          Разрешение получено. Подключите или включите MIDI-клавиатуру — список
          обновится автоматически.
        </p>
      )}
      {errorMessage && (
        <p className="inline-message error-message" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="active-notes" aria-live="polite" role="status">
        <span className="active-notes-label">Нажаты:</span>
        {visibleActiveNotes.length === 0 ? (
          <span className="empty-notes">нет клавиш в диапазоне</span>
        ) : (
          visibleActiveNotes.map((midiNote) => {
            const note = getPitchClassInfo(midiNote);

            return (
              <span className="note-chip" key={midiNote}>
                {note.russianName} ({note.latinName}) · MIDI {midiNote}
              </span>
            );
          })
        )}
      </div>
    </section>
  );
}
