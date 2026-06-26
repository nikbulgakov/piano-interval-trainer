import { useEffect, useRef } from "react";
import type { InterfaceLanguage } from "../app/appPreferences";
import { getText } from "../app/i18n";

type HomeScreenProps = {
  language: InterfaceLanguage;
  onOpenIntervalTraining: () => void;
  onOpenNoteTraining: () => void;
  onOpenSettings: () => void;
};

export function HomeScreen({
  language,
  onOpenIntervalTraining,
  onOpenNoteTraining,
  onOpenSettings,
}: HomeScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const t = (key: Parameters<typeof getText>[1]) => getText(language, key);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <main className="app-shell home-screen">
      <header className="hero">
        <div>
          <p className="eyebrow">Key Sense</p>
          <h1 ref={titleRef} tabIndex={-1}>
            {t("home.title")}
          </h1>
          <p className="hero-copy">{t("home.copy")}</p>
        </div>
        <button
          className="secondary-button"
          onClick={onOpenSettings}
          type="button"
        >
          {t("common.appSettings")}
        </button>
      </header>

      <section
        className="training-mode-section"
        aria-labelledby="training-mode-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("home.modes.eyebrow")}</p>
            <h2 id="training-mode-title">{t("home.modes.title")}</h2>
          </div>
        </div>

        <div className="training-mode-grid">
          <button
            className="training-mode-card is-available"
            onClick={onOpenIntervalTraining}
            type="button"
          >
            <span className="training-mode-status">
              {t("common.available")}
            </span>
            <span aria-hidden="true" className="training-mode-symbol">
              m3
            </span>
            <span className="training-mode-title">
              {t("home.intervals.title")}
            </span>
            <span className="training-mode-description">
              {t("home.intervals.description")}
            </span>
            <span className="training-mode-action">
              {t("home.configureTraining")}
            </span>
          </button>

          <button
            className="training-mode-card is-available"
            onClick={onOpenNoteTraining}
            type="button"
          >
            <span className="training-mode-status">
              {t("common.available")}
            </span>
            <span aria-hidden="true" className="training-mode-symbol">
              {language === "ru" ? "До" : "C"}
            </span>
            <span className="training-mode-title">
              {t("home.notes.title")}
            </span>
            <span className="training-mode-description">
              {t("home.notes.description")}
            </span>
            <span className="training-mode-action">
              {t("home.configureTraining")}
            </span>
          </button>
        </div>
      </section>

      <footer className="app-footer">
        {t("home.footer")}
      </footer>
    </main>
  );
}
