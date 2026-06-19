# Profile Survey Integration

`profile-survey` integrates with the profile creation drawer and does not integrate into the AI assistant segmented control.

## Connected Areas

- `index.html`: survey alert launch action, survey drawer host, stylesheet and script links.
- `src/app.js`: integration API that synchronizes survey output with the existing form and creates the final profile.
- `src/features/profile-survey/`: survey data, state, rendering, events, and styles.
- `docs/components/profile-survey/`: component documentation.

## Application API

The survey uses `window.HRProfileApp.profileSurveyIntegration.syncSurveyResult(result)` for live synchronization after answer changes only when the result belongs to a concrete typical-role template.

The synchronized result includes the active `scenario` so integration consumers can distinguish a template-based typical draft from a manually answered non-typical draft.

The final footer action calls `window.HRProfileApp.profileSurveyIntegration.applySurveyResult(result, options)`, then closes only the survey drawer. For `nonTypical`, this call clears any previous survey-generated draft and does not write survey answers into the form.

The integration uses existing profile creation behavior where possible:

- sets base parameters if they are empty or already managed by the survey, but only for `typical`;
- creates or replaces the survey-generated goal card with tasks and functions, but only for `typical`;
- refreshes validation and stage availability;
- applies competency state as part of the survey-generated draft, but only for `typical`;
- locks survey-managed stage 1 and stage 2 values when the active survey scenario is a concrete typical-role template;
- clears previous survey-generated values when the user switches to `nonTypical`;
- avoids accumulating duplicate survey-generated goal cards on repeated answer changes;
- keeps the profile creation drawer open so the user can review or continue editing;
- does not create a profile-store record from the survey drawer;
- does not navigate back to the profiles table.

Manual values outside the survey-managed area are preserved. Survey-generated values can be updated by later survey answers.

Scenario-specific integration rules:

- `typical`: a concrete typical role is enough to create the survey-generated draft after function and direction are selected; manual question values are not required.
- `typical` drafts are template-managed: synchronized base fields, the generated goal/task/function card, and synchronized competencies are read-only until the user switches away from the concrete template path.
- In the template-managed competency stage, the integration keeps accordion navigation available while hiding internal mutation actions and suppressing hover affordances inside accordion bodies.
- `nonTypical`: survey answers stay inside the survey drawer and are not synchronized into the profile creation form. If the user previously selected a concrete template, the generated draft is cleared when the scenario becomes `nonTypical`.
- `undetermined`: the drawer may live-sync partial base context, but the footer action remains disabled.

## Separation From AI Assistant

AI assistant remains responsible for analysis and chat. It does not own survey state, survey navigation, or survey data synchronization.
