# Публикация

## Production

- URL: [piano-interval-trainer.vercel.app](https://piano-interval-trainer.vercel.app);
- платформа: Vercel;
- проект: `piano-interval-trainer`;
- репозиторий: `nikbulgakov/piano-interval-trainer`;
- production-ветка: `main`.

## Vercel

Vercel является единственным публичным хостингом. Он автоматически создаёт production-деплой только из `main`.

Автоматические Vercel-деплои feature-веток отключены через `git.deploymentEnabled` в `vercel.json`, чтобы не создавать отдельные Vercel-ветки и preview-деплои.

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node.js version: 24.x
```

GitHub App Vercel имеет доступ к `piano-interval-trainer` через список явно выбранных репозиториев. Секреты приложению сейчас не нужны: вся логика выполняется локально в браузере.

## Выпуск изменений

1. Обновить актуальный `main`.
2. Реализовать изменение и выполнить `npm run lint`.
3. Провести ручную приёмку локально в настольном Chrome или Edge, включая реальную MIDI-клавиатуру, если изменение затрагивает MIDI или тренировку.
4. Создать небольшой осмысленный коммит в `main`.
5. Выполнить push в `main` после приёмки.
6. Убедиться, что production-деплой Vercel из `main` завершился успешно.

Push в `main` — единственный штатный путь публикации production. Для отката следует создать revert-коммит, чтобы история и deployment status оставались согласованными.

## Минимальная проверка деплоя

- production-адрес открывается по HTTPS;
- интерфейс загружается без пустого экрана;
- кнопка `Подключить MIDI` доступна;
- браузер запрашивает MIDI-доступ только после нажатия кнопки;
- старт тренировки остаётся недоступен до подключения устройства;
- в production нет ошибок сборки.
