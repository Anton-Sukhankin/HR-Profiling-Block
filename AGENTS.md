# AGENTS.md

Project instructions for Codex and other coding agents working in this repository.

## Project Context

This repository contains a native HTML/CSS/JavaScript prototype for the HR Block profiling module. The main user-facing flow is profile creation: stage 1 "Общие положения и функционал", stage 2 "Ключевые компетенции", the profiles table, and the profile card.

The AI assistant is a key feature of the prototype. It lives in `src/features/profile-ai-assistant/` and supports three modes:

- `Генерация`: creates or pre-fills profile entities and attributes.
- `Анализ`: audits the current profile, groups issues by severity, synchronizes indicators with the workspace, and can apply or undo actions.
- `Чат`: answers methodology questions without changing form values.

Product documentation lives in `docs/`. Agent-facing planning standards live in `.agent/`.

## Operating Principles

Preserve existing functionality unless the user explicitly asks to change it. This is an interactive prototype, so visual behavior and UX details are part of the product, not decoration.

Prefer small, reversible changes. Do not rewrite large files or restructure working modules unless the task clearly requires it.

When changing UI behavior, keep these concerns aligned:

- data model and mock data;
- rendered markup;
- event handling;
- CSS states;
- user-visible behavior in the browser.

Use Russian UI text consistently. Avoid mojibake or corrupted Cyrillic text. If editing files that contain Russian text, preserve UTF-8 encoding.

## Project Structure

Use the current structure unless a task explicitly asks for restructuring:

- `index.html`: prototype entry point.
- `style.css`: shared/global prototype styles.
- `src/app.js`: main application wiring and cross-feature context.
- `src/domain/`: domain model and profile entity structure.
- `src/data/`: seed/mock data.
- `src/features/profile-create/`: profile creation flow.
- `src/features/profile-card/`: profile card behavior.
- `src/features/profiles-table/`: main profiles table.
- `src/features/profile-ai-assistant/`: AI assistant UI, state, events, analysis cards, mocks, and documentation.
- `docs/`: product and implementation documentation.
- `.agent/`: agent-facing planning standards and concrete execution plans.

## Documentation Structure Rules

Use adaptive documentation. Do not create the same documentation files for every component by default.

Every significant component may have `overview.md`, but additional files should appear only when the component needs them:

- `user-flows.md` when the component has meaningful user scenarios or branching flows.
- `business-rules.md` when it enforces domain rules, limits, required fields, statuses, or validation.
- `ui-interactions.md` when it has complex states, visual reactions, drawers, accordions, empty states, loaders, or cross-area navigation.
- `data-model.md` when it owns structured entities, statuses, nested data, mocks, or source-of-truth rules.
- `ai-logic.md` only when AI generates, analyzes, recommends, explains, or changes data.
- `states.md` when behavior is best described as a state machine.
- `integration.md` when the component exchanges data or behavior with other components.

Avoid empty placeholder documents. Create or split documentation only when it reduces ambiguity, prevents repeated discussion, or helps future implementation.

## AI Assistant Rules

Treat the AI assistant as a persistent side panel inside profile creation. It should not reset unexpectedly while the user stays inside the same profile-creation session.

Keep the three assistant modes behaviorally distinct:

- Generation may change profile data.
- Analysis may navigate, apply recommended actions, and allow undo.
- Chat is consultative and must not mutate profile data.

For Analysis cards:

- every card belongs to one severity group: critical, warning, recommendation, or success/done when explicitly modeled;
- each card may contain either a concrete action or a suggestion, not an overloaded mix unless the model explicitly splits it into separate cards;
- cards with completed actions should remain visible and expose an undo action when possible;
- group-level actions should apply all eligible card actions in the group with one click;
- recommendations for stage 2 must not navigate to or fill locked stage-2 content before the first-stage minimum context is available.

When adding or changing analysis card data, update the data model, examples, and documentation if the attribute structure changes.

When changing `src/features/profile-ai-assistant/`, use `docs/components/profile-ai-assistant/doc-sync-map.md` to decide which documentation must be checked or updated. Documentation updates are required when behavior, user flows, business rules, AI logic, data models, or integrations change. Documentation updates are usually not required for purely internal refactors or small visual fixes that do not alter documented behavior.

## UX and Visual Rules

Follow the existing visual system. Do not introduce unrelated design language.

For small visual adjustments, prefer targeted CSS changes over markup rewrites.

For frontend work, verify desktop and relevant responsive behavior when possible. If browser verification is unavailable, state that clearly in the final response.

## Working Safely

The project may not have Git available in the current environment. If Git is unavailable, do not claim that changes are staged, committed, or reviewed from a Git diff.

Never remove user work or revert broad files unless explicitly asked.

Before major edits, inspect the relevant current files. Previous conversation context is helpful but not authoritative.

After code changes, run the narrowest useful validation available, such as:

- `node --check src/features/profile-ai-assistant/events/profile-ai-assistant.events.js`
- `node --check src/features/profile-ai-assistant/render/profile-ai-assistant.render.js`
- `node --check src/app.js`

## ExecPlans

For substantial multi-step work, new features, architectural changes, or refactors expected to touch multiple areas, use an ExecPlan according to `.agent/PLANS.md`.

Use concrete plans in `.agent/plans/` unless the user asks to keep the plan only in chat.

Do not create an ExecPlan for trivial visual fixes, copy edits, or one-file changes unless the user asks for one.

When an ExecPlan is used, keep it current as work proceeds: update progress, decisions, discoveries, validation evidence, and outcomes.


