# Публикация

## Production

- URL: [piano-interval-trainer.vercel.app](https://piano-interval-trainer.vercel.app);
- платформа: Vercel;
- проект: `piano-interval-trainer`;
- репозиторий: `nikbulgakov/piano-interval-trainer`;
- production-ветка: `main`.

## Vercel

Vercel является единственным публичным хостингом. Он автоматически создаёт production-деплой из `main` и preview для остальных веток и pull request.

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node.js version: 24.x
```

GitHub App Vercel имеет доступ к `piano-interval-trainer` через список явно выбранных репозиториев. Секреты приложению сейчас не нужны: вся логика выполняется локально в браузере.

## Выпуск изменений

1. Создать ветку `codex/<краткое-название>` от актуального `main`.
2. Реализовать изменение и выполнить `npm run lint`.
3. Открыть draft pull request.
4. Проверить lint в GitHub Actions и Vercel Preview.
5. Провести ручную приёмку Vercel Preview в настольном Chrome или Edge, включая реальную MIDI-клавиатуру, если изменение затрагивает MIDI или тренировку.
6. Перевести pull request в ready и выполнить merge после приёмки.
7. Убедиться, что production-деплой Vercel из `main` завершился успешно.

Merge в `main` — единственный штатный путь публикации production. Для отката следует создать revert-коммит через pull request, чтобы CI, история и deployment status оставались согласованными.

## Минимальная проверка деплоя

- production-адрес открывается по HTTPS;
- интерфейс загружается без пустого экрана;
- кнопка `Подключить MIDI` доступна;
- браузер запрашивает MIDI-доступ только после нажатия кнопки;
- старт тренировки остаётся недоступен до подключения устройства;
- в preview и production нет ошибок сборки.
