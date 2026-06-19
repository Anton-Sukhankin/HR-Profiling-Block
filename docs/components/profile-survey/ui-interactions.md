# Profile Survey UI Interactions

## Layout

The survey is launched from a white alert placed inside the first profile creation stage below the base attributes block and above `Задачи и функции`. The alert is hidden until the user selects `Место в структуре`. It uses the questionnaire illustration, title `Пройди опрос — сократи ручной ввод и ускорь согласование!`, the express-approval description, and the primary button `Пройти`.

Clicking `Пройти` opens a 650px right-side survey drawer inside the profile creation drawer. The normal profile creation form remains visible and interactive. The survey drawer does not use an overlay and does not switch the whole profile creation drawer into a separate survey mode.

The survey drawer header shows:

- title `Опрос`;
- description `Ответь на несколько вопросов, чтобы быстрее оформить профиль`;
- close action.

## Accordion Stages

The survey content is a vertical list of accordions. All accordions are closed by default when the drawer opens.

The visible question order is:

1. `Основная функция должности`.
2. `Функциональное направление должности`.
3. `Проверь, есть ли подходящие профили из каталога типовых ролей для выбранного функционального направления` when the selected function supports typical roles.
4. `Должность является руководящей (в подчинении закреплено структурное подразделение)?`.
5. `Выбери ожидаемый результат деятельности по должности?`.
6. `Опиши цель сущестования должности в Компании одним утверждением?`.
7. `Как можно охарактеризовать ожидаемый подход к работе для данной должности?`.
8. `Какой функционал занимает большую часть рабочего времени по должности и определяет ценность его должности для Компании?`.

The final summary block stays after the questions and is not an accordion question.

Each accordion header is visually based on the previous survey stage card pattern:

- icon block with the same stage metaphor and color;
- full stage title from the former right-side survey block;
- stage description;
- completed state with green check on a light-green background when the required values for the stage are filled.

When an accordion is open, its body appears below a grey divider and contains the same controls that previously lived in the corresponding right-side survey block.

The final block `Проверьте сводку перед применением` is not an accordion. It stays permanently expanded, has no collapse or expand affordance, has no hover effect, and uses the same visual structure as an opened accordion so the summary remains visible before profile creation.

The summary row `Типовой шаблон` is shown only for the `typical` scenario with a concrete selected template. If the user chooses `Не относится к типовым ролям`, this row is hidden instead of showing an empty value.

Selecting values inside lower accordions must preserve the current scroll position of the survey drawer, so the user does not lose visual context after the drawer content rerenders.

## Drawer Actions

- `Отмена` closes the survey drawer. Only values synchronized by a concrete typical-role template remain in the main form.
- The drawer close icon also closes the survey drawer without rollback.
- `Применить` is disabled by default and becomes active only when all required values for the current scenario are filled.
- In the `typical` scenario, the button requires main function, functional direction, and a concrete typical role.
- In the `nonTypical` scenario, the button requires main function, functional direction, and all manual answers.
- Clicking `Применить` closes only the survey drawer. For `typical`, the synchronized template draft remains visible in the form. For `nonTypical`, the profile creation form remains empty or unchanged and the user fills it manually.

## Selection Fields

All survey selection fields use the same interaction pattern as task-name selection in profile creation:

- compact trigger field with chevron;
- dropdown panel opened below the field;
- searchable option list;
- selected value shown inside the trigger;
- active item marked inside the list;
- custom values show a delete icon on hover in the right side of the dropdown row.

For short answer sets with five options or fewer, the survey uses card-style radio choices directly inside the accordion body. Longer answer sets use the same searchable dropdown component. In both cases the user can select only one answer.

For the main function field:

- typing filters values;
- functions with templates show `Типовые должности` on the right;
- no matches show only `Новое значение`;
- adding a new value selects it immediately;
- hovering a newly added value shows a delete action.

For the functional direction field:

- typing filters values available for the selected main function;
- no matches show only `Новое значение`;
- adding a new value selects it immediately and stores it in the survey state;
- hovering a newly added value shows a delete action.

## Typical Role Cards

Role templates are displayed as card-style radio choices without a permanent border. Radio indicators are visible immediately when the block appears.

The block is shown as a separate third question after `Функциональное направление должности`, but only for `Девелопмент`, `Sales (продажи)`, `Проектный институт`, `УК`, or `Клиентский сервис`.

The first card in this block is `Не относится к типовым ролям`. Concrete typical-role templates are listed after it.

The default technical value `selectedTypicalRole: "none"` is not shown as an active refusal. `Не относится к типовым ролям` becomes selected only after the user explicitly clicks it.

Choosing a concrete role switches the drawer to the `typical` scenario: manual question accordions are hidden, the final summary remains visible, and `Типовой профиль не подходит` is available in the summary.

Choosing `Не относится к типовым ролям` or clicking `Типовой профиль не подходит` switches the drawer to the `nonTypical` scenario: the typical role is cleared, manual question accordions appear, and the user continues through the manual path. If the functional direction was not selected before this choice, the first available direction for the selected main function is selected automatically.

The user can choose a concrete role or `Не относится к типовым ролям` before selecting the functional direction. The choice must be visually reflected immediately, while `Применить` remains disabled until the direction and all scenario-specific required values are filled.

## Template-Based Read-Only State

When the user selects a concrete typical role, the values synchronized into the profile creation form become template-managed. Template-managed fields in stage 1 and stage 2 are shown as unavailable for manual editing: the controls keep their values visible, use a muted locked visual state, and show a `not-allowed` cursor on hover.

In stage 2, template-managed competency accordions remain expandable and collapsible. Internal action controls such as delete, reset, and remove are hidden, and hover effects inside accordion bodies are suppressed so the content reads as view-only.

This read-only state must not apply when the user selects `Не относится к типовым ролям` or continues through the non-typical manual path.

In the non-typical path, survey selections do not fill either profile creation stage. The controls in the survey may be completed for business guidance, but the visible profile creation fields remain available for manual input by the user.
