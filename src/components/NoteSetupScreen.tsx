import { useEffect, useRef } from "react";
import type { AppPreferences } from "../app/appPreferences";
import { getText } from "../app/i18n";
import type { NoteTrainingConfig } from "../domain/noteTrainingConfig";
import type { MidiInputInfo, MidiStatus } from "../midi/useMidiInput";
import { MidiConnectionCard } from "./MidiConnectionCard";
import { NoteStartPanel } from "./NoteStartPanel";
import { NoteTrainingSetup } from "./NoteTrainingSetup";

type NoteSetupScreenProps = {
  config: NoteTrainingConfig;
  onConfigChange: (config: NoteTrainingConfig) => void;
  midiStatus: MidiStatus;
  midiErrorMessage: string;
  midiInputs: MidiInputInfo[];
  selectedInputId: string;
  onSelectInput: (inputId: string) => void;
  activeNotes: ReadonlySet<number>;
  onConnectMidi: () => Promise<void>;
  onStart: () => void;
  onOpenSettings: () => void;
  onReturnHome: () => void;
  preferences: AppPreferences;
};

export function NoteSetupScreen({
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
  onOpenSettings,
  onReturnHome,
  preferences,
}: NoteSetupScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const t = (key: Parameters<typeof getText>[1]) =>
    getText(preferences.interfaceLanguage, key);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">{t("common.noteTraining")}</p>
          <h1 ref={titleRef} tabIndex={-1}>
            {t("setup.note.title")}
          </h1>
          <p className="hero-copy">{t("setup.note.copy")}</p>
        </div>
        <div className="hero-actions">
          <button
            className="secondary-button"
            onClick={onReturnHome}
            type="button"
          >
            {t("common.backToHome")}
          </button>
          <button
            className="secondary-button"
            onClick={onOpenSettings}
            type="button"
          >
            {t("common.appSettings")}
          </button>
        </div>
      </header>

      <MidiConnectionCard
        activeNotes={activeNotes}
        errorMessage={midiErrorMessage}
        inputs={midiInputs}
        onConnect={onConnectMidi}
        onSelectInput={onSelectInput}
        preferences={preferences}
        selectedInputId={selectedInputId}
        status={midiStatus}
      />

      <div className="setup-layout">
        <NoteTrainingSetup
          config={config}
          onChange={onConfigChange}
          preferences={preferences}
        />
        <NoteStartPanel
          config={config}
          midiStatus={midiStatus}
          onStart={onStart}
          preferences={preferences}
        />
      </div>

      <footer className="app-footer">
        {t("setup.footer")}
      </footer>
    </main>
  );
}
