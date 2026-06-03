# AI-помощник: интеграции

Документ описывает связи AI-помощника с другими частями прототипа.

## Диаграмма интеграций

Диаграмма показывает, с какими частями прототипа связан AI-помощник и какие документы помогают поддерживать эту связь.

```mermaid
flowchart LR
  A["AI Assistant\nsrc/features/profile-ai-assistant"] --> R["Render\nrender/"]
  A --> E["Events\nevents/"]
  A --> S["State\nstate/"]
  A --> M["Analysis Card Model\nmodel/"]
  A --> D["Mock/Data\ndata/"]
  A --> CSS["Styles\nstyles/"]

  E --> PC["Profile Create Drawer\nsrc/features/profile-create + index.html"]
  E --> CTX["profileCreateStageContext\ngetFirstStageStatus / canNavigateToStage / navigateToStage\ngetCompetenciesState / refreshFunctionalStage\napplyCompetencyRecommendationAction"]
  E --> APP["App Context\nsrc/app.js"]
  CTX --> APP
  APP --> ST1["Stage 1\nОбщие положения и функционал"]
  APP --> ST2["Stage 2\nКлючевые компетенции"]
  APP --> PM["Profile Model\nsrc/domain/profile-model.js"]
  APP --> PS["Profile Store\nsrc/store/profile-store.js"]

  M --> AC["Analysis Cards"]
  AC --> WS["Workspace targets\ntargetKey / border / navigation / apply / undo"]
  WS --> ST1
  WS --> ST2

  DOC["Component docs\ndocs/components/profile-ai-assistant"] --> MAP["doc-sync-map.md"]
  MAP --> A
  MAP --> ROOTDOC["docs/components/profile-ai-assistant/product-spec.md"]
  MAP --> CARDMODEL["docs/components/profile-ai-assistant/analysis-card-model.md"]
```

## Связь с интерфейсом создания профиля

AI-помощник работает внутри drawer создания профиля и синхронизируется с двумя этапами:

- `Общие положения и функционал`;
- `Ключевые компетенции`.

Он должен знать, какой этап активен, и уметь переключить рабочую область при клике по карточке анализа, если целевой элемент находится на другом доступном этапе.

## Минимальный контекст первого этапа

AI-помощник получает статус первого этапа через контекст создания профиля. Минимальный контекст нужен для:

- разблокировки второго этапа;
- подбора компетенций;
- отображения рекомендаций второго этапа;
- корректной навигации из карточек анализа.

Если минимального контекста нет, AI не должен переходить к закрытому второму этапу через карточки анализа.

## Связь с рабочей областью анализа

Каждая карточка анализа может иметь `targetKey`. Этот ключ связывает карточку с DOM-элементом рабочей области.

На основе этой связи работают:

- border-индикация поля;
- скролл к элементу;
- подсветка элемента;
- переход между этапами перед навигацией;
- применение значения;
- откат действия.

## Связь с действиями рабочей области

Действия анализа выполняются через API контекста приложения, а не через изолированную логику панели.

Ключевые runtime-контракты сейчас находятся в `window.HRProfileApp`:

- `profileCreateStageContext.getFirstStageStatus`;
- `profileCreateStageContext.canNavigateToStage`;
- `profileCreateStageContext.navigateToStage`;
- `profileCreateStageContext.getCompetenciesState`;
- `profileCreateStageContext.refreshFunctionalStage`;
- `profileCreateStageContext.applyCompetencyRecommendationAction`.

AI-помощник инициирует действие, но фактическое изменение данных должно проходить через согласованные функции рабочей области.

## Связь с моделью профиля

AI-помощник должен учитывать модель профиля, но не заменять ее.

Глобальная модель профиля описывает сущности и вложенность:

```text
Профиль → Цели → Задачи → Функции
Профиль → Ключевые компетенции и требования
```

AI-помощник использует эту модель для анализа и действий карточек, но не должен создавать параллельную несовместимую структуру данных.

## Связь с документацией

Основные документы:

```text
docs/components/profile-ai-assistant/product-spec.md
docs/components/profile-ai-assistant/analysis-card-model.md
docs/profile-entity-model.md
docs/components/profile-ai-assistant/
```

Если меняется атрибутивный состав карточки анализа, нужно обновить:

- `docs/components/profile-ai-assistant/data-model.md`;
- `docs/components/profile-ai-assistant/analysis-card-model.md`;
- `src/features/profile-ai-assistant/model/profile-ai-assistant.analysis-card.model.js`;
- JSON/JS-примеры в `src/features/profile-ai-assistant/data/`, если они затронуты.

Если меняется поведение вкладок, нужно обновить соответствующий слой компонентной документации: `user-flows.md`, `ui-interactions.md`, `ai-logic.md` или `business-rules.md`.

## Связь с будущими компонентами

AI-помощник сейчас наиболее подробно документированный компонент. Для других компонентов не нужно автоматически копировать такой же набор файлов.

Новые документы для других компонентов создаются по правилу адаптивной документации из `AGENTS.md`.

