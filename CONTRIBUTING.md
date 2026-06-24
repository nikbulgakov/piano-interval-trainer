# Разработка Piano Interval Trainer

## Рабочий процесс

1. Обновить `main` и создать ветку `codex/<короткое-название>`.
2. Реализовать одну связанную задачу без несогласованного расширения MVP.
3. Обновить тесты и документацию, если изменилось поведение.
4. Выполнить `npm run lint`.
5. Создать небольшой осмысленный коммит и открыть draft pull request.
6. Проверить GitHub Actions и Vercel Preview.
7. Перевести pull request в ready только после успешных проверок и ручной приёмки preview.

## Команды проверки

```powershell
npm ci
npm run lint
```

## Имена и коммиты

- Ветки: `codex/midi-reconnect`, `codex/session-history`.
- Коммиты: `feat: add session history`, `fix: clear held notes after reconnect`, `docs: update practice checklist`.
- Один pull request должен решать одну понятную задачу.

## Definition of Done

- поведение соответствует `docs/PRODUCT.md`;
- lint в CI проходит;
- Vercel Preview собран и открывается по HTTPS;
- MIDI-сценарии проверены вручную, если изменение касается ввода;
- pull request объясняет, что изменено, зачем и как проверено;
- в diff нет секретов, артефактов сборки и несвязанных файлов.
