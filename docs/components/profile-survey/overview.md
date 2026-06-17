# Profile Survey Overview

`profile-survey` is a separate guided survey inside the profile creation drawer. It helps a manager fill the normal profile creation form by answering structured questions in a compact side drawer.

The survey is not part of the AI assistant. The AI assistant remains `Анализ | Чат`; the survey is an alternative profile creation aid inside profile creation.

## Entry Point

The entry point is the `Ассистент профилирования` button in the profile creation drawer header, placed to the left of `ИИ-Помощник`. The button uses the same visual style as the AI assistant trigger and has its own profiling metaphor icon.

The former `Пройти опрос` banner is not displayed in the profile creation workspace.

## Main Behavior

When launched, the survey opens as a right-side drawer inside the profile creation interface. The profile creation form remains visible and interactive; no dimming overlay is shown.

The survey drawer is 650px wide and contains:

- header title `Ассистент профилирования`;
- description `Ответь на несколько вопросов, чтобы быстрее оформить профиль`;
- a vertical list of accordion stages;
- footer actions `Отмена` and `Создать профиль`.

Each stage is an accordion. The closed header keeps the same visual language as the previous survey stage cards: icon block, title, description, stage colors, and completed check state. The expanded body contains the existing survey controls for that stage.

Survey answers are applied to the normal profile creation form in real time. The survey branches into two scenarios:

- `typical`: available when the selected function has typical role templates and the user chooses a concrete template.
- `nonTypical`: used when the selected function has no typical templates or the user explicitly rejects the typical path.

The footer action `Создать профиль` stays disabled until the required values for the active scenario are filled. After the user clicks it, the survey result is applied to the current form, the profile is created in the profiles table, the profile creation drawer closes, and a success notification appears in the upper-right area of the main interface.
