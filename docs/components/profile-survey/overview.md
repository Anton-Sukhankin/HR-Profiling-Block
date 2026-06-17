# Profile Survey Overview

`profile-survey` is a separate guided survey inside the profile creation drawer. It helps a manager create a draft profile by answering structured questions, then applies the result to the normal profile creation form only after explicit confirmation.

The survey is not part of the AI assistant. The AI assistant remains `Анализ | Чат`; the survey is an alternative profile creation path.

## Entry Point

The entry point is a light banner on stage `Общие положения и функционал`, next to the base parameters block. The banner contains:

- illustration/metaphor on a round background;
- title `Пройти опрос`;
- explanatory text about minimizing manual input;
- action button `Пройти`.

## Main Behavior

When launched, the survey replaces the profile creation working area with a 7-step wizard. The manual form is hidden but not destroyed. The first survey step is `Основная функция должности`; there is no separate introductory banner step inside the wizard. Survey navigation is displayed as a vertical stack of step cards on the left, while the active step content is rendered on the right. Fields with predefined choices use the same compact select pattern as task-name selection in profile creation. The user may exit the survey and return to the normal form with survey progress preserved in local in-memory state.

The final action `Применить и закрыть` transfers survey output into the existing profile creation form.
