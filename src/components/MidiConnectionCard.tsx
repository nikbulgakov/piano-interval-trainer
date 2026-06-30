import {
  formatNoteName,
  type AppPreferences,
} from "../app/appPreferences";
import { getText } from "../app/i18n";
import { isNoteInPracticeRange } from "../domain/keyboard";
import type { MidiInputInfo, MidiStatus } from "../midi/useMidiInput";

type MidiConnectionCardProps = {
  status: MidiStatus;
  errorMessage: string;
  inputs: MidiInputInfo[];
  selectedInputId: string;
  onSelectInput: (inputId: string) => void;
  activeNotes: ReadonlySet<number>;
  onConnect: () => Promise<void>;
  preferences: AppPreferences;
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
  preferences,
}: MidiConnectionCardProps) {
  const t = (key: Parameters<typeof getText>[1]) =>
    getText(preferences.interfaceLanguage, key);
  const statusText: Record<MidiStatus, string> = {
    idle: t("midi.status.idle"),
    requesting: t("midi.status.requesting"),
    ready: t("midi.status.ready"),
    "no-inputs": t("midi.status.noInputs"),
    denied: t("midi.status.denied"),
    unsupported: t("midi.status.unsupported"),
    error: t("midi.status.error"),
  };
  const visibleActiveNotes = Array.from(activeNotes)
    .filter(isNoteInPracticeRange)
    .sort((left, right) => left - right);
  const canRequestAccess = status !== "requesting" && status !== "unsupported";
  const connectButtonText =
    status === "requesting"
      ? t("midi.connecting")
      : status === "denied" || status === "error"
        ? t("midi.retry")
        : t("midi.connect");

  return (
    <section className="midi-card" aria-labelledby="midi-title">
      <div className="midi-card-header">
        <div>
          <p className="eyebrow">{t("midi.eyebrow")}</p>
          <h2 id="midi-title">{t("midi.title")}</h2>
        </div>
        <span
          aria-live="polite"
          className={`status-badge status-${STATUS_TONE[status]}`}
          role="status"
        >
          <span className="status-dot" aria-hidden="true" />
          {statusText[status]}
        </span>
      </div>

      <div className="midi-controls">
        {inputs.length > 0 ? (
          <label className="field">
            <span>{t("midi.inputLabel")}</span>
            <select
              onChange={(event) => onSelectInput(event.target.value)}
              value={selectedInputId}
            >
              {inputs.map((input) => (
                <option key={input.id} value={input.id}>
                  {input.manufacturer
                    ? `${input.name || t("midi.unnamedInput")} — ${input.manufacturer}`
                    : input.name || t("midi.unnamedInput")}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="connection-hint">{t("midi.hint")}</p>
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
          {t("midi.unsupportedHint")}
        </p>
      )}
      {status === "no-inputs" && (
        <p className="inline-message" role="status">
          {t("midi.noInputsHint")}
        </p>
      )}
      {errorMessage && (
        <p className="inline-message error-message" role="alert">
          {t(errorMessage as Parameters<typeof getText>[1])}
        </p>
      )}

      <div className="active-notes" aria-live="polite" role="status">
        <span className="active-notes-label">{t("keyboard.pressedLabel")}</span>
        {visibleActiveNotes.length === 0 ? (
          <span className="empty-notes">{t("midi.activeNotesEmpty")}</span>
        ) : (
          visibleActiveNotes.map((midiNote) => (
            <span className="note-chip" key={midiNote}>
              {formatNoteName(
                midiNote,
                preferences.noteNotation,
                preferences.interfaceLanguage,
              )}{" "}
              · MIDI{" "}
              {midiNote}
            </span>
          ))
        )}
      </div>
    </section>
  );
}
