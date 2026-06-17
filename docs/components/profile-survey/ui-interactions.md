# Profile Survey UI Interactions

## Layout

The launch banner is displayed only inside stage `Общие положения и функционал`. It is positioned on the right side of the base parameters block with a 16px gap.

The wizard uses full drawer-mode replacement: stage cards, functional content, drawer footer, and the AI assistant entry point are hidden while the survey is active. The profile creation drawer becomes a survey drawer with its own title and description.

In survey mode the drawer header shows:

- title `Ускоренный сценарий`;
- description `Ответь на несколько вопросов, чтобы быстрее оформить профиль`.

Inside the drawer, survey navigation is not horizontal. It is rendered as a vertical stack of stage cards on the left. These cards reuse the same visual language as the stage cards in profile creation: icon block, title, description, active state, and completed state. On the right, all survey steps are rendered at once as a vertical sequence of blocks. Every block remains visible and interactive независимо from whether the previous survey step was completed; the current step is only highlighted as the active one for navigation. Clicking a stage card on the left switches the active stage and scrolls the right content area to the matching survey block. When the user scrolls the right content area manually, the active stage changes automatically after the current right-side block is hidden above the visible area by 20% or more of that block height. The final stage becomes active when the summary block reaches the middle of the visible right-side area or when the user reaches the bottom of the scroll area. The left stage column stays fixed while the right side scrolls.

When all required values inside a right-side survey block are filled, the matching left stage card shows a completed state: the original stage icon is replaced with a green check on a light-green background. This completion state is based on actual answers, not on whether the user has visited or scrolled past the step.

The AI assistant trigger is not shown in this mode because survey completion and AI assistance are separate user paths.

## Wizard Navigation

- `Далее` advances to the next step.
- `Назад` returns to the previous step.
- `Пропустить вопрос` advances without selecting a value on optional steps.
- The drawer back arrow closes the wizard without applying values and returns the user to the normal profile creation form.
- `Применить и закрыть` applies values to the normal profile creation form.

## Selection Fields

All survey selection fields use the same interaction pattern as task-name selection in profile creation:

- compact trigger field with chevron;
- dropdown panel opened below the field;
- searchable option list;
- selected value shown inside the trigger;
- active item marked inside the list.
- custom values show a delete icon on hover in the right side of the dropdown row.

For short answer sets with five options or fewer, the survey does not use a dropdown. Instead it shows card-style radio choices directly inside the step block. In that mode radio indicators are visible immediately, but none of them is active by default until the user clicks a card.

For the main function field:

- typing filters values;
- functions with templates show `Типовые должности` on the right;
- no matches show only `Новое значение`;
- adding a new value selects it immediately.
- hovering a newly added value shows a delete action.

For the functional direction field:

- typing filters values available for the selected main function;
- no matches show only `Новое значение`;
- adding a new value selects it immediately and stores it in the survey state.
- hovering a newly added value shows a delete action.

## Typical Role Cards

Role templates are displayed as card-style radio choices without a permanent border. Radio indicators are visible immediately when the block appears. The default state keeps `Не относится к типовым ролям` selected until the user explicitly chooses one of the template variants. Hover uses a light-blue background. After a choice, the selected card displays an active radio state.
