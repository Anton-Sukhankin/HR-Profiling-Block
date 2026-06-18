# Profile Survey Integration

`profile-survey` integrates with the profile creation drawer and does not integrate into the AI assistant segmented control.

## Connected Areas

- `index.html`: survey alert launch action, survey drawer host, stylesheet and script links.
- `src/app.js`: integration API that synchronizes survey output with the existing form and creates the final profile.
- `src/features/profile-survey/`: survey data, state, rendering, events, and styles.
- `docs/components/profile-survey/`: component documentation.

## Application API

The survey uses `window.HRProfileApp.profileSurveyIntegration.syncSurveyResult(result)` for live synchronization after answer changes.

The synchronized result includes the active `scenario` so integration consumers can distinguish a template-based typical draft from a manually answered non-typical draft.

The final footer action calls `window.HRProfileApp.profileSurveyIntegration.applySurveyResult(result, options)` to ensure the latest survey result is reflected in the form, then closes only the survey drawer.

The integration uses existing profile creation behavior where possible:

- sets base parameters if they are empty or already managed by the survey;
- creates or replaces the survey-generated goal card with tasks and functions;
- refreshes validation and stage availability;
- applies competency state as part of the survey-generated draft;
- avoids accumulating duplicate survey-generated goal cards on repeated answer changes;
- keeps the profile creation drawer open so the user can review or continue editing;
- does not create a profile-store record from the survey drawer;
- does not navigate back to the profiles table.

Manual values outside the survey-managed area are preserved. Survey-generated values can be updated by later survey answers.

Scenario-specific integration rules:

- `typical`: a concrete typical role is enough to create the survey-generated draft after function and direction are selected; manual question values are not required.
- `nonTypical`: the draft is built from manual answers and keeps the existing management-task rule for leadership answer `Да`.
- `undetermined`: the drawer may live-sync partial base context, but the footer action remains disabled.

## Separation From AI Assistant

AI assistant remains responsible for analysis and chat. It does not own survey state, survey navigation, or survey data synchronization.
