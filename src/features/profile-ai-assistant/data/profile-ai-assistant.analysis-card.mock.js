(function () {
    const app = window.HRProfileApp || {};
    const model = app.profileAIAnalysisCardModel || {};
    const types = model.TYPES || {};
    const stages = model.STAGES || {};
    const targets = model.TARGET_KINDS || {};
    const actions = model.ACTION_TYPES || {};

    app.profileAIAnalysisCardMock = {
        examples: [
            {
                id: "analysis_goal_missing_example",
                type: types.CRITICAL || "critical",
                title: "Цель не добавлена",
                description: "После выбора должности и места в структуре добавьте цель, а затем раскройте её через задачу и функцию.",
                location: "Первый этап → Общие положения и функционал",
                targetKey: "analysis_goals_missing",
                stage: stages.FUNCTIONAL || "functional",
                targetKind: targets.GOAL || "goal",
                suggestedText: "Минимальный ручной контекст для продолжения: добавленная цель, одна задача внутри цели и хотя бы одна выбранная функция.",
                status: "active"
            },
            {
                id: "analysis_goal_name_suggestion_example",
                type: types.CRITICAL || "critical",
                title: "Цель не выбрана",
                description: "Цель задаёт верхнеуровневый смысл профиля и нужна для дальнейшего анализа.",
                location: "Цель 1",
                targetKey: "analysis_goal_0_missing_name",
                stage: stages.FUNCTIONAL || "functional",
                targetKind: targets.GOAL || "goal",
                suggestedValue: "Обеспечение анализа и развития бизнес-процессов",
                originalValue: "",
                status: "active"
            },
            {
                id: "analysis_decomposition_action_example",
                type: types.WARNING || "warning",
                title: "Недостаточная глубина декомпозиции",
                description: "По методологии лучше раскрывать задачу через 5 и более функций.",
                location: "Цель → Задача",
                targetKey: "analysis_goal_0_task_0_few_functions",
                stage: stages.FUNCTIONAL || "functional",
                targetKind: targets.TASK || "task",
                action: {
                    type: actions.CUSTOM || "custom",
                    label: "Добавить функции до 5+"
                },
                status: "active"
            },
            {
                id: "analysis_soft_skills_relevance_example",
                type: types.RECOMMENDATION || "recommendation",
                title: "Проверьте связь Soft Skills с функциями",
                description: "Soft Skills должны объяснять способ выполнения работы, а не быть универсальным набором качеств.",
                location: "Ключевые компетенции → Компетенции",
                targetKey: "analysis_soft_skills_relevance",
                stage: stages.COMPETENCIES || "competencies",
                targetKind: targets.SOFT_SKILLS || "softSkills",
                suggestedText: "Оставьте только те soft skills, которые реально помогают выполнять выбранные функции первого этапа.",
                status: "active"
            },
            {
                id: "analysis_hard_skills_match_example",
                type: types.RECOMMENDATION || "recommendation",
                title: "Проверьте соответствие Hard Skills функциям",
                description: "Профессиональные навыки должны подтверждаться задачами и функциями профиля.",
                location: "Ключевые компетенции → Профессиональные знания и навыки",
                targetKey: "analysis_hard_skills_match",
                stage: stages.COMPETENCIES || "competencies",
                targetKind: targets.HARD_SKILLS || "hardSkills",
                action: {
                    type: actions.FOCUS_TARGET || "focus_target",
                    label: "Перейти к Hard Skills"
                },
                status: "active"
            },
            {
                id: "analysis_language_cefr_example",
                type: types.RECOMMENDATION || "recommendation",
                title: "Проверьте уровень языка по CEFR",
                description: "Уровень языка лучше выбирать по рабочим сценариям: чтение документации, переписка, встречи или переговоры.",
                location: "Ключевые компетенции → Иностранные языки",
                targetKey: "analysis_languages_cefr",
                stage: stages.COMPETENCIES || "competencies",
                targetKind: targets.LANGUAGE || "language",
                suggestedText: "Если язык нужен только для чтения документации, обычно достаточно B1. Для встреч и согласований чаще нужен B2.",
                status: "active"
            }
        ]
    };

    window.HRProfileApp = app;
})();
