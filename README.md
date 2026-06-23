# Piano Interval Trainer

[![CI](https://github.com/nikbulgakov/piano-interval-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/nikbulgakov/piano-interval-trainer/actions/workflows/ci.yml)

Лёгкое браузерное приложение для тренировки быстрого построения интервалов на MIDI-клавиатуре.

## Статус

Локальный MVP завершён и принят. Дальнейшие изменения разрабатываются в отдельных ветках и проходят CI через pull request.

## MVP

- подключение MIDI-клавиатуры через Web MIDI API;
- выбор исходных нот и интервалов;
- последовательный режим и режим с ограничением времени на задание;
- ограничение продолжительности тренировки;
- текущая задача в формате `До (C) — малая терция (m3)`;
- экранная клавиатура на три октавы с подсветкой нажатий;
- короткая сводка после сессии.

Приложение работает целиком в браузере: без аккаунта, сервера, базы данных и отправки MIDI-данных наружу.

## Документация

- [AGENTS.md](AGENTS.md) — постоянные правила и контекст для coding-агентов.
- [CLAUDE.md](CLAUDE.md) — подключение общих правил в Claude Code без дублирования.
- [docs/PRODUCT.md](docs/PRODUCT.md) — продуктовая спецификация и критерии приёмки.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — техническая архитектура и границы модулей.
- [docs/DECISIONS.md](docs/DECISIONS.md) — журнал принятых и предварительных решений.
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
npm test
npm run typecheck
npm run lint
npm run build
```

## Требования к окружению

Для MIDI нужен браузер с Web MIDI API и безопасный контекст. Локальная разработка через `localhost` подходит; опубликованная версия должна открываться по HTTPS. Основная цель MVP — актуальные настольные Chrome и Edge. В неподдерживаемом браузере приложение должно показать понятное сообщение вместо падения.

## Разработка

Правила веток, коммитов, проверок и pull request описаны в [CONTRIBUTING.md](CONTRIBUTING.md). Каждый push в `main` и каждый pull request автоматически проходят полный набор проверок в GitHub Actions.

## Лицензия

Проект распространяется по лицензии [MIT](LICENSE).

## Источники проектного подхода

- [OpenAI Codex best practices](https://developers.openai.com/codex/learn/best-practices)
- [OpenAI: AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Anthropic: project memory and CLAUDE.md](https://code.claude.com/docs/en/memory)
- [MDN: Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
