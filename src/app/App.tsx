import { useCallback, useEffect, useState } from "react";
import { HomeScreen } from "../components/HomeScreen";
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
  | { kind: "home" }
  | { kind: "interval-setup" }
  | { kind: "settings"; returnTo: "home" | "interval-setup" }
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
  const [screen, setScreen] = useState<ScreenState>({ kind: "home" });
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
    setScreen({ kind: "interval-setup" });
  }, []);

  if (screen.kind === "settings") {
    return (
      <SettingsScreen
        backLabel={
          screen.returnTo === "home"
            ? "Назад на главный экран"
            : "Назад к настройке интервалов"
        }
        onBack={() => setScreen({ kind: screen.returnTo })}
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

  if (screen.kind === "home") {
    return (
      <HomeScreen
        onOpenIntervalTraining={() => setScreen({ kind: "interval-setup" })}
        onOpenSettings={() =>
          setScreen({ kind: "settings", returnTo: "home" })
        }
      />
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
      onOpenSettings={() =>
        setScreen({ kind: "settings", returnTo: "interval-setup" })
      }
      onReturnHome={() => setScreen({ kind: "home" })}
      onStart={startPractice}
      preferences={preferences}
      selectedInputId={selectedInputId}
    />
  );
}
