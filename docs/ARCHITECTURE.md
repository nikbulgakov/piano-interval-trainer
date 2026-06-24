# Архитектура

## 1. Общий подход

Приложение — статическое browser-only SPA. Backend не нужен: настройки, таймер, генерация заданий, проверка ответов и MIDI-ввод работают локально.

Планируемый стек:

- React для небольшого набора экранов и предсказуемого UI-состояния;
- TypeScript для явных моделей MIDI и тренировки;
- Vite для dev server и production build;
- Web MIDI API без обёрточной библиотеки;
- обычный CSS;
- Vitest для чистой доменной логики.

Не планируются router, глобальный state manager, UI kit, backend SDK или музыкальная библиотека.

## 2. Границы системы

```text
MIDI-клавиатура
      │ MIDI messages
      ▼
MIDI adapter ──► active notes ──► training engine
                                      │
settings ──► task generator ──────────┤
                                      ▼
                             React presentation
                                      │
                         prompt / feedback / keyboard
```

Web MIDI знает только инфраструктурный слой. Генератор и проверка ответа принимают обычные числа и структуры данных, поэтому тестируются без браузера и устройства.

## 3. Целевая структура исходников

```text
src/
├── app/
│   ├── App.tsx
│   └── appPreferences.ts
├── components/
│   ├── HomeScreen.tsx
│   ├── MidiConnectionCard.tsx
│   ├── TrainingSetup.tsx
│   ├── StartPanel.tsx
│   ├── SetupScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── PracticeScreen.tsx
│   ├── ResultsScreen.tsx
│   └── PianoKeyboard.tsx
├── domain/
│   ├── music.ts
│   ├── tasks.ts
│   ├── trainingConfig.ts
│   ├── sequentialSession.ts
│   ├── timedSession.ts
│   ├── sessionSummary.ts
│   └── time.ts
├── midi/
│   ├── midiAdapter.ts
│   └── useMidiInput.ts
├── styles/
│   └── app.css
├── main.tsx
└── vite-env.d.ts
```

Структура может немного меняться при реализации, но разделение `domain`, `midi` и UI обязательно.

Навигация остаётся небольшой машиной состояний внутри `App`:

```text
home ─► interval-setup ─► practice ─► results
  │              │                         │
  └─ settings ◄──┘                         └─► interval-setup
```

Экран настроек хранит точку возврата: `home` или `interval-setup`. Router не нужен, потому что URL-маршруты и прямые ссылки на внутренние экраны не являются требованием. MIDI adapter и конфигурация тренировки принадлежат `App`, поэтому переход на главный экран не сбрасывает подключение и выбранные параметры.

## 4. Основные модели

Ожидаемые типы, без требования к дословной реализации:

```ts
type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

type Interval = {
  semitones: number;
  shortName: string;
  russianName: string;
};

type TrainingMode =
  | { kind: "sequential" }
  | { kind: "timed"; promptPeriodSeconds: number };

type SessionConfig = {
  pitchClasses: PitchClass[];
  intervals: Interval[];
  durationSeconds: number;
  mode: TrainingMode;
};

type Task = {
  rootPitchClass: PitchClass;
  intervalSemitones: number;
};
```

`activeNotes` хранится как `Set<number>` MIDI-номеров. Состояние интерфейса не должно быть источником музыкальной истины.

## 5. Музыкальная логика

Для задания строится список допустимых пар внутри диапазона 48–83:

1. перебрать все MIDI-ноты диапазона;
2. оставить ноты, для которых `note % 12` равен `rootPitchClass`;
3. вычислить `upper = note + intervalSemitones`;
4. оставить пары, где `upper <= 83`.

Ответ корректен, если множество удерживаемых нот точно равно одной допустимой паре.

Текстовое имя ноты и интервала используется только представлением. Проверка всегда основана на pitch class и числе полутонов.

## 6. Жизненный цикл сессии

Минимальная машина состояний последовательной сессии:

```text
interval-setup
  └─ start ─► practice / waiting-for-release
                    └─ all keys released ─► awaiting-answer
                          ├─ wrong chord ─► error + attempt locked
                          │                    └─ fewer than 2 keys ─► retry
                          ├─ correct ─► solved-waiting-for-release
                          │                 └─ all keys released ─► next task
                          └─ session deadline ─► results
```

На смене timed-задания новое задание отображается сразу, но проверка блокируется до полного отпускания клавиш. Это исключает ложное засчитывание нот прошлого задания.

Timed-сессия хранит абсолютный дедлайн текущего задания. Правильный ответ сразу вытягивает следующее задание и устанавливает для него новый дедлайн `answeredAt + period`. Нерешённое задание при наступлении дедлайна увеличивает счётчик пропусков. Если вкладка была в фоне, state machine последовательно обрабатывает все прошедшие дедлайны.

## 7. Таймеры

- При старте сохраняются `sessionEndsAt` и, для timed-режима, `nextPromptAt`; после правильного ответа `nextPromptAt` переносится на полный период от момента ответа.
- Оставшееся время вычисляется как `deadline - performance.now()`.
- Периодический UI-tick только вызывает пересчёт; он не является источником времени.
- При возврате вкладки из фона приложение догоняет пропущенные дедлайны и завершает сессию по реальному времени.

## 8. MIDI adapter

Обязанности:

- проверить наличие `navigator.requestMIDIAccess`;
- запросить разрешение только после действия пользователя;
- перечислить входы и выбрать активный;
- подписаться на `midimessage` и `statechange`;
- нормализовать Note On/Off;
- удалить подписки при смене устройства и размонтировании;
- игнорировать SysEx, output и Control Change.

UI получает нормализованные события вида `{ type: "noteon" | "noteoff", note: number, velocity: number }` и состояние подключения.

## 9. Обработка ошибок

- API отсутствует: показать рекомендацию открыть приложение в актуальном Chrome или Edge.
- Разрешение отклонено: показать повторную кнопку и краткую инструкцию проверить разрешения сайта.
- Нет входов: сохранить доступ и ждать `statechange`.
- Активное устройство отключено: остановить проверку ответов, показать статус и предложить доступный вход.
- При успешном обновлении списка или выборе входа очистить прежнюю ошибку; асинхронный результат открытия старого порта не должен менять текущее состояние.
- Если MIDI пропал во время практики, оставить таймер абсолютным и дать пользователю прямой возврат к экрану подключения.
- MIDI-сообщение повреждено или не относится к Note On/Off: безопасно проигнорировать.

## 10. Тестирование

Доменная логика покрыта существующими unit-тестами:

- таблица интервалов и pitch classes;
- построение допустимых пар на краях диапазона;
- проверка правильных, неправильных и лишних нот;
- перемешанный мешок без преждевременных повторов;
- переходы последовательного и timed-режимов;
- scoring и окончание по deadline;
- нормализация MIDI-сообщений.

Вручную с реальным устройством:

- разрешение и выбор входа;
- Note On, Note Off и velocity `0`;
- одновременная подсветка нескольких клавиш;
- hot-plug устройства;
- отсутствие ложного ответа от удержанных клавиш;
- поведение обоих режимов по чек-листам `PLANS.md`.

## 11. Сборка и публикация

Vite создаёт статический каталог `dist/`. Основной production размещён в Vercel по адресу `https://piano-interval-trainer.vercel.app`, резервный — в Cloudflare Pages по адресу `https://piano-interval-trainer.pages.dev`.

Оба хостинга собирают проект из GitHub:

- production-ветка — `main`;
- команда — `npm run build`;
- каталог результата — `dist`;
- версия Node.js — 24.x;
- ветки pull request получают отдельные preview-деплои только в Vercel;
- Cloudflare Pages публикует только production из `main`.

GitHub Actions запускает обязательный lint. Vercel Preview подтверждает сборку и даёт URL для ручной приёмки. После merge Vercel и Cloudflare Pages независимо публикуют production. Подробности и порядок выпуска находятся в `docs/DEPLOYMENT.md`.
