(function () {
    const app = window.HRProfileApp || {};

    const SYSTEM_DEFAULTS = {
        department: "Отдел концептуальных решений",
        band: "Band 3",
        hasBinding: false,
        isTypicalPosition: false,
        status: "Черновик",
        categories: ["Новые"],
        isTypicalProfile: false,
        leaderName: "—",
        leaderPosition: "—"
    };

    const clone = (value) => JSON.parse(JSON.stringify(value || null));

    const createEmptyCompetencies = () => ({
        softSkills: [],
        hardSkills: [],
        languages: [],
        technologies: [],
        certificates: [],
        permits: [],
        education: [],
        experience: [],
        functionalAreas: []
    });

    const DEFAULT_COMPETENCY_SETS = [
        {
            softSkills: [
                { id: 1, name: "Командная работа", desc: "Умение эффективно взаимодействовать с коллегами для достижения общих целей.", score: 3 },
                { id: 2, name: "Критическое мышление", desc: "Способность анализировать информацию и принимать взвешенные решения.", score: 3 }
            ],
            hardSkills: ["Управление проектами", "Agile (Scrum, Kanban)", "BPMN 2.0"],
            languages: [{ name: "Английский", level: "B2" }],
            technologies: ["Microsoft Excel", "Microsoft PowerPoint", "Jira"],
            certificates: ["PMP (Project Management Professional)"],
            permits: ["Электробезопасность IV гр."],
            education: [{ name: "Высшее образование", directions: ["Менеджмент и управление"] }],
            experience: [
                { id: "total", name: "Общий стаж работы", years: "3-6 лет", mandatory: true },
                { id: "mgmt", name: "Опыт на руководящих должностях", years: "1-3 года", mandatory: true }
            ],
            functionalAreas: ["Управление проектами (PMO)", "Административное управление"]
        },
        {
            softSkills: [
                { id: 3, name: "Тайм-менеджмент", desc: "Эффективное планирование рабочего времени и соблюдение дедлайнов.", score: 3 },
                { id: 5, name: "Адаптивность", desc: "Способность быстро подстраиваться под меняющиеся условия и задачи.", score: 2 }
            ],
            hardSkills: ["SQL (PostgreSQL, MySQL)", "Python (Django, FastAPI)", "REST API Design"],
            languages: [{ name: "Английский", level: "B1" }],
            technologies: ["Visual Studio Code", "Postman", "Power BI"],
            certificates: ["Microsoft Certified: Azure Administrator"],
            permits: ["Допуск к управлению спецтехникой"],
            education: [{ name: "Высшее образование", directions: ["Информационные технологии"] }],
            experience: [{ id: "total", name: "Общий стаж работы", years: "1-3 года", mandatory: true }],
            functionalAreas: ["Информационные технологии (IT)", "Безопасность"]
        },
        {
            softSkills: [
                { id: 6, name: "Переговоры", desc: "Навык ведения диалога для нахождения взаимовыгодных решений.", score: 3 },
                { id: 9, name: "Презентационные навыки", desc: "Умение четко и убедительно излагать свои идеи аудитории.", score: 3 }
            ],
            hardSkills: ["Финансовый анализ", "Управление проектами", "Agile (Scrum, Kanban)"],
            languages: [{ name: "Английский", level: "B2" }],
            technologies: ["Microsoft Excel", "Tableau", "1C:Предприятие"],
            certificates: ["ACCA"],
            permits: ["Работа с ГСМ (горюче-смазочными материалами)"],
            education: [{ name: "Магистратура", directions: ["Экономика и финансы"] }],
            experience: [{ id: "total", name: "Общий стаж работы", years: "3-6 лет", mandatory: true }],
            functionalAreas: ["Финансы и аудит", "Продажи и развитие бизнеса"]
        },
        {
            softSkills: [
                { id: 4, name: "Эмоциональный интеллект", desc: "Понимание своих и чужих эмоций для конструктивного общения.", score: 3 },
                { id: 8, name: "Решение конфликтов", desc: "Способность находить выход из спорных ситуаций без ущерба для дела.", score: 3 }
            ],
            hardSkills: ["Управление проектами", "Figma", "BPMN 2.0"],
            languages: [{ name: "Английский", level: "B1" }],
            technologies: ["Figma", "Microsoft Word", "Confluence"],
            certificates: ["ISO 9001 Lead Auditor"],
            permits: ["Работа в замкнутых пространствах"],
            education: [{ name: "Бакалавриат", directions: ["Управление персоналом (HR)"] }],
            experience: [{ id: "total", name: "Общий стаж работы", years: "1-3 года", mandatory: true }],
            functionalAreas: ["Управление персоналом (HR)", "Маркетинг и PR"]
        }
    ];

    const getDefaultCompetencies = (profile = {}) => {
        const profileId = Number(profile.id) || 1;
        const variant = DEFAULT_COMPETENCY_SETS[(profileId - 1) % DEFAULT_COMPETENCY_SETS.length];
        return clone(variant);
    };

    const hasItems = (value) => Array.isArray(value) && value.length > 0;

    const normalizeFunction = (func = {}) => ({
        name: func.name || "",
        ai: func.ai || "Не используется",
        influence: func.influence || "",
        role: func.role || "Исполняет"
    });

    const normalizeTask = (task = {}) => ({
        name: task.name || "",
        participation: task.participation || "",
        role: task.role || "Исполняет",
        functions: Array.isArray(task.functions) ? task.functions.map(normalizeFunction) : []
    });

    const normalizeGoal = (goal = {}) => ({
        name: goal.name || "",
        role: goal.role || "Отвечает",
        tasks: Array.isArray(goal.tasks) ? goal.tasks.map(normalizeTask) : []
    });

    const normalizeCompetencies = (competencies = {}, profile = {}, options = {}) => {
        const emptyCompetencies = createEmptyCompetencies();
        const useDefaults = options.useDefaults !== false;
        const defaults = useDefaults ? getDefaultCompetencies(profile) : emptyCompetencies;
        const source = clone(competencies) || {};
        const normalized = {};

        Object.keys(emptyCompetencies).forEach((key) => {
            normalized[key] = hasItems(source[key]) ? source[key] : defaults[key];
        });

        return normalized;
    };

    const normalizeProfile = (profile = {}) => ({
        id: profile.id,
        code: profile.code || "",
        name: profile.name || "",
        department: profile.department || SYSTEM_DEFAULTS.department,
        band: profile.band || SYSTEM_DEFAULTS.band,
        hasBinding: Boolean(profile.hasBinding),
        classifier: profile.classifier || "",
        isTypicalPosition: Boolean(profile.isTypicalPosition),
        updatedAt: profile.updatedAt || new Date().toISOString(),
        status: profile.status || SYSTEM_DEFAULTS.status,
        okzCode: profile.okzCode || "",
        categories: Array.isArray(profile.categories) ? [...profile.categories] : [...SYSTEM_DEFAULTS.categories],
        isTypicalProfile: Boolean(profile.isTypicalProfile),
        competenciesAreUserDefined: Boolean(profile.competenciesAreUserDefined),
        leaderName: profile.leaderName || SYSTEM_DEFAULTS.leaderName,
        leaderPosition: profile.leaderPosition || SYSTEM_DEFAULTS.leaderPosition,
        goals: Array.isArray(profile.goals) ? profile.goals.map(normalizeGoal) : [],
        competencies: normalizeCompetencies(profile.competencies, profile, {
            useDefaults: !profile.competenciesAreUserDefined
        })
    });

    const getNextProfileId = (profiles = []) => {
        if (!profiles.length) return 1;
        return Math.max(...profiles.map((profile) => profile.id || 0)) + 1;
    };

    const formatProfileCode = (id) => `PROF-${String(id).padStart(3, "0")}`;

    const createProfile = (input = {}, profiles = []) => {
        const id = input.id || getNextProfileId(profiles);

        return normalizeProfile({
            ...SYSTEM_DEFAULTS,
            ...input,
            id,
            code: input.code || formatProfileCode(id),
            updatedAt: input.updatedAt || new Date().toISOString()
        });
    };

    const updateProfile = (profile, input = {}) => {
        if (!profile) return null;

        const updatedProfile = normalizeProfile({
            ...profile,
            ...input,
            id: profile.id,
            updatedAt: input.updatedAt || new Date().toISOString()
        });

        Object.keys(profile).forEach((key) => delete profile[key]);
        Object.assign(profile, updatedProfile);
        return profile;
    };

    app.profileModel = {
        SYSTEM_DEFAULTS,
        createEmptyCompetencies,
        normalizeCompetencies,
        getDefaultCompetencies,
        normalizeProfile,
        createProfile,
        updateProfile,
        getNextProfileId,
        formatProfileCode
    };

    window.HRProfileApp = app;
})();
