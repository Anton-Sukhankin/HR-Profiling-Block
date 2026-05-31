# Структура проекта

```text
index.html
style.css
AGENTS.md
.agent/
  PLANS.md
  plans/
src/
  app.js
  data/
    profiles.seed.js
    requests.seed.js
  domain/
    profile-model.js
  store/
    profile-store.js
  features/
    profile-ai-assistant/
      data/
        profile-ai-assistant.analysis-card.mock.js
        profile-ai-assistant.analysis-card.examples.json
        profile-ai-assistant.mock.js
      docs/
        README.md
      events/
        profile-ai-assistant.events.js
      model/
        profile-ai-assistant.analysis-card.model.js
      render/
        profile-ai-assistant.render.js
      state/
        profile-ai-assistant.state.js
      styles/
        profile-ai-assistant.css
    profile-create/
      profile-create.mapper.js
    profile-card/
      profile-card.actions.js
    profiles-table/
      profiles-table.render.js
docs/
  components/
    profile-ai-assistant/
      overview.md
      product-spec.md
      user-flows.md
      business-rules.md
      ui-interactions.md
      data-model.md
      analysis-card-model.md
      ai-logic.md
      integration.md
      doc-sync-map.md
  profile-entity-model.md
  project-structure.md
```

## Назначение блоков

`src/domain/profile-model.js` задаёт единую структуру профиля, вложенных целей, задач, функций и компетенций.

`src/store/profile-store.js` отвечает за доступ к списку профилей, обновление таблицы и сохранение изменений в `localStorage`.

`src/features/profile-create/profile-create.mapper.js` формирует payload создания или редактирования профиля.

`src/features/profile-ai-assistant/` содержит самостоятельный модуль AI-помощника создания профиля. Внутри модуль разделён по ролям: `data` хранит мок-данные и JSON-примеры, `model` описывает карточки анализа, `state` хранит состояние панели, `render` отвечает за отрисовку, `events` — за пользовательские действия и синхронизацию с рабочей областью, `styles` — за внешний вид, `docs` — за локальную документацию компонента.

`docs/components/profile-ai-assistant/product-spec.md` описывает продуктовую и UX-логику AI-помощника: генерацию, анализ, чат, состояния панели, карточки рекомендаций и правила синхронизации с рабочей областью.

`docs/components/profile-ai-assistant/` декомпозирует документацию AI-помощника по смысловым слоям: обзор, пользовательские сценарии, бизнес-правила, UI-взаимодействия, модель данных, AI-логика, интеграции и карта синхронизации документации с кодом.

`docs/components/profile-ai-assistant/analysis-card-model.md` фиксирует атрибутивный состав карточек анализа AI-помощника и связан с `docs/components/profile-ai-assistant/data-model.md`.

`AGENTS.md` содержит проектные инструкции для Codex и других агентов. `.agent/PLANS.md` задаёт стандарт ExecPlan для крупных задач, а `.agent/plans/` предназначена для конкретных планов реализации.

`src/features/profile-card/profile-card.actions.js` содержит действия карточки профиля, которые дальше можно расширять без роста `src/app.js`.

`src/features/profiles-table/profiles-table.render.js` отвечает за отрисовку основной таблицы профилей.

`src/app.js` пока остаётся главным файлом интерфейсной логики. Его следующий этап декомпозиции — переносить из него крупные независимые блоки в `features`.


