# Profile Survey Overview

`profile-survey` is a separate guided survey inside the profile creation drawer. It helps a manager fill the normal profile creation form by answering structured questions in a compact side drawer.

The survey is not part of the AI assistant. The AI assistant remains `Анализ | Чат`; the survey is an alternative profile creation aid inside profile creation.

## Entry Point

The entry point is a white survey alert inside the first profile creation stage `Общие положения и функционал`. It appears only after `Место в структуре` has a selected value and is placed below the base attributes block and above the `Задачи и функции` block.

The alert contains:

- illustration metaphor for a structured questionnaire;
- title `Пройди опрос — сократи ручной ввод и ускорь согласование!`;
- description `Пожалуйста, пройди опросник для корректного формирования профиля должности. При заполнении опросника профиль будет рассмотрен по автоматическому экспресс-маршруту согласования в рамках 3 рабочих дней.`;
- primary action `Пройти`.

The profile creation drawer header no longer contains a separate `Ассистент профилирования` button. The survey alert action owns the survey launch behavior.

## Main Behavior

When launched, the survey opens as a right-side drawer inside the profile creation interface. The profile creation form remains visible and interactive; no dimming overlay is shown.

The survey drawer is 650px wide and contains:

- header title `Опрос`;
- description `Ответь на несколько вопросов, чтобы быстрее оформить профиль`;
- a vertical list of accordion stages;
- footer actions `Отмена` and `Применить`.

Each stage is an accordion. The closed header keeps the same visual language as the previous survey stage cards: icon block, title, description, stage colors, and completed check state. The expanded body contains the existing survey controls for that stage.

The survey question sequence and answer sources are:

1. `Основная функция должности` — single choice from the Code 4 function dropdown. The prototype data structure supports the 39-function classifier; the current demo dictionary includes the functions needed for the branch demonstration and can be extended without changing the UI.
2. `Функциональное направление должности` — dependent single-choice Code 5 dropdown built from the function selected in question 1.
3. `Проверь, есть ли подходящие профили из каталога типовых ролей для выбранного функционального направления` — hidden by default and shown only for `Девелопмент`, `Sales (продажи)`, `Проектный институт`, `УК`, or `Клиентский сервис`. The first answer is always `Не относится к типовым ролям`, followed by available typical-role templates.
4. `Должность является руководящей (в подчинении закреплено структурное подразделение)?`.
5. `Выбери ожидаемый результат деятельности по должности?`.
6. `Опиши цель сущестования должности в Компании одним утверждением?`.
7. `Как можно охарактеризовать ожидаемый подход к работе для данной должности?`.
8. `Какой функционал занимает большую часть рабочего времени по должности и определяет ценность его должности для Компании?`.

The final summary block is not counted as a question.

Questions 4-8 are shown only when the user does not select a concrete profile from the typical-role catalog. Every question uses single selection only.

Survey answers are applied to the normal profile creation form in real time only for a concrete typical-role template. The survey branches into two scenarios:

- `typical`: available when the selected function has typical role templates and the user chooses a concrete template. This scenario synchronizes the template draft into the profile creation form and locks the generated values.
- `nonTypical`: used when the selected function has no typical templates or the user explicitly rejects the typical path. This scenario does not synchronize answers into the profile creation form; after closing the survey, the user fills the profile manually.

The footer action `Применить` stays disabled until the required values for the active scenario are filled. In the `typical` scenario, clicking it keeps the synchronized template draft in the form and closes only the survey drawer. In the `nonTypical` scenario, clicking it closes only the survey drawer and leaves the profile creation form empty or unchanged except for data the user entered manually outside the survey.
