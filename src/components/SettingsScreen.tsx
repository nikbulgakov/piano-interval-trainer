import { useEffect, useRef } from "react";
import {
  formatIntervalName,
  formatNoteName,
  type AppPreferences,
} from "../app/appPreferences";
import type { SynthPreset } from "../audio/synthSettings";

type SettingsScreenProps = {
  preferences: AppPreferences;
  backLabel: string;
  onChange: (preferences: AppPreferences) => void;
  onBack: () => void;
};

export function SettingsScreen({
  preferences,
  backLabel,
  onChange,
  onBack,
}: SettingsScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

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
          <p className="eyebrow">Настройки приложения</p>
          <h1 ref={titleRef} tabIndex={-1}>
            Обозначения и звук
          </h1>
          <p className="hero-copy">
            Выбранные форматы используются в настройке, практике,
            MIDI-мониторе и на экранной клавиатуре. Звук реагирует на
            физическую MIDI-клавиатуру.
          </p>
        </div>
        <button className="secondary-button" onClick={onBack} type="button">
          {backLabel}
        </button>
      </header>

      <section className="settings-card" aria-labelledby="notation-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Общие настройки</p>
            <h2 id="notation-title">Как показывать задания</h2>
          </div>
        </div>

        <fieldset className="preference-group">
          <legend>Обозначения нот</legend>
          <p className="preference-description">
            Настройка применяется одновременно ко всем белым и чёрным клавишам.
          </p>
          <div className="preference-grid">
            <label className="preference-option">
              <input
                checked={preferences.noteNotation === "russian"}
                name="note-notation"
                onChange={() =>
                  onChange({ ...preferences, noteNotation: "russian" })
                }
                type="radio"
                value="russian"
              />
              <span>
                <strong>Русские</strong>
                <small>До, До♯/Ре♭, Ре</small>
              </span>
            </label>
            <label className="preference-option">
              <input
                checked={preferences.noteNotation === "latin"}
                name="note-notation"
                onChange={() =>
                  onChange({ ...preferences, noteNotation: "latin" })
                }
                type="radio"
                value="latin"
              />
              <span>
                <strong>Латинские</strong>
                <small>C, C♯/D♭, D</small>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset className="preference-group">
          <legend>Обозначения интервалов</legend>
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
                <strong>Полные названия</strong>
                <small>малая терция, чистая квинта</small>
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
                <strong>Краткие обозначения</strong>
                <small>m3, P5</small>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="preference-preview" aria-live="polite">
          <span>Пример задания</span>
          <strong>
            {formatNoteName(1, preferences.noteNotation)} —{" "}
            {formatIntervalName(3, preferences.intervalNotation)}
          </strong>
        </div>
      </section>

      <section className="settings-card" aria-labelledby="sound-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Звук</p>
            <h2 id="sound-title">Как звучит MIDI-клавиатура</h2>
          </div>
        </div>

        <label className="sound-toggle">
          <input
            checked={preferences.synth.enabled}
            onChange={(event) => updateSynth({ enabled: event.target.checked })}
            type="checkbox"
          />
          <span>
            <strong>Включить звук клавиш</strong>
            <small>
              Звук запускается от физической MIDI-клавиатуры и не влияет на
              проверку ответов.
            </small>
          </span>
        </label>

        <fieldset className="preference-group">
          <legend>Тембр</legend>
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
                <strong>Пианино</strong>
                <small>Реалистичный sample-based звук</small>
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
                <strong>Синт</strong>
                <small>Более яркий удерживаемый звук</small>
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
                <strong>Электропиано</strong>
                <small>Мягкий округлый тембр</small>
              </span>
            </label>
          </div>
        </fieldset>

        <label className="volume-control">
          <span>
            <strong>Громкость</strong>
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
    </main>
  );
}
