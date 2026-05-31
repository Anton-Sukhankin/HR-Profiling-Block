(function () {
    const app = window.HRProfileApp || {};
    const STORAGE_KEY = "hr-profile-prototype.ai-assistant";
    const mock = app.profileAIAssistantMock || { messages: [] };

    const clone = (value) => JSON.parse(JSON.stringify(value));
    const normalizeMessages = (messages = []) => (
        Array.isArray(messages)
            ? messages.filter((message) => message && message.id !== "profile_ai_welcome")
            : []
    );

    const defaultState = {
        isOpen: false,
        width: 490,
        activeTab: "generation",
        draft: "",
        drafts: {
            generation: "",
            chat: ""
        },
        generationStatus: "idle",
        generationNotice: null,
        generationMessages: [],
        generationDraftSource: "",
        lastGenerationSource: "",
        demoCriticalAfterQuickGeneration: false,
        analysisStatus: "idle",
        analysisItems: [],
        analysisCollapsedGroups: {},
        analysisLastRunAt: null,
        messages: normalizeMessages(clone(mock.messages))
    };

    const readState = () => {
        try {
            const rawState = window.localStorage.getItem(STORAGE_KEY);
            if (!rawState) return clone(defaultState);

            const parsedState = JSON.parse(rawState);
            const nextState = {
                ...clone(defaultState),
                ...parsedState,
                drafts: {
                    ...clone(defaultState.drafts),
                    ...(parsedState.drafts || {})
                },
                analysisCollapsedGroups: {
                    ...clone(defaultState.analysisCollapsedGroups),
                    ...(parsedState.analysisCollapsedGroups || {})
                }
            };

            if (parsedState.draft && !nextState.drafts.chat) {
                nextState.drafts.chat = parsedState.draft;
            }

            nextState.messages = normalizeMessages(nextState.messages);

            return nextState;
        } catch (error) {
            return clone(defaultState);
        }
    };

    let state = readState();

    const persist = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.warn("Не удалось сохранить состояние ИИ-помощника", error);
        }
    };

    const getState = () => state;

    const setState = (patch) => {
        state = {
            ...state,
            ...patch
        };
        persist();
        return state;
    };

    const addMessage = (message) => {
        state.messages.push(message);
        persist();
    };

    const resetSession = (patch = {}) => {
        const preservedWidth = state.width || defaultState.width;
        state = {
            ...clone(defaultState),
            width: preservedWidth,
            isOpen: false,
            messages: [],
            ...patch,
            drafts: {
                ...clone(defaultState.drafts),
                ...((patch && patch.drafts) || {})
            },
            analysisCollapsedGroups: {
                ...clone(defaultState.analysisCollapsedGroups),
                ...((patch && patch.analysisCollapsedGroups) || {})
            }
        };
        persist();
        return state;
    };

    app.profileAIAssistantState = {
        getState,
        setState,
        addMessage,
        resetSession,
        persist
    };

    window.HRProfileApp = app;
})();
