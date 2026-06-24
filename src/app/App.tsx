import { useCallback, useEffect, useState } from "react";
import { PracticeScreen } from "../components/PracticeScreen";
import { ResultsScreen } from "../components/ResultsScreen";
import { SettingsScreen } from "../components/SettingsScreen";
import { SetupScreen } from "../components/SetupScreen";
import type { SessionSummary } from "../domain/sessionSummary";
import {
  DEFAULT_TRAINING_CONFIG,
  type TrainingConfig,
} from "../domain/trainingConfig";
import { useMidiInput } from "../midi/useMidiInput";
import {
  loadAppPreferences,
  saveAppPreferences,
  type AppPreferences,
} from "./appPreferences";

type ScreenState =
  | { kind: "setup" }
  | { kind: "settings" }
  | { kind: "practice"; config: TrainingConfig }
  | { kind: "results"; summary: SessionSummary };

export function App() {
  const [preferences, setPreferences] = useState<AppPreferences>(
    loadAppPreferences,
  );
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>(() => ({
    ...DEFAULT_TRAINING_CONFIG,
    pitchClasses: [...DEFAULT_TRAINING_CONFIG.pitchClasses],
    intervalSemitones: [...DEFAULT_TRAINING_CONFIG.intervalSemitones],
  }));
  const [screen, setScreen] = useState<ScreenState>({ kind: "setup" });
  const {
    status,
    errorMessage,
    inputs,
    selectedInputId,
    setSelectedInputId,
    activeNotes,
    connect,
  } = useMidiInput();

  useEffect(() => {
    saveAppPreferences(preferences);
  }, [preferences]);

  const startPractice = useCallback(() => {
    setScreen({
      kind: "practice",
      config: {
        ...trainingConfig,
        pitchClasses: [...trainingConfig.pitchClasses],
        intervalSemitones: [...trainingConfig.intervalSemitones],
      },
    });
  }, [trainingConfig]);

  const finishPractice = useCallback((summary: SessionSummary) => {
    setScreen({ kind: "results", summary });
  }, []);

  const returnToSetup = useCallback(() => {
    setScreen({ kind: "setup" });
  }, []);

  if (screen.kind === "settings") {
    return (
      <SettingsScreen
        onBack={returnToSetup}
        onChange={setPreferences}
        preferences={preferences}
      />
    );
  }

  if (screen.kind === "practice") {
    return (
      <PracticeScreen
        activeNotes={activeNotes}
        config={screen.config}
        midiStatus={status}
        onFinish={finishPractice}
        onReturnToSetup={returnToSetup}
        preferences={preferences}
      />
    );
  }

  if (screen.kind === "results") {
    return (
      <ResultsScreen onReturn={returnToSetup} summary={screen.summary} />
    );
  }

  return (
    <SetupScreen
      activeNotes={activeNotes}
      config={trainingConfig}
      midiErrorMessage={errorMessage}
      midiInputs={inputs}
      midiStatus={status}
      onConfigChange={setTrainingConfig}
      onConnectMidi={connect}
      onSelectInput={setSelectedInputId}
      onOpenSettings={() => setScreen({ kind: "settings" })}
      onStart={startPractice}
      preferences={preferences}
      selectedInputId={selectedInputId}
    />
  );
}
