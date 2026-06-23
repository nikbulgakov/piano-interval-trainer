import { useCallback, useState } from "react";
import { PracticeScreen } from "../components/PracticeScreen";
import { ResultsScreen } from "../components/ResultsScreen";
import { SetupScreen } from "../components/SetupScreen";
import type { SessionSummary } from "../domain/sessionSummary";
import {
  DEFAULT_TRAINING_CONFIG,
  type TrainingConfig,
} from "../domain/trainingConfig";
import { useMidiInput } from "../midi/useMidiInput";

type ScreenState =
  | { kind: "setup" }
  | { kind: "practice"; config: TrainingConfig }
  | { kind: "results"; summary: SessionSummary };

export function App() {
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

  if (screen.kind === "practice") {
    return (
      <PracticeScreen
        activeNotes={activeNotes}
        config={screen.config}
        midiStatus={status}
        onFinish={finishPractice}
        onReturnToSetup={returnToSetup}
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
      onStart={startPractice}
      selectedInputId={selectedInputId}
    />
  );
}
