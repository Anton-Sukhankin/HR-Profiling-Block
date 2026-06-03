(function () {
    const app = window.HRProfileApp || {};

    const TYPES = Object.freeze({
        CRITICAL: "critical",
        WARNING: "warning",
        RECOMMENDATION: "recommendation",
        SUCCESS: "success"
    });

    const STAGES = Object.freeze({
        FUNCTIONAL: "functional",
        COMPETENCIES: "competencies"
    });

    const ACTION_TYPES = Object.freeze({
        FOCUS_TARGET: "focus_target",
        APPLY_SUGGESTION: "apply_suggestion",
        APPLY_COMPETENCY_VALUE: "apply_competency_value",
        CUSTOM: "custom"
    });

    const TARGET_KINDS = Object.freeze({
        POSITION: "position",
        STRUCTURE: "structure",
        GOAL: "goal",
        TASK: "task",
        FUNCTION: "function",
        SOFT_SKILLS: "softSkills",
        HARD_SKILLS: "hardSkills",
        LANGUAGE: "language",
        TECHNOLOGY: "technology",
        EDUCATION: "education",
        EXPERIENCE: "experience",
        FUNCTIONAL_AREA: "functionalArea",
        ACCORDION: "accordion"
    });

    const GROUPS = Object.freeze({
        CRITICAL: Object.freeze({
            id: TYPES.CRITICAL,
            type: TYPES.CRITICAL,
            title: "??????????? ??????",
            description: "????????? ??????? ??????",
            priority: 10,
            blocksNextStep: true
        }),
        WARNING: Object.freeze({
            id: TYPES.WARNING,
            type: TYPES.WARNING,
            title: "??????????????",
            description: "?????? ?? ???????? ??????????",
            priority: 20,
            blocksNextStep: false
        }),
        RECOMMENDATION: Object.freeze({
            id: TYPES.RECOMMENDATION,
            type: TYPES.RECOMMENDATION,
            title: "????????????",
            description: "???????? ????????? ???????",
            priority: 30,
            blocksNextStep: false
        }),
        SUCCESS: Object.freeze({
            id: TYPES.SUCCESS,
            type: TYPES.SUCCESS,
            title: "??????????",
            description: "?????????, ??????? ??? ???????",
            priority: 40,
            blocksNextStep: false
        })
    });

    const DEFAULT_CARD = Object.freeze({
        id: "",
        type: TYPES.RECOMMENDATION,
        title: "",
        description: "",
        location: "",
        targetKey: "",
        stage: STAGES.FUNCTIONAL,
        targetKind: TARGET_KINDS.ACCORDION,
        status: "active"
    });

    const hasSuggestion = (card) => Boolean(card && (card.suggestedText || card.suggestedValue));
    const hasAction = (card) => Boolean(card && card.action);

    const createCard = (card = {}) => ({
        ...DEFAULT_CARD,
        ...card
    });

    const validateCard = (card = {}) => {
        const errors = [];
        const normalized = createCard(card);

        if (!normalized.id) errors.push("id is required");
        if (!normalized.title) errors.push("title is required");
        if (!normalized.description) errors.push("description is required");
        if (!Object.values(TYPES).includes(normalized.type)) errors.push("type is invalid");
        if (!Object.values(STAGES).includes(normalized.stage)) errors.push("stage is invalid");
        if (hasSuggestion(normalized) && hasAction(normalized)) {
            errors.push("card must contain either suggestion or action, not both");
        }
        if (!hasSuggestion(normalized) && !hasAction(normalized) && normalized.status !== "done") {
            errors.push("active card should contain suggestedText, suggestedValue or action");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    };

    const splitMixedCard = (card = {}) => {
        if (!hasSuggestion(card) || !hasAction(card)) {
            return [card];
        }

        return [
            {
                ...card,
                id: `${card.id}_suggestion`,
                action: null
            },
            {
                ...card,
                id: `${card.id}_action`,
                suggestedText: "",
                suggestedValue: "",
                originalValue: ""
            }
        ];
    };

    app.profileAIAnalysisCardModel = {
        TYPES,
        STAGES,
        ACTION_TYPES,
        TARGET_KINDS,
        GROUPS,
        DEFAULT_CARD,
        createCard,
        validateCard,
        splitMixedCard,
        hasSuggestion,
        hasAction
    };

    window.HRProfileApp = app;
})();
