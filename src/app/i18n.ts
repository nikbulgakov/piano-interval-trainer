import type { InterfaceLanguage } from "./appPreferences";

export const TEXT = {
  ru: {
    "common.backToHome": "Назад на главный экран",
    "common.backToIntervalSetup": "Назад к настройке интервалов",
    "common.backToNoteSetup": "Назад к настройке нот",
    "common.available": "Доступно",
    "common.appSettings": "Настройки приложения",
    "home.title": "Выберите тренировку",
    "home.copy":
      "Сначала выберите навык, затем подключите MIDI-клавиатуру и настройте упражнение.",
    "home.modes.eyebrow": "Режимы",
    "home.modes.title": "Что будем искать на клавиатуре",
    "home.intervals.title": "Интервалы",
    "home.intervals.description":
      "Стройте восходящие гармонические интервалы от заданной ноты.",
    "home.notes.title": "Одиночные ноты",
    "home.notes.description":
      "Находите на клавиатуре одну ноту, показанную в задании.",
    "home.configureTraining": "Настроить тренировку →",
    "home.footer":
      "MIDI-доступ запрашивается только после выбора и настройки тренировки.",
    "settings.eyebrow": "Настройки приложения",
    "settings.title": "Обозначения и звук",
    "settings.copy":
      "Выбранные форматы используются в настройке, практике, MIDI-мониторе и на экранной клавиатуре. Звук реагирует на физическую MIDI-клавиатуру.",
    "settings.general.eyebrow": "Общие настройки",
    "settings.general.title": "Как показывать задания",
    "settings.language.title": "Язык интерфейса",
    "settings.language.description":
      "Меняет язык экранов приложения. Обозначения нот и интервалов настраиваются отдельно.",
    "settings.language.ru": "Русский",
    "settings.language.en": "English",
    "settings.language.ruDescription": "Русский интерфейс",
    "settings.language.enDescription": "English interface",
    "settings.noteNotation.legend": "Обозначения нот",
    "settings.noteNotation.description":
      "Настройка применяется одновременно ко всем белым и чёрным клавишам.",
    "settings.noteNotation.russian": "Русские",
    "settings.noteNotation.latin": "Латинские",
    "settings.intervalNotation.legend": "Обозначения интервалов",
    "settings.intervalNotation.names": "Полные названия",
    "settings.intervalNotation.symbols": "Краткие обозначения",
    "settings.preview.label": "Пример задания",
    "settings.sound.eyebrow": "Звук",
    "settings.sound.title": "Как звучит MIDI-клавиатура",
    "settings.sound.enable": "Включить звук клавиш",
    "settings.sound.description":
      "Звук запускается от физической MIDI-клавиатуры и не влияет на проверку ответов.",
    "settings.sound.presetLegend": "Тембр",
    "settings.sound.piano": "Пианино",
    "settings.sound.pianoDescription": "Реалистичный sample-based звук",
    "settings.sound.synth": "Синт",
    "settings.sound.synthDescription": "Более яркий удерживаемый звук",
    "settings.sound.electricPiano": "Электропиано",
    "settings.sound.electricPianoDescription": "Мягкий округлый тембр",
    "settings.sound.volume": "Громкость",
  },
  en: {
    "common.backToHome": "Back to home",
    "common.backToIntervalSetup": "Back to interval setup",
    "common.backToNoteSetup": "Back to note setup",
    "common.available": "Available",
    "common.appSettings": "App settings",
    "home.title": "Choose a training mode",
    "home.copy":
      "Choose a skill first, then connect your MIDI keyboard and configure the exercise.",
    "home.modes.eyebrow": "Modes",
    "home.modes.title": "What do you want to find on the keyboard?",
    "home.intervals.title": "Intervals",
    "home.intervals.description":
      "Build ascending harmonic intervals from the prompted note.",
    "home.notes.title": "Single notes",
    "home.notes.description":
      "Find one prompted note anywhere on the keyboard.",
    "home.configureTraining": "Configure training →",
    "home.footer":
      "MIDI access is requested only after you choose and configure a training mode.",
    "settings.eyebrow": "App settings",
    "settings.title": "Notation and sound",
    "settings.copy":
      "Selected formats are used in setup, practice, the MIDI monitor, and the on-screen keyboard. Sound reacts to the physical MIDI keyboard.",
    "settings.general.eyebrow": "General settings",
    "settings.general.title": "How to show prompts",
    "settings.language.title": "Interface language",
    "settings.language.description":
      "Changes the language of app screens. Note and interval notation are configured separately.",
    "settings.language.ru": "Русский",
    "settings.language.en": "English",
    "settings.language.ruDescription": "Russian interface",
    "settings.language.enDescription": "English interface",
    "settings.noteNotation.legend": "Note notation",
    "settings.noteNotation.description":
      "This setting applies to all white and black keys.",
    "settings.noteNotation.russian": "Russian",
    "settings.noteNotation.latin": "Latin",
    "settings.intervalNotation.legend": "Interval notation",
    "settings.intervalNotation.names": "Full names",
    "settings.intervalNotation.symbols": "Short symbols",
    "settings.preview.label": "Prompt example",
    "settings.sound.eyebrow": "Sound",
    "settings.sound.title": "MIDI keyboard sound",
    "settings.sound.enable": "Enable key sound",
    "settings.sound.description":
      "Sound starts from the physical MIDI keyboard and does not affect answer checking.",
    "settings.sound.presetLegend": "Timbre",
    "settings.sound.piano": "Piano",
    "settings.sound.pianoDescription": "Realistic sample-based sound",
    "settings.sound.synth": "Synth",
    "settings.sound.synthDescription": "Brighter sustained sound",
    "settings.sound.electricPiano": "Electric piano",
    "settings.sound.electricPianoDescription": "Soft rounded timbre",
    "settings.sound.volume": "Volume",
  },
} as const;

export type TextKey = keyof typeof TEXT.ru;

export function getText(language: InterfaceLanguage, key: TextKey): string {
  return TEXT[language][key];
}
