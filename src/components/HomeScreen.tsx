import { useEffect, useRef } from "react";

type HomeScreenProps = {
  onOpenIntervalTraining: () => void;
  onOpenSettings: () => void;
};

export function HomeScreen({
  onOpenIntervalTraining,
  onOpenSettings,
}: HomeScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <main className="app-shell home-screen">
      <header className="hero">
        <div>
          <p className="eyebrow">Piano Interval Trainer</p>
          <h1 ref={titleRef} tabIndex={-1}>
            Выберите тренировку
          </h1>
          <p className="hero-copy">
            Сначала выберите навык, затем подключите MIDI-клавиатуру и настройте
            упражнение.
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={onOpenSettings}
          type="button"
        >
          Настройки приложения
        </button>
      </header>

      <section
        className="training-mode-section"
        aria-labelledby="training-mode-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Режимы</p>
            <h2 id="training-mode-title">Что будем искать на клавиатуре</h2>
          </div>
        </div>

        <div className="training-mode-grid">
          <button
            className="training-mode-card is-available"
            onClick={onOpenIntervalTraining}
            type="button"
          >
            <span className="training-mode-status">Доступно</span>
            <span aria-hidden="true" className="training-mode-symbol">
              m3
            </span>
            <span className="training-mode-title">Интервалы</span>
            <span className="training-mode-description">
              Стройте восходящие гармонические интервалы от заданной ноты.
            </span>
            <span className="training-mode-action">Настроить тренировку →</span>
          </button>

          <button
            className="training-mode-card is-coming"
            disabled
            type="button"
          >
            <span className="training-mode-status">Скоро</span>
            <span aria-hidden="true" className="training-mode-symbol">
              До
            </span>
            <span className="training-mode-title">Одиночные ноты</span>
            <span className="training-mode-description">
              Находите на клавиатуре одну ноту, показанную в задании.
            </span>
            <span className="training-mode-action">Следующий спринт</span>
          </button>
        </div>
      </section>

      <footer className="app-footer">
        MIDI-доступ запрашивается только после выбора и настройки тренировки.
      </footer>
    </main>
  );
}
