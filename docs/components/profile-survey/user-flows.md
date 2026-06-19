# Profile Survey User Flows

## Flow 1. Start Survey Drawer

```mermaid
flowchart TD
  A["Open profile creation drawer"] --> B["Survey alert below base attributes"]
  B --> C["Click Пройти"]
  C --> D["650px survey drawer opens"]
  D --> E["Main profile creation form stays visible"]
```

## Flow 2. Fill Values With Scenario-Based Sync

```mermaid
flowchart TD
  A["Open survey accordion"] --> B["Select or add value"]
  B --> C["Survey state updates"]
  C --> D["Survey result is rebuilt"]
  D --> E{"Concrete typical role selected?"}
  E -->|Yes| F["Main profile form updates immediately"]
  E -->|No| G["Main profile form remains unchanged"]
```

## Flow 3. Function, Direction And Template Selection

```mermaid
flowchart TD
  A["Question 1: Основная функция должности"] --> B["Select or add main function"]
  B --> C["Question 2: Функциональное направление должности"]
  C --> D["Select or add functional direction"]
  D --> E{"Function has typical roles?"}
  E -->|No| F["Scenario becomes nonTypical"]
  F --> G["Show manual question accordions"]
  E -->|Yes| H["Question 3: Check typical-role catalog"]
  H --> I{"User choice"}
  I -->|Concrete role| J["Scenario becomes typical"]
  J --> K["Manual questions are hidden; final summary stays visible"]
  I -->|Не относится / template rejected| F
  G --> L["Main form remains empty or manually filled by user"]
  K --> M["Typical template synchronizes into main form"]
```

## Flow 4. Typical Scenario

```mermaid
flowchart TD
  A["Function with typical roles is selected"] --> B["Functional direction is selected"]
  B --> C["User selects concrete typical role"]
  C --> D["Scenario: typical"]
  D --> E["Manual questions are not required"]
  E --> F["Применить becomes enabled"]
  F --> G["Template draft is synchronized and locked in the form"]
```

## Flow 5. Non-Typical Scenario

```mermaid
flowchart TD
  A["Function has no typical roles or user rejects template"] --> B["Scenario: nonTypical"]
  B --> C["Show manual question accordions"]
  C --> D["Fill leadership, result, goal, approach and time focus"]
  D --> E["Применить becomes enabled"]
  E --> F["Profile creation form is not filled from survey answers"]
```

## Flow 6. Apply Survey

```mermaid
flowchart TD
  A["Required values for active scenario are filled"] --> B["Button Применить becomes enabled"]
  B --> C["Click Применить"]
  C --> D{"Scenario"}
  D -->|typical| E["Template draft remains in form"]
  D -->|nonTypical| F["No survey data is written to form"]
  E --> G["Survey drawer closes"]
  F --> G
  G --> H["Profile creation drawer remains open"]
```

## Flow 7. Close Survey Drawer Without Creating

```mermaid
flowchart TD
  A["Survey drawer is open"] --> B["Click Отмена or close icon"]
  B --> C["Survey drawer closes"]
  C --> D["Only typical synchronized values remain; nonTypical answers do not fill the form"]
```
