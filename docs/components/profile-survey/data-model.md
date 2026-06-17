# Profile Survey Data Model

The survey keeps local in-memory state in `profileSurveyState`.

```js
{
  isActive: false,
  currentStep: 1,
  totalSteps: 7,
  hasVisitedTypicalRoles: false,
  isTypicalProfile: false,
  appliedAt: null,
  answers: {
    selectedFunctionId: "",
    functionSearchQuery: "",
    selectedArea: "",
    areaSearchQuery: "",
    selectedTypicalRole: "none",
    leadership: "",
    result: "",
    goal: "",
    approach: "",
    time: ""
  },
  customFunctions: [],
  customAreas: {}
}
```

## Source Data

Survey dictionaries live in `src/features/profile-survey/data/`:

- main functions;
- functional areas;
- typical role templates;
- thematic answers for result, goal, approach, and time distribution;
- task-to-function drafts;
- competency draft.

Custom functional directions are stored in `customAreas` by selected main function id. Directions created before a main function is selected are stored in the `__global` bucket and can still be selected in the survey summary.

## Applied Result

The final result contains:

- base context draft;
- one generated goal;
- generated tasks and functions;
- competency draft;
- summary metadata for the final survey screen.
