import { useCallback, useEffect, useState } from "react";
import { useMidiSynth } from "../audio/useMidiSynth";
import { HomeScreen } from "../components/HomeScreen";
import { NotePracticeScreen } from "../components/NotePracticeScreen";
import { NoteSetupScreen } from "../components/NoteSetupScreen";
import { PracticeScreen } from "../components/PracticeScreen";
import { ResultsScreen } from "../components/ResultsScreen";
import { SettingsScreen } from "../components/SettingsScreen";
import { SetupScreen } from "../components/SetupScreen";
import type { SessionSummary } from "../domain/sessionSummary";
import {
  DEFAULT_NOTE_TRAINING_CONFIG,
  type NoteTrainingConfig,
} from "../domain/noteTrainingConfig";
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
  | { kind: "note-setup" }
  | {
      kind: "settings";
      returnTo: "home" | "interval-setup" | "note-setup";
    }
  | { kind: "interval-practice"; config: TrainingConfig }
  | { kind: "note-practice"; config: NoteTrainingConfig }
  | {
      kind: "results";
      summary: SessionSummary;
      returnTo: "interval-setup" | "note-setup";
      showMissedTasks: boolean;
    };

export function App() {
  const [preferences, setPreferences] = useState<AppPreferences>(
    loadAppPreferences,
  );
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>(() => ({
    ...DEFAULT_TRAINING_CONFIG,
    pitchClasses: [...DEFAULT_TRAINING_CONFIG.pitchClasses],
    intervalSemitones: [...DEFAULT_TRAINING_CONFIG.intervalSemitones],
  }));
  const [noteTrainingConfig, setNoteTrainingConfig] =
    useState<NoteTrainingConfig>(() => ({
      ...DEFAULT_NOTE_TRAINING_CONFIG,
      pitchClasses: [...DEFAULT_NOTE_TRAINING_CONFIG.pitchClasses],
    }));
  const [screen, setScreen] = useState<ScreenState>({ kind: "home" });
  const {
    status,
    errorMessage,
    inputs,
    selectedInputId,
    setSelectedInputId,
    activeNotes,
    lastNoteEvent,
    connect,
  } = useMidiInput();

  useMidiSynth(lastNoteEvent, activeNotes, preferences.synth);

  useEffect(() => {
    saveAppPreferences(preferences);
  }, [preferences]);

  const startIntervalPractice = useCallback(() => {
    setScreen({
      kind: "interval-practice",
      config: {
        ...trainingConfig,
        pitchClasses: [...trainingConfig.pitchClasses],
        intervalSemitones: [...trainingConfig.intervalSemitones],
      },
    });
  }, [trainingConfig]);

  const startNotePractice = useCallback(() => {
    setScreen({
      kind: "note-practice",
      config: {
        ...noteTrainingConfig,
        pitchClasses: [...noteTrainingConfig.pitchClasses],
      },
    });
  }, [noteTrainingConfig]);

  const finishIntervalPractice = useCallback((summary: SessionSummary) => {
    setScreen({
      kind: "results",
      summary,
      returnTo: "interval-setup",
      showMissedTasks: true,
    });
  }, []);

  const finishNotePractice = useCallback(
    (summary: SessionSummary, showMissedTasks: boolean) => {
      setScreen({
        kind: "results",
        summary,
        returnTo: "note-setup",
        showMissedTasks,
      });
    },
    [],
  );

  const returnToIntervalSetup = useCallback(() => {
    setScreen({ kind: "interval-setup" });
  }, []);

  const returnToNoteSetup = useCallback(() => {
    setScreen({ kind: "note-setup" });
  }, []);

  if (screen.kind === "settings") {
    return (
      <SettingsScreen
        activeNotes={activeNotes}
        backLabel={
          screen.returnTo === "home"
            ? "Назад на главный экран"
            : screen.returnTo === "note-setup"
              ? "Назад к настройке нот"
              : "Назад к настройке интервалов"
        }
        midiErrorMessage={errorMessage}
        midiInputs={inputs}
        midiStatus={status}
        onBack={() => setScreen({ kind: screen.returnTo })}
        onChange={setPreferences}
        onConnectMidi={connect}
        onSelectInput={setSelectedInputId}
        preferences={preferences}
        selectedInputId={selectedInputId}
      />
    );
  }

  if (screen.kind === "interval-practice") {
    return (
      <PracticeScreen
        activeNotes={activeNotes}
        config={screen.config}
        midiStatus={status}
        onFinish={finishIntervalPractice}
        onReturnToSetup={returnToIntervalSetup}
        preferences={preferences}
      />
    );
  }

  if (screen.kind === "note-practice") {
    return (
      <NotePracticeScreen
        activeNotes={activeNotes}
        config={screen.config}
        midiStatus={status}
        onFinish={finishNotePractice}
        onReturnToSetup={returnToNoteSetup}
        preferences={preferences}
      />
    );
  }

  if (screen.kind === "results") {
    return (
      <ResultsScreen
        exerciseLabel={
          screen.returnTo === "note-setup"
            ? "Тренировка нот завершена"
            : "Тренировка интервалов завершена"
        }
        onReturn={() => setScreen({ kind: screen.returnTo })}
        returnLabel={
          screen.returnTo === "note-setup"
            ? "К настройке нот"
            : "К настройке интервалов"
        }
        showMissedTasks={screen.showMissedTasks}
        summary={screen.summary}
      />
    );
  }

  if (screen.kind === "home") {
    return (
      <HomeScreen
        onOpenIntervalTraining={() => setScreen({ kind: "interval-setup" })}
        onOpenNoteTraining={() => setScreen({ kind: "note-setup" })}
        onOpenSettings={() =>
          setScreen({ kind: "settings", returnTo: "home" })
        }
      />
    );
  }

  if (screen.kind === "note-setup") {
    return (
      <NoteSetupScreen
        activeNotes={activeNotes}
        config={noteTrainingConfig}
        midiErrorMessage={errorMessage}
        midiInputs={inputs}
        midiStatus={status}
        onConfigChange={setNoteTrainingConfig}
        onConnectMidi={connect}
        onOpenSettings={() =>
          setScreen({ kind: "settings", returnTo: "note-setup" })
        }
        onReturnHome={() => setScreen({ kind: "home" })}
        onSelectInput={setSelectedInputId}
        onStart={startNotePractice}
        preferences={preferences}
        selectedInputId={selectedInputId}
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
      onStart={startIntervalPractice}
      preferences={preferences}
      selectedInputId={selectedInputId}
    />
  );
}
