import {
  getKeyboardNotes,
  PRACTICE_MAX_NOTE,
  PRACTICE_MIN_NOTE,
} from "../domain/keyboard";

type PianoKeyboardProps = {
  activeNotes: ReadonlySet<number>;
};

const keyboardNotes = getKeyboardNotes();
const whiteNotes = keyboardNotes.filter((note) => !note.isBlack);
const blackNotes = keyboardNotes.filter((note) => note.isBlack);

function getBlackKeyPosition(midiNote: number): number {
  const whiteKeysBefore = keyboardNotes.filter(
    (note) => !note.isBlack && note.midiNote < midiNote,
  ).length;

  return (whiteKeysBefore / whiteNotes.length) * 100;
}

export function PianoKeyboard({ activeNotes }: PianoKeyboardProps) {
  const activeNoteNames = keyboardNotes
    .filter((note) => activeNotes.has(note.midiNote))
    .map(
      (note) =>
        `${note.russianName} (${note.latinName}), MIDI ${note.midiNote}`,
    );

  return (
    <section className="keyboard-section" aria-labelledby="keyboard-title">
      <div className="keyboard-heading">
        <div>
          <p className="eyebrow">Монитор нажатий</p>
          <h2 id="keyboard-title">Экранная клавиатура</h2>
        </div>
        <p className="keyboard-range">
          MIDI {PRACTICE_MIN_NOTE}–{PRACTICE_MAX_NOTE} · 3 октавы
        </p>
      </div>

      <p aria-live="polite" className="visually-hidden" role="status">
        {activeNoteNames.length > 0
          ? `Нажаты: ${activeNoteNames.join(", ")}`
          : "Клавиши не нажаты"}
      </p>

      <div className="piano" aria-hidden="true">
        <div className="white-keys">
          {whiteNotes.map((note) => {
            const isActive = activeNotes.has(note.midiNote);

            return (
              <div
                className={`piano-key white-key${isActive ? " is-active" : ""}`}
                key={note.midiNote}
              >
                <span>{note.latinName}</span>
              </div>
            );
          })}
        </div>

        {blackNotes.map((note) => {
          const isActive = activeNotes.has(note.midiNote);

          return (
            <div
              className={`piano-key black-key${isActive ? " is-active" : ""}`}
              key={note.midiNote}
              style={{ left: `${getBlackKeyPosition(note.midiNote)}%` }}
            />
          );
        })}
      </div>
    </section>
  );
}
