# Profile Survey Data Model

The survey keeps local in-memory state in `profileSurveyState`.

```js
{
  isActive: false,
  currentStep: 1,
  totalSteps: 7,
  openAccordions: {},
  surveyScenario: "undetermined",
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

## Scenario State

`surveyScenario` is the source of truth for branching:

- `undetermined`: the user has not provided enough context or has not chosen between typical and non-typical paths yet.
- `typical`: the user selected a concrete typical role template.
- `nonTypical`: the function has no typical roles, or the user explicitly chose `Не относится к типовым ролям` / `Типовой профиль не подходит`.

`selectedTypicalRole: "none"` is a technical empty value. It becomes a meaningful refusal only together with `hasVisitedTypicalRoles: true` and `surveyScenario: "nonTypical"`.

`isTypicalProfile` is kept as a compatibility flag for existing rendering and integration, but it follows `surveyScenario === "typical"`.

## Source Data

Survey dictionaries live in `src/features/profile-survey/data/`:

- main functions;
- functional areas;
- typical role templates;
- thematic answers for result, goal, approach, and time distribution;
- task-to-function drafts;
- competency draft.

Custom functional directions are stored in `customAreas` by selected main function id. Directions created before a main function is selected are stored in the `__global` bucket and can still be selected in the survey summary.

## Synchronized Result

The synchronized result contains:

- `scenario`: the active survey scenario;
- base context draft;
- one survey-generated goal;
- generated tasks and functions;
- competency draft;
- summary metadata for the final survey accordion.

The integration replaces previous survey-generated goal data on every live sync to avoid duplicates. Values marked as survey-managed may be updated by later survey answers; manual values outside the survey-managed area are preserved.
