import { useEffect, useRef } from "react";
import type { AppPreferences } from "../app/appPreferences";
import { getText } from "../app/i18n";
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
  onOpenSettings: () => void;
  onReturnHome: () => void;
  preferences: AppPreferences;
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
  onOpenSettings,
  onReturnHome,
  preferences,
}: SetupScreenProps) {
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
          <p className="eyebrow">{t("common.intervalTraining")}</p>
          <h1 ref={titleRef} tabIndex={-1}>
            {t("setup.interval.title")}
          </h1>
          <p className="hero-copy">{t("setup.interval.copy")}</p>
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
        <TrainingSetup
          config={config}
          onChange={onConfigChange}
          preferences={preferences}
        />
        <StartPanel
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
