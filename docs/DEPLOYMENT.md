# Публикация

## Production

- URL: [piano-interval-trainer.pages.dev](https://piano-interval-trainer.pages.dev)
- платформа: Cloudflare Pages;
- проект: `piano-interval-trainer`;
- репозиторий: `nikbulgakov/piano-interval-trainer`;
- production-ветка: `main`.

## Параметры сборки

```text
Framework preset: React (Vite)
Build command: npm run build
Build output directory: dist
NODE_VERSION: 24
```

Cloudflare GitHub App ограничен этим репозиторием. Секреты приложению сейчас не нужны: вся логика выполняется локально в браузере.

## Выпуск изменений

1. Создать ветку `codex/<краткое-название>` от актуального `main`.
2. Реализовать изменение и выполнить локальные проверки.
3. Открыть draft pull request.
4. Проверить GitHub Actions и Cloudflare Pages Preview.
5. Провести ручную приёмку preview в настольном Chrome или Edge, включая реальную MIDI-клавиатуру, если изменение затрагивает MIDI или тренировку.
6. Перевести pull request в ready и выполнить merge после приёмки.
7. Убедиться, что production-деплой из `main` завершился успешно.

Merge в `main` — единственный штатный путь публикации production. Для отката следует создать revert-коммит через pull request, чтобы CI, история и deployment status оставались согласованными.

## Минимальная проверка деплоя

- страница открывается по HTTPS;
- интерфейс загружается без пустого экрана;
- кнопка `Подключить MIDI` доступна;
- браузер запрашивает MIDI-доступ только после нажатия кнопки;
- старт тренировки остаётся недоступен до подключения устройства;
- в preview и production нет ошибок сборки.
