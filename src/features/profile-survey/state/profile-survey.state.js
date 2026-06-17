(function () {
    const app = window.HRProfileApp || {};

    const createInitialState = () => ({
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
    });

    let state = createInitialState();

    const notify = (options = {}) => {
        document.dispatchEvent(new CustomEvent("profile-survey-state-change", { detail: { state, ...options } }));
    };

    const setState = (patch = {}, options = {}) => {
        state = {
            ...state,
            ...patch,
            answers: {
                ...state.answers,
                ...(patch.answers || {})
            },
            customFunctions: patch.customFunctions || state.customFunctions,
            customAreas: patch.customAreas || state.customAreas
        };
        notify(options);
        return state;
    };

    const reset = () => {
        state = createInitialState();
        notify();
        return state;
    };

    const getState = () => state;

    app.profileSurveyState = {
        getState,
        setState,
        reset
    };

    window.HRProfileApp = app;
})();
