# Profile Survey Integration

`profile-survey` integrates with the profile creation drawer and does not integrate into the AI assistant segmented control.

## Connected Areas

- `index.html`: launch banner host, wizard host, drawer header content, stylesheet and script links.
- `src/app.js`: integration API that applies survey output to the existing form.
- `src/features/profile-survey/`: survey data, state, rendering, events, and styles.
- `docs/components/profile-survey/`: component documentation.

## Application API

The survey uses `window.HRProfileApp.profileSurveyIntegration.applySurveyResult(result)` to apply its final result.

When survey state `isActive` is true, the create-profile drawer receives survey mode styling. This mode hides profile creation stage navigation, normal drawer footer, and the AI assistant trigger. The drawer back arrow exits survey mode instead of closing the drawer.

The integration uses existing profile creation behavior where possible:

- sets base parameters only if empty;
- creates a goal card with tasks and functions;
- refreshes validation and stage availability;
- applies competency state after the first-stage draft exists.

## Separation From AI Assistant

AI assistant remains responsible for analysis and chat. It does not own survey state, survey navigation, or survey data application.
