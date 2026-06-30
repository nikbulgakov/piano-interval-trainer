import { useEffect, useRef } from "react";
import {
  formatIntervalName,
  formatNoteName,
  type AppPreferences,
} from "../app/appPreferences";
import { getText } from "../app/i18n";
import type { SynthPreset } from "../audio/synthSettings";
import type { MidiInputInfo, MidiStatus } from "../midi/useMidiInput";
import { MidiConnectionCard } from "./MidiConnectionCard";

type SettingsScreenProps = {
  preferences: AppPreferences;
  backLabel: string;
  activeNotes: Set<number>;
  midiErrorMessage: string;
  midiInputs: MidiInputInfo[];
  midiStatus: MidiStatus;
  onChange: (preferences: AppPreferences) => void;
  onBack: () => void;
  onConnectMidi: () => Promise<void>;
  onSelectInput: (inputId: string) => void;
  selectedInputId: string;
};

export function SettingsScreen({
  preferences,
  backLabel,
  activeNotes,
  midiErrorMessage,
  midiInputs,
  midiStatus,
  onChange,
  onBack,
  onConnectMidi,
  onSelectInput,
  selectedInputId,
}: SettingsScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const t = (key: Parameters<typeof getText>[1]) =>
    getText(preferences.interfaceLanguage, key);
  const solfegeExample =
    preferences.interfaceLanguage === "ru"
      ? "До, До♯/Ре♭, Ре"
      : "Do, Do♯/Re♭, Re";
  const fullIntervalExample = `${formatIntervalName(
    3,
    "name",
    preferences.interfaceLanguage,
  )}, ${formatIntervalName(7, "name", preferences.interfaceLanguage)}`;
  const shortIntervalExample = `${formatIntervalName(
    3,
    "symbol",
    preferences.interfaceLanguage,
  )}, ${formatIntervalName(7, "symbol", preferences.interfaceLanguage)}`;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const updateSynth = (partialSynth: Partial<AppPreferences["synth"]>) => {
    onChange({
      ...preferences,
      synth: {
        ...preferences.synth,
        ...partialSynth,
      },
    });
  };

  const choosePreset = (preset: SynthPreset) => {
    updateSynth({ preset });
  };

  return (
    <main className="app-shell settings-screen">
      <header className="hero settings-hero">
        <div>
          <p className="eyebrow">{t("settings.eyebrow")}</p>
          <h1 ref={titleRef} tabIndex={-1}>
            {t("settings.title")}
          </h1>
          <p className="hero-copy">{t("settings.copy")}</p>
        </div>
        <button className="secondary-button" onClick={onBack} type="button">
          {backLabel}
        </button>
      </header>

      <section className="settings-card" aria-labelledby="notation-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("settings.general.eyebrow")}</p>
            <h2 id="notation-title">{t("settings.general.title")}</h2>
          </div>
        </div>

        <fieldset className="preference-group">
          <legend>{t("settings.language.title")}</legend>
          <p className="preference-description">
            {t("settings.language.description")}
          </p>
          <div className="preference-grid">
            <label className="preference-option">
              <input
                checked={preferences.interfaceLanguage === "ru"}
                name="interface-language"
                onChange={() =>
                  onChange({ ...preferences, interfaceLanguage: "ru" })
                }
                type="radio"
                value="ru"
              />
              <span>
                <strong>{t("settings.language.ru")}</strong>
                <small>{t("settings.language.ruDescription")}</small>
              </span>
            </label>
            <label className="preference-option">
              <input
                checked={preferences.interfaceLanguage === "en"}
                name="interface-language"
                onChange={() =>
                  onChange({ ...preferences, interfaceLanguage: "en" })
                }
                type="radio"
                value="en"
              />
              <span>
                <strong>{t("settings.language.en")}</strong>
                <small>{t("settings.language.enDescription")}</small>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset className="preference-group">
          <legend>{t("settings.noteNotation.legend")}</legend>
          <p className="preference-description">
            {t("settings.noteNotation.description")}
          </p>
          <div className="preference-grid">
            <label className="preference-option">
              <input
                checked={preferences.noteNotation === "solfege"}
                name="note-notation"
                onChange={() =>
                  onChange({ ...preferences, noteNotation: "solfege" })
                }
                type="radio"
                value="solfege"
              />
              <span>
                <strong>{t("settings.noteNotation.russian")}</strong>
                <small>{solfegeExample}</small>
              </span>
            </label>
            <label className="preference-option">
              <input
                checked={preferences.noteNotation === "letter"}
                name="note-notation"
                onChange={() =>
                  onChange({ ...preferences, noteNotation: "letter" })
                }
                type="radio"
                value="letter"
              />
              <span>
                <strong>{t("settings.noteNotation.latin")}</strong>
                <small>C, C♯/D♭, D</small>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset className="preference-group">
          <legend>{t("settings.intervalNotation.legend")}</legend>
          <div className="preference-grid">
            <label className="preference-option">
              <input
                checked={preferences.intervalNotation === "name"}
                name="interval-notation"
                onChange={() =>
                  onChange({ ...preferences, intervalNotation: "name" })
                }
                type="radio"
                value="name"
              />
              <span>
                <strong>{t("settings.intervalNotation.names")}</strong>
                <small>{fullIntervalExample}</small>
              </span>
            </label>
            <label className="preference-option">
              <input
                checked={preferences.intervalNotation === "symbol"}
                name="interval-notation"
                onChange={() =>
                  onChange({ ...preferences, intervalNotation: "symbol" })
                }
                type="radio"
                value="symbol"
              />
              <span>
                <strong>{t("settings.intervalNotation.symbols")}</strong>
                <small>{shortIntervalExample}</small>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="preference-preview" aria-live="polite">
          <span>{t("settings.preview.label")}</span>
          <strong>
            {formatNoteName(
              1,
              preferences.noteNotation,
              preferences.interfaceLanguage,
            )}{" "}
            —{" "}
            {formatIntervalName(
              3,
              preferences.intervalNotation,
              preferences.interfaceLanguage,
            )}
          </strong>
        </div>
      </section>

      <section className="settings-card" aria-labelledby="sound-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("settings.sound.eyebrow")}</p>
            <h2 id="sound-title">{t("settings.sound.title")}</h2>
          </div>
        </div>

        <label className="sound-toggle">
          <input
            checked={preferences.synth.enabled}
            onChange={(event) => updateSynth({ enabled: event.target.checked })}
            type="checkbox"
          />
          <span>
            <strong>{t("settings.sound.enable")}</strong>
            <small>{t("settings.sound.description")}</small>
          </span>
        </label>

        <fieldset className="preference-group">
          <legend>{t("settings.sound.presetLegend")}</legend>
          <div className="preference-grid synth-preset-grid">
            <label className="preference-option">
              <input
                checked={preferences.synth.preset === "piano"}
                name="synth-preset"
                onChange={() => choosePreset("piano")}
                type="radio"
                value="piano"
              />
              <span>
                <strong>{t("settings.sound.piano")}</strong>
                <small>{t("settings.sound.pianoDescription")}</small>
              </span>
            </label>
            <label className="preference-option">
              <input
                checked={preferences.synth.preset === "synth"}
                name="synth-preset"
                onChange={() => choosePreset("synth")}
                type="radio"
                value="synth"
              />
              <span>
                <strong>{t("settings.sound.synth")}</strong>
                <small>{t("settings.sound.synthDescription")}</small>
              </span>
            </label>
            <label className="preference-option">
              <input
                checked={preferences.synth.preset === "electric-piano"}
                name="synth-preset"
                onChange={() => choosePreset("electric-piano")}
                type="radio"
                value="electric-piano"
              />
              <span>
                <strong>{t("settings.sound.electricPiano")}</strong>
                <small>{t("settings.sound.electricPianoDescription")}</small>
              </span>
            </label>
          </div>
        </fieldset>

        <label className="volume-control">
          <span>
            <strong>{t("settings.sound.volume")}</strong>
            <small>{Math.round(preferences.synth.volume * 100)}%</small>
          </span>
          <input
            max="100"
            min="0"
            onChange={(event) =>
              updateSynth({ volume: Number(event.target.value) / 100 })
            }
            type="range"
            value={Math.round(preferences.synth.volume * 100)}
          />
        </label>
      </section>

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
    </main>
  );
}
