import { useEffect, useRef } from "react";
import type { TrainingConfig } from "../domain/trainingConfig";
import type {
  MidiInputInfo,
  MidiStatus,
} from "../midi/useMidiInput";
import { MidiConnectionCard } from "./MidiConnectionCard";
import { StartPanel } from "./StartPanel";
import { TrainingSetup } from "./TrainingSetup";

type SetupScreenProps = {
  config: TrainingConfig;
  onConfigChange: (config: TrainingConfig) => void;
  midiStatus: MidiStatus;
  midiErrorMessage: string;
  midiInputs: MidiInputInfo[];
  selectedInputId: string;
  onSelectInput: (inputId: string) => void;
  activeNotes: ReadonlySet<number>;
  onConnectMidi: () => Promise<void>;
  onStart: () => void;
};

export function SetupScreen({
  config,
  onConfigChange,
  midiStatus,
  midiErrorMessage,
  midiInputs,
  selectedInputId,
  onSelectInput,
  activeNotes,
  onConnectMidi,
  onStart,
}: SetupScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Piano Interval Trainer</p>
          <h1 ref={titleRef} tabIndex={-1}>
            Настройте тренировку
          </h1>
          <p className="hero-copy">
            Подключите MIDI-клавиатуру, выберите материал и запустите отдельный
            экран практики без лишних настроек.
          </p>
        </div>
        <span className="stage-label">Sprint 5</span>
      </header>

      <MidiConnectionCard
        activeNotes={activeNotes}
        errorMessage={midiErrorMessage}
        inputs={midiInputs}
        onConnect={onConnectMidi}
        onSelectInput={onSelectInput}
        selectedInputId={selectedInputId}
        status={midiStatus}
      />

      <div className="setup-layout">
        <TrainingSetup config={config} onChange={onConfigChange} />
        <StartPanel config={config} midiStatus={midiStatus} onStart={onStart} />
      </div>

      <footer className="app-footer">
        MIDI-данные обрабатываются только в этом браузере и никуда не
        отправляются.
      </footer>
    </main>
  );
}
