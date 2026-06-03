# Codex Execution Plans for HR Block Prototype

This document defines how to write and maintain an ExecPlan in this repository.

An ExecPlan is a living, self-contained implementation plan that a future agent or developer can follow to deliver observable, working behavior in the HR Block prototype. It is intended for substantial work: multi-step features, refactors, architecture changes, or tasks that touch several files and need careful verification.

This planning standard is adapted for this project from OpenAI's public guidance on Codex ExecPlans: https://cookbook.openai.com/articles/codex_exec_plans/

## When to Use an ExecPlan

Use an ExecPlan when the task is large enough that losing context would be risky. Examples in this project:

- redesigning the AI assistant behavior across the current modes `Анализ` and `Чат`;
- changing the profile entity model or data synchronization rules;
- restructuring folders or feature modules;
- changing how stage 1 and stage 2 interact;
- implementing a new multi-step UX flow;
- changing analysis card grouping, action execution, undo, and workspace indicators together.

Do not use an ExecPlan for simple one-off adjustments such as changing a button color, removing a label, fixing a typo, or making a small CSS-only correction unless the user explicitly asks for a plan.

## Where Plans Live

Concrete plans should live in:

`.agent/plans/`

Use short descriptive file names, for example:

- `.agent/plans/ai-assistant-analysis-actions.md`
- `.agent/plans/profile-entity-model-refactor.md`
- `.agent/plans/profile-create-stage-sync.md`

## Required Properties

Every ExecPlan must be self-contained. Assume the reader has the current working tree and the plan file, but no memory of previous chat messages.

Every ExecPlan must explain:

- what user-visible behavior will change;
- which files and modules matter;
- what terms mean in this project;
- what sequence of work is planned;
- how progress is tracked;
- how success will be verified;
- how to recover or undo risky steps.

The plan must lead to demonstrably working behavior, not just code edits.

## Required Sections

Use the following structure for each plan.

### Purpose / Big Picture

Describe the user-visible outcome. Explain what the user will be able to do after the work is complete and how that differs from the current behavior.

### Current Context

Describe the relevant current state of the project. Include concrete paths, functions, modules, and UI areas.

For this project, mention relevant areas such as:

- `src/app.js`
- `src/features/profile-create/`
- `src/features/profile-ai-assistant/`
- `src/domain/profile-model.js`
- `docs/`

Define project-specific terms when they appear, for example: profile, goal, task, function, key competencies, analysis card, action, suggestion, severity group, drawer, segmented control.

### Scope and Non-Goals

State what is included and what is deliberately excluded. This is important because the prototype has many connected UI areas.

### Plan of Work

Describe the implementation sequence in prose. For each step, name the file or feature area and explain what will change.

Prefer incremental milestones that can be tested independently.

### Progress

Track real progress with checkboxes and timestamps.

Example:

- [x] (2026-05-30 14:10 Europe/Moscow) Inspected current AI assistant state and analysis card rendering.
- [ ] Update action execution logic.
- [ ] Verify browser behavior for single-card and group-level actions.

Update this section whenever work pauses or a milestone is completed.

### Decisions

Record decisions that affect future work. Include the date and rationale.

Example:

- (2026-05-30) Keep `Чат` consultative only. Rationale: it must remain visually related to generation but behaviorally safe and non-mutating.

### Surprises and Discoveries

Record unexpected implementation details, bugs, or constraints with brief evidence.

Example:

- Git is not available in the current environment, so validation cannot rely on `git diff` or staged changes.

### Validation and Acceptance

Describe exact checks and expected observable behavior.

Use commands when useful, for example:

- `node --check src/features/profile-ai-assistant/events/profile-ai-assistant.events.js`
- `node --check src/features/profile-ai-assistant/render/profile-ai-assistant.render.js`
- `node --check src/app.js`

Also include browser scenarios when UI behavior matters, for example:

- Open `index.html` in the Codex in-app browser.
- Open profile creation.
- Open AI assistant.
- Run the relevant assistant scenario.
- Switch to analysis.
- Click a card action.
- Confirm the workspace value changes and the card offers undo.

Acceptance must be phrased as behavior the user can observe.

### Idempotence and Recovery

Explain whether steps can be safely repeated. If a step can create duplicate UI data, describe how to avoid or undo that.

For risky UI/data changes, describe the rollback path. If Git is unavailable, describe manual recovery or the files that would need to be restored.

### Outcomes and Retrospective

At completion, summarize what was achieved, what remains, and which validation evidence proves completion.

## Style Rules

Write plans in clear prose. Use lists when they improve scanning, but do not turn the plan into a vague checklist.

Use exact file paths and concrete behavior. Avoid phrases like "fix logic" without saying which logic and how the user will see the result.

Keep the plan updated. A stale plan is worse than no plan because it gives false confidence.

## Relationship to AGENTS.md

`AGENTS.md` decides when this planning standard should be used. This file defines how the plan should be written and maintained.

If `AGENTS.md` and an ExecPlan conflict, pause and clarify unless the user's current instruction clearly resolves the conflict and does not violate higher-priority rules.
