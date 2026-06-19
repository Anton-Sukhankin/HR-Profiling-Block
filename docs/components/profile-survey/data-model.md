# Profile Survey Data Model

The survey keeps local in-memory state in `profileSurveyState`.

```js
{
  isActive: false,
  currentStep: 1,
  totalSteps: 9,
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

- main functions as Code 4 classifier values;
- functional areas as dependent Code 5 values;
- typical role templates;
- thematic answers for result, goal, approach, and time distribution;
- task-to-function drafts;
- competency draft.

The main-function dictionary is structured for the full 39-function Code 4 classifier. In the current prototype data it contains the functions needed for the demonstrated branching path and can be extended by adding more objects to the same `functions` array.

The typical-role catalog question is available only for these Code 4 values:

- `Девелопмент`;
- `Sales (продажи)`;
- `Проектный институт`;
- `УК`;
- `Клиентский сервис`.

The first answer in the typical-role catalog is always `Не относится к типовым ролям`; concrete typical-role templates follow it.

## Manual Scenario Answer Dictionaries

Question 4 `Должность является руководящей (в подчинении закреплено структурное подразделение)?`:

- `Да`;
- `Нет`.

Question 5 `Выбери ожидаемый результат деятельности по должности?`:

- `Центры продаж: Генерация прибыли / оказание прямого влияния на получение прибыли Компании`;
- `R&D центры: Создание абсолютно нового продукта / бизнес-направления, которого ранее не было в Компании`;
- `Центры создания продукта: Создание готового продукта Компании / оказание прямого влияния на себестоимость продукта и прибыль Компании`;
- `Центры разработки продукта: Разработка и улучшение существующего продукта Компании`;
- `Центры сопровождения продукта: Сопровождение создания продукта Компании (прямая связь с продажами и производством продукта)`;
- `Центры поддержки: Выполнение поддерживающих и административных функций`.

Question 6 `Опиши цель сущестования должности в Компании одним утверждением?`:

- `Поддерживать работу текущих процессов и продуктов Компании (Run)`;
- `Придумывать и внедрять на постоянной основе новые проекты, продукты или подходы (Change)`;
- `Создавать принципиально новые направления, не связанные с текущей деятельностью Компании (Disrupt)`;
- `Совмещать поддержку текущей деятельности с созданием и запуском новых проектов Компании (Run&Change)`.

Question 7 `Как можно охарактеризовать ожидаемый подход к работе для данной должности?`:

- `Работа по четким инструкциям, чек-листам, планам, фреймворкам`;
- `Отсутствие готовых решений, необходимость постоянных экспериментов, A/B-тестов и адаптации к изменениям`;
- `Работа на стыке: часть функций по алгоритмам, часть — в режиме принятия решений`.

Question 8 `Какой функционал занимает большую часть рабочего времени по должности и определяет ценность его должности для Компании?`:

- `(1) Придумать (разработка и создание продуктов / моделей / бизнес-процессов, проектирование, исследования)`;
- `(2) Провести анализ (сбор, аналитика и подсчет показателей)`;
- `(3) Соблюсти требования (контроль данных и действий, проверки, тестирование)`;
- `(4) Наладить отношения (консультирование, сбор информации и обработка обращений)`;
- `(5) Создать условия (сервис, работа с техникой, ремонт, закупки и обеспечение)`;
- `(6) Обеспечить процессы (сбор и обработка документов / документооборот, проверка на соответствие нормам)`;
- `(7) Получить прибыль (продажи идей / продуктов, презентации, работа с клиентами / средствами массовой информации / органами государственной власти)`;
- `(8) Реализовать стратегию (менеджмент, постановка целей, контроль, управление командой)`.

Custom functional directions are stored in `customAreas` by selected main function id. Directions created before a main function is selected are stored in the `__global` bucket and can still be selected in the survey summary.

## Synchronized Result

The survey result contains:

- `scenario`: the active survey scenario;
- base context draft;
- one survey-generated goal;
- generated tasks and functions;
- competency draft;
- summary metadata for the final survey accordion.

Only `typical` results are synchronized to the profile creation form. The integration replaces previous survey-generated goal data on every typical live sync to avoid duplicates. Values marked as survey-managed may be updated by later typical survey answers; manual values outside the survey-managed area are preserved.

`nonTypical` results remain local to the survey drawer. They do not prefill stage 1 or stage 2. If a previous typical result had synchronized survey-generated data, switching to `nonTypical` clears those survey-generated values.
