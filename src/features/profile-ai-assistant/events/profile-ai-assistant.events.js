(function () {
    const app = window.HRProfileApp || {};

    const getStateApi = () => (window.HRProfileApp || {}).profileAIAssistantState;
    const getRenderApi = () => (window.HRProfileApp || {}).profileAIAssistantRender;
    let isRenderingAIPanel = false;
    let hasPendingAIPanelRender = false;
    let analysisTimer = null;
    let asyncRunToken = 0;

    const normalizeTab = (tab) => (tab === "chat" ? "chat" : "analysis");

    const nextAsyncRunToken = () => {
        asyncRunToken += 1;
        return asyncRunToken;
    };

    const isAsyncRunCurrent = (token) => token === asyncRunToken;

    const clearAsyncOperations = () => {
        asyncRunToken += 1;
        window.clearTimeout(analysisTimer);
        analysisTimer = null;
    };

    const escapeCssIdent = (value) => {
        if (window.CSS && typeof window.CSS.escape === "function") {
            return window.CSS.escape(String(value));
        }

        return String(value).replace(/"/g, '\\"');
    };

    const getAnalysisMarkerHost = (target) => {
        if (!target) return null;
        const tagName = target.tagName ? target.tagName.toLowerCase() : "";
        if (["input", "select", "textarea"].includes(tagName)) {
            return target.closest(".task-participation-container, .ai-influence-container") || target;
        }

        return target.closest(".tree-select-trigger, .custom-select-wrapper, .goal-name-wrapper, .col-task-name-wrapper") || target;
    };

    const getAnalysisStatusIconName = (type = "recommendation") => {
        if (type === "critical") return "octagon-alert";
        if (type === "warning") return "triangle-alert";
        return "sparkles";
    };

    const canShowInlineAnalysisIcon = (host) => {
        if (!host) return false;
        return host.matches(
            ".custom-select-wrapper, .goal-name-wrapper, .col-task-name-wrapper, .task-participation-container, .ai-influence-container, .tree-select-trigger"
        );
    };

    const addInlineAnalysisIcon = (host, item) => {
        if (item && (item.id === "analysis_position_missing" || item.id === "analysis_structure_missing")) {
            return false;
        }

        if (host && host.matches("select.custom-select")) {
            const iconHost = host.closest(".select-wrapper");
            if (!iconHost) return false;

            const icon = document.createElement("span");
            icon.className = `profile-ai-field-status-icon is-native-select is-${item.type || "recommendation"}`;
            icon.setAttribute("aria-hidden", "true");
            icon.innerHTML = `<i data-lucide="${getAnalysisStatusIconName(item.type)}"></i>`;
            iconHost.appendChild(icon);
            host.classList.add("has-ai-status-icon");
            return true;
        }

        if (!canShowInlineAnalysisIcon(host)) return false;

        const icon = document.createElement("span");
        icon.className = `profile-ai-field-status-icon is-${item.type || "recommendation"}`;
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = `<i data-lucide="${getAnalysisStatusIconName(item.type)}"></i>`;

        const chevron = host.querySelector(".select-chevron, .tree-select-chevron");
        if (chevron && chevron.parentElement === host) {
            host.insertBefore(icon, chevron);
        } else {
            host.appendChild(icon);
        }

        host.classList.add("has-ai-status-icon");
        return true;
    };

    const clearAnalysisMarkers = () => {
        document.querySelectorAll(".profile-ai-analysis-target").forEach((target) => {
            target.classList.remove(
                "profile-ai-analysis-target",
                "is-critical",
                "is-warning",
                "is-recommendation",
                "is-highlighted",
                "has-ai-status-icon"
            );
        });

        document.querySelectorAll(".profile-ai-field-status-icon").forEach((icon) => icon.remove());
    };

    const syncAnalysisMarkers = () => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        if (!state.isOpen || state.activeTab !== "analysis" || state.analysisStatus !== "done") {
            clearAnalysisMarkers();
            return;
        }

        clearAnalysisMarkers();
        const markedTargets = new Set();
        (state.analysisItems || []).forEach((item) => {
            if (!item.targetKey || item.status === "done") return;
            if (markedTargets.has(item.targetKey)) return;

            const target = document.querySelector(`[data-ai-analysis-target="${escapeCssIdent(item.targetKey)}"]`);
            const host = getAnalysisMarkerHost(target);
            if (!host) return;

            markedTargets.add(item.targetKey);
            host.classList.add("profile-ai-analysis-target", `is-${item.type || "recommendation"}`);
            if (canShowInlineAnalysisIcon(host) && getComputedStyle(host).position === "static") {
                host.style.position = "relative";
            }
            const hasIcon = addInlineAnalysisIcon(host, item);
            if (hasIcon && window.lucide) {
                window.lucide.createIcons();
            }
        });
    };

    const setTriggerState = () => {
        const trigger = document.getElementById("btn-profile-ai-assistant");
        const stateApi = getStateApi();
        if (!trigger || !stateApi) return;

        const isOpen = stateApi.getState().isOpen;
        trigger.classList.toggle("is-active", isOpen);
        trigger.setAttribute("aria-expanded", String(isOpen));
    };

    const renderAndBind = () => {
        const renderApi = getRenderApi();
        if (!renderApi) return;
        if (isRenderingAIPanel) {
            hasPendingAIPanelRender = true;
            return;
        }

        isRenderingAIPanel = true;
        hasPendingAIPanelRender = false;
        try {
            renderApi.render();
            bindDrawerEvents();
            setTriggerState();
            renderApi.scrollToBottom();
            syncAnalysisMarkers();
        } finally {
            window.setTimeout(() => {
                isRenderingAIPanel = false;
                if (hasPendingAIPanelRender) {
                    renderAndBind();
                }
            }, 0);
        }
    };

    const getActiveTab = () => {
        const stateApi = getStateApi();
        return stateApi ? (stateApi.getState().activeTab || "analysis") : "analysis";
    };

    const getSelectedOptionText = (select) => {
        if (!select || select.selectedIndex < 0) return "";
        const option = select.options[select.selectedIndex];
        if (!option || option.disabled || !option.value) return "";
        return option.textContent.trim();
    };

    const getTriggerValue = (trigger) => (
        trigger
            ? (trigger.dataset.value || trigger.textContent || "").trim()
            : ""
    );

    const isFilledTrigger = (trigger) => (
        Boolean(getTriggerValue(trigger)) &&
        !trigger.classList.contains("is-placeholder") &&
        !trigger.closest(".is-placeholder")
    );

    const getGenerationContextText = () => {
        const position = getSelectedOptionText(document.getElementById("param-position"));
        const structureValue = document.getElementById("param-structure-value");
        const structure = structureValue && !structureValue.classList.contains("is-placeholder")
            ? structureValue.textContent.trim()
            : getSelectedOptionText(document.getElementById("param-structure"));
        const stage = document.getElementById("stage-competencies")?.classList.contains("active")
            ? "этап ключевых компетенций"
            : "этап общих положений и функционала";

        return { position, structure, stage };
    };

    const getFirstStageStatus = () => {
        const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
        if (!contextApi || typeof contextApi.getFirstStageStatus !== "function") {
            return { hasMinimumContext: false };
        }

        return contextApi.getFirstStageStatus();
    };

    const isCompetencyGenerationRequest = (text) => {
        const lowerText = String(text || "").toLowerCase();
        return [
            "компетенц",
            "ключев",
            "hard skill",
            "soft skill",
            "навык",
            "требован",
            "образован",
            "опыт",
            "второй этап",
            "2 этап"
        ].some((marker) => lowerText.includes(marker));
    };

    const setAnalysisTarget = (element, key) => {
        if (!element) return "";
        element.dataset.aiAnalysisTarget = key;
        return key;
    };

    const makeFunctionSuggestion = (value) => {
        const text = String(value || "").trim();
        const replacements = [
            { from: /^Анализ\b/i, to: "Проанализировать" },
            { from: /^Разработка\b/i, to: "Разработать" },
            { from: /^Проектирование\b/i, to: "Спроектировать" },
            { from: /^Проведение\b/i, to: "Провести" },
            { from: /^Оптимизация\b/i, to: "Оптимизировать" },
            { from: /^Подготовка\b/i, to: "Подготовить" },
            { from: /^Контроль\b/i, to: "Проконтролировать" }
        ];

        const rule = replacements.find((item) => item.from.test(text));
        return rule ? text.replace(rule.from, rule.to) : "";
    };

    const getCompetenciesCompletion = () => {
        const sections = [
            { id: "soft-skills-accordion", label: "компетенции" },
            { id: "hard-skills-accordion", label: "профессиональные знания и навыки" },
            { id: "lang-skills-accordion", label: "иностранные языки" },
            { id: "soft-tech-accordion", label: "знание ПО" },
            { id: "cert-skills-accordion", label: "сертификаты и допуски" },
            { id: "extra-permits-accordion", label: "дополнительные допуски" },
            { id: "edu-skills-accordion", label: "образование" },
            { id: "exp-skills-accordion", label: "опыт работы" },
            { id: "func-area-accordion", label: "направление деятельности" }
        ];

        return sections.map((section) => {
            const accordion = document.getElementById(section.id);
            const counter = accordion ? accordion.querySelector(".skills-counter") : null;
            const isFilled = counter ? counter.classList.contains("valid") : false;
            return { ...section, accordion, isFilled };
        });
    };

    const getCompetenciesSnapshot = () => {
        const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
        if (!contextApi || typeof contextApi.getCompetenciesState !== "function") {
            return null;
        }

        return contextApi.getCompetenciesState();
    };

    const getCompetencySectionRecommendationAction = (sectionId, competencies = {}) => {
        const actionMap = {
            "soft-skills-accordion": {
                section: "softSkills",
                mode: "add",
                value: "Критическое мышление",
                label: "Добавить «Критическое мышление»"
            },
            "hard-skills-accordion": {
                section: "hardSkills",
                mode: "add",
                value: "SQL (PostgreSQL, MySQL)",
                label: "Добавить «SQL (PostgreSQL, MySQL)»"
            },
            "lang-skills-accordion": {
                section: "languages",
                mode: "add",
                language: "Английский",
                level: "B1",
                label: "Добавить «Английский B1»"
            },
            "soft-tech-accordion": {
                section: "technologies",
                mode: "add",
                value: "Jira",
                label: "Добавить «Jira»"
            },
            "func-area-accordion": {
                section: "functionalAreas",
                mode: "add",
                value: "Информационные технологии (IT)",
                label: "Добавить «Информационные технологии (IT)»"
            }
        };

        const action = actionMap[sectionId];
        if (!action) return null;

        if (action.section === "softSkills" && (competencies.softSkills || []).some((item) => item.name === action.value)) return null;
        if (action.section === "hardSkills" && (competencies.hardSkills || []).includes(action.value)) return null;
        if (action.section === "technologies" && (competencies.technologies || []).includes(action.value)) return null;
        if (action.section === "functionalAreas" && (competencies.functionalAreas || []).includes(action.value)) return null;
        if (action.section === "languages" && (competencies.languages || []).some((item) => item.name === action.language)) return null;

        return {
            type: "apply_competency_value",
            ...action
        };
    };

    const hasCompetenciesData = (competencies) => {
        if (!competencies) return false;

        return [
            competencies.softSkills,
            competencies.hardSkills,
            competencies.languages,
            competencies.technologies,
            competencies.certificates,
            competencies.permits,
            competencies.education,
            competencies.experience,
            competencies.functionalAreas
        ].some((section) => Array.isArray(section) && section.length > 0);
    };

    const splitMixedAnalysisItems = (items) => {
        const analysisCardModel = (window.HRProfileApp || {}).profileAIAnalysisCardModel;
        if (analysisCardModel && typeof analysisCardModel.splitMixedCard === "function") {
            return items.flatMap((item) => analysisCardModel.splitMixedCard(item));
        }

        const result = [];

        items.forEach((item) => {
            const hasAction = Boolean(item.action);
            const hasSuggestion = Boolean(item.suggestedText || item.suggestedValue);

            if (!hasAction || !hasSuggestion) {
                result.push(item);
                return;
            }

            const suggestionItem = {
                ...item,
                id: `${item.id}_suggestion`,
                action: null
            };
            const actionItem = {
                ...item,
                id: `${item.id}_action`,
                suggestedText: "",
                suggestedValue: "",
                originalValue: ""
            };

            result.push(suggestionItem, actionItem);
        });

        return result;
    };

    const buildAnalysisResult = () => {
        const items = [];
        const assistantState = getStateApi() ? getStateApi().getState() : {};
        const position = document.getElementById("param-position");
        const structure = document.getElementById("param-structure");
        const structureValue = document.getElementById("param-structure-value");
        const goals = Array.from(document.querySelectorAll("#goals-container .goal-card"));
        const competencies = getCompetenciesSnapshot();
        const competenciesHaveData = hasCompetenciesData(competencies);
        const firstStageStatus = getFirstStageStatus();
        const canAnalyzeCompetencies = firstStageStatus.hasMinimumContext;
        const hasAnyProfileContext = Boolean(
            (position && position.value) ||
            (structure && structure.value) ||
            goals.length ||
            (canAnalyzeCompetencies && competenciesHaveData)
        );

        if (!hasAnyProfileContext) {
            return { items, empty: true };
        }

        if (!position || !position.value) {
            items.push({
                id: "analysis_position_missing",
                type: "critical",
                title: "Не указана должность",
                description: "Выберите должность из справочника, чтобы AI получил базовый профессиональный контекст и смог связать цели, задачи и компетенции.",
                location: "Параметры профиля → Должность",
                targetKey: setAnalysisTarget(position, "analysis_position_missing"),
                action: {
                    type: "focus_target",
                    label: "Перейти к выбору должности"
                }
            });
        }

        if (!structure || !structure.value) {
            items.push({
                id: "analysis_structure_missing",
                type: "critical",
                title: "Не указано место в структуре",
                description: "Укажите подразделение или блок, чтобы AI точнее подобрал задачи, функции и будущие компетенции.",
                location: "Параметры профиля → Место в структуре",
                targetKey: setAnalysisTarget(structureValue || structure, "analysis_structure_missing"),
                action: {
                    type: "focus_target",
                    label: "Перейти к месту в структуре"
                }
            });
        }

        if (!goals.length) {
            items.push({
                id: "analysis_goals_missing",
                type: "critical",
                title: "Цель не добавлена",
                description: "После выбора должности и места в структуре добавьте цель, а затем раскройте её через задачу и функцию.",
                location: "Первый этап → Общие положения и функционал",
                targetKey: setAnalysisTarget(document.getElementById("add-goal-btn") || document.getElementById("functional-content"), "analysis_goals_missing"),
                suggestedText: "Минимальный ручной контекст для продолжения: добавленная цель, одна задача внутри цели и хотя бы одна выбранная функция.",
                action: {
                    type: "custom",
                    label: "Добавить цель, задачу и функции"
                }
            });
        }

        goals.forEach((goal, goalIndex) => {
            const goalNameWrapper = goal.querySelector(".col-goal-name");
            const goalNameTrigger = goal.querySelector(".goal-name-text");
            const goalName = isFilledTrigger(goalNameTrigger) ? getTriggerValue(goalNameTrigger) : "";
            const goalLabel = goalName || `Цель ${goalIndex + 1}`;
            const tasks = Array.from(goal.querySelectorAll(".task-body tr"));

            if (!goalName) {
                items.push({
                    id: `analysis_goal_${goalIndex}_missing_name`,
                    type: "critical",
                    title: "Цель не выбрана",
                    description: "Цель задает верхнеуровневый смысл профиля и нужна для дальнейшего анализа.",
                    location: `Цель ${goalIndex + 1}`,
                    targetKey: setAnalysisTarget(goalNameWrapper, `analysis_goal_${goalIndex}_missing_name`),
                    suggestedValue: "Обеспечение анализа и развития бизнес-процессов",
                    originalValue: goalName
                });
            }

            if (!tasks.length) {
                items.push({
                    id: `analysis_goal_${goalIndex}_missing_tasks`,
                    type: "critical",
                    title: "У цели нет задачи",
                    description: "Добавьте хотя бы одну задачу, чтобы AI смог оценить операционный контекст.",
                    location: goalLabel,
                    targetKey: setAnalysisTarget(goal, `analysis_goal_${goalIndex}_missing_tasks`),
                    suggestedText: `Добавьте задачу, которая раскрывает цель «${goalLabel}» через конкретный операционный результат.`,
                    action: {
                        type: "custom",
                        label: "Добавить задачу для этой цели"
                    }
                });
            }

            tasks.forEach((task, taskIndex) => {
                const taskNameWrapper = task.querySelector(".col-task-name-wrapper");
                const taskNameTrigger = task.querySelector(".task-name-text");
                const taskName = isFilledTrigger(taskNameTrigger) ? getTriggerValue(taskNameTrigger) : "";
                const taskLabel = taskName || `Задача ${taskIndex + 1}`;
                const participationInput = task.querySelector(".task-participation-input");
                const functionRows = Array.from(task.querySelectorAll(".function-row-item"));
                const selectedFunctionRows = functionRows.filter((row) => {
                    const trigger = row.querySelector(".col-select-name .custom-select-trigger");
                    return isFilledTrigger(trigger);
                });

                if (!taskName) {
                    items.push({
                        id: `analysis_goal_${goalIndex}_task_${taskIndex}_missing_name`,
                        type: "critical",
                        title: "Задача не выбрана",
                        description: "Задача является локальным контекстом для функций и будущих компетенций.",
                        location: `${goalLabel} → Задача ${taskIndex + 1}`,
                        targetKey: setAnalysisTarget(taskNameWrapper, `analysis_goal_${goalIndex}_task_${taskIndex}_missing_name`),
                        suggestedValue: "Сбор и анализ требований заинтересованных сторон",
                        originalValue: taskName
                    });
                }

                if (participationInput && !participationInput.value.trim()) {
                    items.push({
                        id: `analysis_goal_${goalIndex}_task_${taskIndex}_missing_participation`,
                        type: "warning",
                        title: "Не указана доля участия",
                        description: "Доля участия помогает понять приоритет задачи в профиле должности.",
                        location: `${goalLabel} → ${taskLabel}`,
                        targetKey: setAnalysisTarget(participationInput, `analysis_goal_${goalIndex}_task_${taskIndex}_missing_participation`),
                        suggestedValue: "40%",
                        originalValue: participationInput.value.trim()
                    });
                }

                if (!selectedFunctionRows.length) {
                    items.push({
                        id: `analysis_goal_${goalIndex}_task_${taskIndex}_missing_function`,
                        type: "critical",
                        title: "У задачи нет выбранной функции",
                        description: `Начните с функции, которая описывает конкретное действие внутри задачи «${taskLabel}». Хотя бы одна функция нужна как точка опоры для подбора компетенций.`,
                        location: `${goalLabel} → ${taskLabel}`,
                        targetKey: setAnalysisTarget(task, `analysis_goal_${goalIndex}_task_${taskIndex}_missing_function`),
                        action: {
                            type: "custom",
                            label: "Подобрать функции для задачи"
                        }
                    });
                } else if (selectedFunctionRows.length < 5) {
                    items.push({
                        id: `analysis_goal_${goalIndex}_task_${taskIndex}_few_functions`,
                        type: "warning",
                        title: "Недостаточная глубина декомпозиции",
                        description: `Сейчас выбрано ${selectedFunctionRows.length} функций. По методологии лучше раскрывать задачу через 5 и более функций.`,
                        location: `${goalLabel} → ${taskLabel}`,
                        targetKey: setAnalysisTarget(task, `analysis_goal_${goalIndex}_task_${taskIndex}_few_functions`),
                        suggestedText: `Раскройте задачу «${taskLabel}» до 5+ функций: сбор данных, анализ, подготовка решения, согласование и сопровождение изменений.`,
                        action: {
                            type: "custom",
                            label: "Добавить функции до 5+"
                        }
                    });
                }

                selectedFunctionRows.forEach((row, functionIndex) => {
                    const wrapper = row.querySelector(".col-select-name");
                    const trigger = row.querySelector(".col-select-name .custom-select-trigger");
                    const value = trigger ? trigger.textContent.trim() : "";
                    const suggestion = makeFunctionSuggestion(value);

                    if (suggestion) {
                        items.push({
                            id: `analysis_goal_${goalIndex}_task_${taskIndex}_function_${functionIndex}_verb`,
                            type: "recommendation",
                            title: "Функцию лучше сформулировать глаголом",
                            description: "Функции читаются методологически чище, когда начинаются с действия.",
                            location: `${goalLabel} → ${taskLabel} → Функция ${functionIndex + 1}`,
                            targetKey: setAnalysisTarget(wrapper, `analysis_goal_${goalIndex}_task_${taskIndex}_function_${functionIndex}_verb`),
                            suggestedValue: suggestion,
                            originalValue: value
                        });
                    }
                });
            });
        });

        if (canAnalyzeCompetencies) {
            const missingCompetencySections = getCompetenciesCompletion().filter((section) => !section.isFilled);
            missingCompetencySections.forEach((section) => {
                const competencyAction = getCompetencySectionRecommendationAction(section.id, competencies || {});
                items.push({
                    id: `analysis_competencies_missing_${section.id}`,
                    type: "recommendation",
                    title: `Не заполнен раздел «${section.label}»`,
                    description: "AI может заполнить этот раздел на основе цели, задачи и функций первого этапа.",
                    location: `Ключевые компетенции → ${section.label}`,
                    targetKey: setAnalysisTarget(section.accordion || document.getElementById("stage-competencies"), `analysis_competencies_missing_${section.id}`),
                    suggestedText: `Раздел «${section.label}» лучше заполнить после анализа функций первого этапа, чтобы требования не были оторваны от реальной работы.`,
                    action: competencyAction
                });
            });

            if (competencies) {
                if ((competencies.softSkills || []).length > 8) {
                    items.push({
                        id: "analysis_soft_skills_limit",
                        type: "critical",
                        title: "Превышен лимит Soft Skills",
                        description: "В профиле не должно быть больше 8 soft skills. Оставьте только компетенции, которые критически влияют на выполнение функций должности.",
                        location: "Ключевые компетенции → Компетенции",
                        targetKey: setAnalysisTarget(document.getElementById("soft-skills-accordion"), "analysis_soft_skills_limit"),
                        action: {
                            type: "focus_target",
                            label: "Перейти к списку Soft Skills"
                        }
                    });
                }

                if ((competencies.softSkills || []).length > 0 && (competencies.softSkills || []).length <= 8) {
                    items.push({
                        id: "analysis_soft_skills_relevance",
                        type: "recommendation",
                        title: "Проверьте связь Soft Skills с функциями",
                        description: "Soft Skills должны объяснять способ выполнения работы, а не быть универсальным набором качеств.",
                        location: "Ключевые компетенции → Компетенции",
                        targetKey: setAnalysisTarget(document.getElementById("soft-skills-accordion"), "analysis_soft_skills_relevance"),
                        suggestedText: "Оставьте только те soft skills, которые реально помогают выполнять выбранные функции первого этапа."
                    });
                }

                if ((competencies.hardSkills || []).length > 0 && (competencies.hardSkills || []).length <= 6) {
                    const hasSqlSkill = (competencies.hardSkills || []).includes("SQL (PostgreSQL, MySQL)");
                    items.push({
                        id: "analysis_hard_skills_match",
                        type: "recommendation",
                        title: "Проверьте соответствие Hard Skills функциям",
                        description: "Профессиональные навыки должны подтверждаться задачами и функциями профиля.",
                        location: "Ключевые компетенции → Профессиональные знания и навыки",
                        targetKey: setAnalysisTarget(document.getElementById("hard-skills-accordion"), "analysis_hard_skills_match"),
                        suggestedText: hasSqlSkill
                            ? "Текущий набор навыков выглядит связанным с аналитическими функциями первого этапа."
                            : "Для аналитического профиля часто полезно добавить навык работы с SQL.",
                        action: hasSqlSkill ? null : {
                            type: "apply_competency_value",
                            section: "hardSkills",
                            mode: "add",
                            value: "SQL (PostgreSQL, MySQL)",
                            label: "Добавить «SQL (PostgreSQL, MySQL)»"
                        }
                    });
                }

                const languageWithoutLevel = (competencies.languages || []).find((language) => !language.level);
                if (languageWithoutLevel) {
                    items.push({
                        id: "analysis_language_level_missing",
                        type: "warning",
                        title: "Не указан уровень языка",
                        description: `Для языка «${languageWithoutLevel.name}» нужно выбрать уровень владения, например B1 или B2.`,
                        location: "Ключевые компетенции → Иностранные языки",
                        targetKey: setAnalysisTarget(document.getElementById("lang-skills-accordion"), "analysis_language_level_missing"),
                        suggestedText: `Для языка «${languageWithoutLevel.name}» чаще всего достаточно указать рабочий уровень B1/B2, если нет специальных требований к переговорам.`,
                        action: {
                            type: "apply_competency_value",
                            section: "languages",
                            mode: "set_level",
                            language: languageWithoutLevel.name,
                            level: "B1",
                            label: `Установить «${languageWithoutLevel.name} B1»`
                        }
                    });
                } else if ((competencies.languages || []).length > 0) {
                    items.push({
                        id: "analysis_languages_cefr",
                        type: "recommendation",
                        title: "Проверьте уровень языка по CEFR",
                        description: "Уровень языка лучше выбирать по рабочим сценариям: чтение документации, переписка, встречи или переговоры.",
                        location: "Ключевые компетенции → Иностранные языки",
                        targetKey: setAnalysisTarget(document.getElementById("lang-skills-accordion"), "analysis_languages_cefr"),
                        suggestedText: "Если язык нужен только для чтения документации, обычно достаточно B1. Для встреч и согласований чаще нужен B2."
                    });
                }

                if ((competencies.hardSkills || []).length > 6) {
                    const extraHardSkill = (competencies.hardSkills || [])[competencies.hardSkills.length - 1];
                    items.push({
                        id: "analysis_hard_skills_overloaded",
                        type: "recommendation",
                        title: "Профессиональных навыков слишком много",
                        description: "Лучше оставить наиболее существенные навыки, которые прямо связаны с функциями должности.",
                        location: "Ключевые компетенции → Профессиональные знания и навыки",
                        targetKey: setAnalysisTarget(document.getElementById("hard-skills-accordion"), "analysis_hard_skills_overloaded"),
                        suggestedText: "Сократите список до навыков, которые прямо подтверждаются задачами и функциями первого этапа.",
                        action: extraHardSkill ? {
                            type: "apply_competency_value",
                            section: "hardSkills",
                            mode: "remove",
                            removeValue: extraHardSkill,
                            label: `Удалить «${extraHardSkill}»`
                        } : null
                    });
                }

                if ((competencies.technologies || []).length > 0) {
                    const hasJira = (competencies.technologies || []).includes("Jira");
                    items.push({
                        id: "analysis_technologies_match",
                        type: "recommendation",
                        title: "Проверьте прикладное ПО",
                        description: "ПО должно быть связано с инструментами, которые используются при выполнении функций.",
                        location: "Ключевые компетенции → Знание ПО",
                        targetKey: setAnalysisTarget(document.getElementById("soft-tech-accordion"), "analysis_technologies_match"),
                        suggestedText: hasJira
                            ? "Проверьте, действительно ли все выбранные инструменты регулярно используются в задачах должности."
                            : "Для задач с требованиями и сопровождением изменений часто нужен инструмент управления задачами.",
                        action: hasJira ? null : {
                            type: "apply_competency_value",
                            section: "technologies",
                            mode: "add",
                            value: "Jira",
                            label: "Добавить «Jira»"
                        }
                    });
                }

                if ((competencies.education || []).length > 0 || (competencies.experience || []).length > 0) {
                    items.push({
                        id: "analysis_education_experience_balance",
                        type: "recommendation",
                        title: "Проверьте баланс образования и опыта",
                        description: "Требования к образованию и опыту не должны быть выше, чем реально требуется для выполнения функций.",
                        location: "Ключевые компетенции → Образование и опыт",
                        targetKey: setAnalysisTarget(document.getElementById("exp-skills-accordion") || document.getElementById("edu-skills-accordion"), "analysis_education_experience_balance"),
                        suggestedText: "Если должность не требует редкой экспертизы, лучше не завышать требования к стажу и образованию."
                    });
                }
            }
        }

        return { items: splitMixedAnalysisItems(items), empty: false };
    };

    const startAnalysis = ({ activate = true } = {}) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        window.clearTimeout(analysisTimer);
        const runToken = nextAsyncRunToken();
        const nextState = {
            analysisStatus: "loading",
            analysisItems: [],
            analysisEmpty: false,
            analysisLastRunAt: new Date().toISOString()
        };

        if (activate) {
            nextState.activeTab = "analysis";
        }

        stateApi.setState(nextState);
        renderAndBind();

        analysisTimer = window.setTimeout(() => {
            if (!isAsyncRunCurrent(runToken) || !stateApi.getState().isOpen) return;
            const result = buildAnalysisResult();
            stateApi.setState({
                analysisStatus: "done",
                analysisItems: result.items,
                analysisEmpty: result.empty,
                analysisLastRunAt: new Date().toISOString()
            });
            renderAndBind();
        }, 3000);
    };

    const setActiveTab = (tab) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const nextTab = normalizeTab(tab);

        if (nextTab === "analysis") {
            const state = stateApi.getState();
            if (state.analysisStatus === "loading") {
                stateApi.setState({ activeTab: "analysis" });
                renderAndBind();
                return;
            }

            if (
                state.analysisStatus === "done" &&
                (state.analysisEmpty || (state.analysisItems || []).length > 0)
            ) {
                stateApi.setState({ activeTab: "analysis" });
                renderAndBind();
                return;
            }
            startAnalysis();
            return;
        }

        stateApi.setState({ activeTab: nextTab });
        clearAnalysisMarkers();
        renderAndBind();
    };

    const handleTabClick = (event) => {
        const button = event.target.closest(".profile-ai-tab");
        if (!button || !button.closest("#profile-ai-assistant-drawer")) return;

        event.preventDefault();
        event.stopPropagation();
        setActiveTab(button.dataset.aiTab || "analysis");
    };

    const updateDraft = (value) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        const activeTab = state.activeTab || "analysis";
        const drafts = {
            ...(state.drafts || {}),
            [activeTab]: value
        };

        const patch = {
            drafts,
            draft: activeTab === "chat" ? value : state.draft
        };

        stateApi.setState(patch);
    };

    const clearActiveDraft = () => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        const activeTab = state.activeTab || "analysis";
        stateApi.setState({
            drafts: {
                ...(state.drafts || {}),
                [activeTab]: ""
            },
            draft: activeTab === "chat" ? "" : state.draft
        });
    };

    const open = () => {
        getStateApi().setState({ isOpen: true });
        renderAndBind();
    };

    const close = () => {
        clearAsyncOperations();
        getStateApi().setState({ isOpen: false });
        renderAndBind();
    };

    const toggle = () => {
        const stateApi = getStateApi();
        const nextOpen = !stateApi.getState().isOpen;
        if (!nextOpen) {
            clearAsyncOperations();
        }
        stateApi.setState({ isOpen: nextOpen });
        renderAndBind();
    };

    const buildAiResponse = (userText) => {
        const stageText = document.getElementById("stage-competencies")?.classList.contains("active")
            ? "этапе ключевых компетенций"
            : "этапе общих положений и функционала";
        const lowerText = userText.toLowerCase();

        if (lowerText.includes("задач") && lowerText.includes("функц") && lowerText.includes("отлич")) {
            return {
                text: "Задача описывает результат, который должна обеспечить должность. Функция описывает конкретное действие внутри этой задачи. Проще: задача отвечает на вопрос «что нужно обеспечить?», а функция - «что именно делает сотрудник, чтобы это обеспечить?»",
                actions: []
            };
        }

        if (lowerText.includes("вес") || lowerText.includes("дол") || lowerText.includes("100")) {
            return {
                text: "Веса задач лучше распределять как оценку регулярной нагрузки и значимости для должности. В сумме задачи должны давать 100%. Если задача критична для роли и занимает основную часть работы, ей стоит дать больший вес. Если задача вспомогательная или эпизодическая, вес должен быть ниже.",
                actions: []
            };
        }

        if (lowerText.includes("глагол")) {
            return {
                text: "Функции лучше писать глаголами, потому что функция фиксирует действие сотрудника. Формулировка «анализ требований» звучит как область работы, а «анализировать требования» уже показывает конкретное действие, которое можно оценивать, проверять и связывать с компетенциями.",
                actions: []
            };
        }

        if (lowerText.includes("soft") || lowerText.includes("софт")) {
            return {
                text: "Уровень Soft Skills лучше выбирать по тому, насколько навык влияет на выполнение функций. Если навык нужен редко, достаточно базового уровня. Если он регулярно влияет на результат задачи, выбирайте средний или высокий уровень. Для ключевых управленческих и коммуникационных функций уровень должен быть выше.",
                actions: []
            };
        }

        if (lowerText.includes("связ") && lowerText.includes("компет")) {
            return {
                text: "Компетенции стоит связывать с функциями через реальную работу. Hard Skills отвечают за профессиональные знания и инструменты, которые нужны для выполнения функций. Soft Skills отвечают за способ выполнения: коммуникацию, самостоятельность, работу с неопределенностью, управление конфликтами и принятие решений.",
                actions: []
            };
        }

        if (lowerText.includes("цель") || lowerText.includes("задач") || lowerText.includes("функц")) {
            return {
                text: `На ${stageText} я бы проверил три вещи:\n* есть ли у каждой цели измеримые задачи;\n* заполнена ли доля участия;\n* есть ли у каждой задачи хотя бы одна функция с ролью и маркировкой ИИ.`,
                actions: []
            };
        }

        if (lowerText.includes("компетен")) {
            return {
                text: "Для компетенций лучше связывать требования с уже описанными функциями: soft skills отвечают за способ выполнения работы, hard skills - за инструменты и профессиональные знания.",
                actions: []
            };
        }

        return {
            text: `Я вижу, что вы на ${stageText}. Могу помочь сформулировать профиль, проверить полноту заполнения или предложить связку целей, задач, функций и компетенций.`,
            actions: []
        };
    };

    const sendMessage = () => {
        const input = document.getElementById("profile-ai-input");
        const stateApi = getStateApi();
        const renderApi = getRenderApi();
        if (!input || !stateApi || !renderApi) return;

        const text = input.value.trim();
        if (!text) return;

        stateApi.addMessage({
            id: `profile_ai_user_${Date.now()}`,
            sender: "user",
            timestamp: new Date().toISOString(),
            text,
            actions: []
        });
        clearActiveDraft();
        renderAndBind();

        const typing = document.getElementById("profile-ai-typing");
        if (typing) typing.style.display = "flex";
        renderApi.scrollToBottom();

        window.setTimeout(() => {
            const response = buildAiResponse(text);
            stateApi.addMessage({
                id: `profile_ai_answer_${Date.now()}`,
                sender: "ai",
                timestamp: new Date().toISOString(),
                text: response.text,
                actions: response.actions
            });
            renderAndBind();
        }, 700);
    };

    const handleChatQuestionClick = (event) => {
        const button = event.target.closest(".profile-ai-chat-question-btn");
        const input = document.getElementById("profile-ai-input");
        if (!button || !input) return;

        const question = button.dataset.chatQuestion || "";
        if (!question) return;

        input.value = question;
        updateDraft(question);
        sendMessage();
    };

    const handleActionClick = (event) => {
        const button = event.target.closest(".profile-ai-action-btn");
        const stateApi = getStateApi();
        if (!button || !stateApi) return;

        const actionId = button.dataset.actionId || "";
        const responseText = actionId === "action_review_profile_draft"
            ? "Проверю текущую структуру профиля: обязательные поля, цели, задачи, функции и заполнение компетенций. Сейчас это демонстрационный режим, поэтому я показываю подсказку без изменения формы."
            : "Принял действие. В дальнейшем по этой кнопке можно будет применять предложения помощника к форме профиля.";

        stateApi.addMessage({
            id: `profile_ai_action_${Date.now()}`,
            sender: "ai",
            timestamp: new Date().toISOString(),
            text: responseText,
            actions: []
        });
        renderAndBind();
    };

    const getAnalysisTargetStage = (target) => {
        if (!target) return "";
        if (
            target.id === "stage-competencies" ||
            target.closest("#competencies-content") ||
            target.matches("#soft-skills-accordion, #hard-skills-accordion, #lang-skills-accordion, #soft-tech-accordion, #cert-skills-accordion, #extra-permits-accordion, #edu-skills-accordion, #exp-skills-accordion, #func-area-accordion")
        ) {
            return "competencies";
        }

        if (
            target.id === "stage-functional" ||
            target.id === "functional-content" ||
            target.id === "add-goal-btn" ||
            target.closest("#functional-content")
        ) {
            return "functional";
        }

        return "";
    };

    const navigateToAnalysisTargetStage = (target) => {
        const stage = getAnalysisTargetStage(target);
        if (!stage) return false;

        if (stage === "competencies" && !getFirstStageStatus().hasMinimumContext) {
            return false;
        }

        const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
        if (contextApi && typeof contextApi.navigateToStage === "function") {
            return contextApi.navigateToStage(stage) !== false;
        }

        const stageCard = document.getElementById(stage === "competencies" ? "stage-competencies" : "stage-functional");
        if (stageCard && (stage !== "competencies" || !stageCard.classList.contains("disabled"))) {
            stageCard.click();
            return true;
        }

        return false;
    };

    const scrollToAnalysisTarget = (targetKey, shouldNavigateStage = true) => {
        if (!targetKey) return;
        const target = document.querySelector(`[data-ai-analysis-target="${escapeCssIdent(targetKey)}"]`);
        if (!target) return;

        const targetStage = getAnalysisTargetStage(target);
        if (shouldNavigateStage && targetStage === "competencies" && !getFirstStageStatus().hasMinimumContext) {
            return;
        }

        if (shouldNavigateStage && navigateToAnalysisTargetStage(target)) {
            window.setTimeout(() => {
                syncAnalysisMarkers();
                scrollToAnalysisTarget(targetKey, false);
            }, 80);
            return;
        }

        const refreshedTarget = document.querySelector(`[data-ai-analysis-target="${escapeCssIdent(targetKey)}"]`);
        const host = getAnalysisMarkerHost(refreshedTarget);
        if (!host) return;

        host.scrollIntoView({ behavior: "smooth", block: "center" });
        host.classList.add("is-highlighted");
        window.setTimeout(() => {
            host.classList.remove("is-highlighted");
        }, 1300);
    };

    const updateAnalysisItem = (itemId, patch) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        const items = (state.analysisItems || []).map((item) => (
            item.id === itemId ? { ...item, ...patch } : item
        ));
        stateApi.setState({ analysisItems: items });
        renderAndBind();
    };

    const getAnalysisItemTargetTrigger = (item) => {
        if (!item || !item.targetKey) return null;
        const target = document.querySelector(`[data-ai-analysis-target="${escapeCssIdent(item.targetKey)}"]`);
        if (!target) return null;

        if (target.matches("input, textarea, select")) return target;
        if (target.matches(".goal-name-text, .task-name-text, .custom-select-trigger")) return target;
        return target.querySelector(".goal-name-text, .task-name-text, .custom-select-trigger, input, textarea, select");
    };

    const setTargetValue = (target, value) => {
        if (!target) return;

        if (target.matches("input, textarea")) {
            target.value = value;
            target.dispatchEvent(new Event("input", { bubbles: true }));
            target.dispatchEvent(new Event("change", { bubbles: true }));
            return;
        }

        if (target.matches("select")) {
            target.value = value;
            target.dispatchEvent(new Event("change", { bubbles: true }));
            return;
        }

        target.textContent = value;
        target.dataset.value = value;
        target.classList.remove("is-placeholder");
        target.closest(".is-placeholder")?.classList.remove("is-placeholder");
    };

    const getTargetValue = (target) => {
        if (!target) return "";
        if (target.matches("input, textarea, select")) return target.value.trim();
        return (target.dataset.value || target.textContent || "").trim();
    };

    const applyAnalysisSuggestion = (itemId) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        const item = (state.analysisItems || []).find((entry) => entry.id === itemId);
        if (!item) return;

        const target = getAnalysisItemTargetTrigger(item);
        if (!target || !item.suggestedValue) return;

        const originalValue = Object.prototype.hasOwnProperty.call(item, "originalValue")
            ? item.originalValue
            : getTargetValue(target);
        setTargetValue(target, item.suggestedValue);
        target.classList.remove("error-field");
        target.closest(".custom-select-wrapper, .col-select-name, .col-task-name-wrapper, .goal-name-wrapper")?.classList.remove("error-field");
        updateAnalysisItem(itemId, {
            status: "done",
            originalValue,
            appliedValue: item.suggestedValue,
            undoLabel: "Вернуть предыдущее значение"
        });

        const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
        if (contextApi && typeof contextApi.refreshFunctionalStage === "function") {
            contextApi.refreshFunctionalStage();
        }
    };

    const refreshAnalysisResult = () => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const result = buildAnalysisResult();
        stateApi.setState({
            activeTab: "analysis",
            analysisStatus: "done",
            analysisItems: result.items,
            analysisEmpty: result.empty,
            analysisLastRunAt: new Date().toISOString()
        });
        renderAndBind();
    };

    const isCompetenciesAnalysisItem = (item = {}) => {
        const location = String(item.location || "");
        const id = String(item.id || "");
        const targetKey = String(item.targetKey || "");

        return location.includes("Ключевые компетенции") ||
            id.includes("competencies") ||
            id.includes("soft_skills") ||
            id.includes("hard_skills") ||
            id.includes("language") ||
            id.includes("technologies") ||
            id.includes("education") ||
            targetKey.includes("competencies") ||
            targetKey.includes("soft_skills") ||
            targetKey.includes("hard_skills") ||
            targetKey.includes("language") ||
            targetKey.includes("technologies") ||
            targetKey.includes("education");
    };

    const setTriggerValue = (trigger, value) => {
        if (!trigger || !value) return;
        trigger.textContent = value;
        trigger.dataset.value = value;
        trigger.classList.remove("is-placeholder");
        trigger.closest(".custom-select-wrapper, .col-task-name-wrapper, .goal-name-wrapper")?.classList.remove("error-field");
    };

    const getAnalysisTargetElement = (item) => {
        if (!item || !item.targetKey) return null;
        return document.querySelector(`[data-ai-analysis-target="${escapeCssIdent(item.targetKey)}"]`);
    };

    const getFunctionDraftsForTask = (taskName = "") => {
        const normalized = String(taskName || "").toLowerCase();

        if (normalized.includes("требован") || normalized.includes("анализ")) {
            return [
                { name: "Проводить интервью с заказчиками и пользователями", ai: "Текстовый", influence: "20%", role: "Исполняет" },
                { name: "Анализировать бизнес-требования и ограничения процесса", ai: "Аналитический", influence: "35%", role: "Исполняет" },
                { name: "Формировать описание целевого процесса и критерии приемки", ai: "Текстовый", influence: "30%", role: "Исполняет" },
                { name: "Согласовывать требования с заинтересованными сторонами", ai: "Не используется", influence: "", role: "Согласует" },
                { name: "Проверять полноту требований перед передачей в реализацию", ai: "Аналитический", influence: "25%", role: "Исполняет" }
            ];
        }

        return [
            { name: "Собирать исходные данные для выполнения задачи", ai: "Текстовый", influence: "15%", role: "Исполняет" },
            { name: "Анализировать ограничения и риски выполнения задачи", ai: "Аналитический", influence: "25%", role: "Исполняет" },
            { name: "Подготавливать варианты решения по задаче", ai: "Текстовый", influence: "25%", role: "Исполняет" },
            { name: "Согласовывать решение с заинтересованными сторонами", ai: "Не используется", influence: "", role: "Согласует" },
            { name: "Сопровождать внедрение согласованного решения", ai: "Аналитический", influence: "20%", role: "Исполняет" }
        ];
    };

    const appendFunctionsToTask = (taskRow, taskName = "") => {
        if (!taskRow) return { applied: false, addedNames: [] };

        const listContainer = taskRow.querySelector(".functions-list-container");
        const pasteButton = taskRow.querySelector(".btn-paste-function-row");
        if (!listContainer || !pasteButton) return { applied: false, addedNames: [] };

        const existingNames = new Set(
            Array.from(listContainer.querySelectorAll(".function-row-item .col-select-name .custom-select-trigger"))
                .map((trigger) => trigger.dataset.value || trigger.textContent || "")
                .map((value) => value.trim())
                .filter((value) => value && value !== "Выберите функцию")
        );
        const validRowsCount = existingNames.size;
        const drafts = getFunctionDraftsForTask(taskName);
        const neededCount = Math.max(1, 5 - validRowsCount);
        let addedCount = 0;
        const addedNames = [];

        drafts
            .filter((draft) => !existingNames.has(draft.name))
            .slice(0, neededCount)
            .forEach((draft) => {
                window.copiedFunction = draft;
                pasteButton.click();
                addedCount += 1;
                addedNames.push(draft.name);
                existingNames.add(draft.name);
            });

        return { applied: addedCount > 0, addedNames };
    };

    const applyTaskActionToWorkspace = (item) => {
        const target = getAnalysisTargetElement(item);
        if (!target) return { applied: false };

        const goalCard = target.closest(".goal-card") || (target.matches(".goal-card") ? target : null);
        const taskRow = target.closest("tr");

        if (item.id && item.id.includes("_missing_tasks") && goalCard) {
            const addTaskButton = goalCard.querySelector(".btn-add-task");
            const taskBody = goalCard.querySelector(".task-body");
            if (!addTaskButton || !taskBody) return { applied: false };

            addTaskButton.click();
            const createdTask = taskBody.querySelector("tr:last-child");
            if (!createdTask) return { applied: false };

            const taskName = "Сбор и анализ требований заинтересованных сторон";
            setTriggerValue(createdTask.querySelector(".task-name-text"), taskName);
            setTriggerValue(createdTask.querySelector(".col-task-role .custom-select-trigger"), "Исполняет");

            const participationInput = createdTask.querySelector(".task-participation-input");
            if (participationInput && !participationInput.value.trim()) {
                participationInput.value = "50%";
                participationInput.dispatchEvent(new Event("input", { bubbles: true }));
                participationInput.dispatchEvent(new Event("change", { bubbles: true }));
            }

            appendFunctionsToTask(createdTask, taskName);
            const undoKey = `analysis_created_task_${Date.now()}`;
            createdTask.dataset.aiUndoKey = undoKey;
            return {
                applied: true,
                appliedValue: taskName,
                undoAction: {
                    type: "remove_created_task",
                    undoKey
                }
            };
        }

        if (taskRow && item.id && (item.id.includes("_missing_function") || item.id.includes("_few_functions"))) {
            const taskNameTrigger = taskRow.querySelector(".task-name-text");
            const taskName = isFilledTrigger(taskNameTrigger) ? getTriggerValue(taskNameTrigger) : "";
            const result = appendFunctionsToTask(taskRow, taskName);
            return {
                applied: result.applied,
                appliedValue: result.addedNames.join(", "),
                undoAction: {
                    type: "remove_added_functions",
                    targetKey: item.targetKey,
                    functionNames: result.addedNames
                }
            };
        }

        return { applied: false };
    };

    const applyAnalysisActionToWorkspace = (item) => {
        const taskActionResult = applyTaskActionToWorkspace(item);
        if (taskActionResult.applied) {
            const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
            if (contextApi && typeof contextApi.refreshFunctionalStage === "function") {
                contextApi.refreshFunctionalStage();
            }
            return taskActionResult;
        }

        return { applied: false };
    };

    const getCompetencyActionAppliedValue = (action = {}) => {
        if (action.mode === "remove") return action.removeValue || action.value || action.language || "";
        if (action.mode === "replace") return `${action.removeValue || ""} → ${action.addValue || action.value || ""}`;
        if (action.section === "languages") return `${action.language || action.value || ""} ${action.level || action.addValue || ""}`.trim();
        return action.value || action.addValue || action.language || "";
    };

    const buildCompetencyUndoAction = (action = {}, before = {}) => {
        if (action.section === "languages") {
            const languageName = action.language || action.value;
            const previousLanguage = (before.languages || []).find((language) => language.name === languageName);
            if (!previousLanguage) {
                return {
                    type: "apply_competency_value",
                    section: "languages",
                    mode: "remove",
                    language: languageName,
                    label: `Удалить «${languageName}»`
                };
            }

            return {
                type: "apply_competency_value",
                section: "languages",
                mode: "set_level",
                language: languageName,
                level: previousLanguage.level || null,
                label: `Вернуть уровень «${languageName}»`
            };
        }

        if (action.mode === "remove") {
            return {
                type: "apply_competency_value",
                section: action.section,
                mode: "add",
                value: action.removeValue || action.value,
                label: `Вернуть «${action.removeValue || action.value}»`
            };
        }

        if (action.mode === "replace") {
            return {
                type: "apply_competency_value",
                section: action.section,
                mode: "replace",
                removeValue: action.addValue || action.value,
                addValue: action.removeValue,
                label: "Вернуть предыдущее значение"
            };
        }

        return {
            type: "apply_competency_value",
            section: action.section,
            mode: "remove",
            removeValue: action.value || action.addValue,
            label: `Удалить «${action.value || action.addValue}»`
        };
    };

    const markAnalysisActionDone = (itemId, result = {}) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        const items = (state.analysisItems || []).map((item) => (
            item.id === itemId
                ? {
                    ...item,
                    status: "done",
                    appliedValue: result.appliedValue || (item.action && item.action.label) || "Действие выполнено",
                    undoAction: result.undoAction || item.undoAction || null,
                    undoLabel: result.undoLabel || "Вернуть предыдущее значение"
                }
                : item
        ));
        stateApi.setState({ analysisItems: items });
    };

    const runAnalysisCardAction = (itemId, options = {}) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        const item = (state.analysisItems || []).find((entry) => entry.id === itemId);
        if (!item || !item.action) return;

        if (item.action.type === "apply_competency_value") {
            const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
            if (contextApi && typeof contextApi.applyCompetencyRecommendationAction === "function") {
                const before = contextApi && typeof contextApi.getCompetenciesState === "function"
                    ? contextApi.getCompetenciesState()
                    : {};
                const applied = contextApi.applyCompetencyRecommendationAction(item.action);
                if (applied) {
                    markAnalysisActionDone(itemId, {
                        appliedValue: getCompetencyActionAppliedValue(item.action),
                        undoAction: buildCompetencyUndoAction(item.action, before)
                    });
                    if (!options.deferRefresh) {
                        renderAndBind();
                    }
                }
            }
            return;
        }

        if (item.action.type === "custom") {
            const result = applyAnalysisActionToWorkspace(item);
            if (result.applied) {
                markAnalysisActionDone(itemId, result);
                if (!options.deferRefresh) {
                    renderAndBind();
                }
            }
            return;
        }

        if (item.action.type === "focus_target") {
            scrollToAnalysisTarget(item.targetKey || "");
        }
    };

    const runAnalysisGroupActions = (groupType) => {
        const stateApi = getStateApi();
        if (!stateApi || !groupType) return;

        const state = stateApi.getState();
        const items = (state.analysisItems || []).filter((item) => (
            item.type === groupType &&
            item.status !== "done" &&
            item.action
        ));
        if (!items.length) return;

        const executableItems = items.filter((item) => (
            item.action.type === "custom" ||
            item.action.type === "apply_competency_value"
        ));
        const firstStageItems = executableItems.filter((item) => !isCompetenciesAnalysisItem(item));
        const competenciesItems = executableItems.filter((item) => isCompetenciesAnalysisItem(item));
        const firstStageItemsToRun = firstStageItems;

        firstStageItemsToRun.forEach((item) => {
            runAnalysisCardAction(item.id, { deferRefresh: true });
        });

        competenciesItems.forEach((item) => {
            runAnalysisCardAction(item.id, { deferRefresh: true });
        });

        if (!firstStageItemsToRun.length && !competenciesItems.length) {
            const firstNavigationItem = items.find((item) => item.action.type === "focus_target");
            if (firstNavigationItem) {
                scrollToAnalysisTarget(firstNavigationItem.targetKey || "");
            }
            return;
        }

        renderAndBind();
    };

    const undoAnalysisSuggestion = (itemId) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        const item = (state.analysisItems || []).find((entry) => entry.id === itemId);
        if (!item || !Object.prototype.hasOwnProperty.call(item, "originalValue")) return;

        const target = getAnalysisItemTargetTrigger(item);
        if (!target) return;

        setTargetValue(target, item.originalValue);
        const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
        if (contextApi && typeof contextApi.refreshFunctionalStage === "function") {
            contextApi.refreshFunctionalStage();
        }
        updateAnalysisItem(itemId, {
            status: "pending",
            appliedValue: "",
            undoAction: null,
            undoLabel: ""
        });
    };

    const markAnalysisActionPending = (itemId) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        const items = (state.analysisItems || []).map((item) => (
            item.id === itemId
                ? {
                    ...item,
                    status: "pending",
                    appliedValue: "",
                    undoAction: null,
                    undoLabel: ""
                }
                : item
        ));
        stateApi.setState({ analysisItems: items });
    };

    const removeFunctionsFromTask = (item, functionNames = []) => {
        if (!item || !item.targetKey || !functionNames.length) return false;
        const target = getAnalysisTargetElement(item);
        const taskRow = target ? target.closest("tr") : null;
        if (!taskRow) return false;

        let changed = false;
        taskRow.querySelectorAll(".function-row-item").forEach((row) => {
            const trigger = row.querySelector(".col-select-name .custom-select-trigger");
            const name = (trigger && (trigger.dataset.value || trigger.textContent || "").trim()) || "";
            if (functionNames.includes(name)) {
                row.remove();
                changed = true;
            }
        });

        return changed;
    };

    const resetFirstStageGeneratedDraft = (undoAction = {}) => {
        document.querySelectorAll('#goals-container .goal-card[data-ai-generated="profile-ai"]').forEach((card) => card.remove());

        if (undoAction.resetPosition) {
            const position = document.getElementById("param-position");
            const classifier = document.getElementById("param-classifier");
            const okz = document.getElementById("param-okz");
            if (position) position.value = "";
            if (classifier) classifier.value = "";
            if (okz) okz.value = "";
        }

        if (undoAction.resetStructure) {
            const structure = document.getElementById("param-structure");
            const treeValue = document.getElementById("param-structure-value");
            if (structure) structure.value = "";
            if (treeValue) {
                treeValue.textContent = "Выберите подразделение";
                treeValue.classList.add("is-placeholder");
            }
        }

        return true;
    };

    const undoAppliedAnalysisAction = (itemId, options = {}) => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        const item = (state.analysisItems || []).find((entry) => entry.id === itemId);
        if (!item) return;

        if (!item.undoAction && Object.prototype.hasOwnProperty.call(item, "originalValue")) {
            undoAnalysisSuggestion(itemId);
            return;
        }

        let changed = false;
        const undoAction = item.undoAction || {};

        if (undoAction.type === "apply_competency_value") {
            const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
            if (contextApi && typeof contextApi.applyCompetencyRecommendationAction === "function") {
                changed = contextApi.applyCompetencyRecommendationAction(undoAction);
            }
        }

        if (undoAction.type === "remove_added_functions") {
            changed = removeFunctionsFromTask(item, undoAction.functionNames || []);
        }

        if (undoAction.type === "remove_created_task") {
            const task = document.querySelector(`tr[data-ai-undo-key="${escapeCssIdent(undoAction.undoKey || "")}"]`);
            if (task) {
                task.remove();
                changed = true;
            }
        }

        if (undoAction.type === "remove_ai_generated_first_stage") {
            changed = resetFirstStageGeneratedDraft(undoAction);
        }

        if (undoAction.type === "reset_competencies") {
            const resetButton = document.getElementById("reset-competencies-btn");
            if (resetButton) {
                resetButton.click();
                changed = true;
            }
        }

        const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
        if (contextApi && typeof contextApi.refreshFunctionalStage === "function") {
            contextApi.refreshFunctionalStage();
        }

        if (changed) {
            markAnalysisActionPending(itemId);
            if (!options.deferRender) {
                renderAndBind();
            }
        }
    };

    const undoAnalysisGroupActions = (groupType) => {
        const stateApi = getStateApi();
        if (!stateApi || !groupType) return;

        const state = stateApi.getState();
        (state.analysisItems || [])
            .filter((item) => (
                item.type === groupType &&
                item.status === "done" &&
                (
                    item.undoAction ||
                    Object.prototype.hasOwnProperty.call(item, "originalValue")
                )
            ))
            .forEach((item) => undoAppliedAnalysisAction(item.id, { deferRender: true }));

        renderAndBind();
    };

    const syncManualAnalysisCompletion = () => {
        const stateApi = getStateApi();
        if (!stateApi) return;

        const state = stateApi.getState();
        if (state.activeTab !== "analysis" || state.analysisStatus !== "done") return;

        let hasChanges = false;
        const items = (state.analysisItems || []).map((item) => {
            if (!item.suggestedValue || !item.targetKey) {
                return item;
            }

            const target = getAnalysisItemTargetTrigger(item);
            const currentValue = getTargetValue(target);
            if (!currentValue) return item;

            if (currentValue === item.suggestedValue && item.status !== "done") {
                hasChanges = true;
                return {
                    ...item,
                    status: "done",
                    originalValue: Object.prototype.hasOwnProperty.call(item, "originalValue")
                        ? item.originalValue
                        : "",
                    appliedValue: item.suggestedValue
                };
            }

            if (item.status === "done" && item.appliedValue && currentValue !== item.appliedValue) {
                hasChanges = true;
                return {
                    ...item,
                    status: "pending",
                    appliedValue: ""
                };
            }

            return item;
        });

        if (hasChanges) {
            stateApi.setState({ analysisItems: items });
            renderAndBind();
        }
    };

    const handleAnalysisCardClick = (event) => {
        if (event.target.closest("[data-analysis-action]")) return;

        const card = event.target.closest(".profile-ai-analysis-card");
        if (!card) return;
        scrollToAnalysisTarget(card.dataset.analysisTarget || "");
    };

    const toggleAnalysisGroup = (groupId) => {
        const stateApi = getStateApi();
        if (!stateApi || !groupId) return;

        const state = stateApi.getState();
        const collapsedGroups = {
            ...(state.analysisCollapsedGroups || {})
        };

        collapsedGroups[groupId] = !collapsedGroups[groupId];
        stateApi.setState({ analysisCollapsedGroups: collapsedGroups });
        renderAndBind();
    };

    const handleAnalysisAction = (event) => {
        const button = event.target.closest("[data-analysis-action]");
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const action = button.dataset.analysisAction;
        if (action === "apply_suggestion") {
            applyAnalysisSuggestion(button.dataset.analysisId || "");
            return;
        }

        if (action === "run_action") {
            runAnalysisCardAction(button.dataset.analysisId || "");
            return;
        }

        if (action === "focus_group") {
            scrollToAnalysisTarget(button.dataset.analysisTarget || "");
            return;
        }

        if (action === "run_group_actions") {
            runAnalysisGroupActions(button.dataset.analysisGroup || "");
            return;
        }

        if (action === "undo_group_actions") {
            undoAnalysisGroupActions(button.dataset.analysisGroup || "");
            return;
        }

        if (action === "toggle_group") {
            toggleAnalysisGroup(button.dataset.analysisGroup || "");
            return;
        }

        if (action === "undo_suggestion" || action === "undo_action") {
            undoAppliedAnalysisAction(button.dataset.analysisId || "");
        }
    };

    const bindResize = () => {
        const handle = document.getElementById("profile-ai-resize-handle");
        const drawer = document.getElementById("profile-ai-assistant-drawer");
        const stateApi = getStateApi();
        if (!handle || !drawer || !stateApi) return;

        let isResizing = false;

        const onMove = (event) => {
            if (!isResizing) return;
            const nextWidth = Math.max(320, Math.min(800, window.innerWidth - event.clientX));
            drawer.style.width = `${nextWidth}px`;
            stateApi.setState({ width: nextWidth });
        };

        const onUp = () => {
            isResizing = false;
            document.body.classList.remove("profile-ai-resizing");
            handle.classList.remove("is-active");
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        handle.addEventListener("mousedown", (event) => {
            isResizing = true;
            document.body.classList.add("profile-ai-resizing");
            handle.classList.add("is-active");
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
            event.preventDefault();
        });
    };

    const bindDrawerEvents = () => {
        const closeBtn = document.getElementById("profile-ai-close-btn");
        const input = document.getElementById("profile-ai-input");
        const sendBtn = document.getElementById("profile-ai-send-btn");
        const analysisStartBtn = document.getElementById("profile-ai-analysis-start-btn");
        const stateApi = getStateApi();

        if (closeBtn) closeBtn.addEventListener("click", close);
        if (sendBtn) sendBtn.addEventListener("click", sendMessage);
        if (analysisStartBtn) analysisStartBtn.addEventListener("click", startAnalysis);
        document.querySelectorAll(".profile-ai-tab").forEach((button) => {
            button.addEventListener("click", handleTabClick);
        });
        document.querySelectorAll(".profile-ai-action-btn").forEach((button) => {
            button.addEventListener("click", handleActionClick);
        });
        document.querySelectorAll(".profile-ai-chat-question-btn").forEach((button) => {
            button.addEventListener("click", handleChatQuestionClick);
        });
        document.querySelectorAll(".profile-ai-analysis-card").forEach((card) => {
            card.addEventListener("click", handleAnalysisCardClick);
        });
        document.querySelectorAll("[data-analysis-action]").forEach((button) => {
            button.addEventListener("click", handleAnalysisAction);
        });
        if (input && stateApi) {
            input.addEventListener("input", () => {
                updateDraft(input.value);
            });
            input.addEventListener("keydown", (event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            });
        }

        bindResize();
    };

    const observeStageChanges = () => {
        const renderApi = getRenderApi();
        const stages = [
            document.getElementById("stage-functional"),
            document.getElementById("stage-competencies")
        ].filter(Boolean);

        stages.forEach((stage) => {
            const observer = new MutationObserver(() => {
                if (renderApi) renderApi.updateContext();
            });
            observer.observe(stage, { attributes: true, attributeFilter: ["class"] });
        });
    };

    document.addEventListener("DOMContentLoaded", () => {
        const trigger = document.getElementById("btn-profile-ai-assistant");
        if (trigger) trigger.addEventListener("click", toggle);
        document.addEventListener("click", handleTabClick, true);
        document.addEventListener("input", () => {
            window.setTimeout(syncManualAnalysisCompletion, 0);
        });
        document.addEventListener("change", () => {
            window.setTimeout(syncManualAnalysisCompletion, 0);
        });
        document.addEventListener("click", (event) => {
            if (event.target.closest("#profile-ai-assistant-drawer")) return;
            window.setTimeout(syncManualAnalysisCompletion, 120);
        });

        renderAndBind();
        observeStageChanges();

        window.openProfileAIAssistant = open;
        window.closeProfileAIAssistant = close;
        window.toggleProfileAIAssistant = toggle;
    });
})();
