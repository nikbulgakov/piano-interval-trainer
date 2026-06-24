import { useEffect, useRef } from "react";
import {
  formatIntervalName,
  formatNoteName,
  type AppPreferences,
} from "../app/appPreferences";

type SettingsScreenProps = {
  preferences: AppPreferences;
  onChange: (preferences: AppPreferences) => void;
  onBack: () => void;
};

export function SettingsScreen({
  preferences,
  onChange,
  onBack,
}: SettingsScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <main className="app-shell settings-screen">
      <header className="hero settings-hero">
        <div>
          <p className="eyebrow">Настройки приложения</p>
          <h1 ref={titleRef} tabIndex={-1}>
            Обозначения
          </h1>
          <p className="hero-copy">
            Выбранный формат используется в настройке, практике, MIDI-мониторе
            и на экранной клавиатуре.
          </p>
        </div>
        <button className="secondary-button" onClick={onBack} type="button">
          Назад к настройке тренировки
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
    </main>
  );
}
