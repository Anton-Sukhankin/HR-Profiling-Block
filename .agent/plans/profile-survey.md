# Profile Survey Wizard ExecPlan

## Purpose / Big Picture

Implement a separate profile survey wizard for the profile creation drawer. The user sees a light banner on stage 1, can open an 8-step survey, answer guided questions, then explicitly apply the result to the existing profile creation form.

## Current Context

The profile creation drawer is in `index.html` and wired by `src/app.js`. Stage 1 contains base parameters, goals, tasks, and functions. Stage 2 contains key competencies. Existing dictionaries and dependencies for goal-to-task and task-to-function selection already live in `src/app.js`. AI assistant is separate in `src/features/profile-ai-assistant/` and must remain only `Анализ | Чат`.

## Scope and Non-Goals

Included: banner, isolated `profile-survey` module, 8-step wizard, combobox for main function, typical role cards, final application to current form, documentation. Excluded: adding the survey to AI assistant, replacing manual creation, backend persistence, real AI generation.

## Plan of Work

1. Create `src/features/profile-survey/` with data, state, render, events, and styles.
2. Add a survey host area and launch banner to the first stage of profile creation.
3. Wire survey scripts and stylesheet in `index.html`.
4. Expose a small application API from `src/app.js` so the survey can apply its result without duplicating all profile-create internals.
5. Add documentation under `docs/components/profile-survey/` and update project structure docs.
6. Validate JS syntax and inspect target wiring.

## Progress

- [x] (2026-06-16 Europe/Moscow) Inspected current profile creation entry points, script order, existing goal/task/function dictionaries, and AI assistant separation.
- [x] (2026-06-16 Europe/Moscow) Created survey module files for data, state, render, events, and styles.
- [x] (2026-06-16 Europe/Moscow) Wired launch banner, wizard host, script/style links, and profile creation integration API.
- [x] (2026-06-16 Europe/Moscow) Added apply API and documentation under docs/components/profile-survey.
- [x] (2026-06-16 Europe/Moscow) Ran node --check for changed and new JavaScript files.
- [x] (2026-06-16 Europe/Moscow) Reworked the survey wizard from a horizontal stepper into a left-side vertical stage layout aligned with profile creation stage cards.
- [x] (2026-06-16 Europe/Moscow) Unified survey selection fields with the task-name dropdown pattern used in profile creation.

## Decisions

- (2026-06-16) Survey opens as a separate drawer mode, not as a nested block inside profile creation. Rationale: profile creation and survey completion must read as two different user paths.

- (2026-06-16) Keep survey separate from AI assistant. Rationale: AI assistant generation was removed and current assistant modes are analysis and chat only.
- (2026-06-16) Use existing visual language, not the dark promo banner from the source PRD.
- (2026-06-16) Use a vertical left-side step rail inside the survey instead of a horizontal progress strip. Rationale: it matches the existing profile creation stage metaphor and makes the active survey step easier to scan.

## Surprises and Discoveries

- Goal-to-task and task-to-function dependencies already exist in `src/app.js`, so the survey can reuse the current profile creation behavior rather than create a parallel flow.

## Validation and Acceptance

Run `node --check` for new survey files and changed `src/app.js`. In the browser, verify banner visibility on stage 1, wizard navigation, combobox behavior, typical role shortcut, exit preserving progress, and final apply filling the normal profile form.

## Idempotence and Recovery

The survey result applies only after `Применить и закрыть`. If changes need rollback, remove the new `profile-survey` folder, its stylesheet/script links, the banner/host markup, and the small application API from `src/app.js`.

## Outcomes and Retrospective

Implemented a standalone profile survey wizard with a stage-1 launch banner, separate drawer-mode survey UI, local survey state, separate survey dictionaries, wizard rendering/events, final apply integration, and component documentation. Browser verification was attempted but the in-app browser blocked direct file URL navigation by policy, so final visual QA should be performed manually in the already opened prototype.


