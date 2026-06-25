# Piano Interval Trainer

[![CI](https://github.com/nikbulgakov/piano-interval-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/nikbulgakov/piano-interval-trainer/actions/workflows/ci.yml)

[Открыть приложение](https://piano-interval-trainer.vercel.app)

Лёгкое браузерное приложение для тренировки быстрого построения интервалов на MIDI-клавиатуре.

## Статус

MVP опубликован в Vercel. Дальнейшие изменения разрабатываются в отдельных ветках и проходят CI через pull request; Vercel деплоит только `main`.

## MVP

- подключение MIDI-клавиатуры через Web MIDI API;
- главный экран выбора типа тренировки;
- поиск одиночных нот в любой октаве в последовательном режиме и режиме на время;
- выбор исходных нот и интервалов;
- последовательный режим и режим с ограничением времени на задание;
- ограничение продолжительности тренировки;
- глобальный выбор русских или латинских названий нот и полных или кратких обозначений интервалов;
- sample-based звук пианино и простые синтезированные тембры с выбором громкости;
- текущая задача, например `До — малая терция` или `C — m3`;
- экранная клавиатура на три октавы с подсветкой нажатий;
- короткая сводка после сессии.

Приложение работает целиком в браузере: без аккаунта, сервера, базы данных и отправки MIDI-данных наружу.

## Документация

- [AGENTS.md](AGENTS.md) — постоянные правила и контекст для coding-агентов.
- [CLAUDE.md](CLAUDE.md) — подключение общих правил в Claude Code без дублирования.
- [docs/PRODUCT.md](docs/PRODUCT.md) — продуктовая спецификация и критерии приёмки.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — техническая архитектура и границы модулей.
- [docs/DECISIONS.md](docs/DECISIONS.md) — журнал принятых и предварительных решений.
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — production-деплой и порядок публикации.
- [docs/ATTRIBUTIONS.md](docs/ATTRIBUTIONS.md) — атрибуции сторонних аудиоматериалов.
- [PLANS.md](PLANS.md) — спринты и ручные проверки после каждого этапа.

## Стек

- React + TypeScript;
- Vite;
- Web MIDI API;
- обычный CSS без UI-фреймворка;
- Vitest для автоматических тестов.

## Локальный запуск

```powershell
npm install
npm run dev
```

Откройте адрес, который напечатает Vite, в актуальном Chrome или Edge.

Требуется Node.js 24 или новее.

Проверки:

```powershell
npm run lint
```

## Требования к окружению

Для MIDI нужен браузер с Web MIDI API и безопасный контекст. Локальная разработка через `localhost` подходит; опубликованная версия должна открываться по HTTPS. Основная цель MVP — актуальные настольные Chrome и Edge. В неподдерживаемом браузере приложение должно показать понятное сообщение вместо падения.

## Production

- URL: [piano-interval-trainer.vercel.app](https://piano-interval-trainer.vercel.app);
- хостинг: Vercel;
- production-ветка: `main`;
- промежуточные ветки не создают Vercel Preview.

Параметры сборки и порядок выпуска описаны в [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Разработка

Правила веток, коммитов, проверок и pull request описаны в [CONTRIBUTING.md](CONTRIBUTING.md). Каждый pull request проходит lint в GitHub Actions; merge в `main` запускает production-деплой.

## Лицензия

Проект распространяется по лицензии [MIT](LICENSE).

## Источники проектного подхода

- [OpenAI Codex best practices](https://developers.openai.com/codex/learn/best-practices)
- [OpenAI: AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Anthropic: project memory and CLAUDE.md](https://code.claude.com/docs/en/memory)
- [MDN: Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
