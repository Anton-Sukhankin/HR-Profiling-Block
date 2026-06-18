# Profile Survey User Flows

## Flow 1. Start Survey Drawer

```mermaid
flowchart TD
  A["Open profile creation drawer"] --> B["Survey alert between header and stage cards"]
  B --> C["Click Пройти"]
  C --> D["650px survey drawer opens"]
  D --> E["Main profile creation form stays visible"]
```

## Flow 2. Fill Values With Live Sync

```mermaid
flowchart TD
  A["Open survey accordion"] --> B["Select or add value"]
  B --> C["Survey state updates"]
  C --> D["Survey result is rebuilt"]
  D --> E["Main profile form updates immediately"]
```

## Flow 3. Function And Template Selection

```mermaid
flowchart TD
  A["Accordion: Основная функция должности"] --> B["User types in dropdown"]
  B --> C{"Matches exist?"}
  C -->|Yes| D["Show filtered function list"]
  C -->|No| E["Show only Новое значение"]
  D --> F["Select function and functional direction"]
  F --> G{"Function has typical roles?"}
  G -->|No| H["Scenario becomes nonTypical"]
  H --> I["Show manual question accordions"]
  G -->|Yes| J["Show available role templates"]
  J --> K{"User choice"}
  K -->|Concrete role| L["Scenario becomes typical"]
  L --> M["Manual questions are hidden; final summary stays visible"]
  K -->|Не относится / template rejected| H
  I --> N["Main form updates in real time"]
  M --> N
```

## Flow 4. Typical Scenario

```mermaid
flowchart TD
  A["Function with typical roles is selected"] --> B["Functional direction is selected"]
  B --> C["User selects concrete typical role"]
  C --> D["Scenario: typical"]
  D --> E["Manual questions are not required"]
  E --> F["Заполнить профиль becomes enabled"]
```

## Flow 5. Non-Typical Scenario

```mermaid
flowchart TD
  A["Function has no typical roles or user rejects template"] --> B["Scenario: nonTypical"]
  B --> C["Show manual question accordions"]
  C --> D["Fill leadership, result, goal, approach and time focus"]
  D --> E["Заполнить профиль becomes enabled"]
```

## Flow 6. Fill Profile From Survey

```mermaid
flowchart TD
  A["Required values for active scenario are filled"] --> B["Button Заполнить профиль becomes enabled"]
  B --> C["Click Заполнить профиль"]
  C --> D["Survey result is applied to the form"]
  D --> E["Survey drawer closes"]
  E --> F["Profile creation drawer remains open"]
  F --> G["User reviews or continues editing before final profile creation"]
```

## Flow 7. Close Survey Drawer Without Creating

```mermaid
flowchart TD
  A["Survey drawer is open"] --> B["Click Отмена or close icon"]
  B --> C["Survey drawer closes"]
  C --> D["Already synchronized values remain in form"]
```
