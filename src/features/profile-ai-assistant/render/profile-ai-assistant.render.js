(function () {
    const app = window.HRProfileApp || {};

    const TABS = [
        {
            id: "generation",
            label: "Генерация",
            title: "Создать структуру профиля",
            badge: "Может изменить профиль после подтверждения",
            tone: "action"
        },
        {
            id: "analysis",
            label: "Анализ",
            title: "Проверить качество заполнения",
            badge: "Показывает индикации в рабочей области",
            tone: "analysis"
        },
        {
            id: "chat",
            label: "Чат",
            title: "Спросить по методологии",
            badge: "Только консультация",
            tone: "safe"
        }
    ];

    const CHAT_QUICK_QUESTIONS = [
        "Чем задача отличается от функции?",
        "Как правильно распределить веса задач?",
        "Почему функции лучше писать глаголами?",
        "Как выбрать уровень Soft Skills?",
        "Как связать компетенции с функциями?"
    ];

    const escapeHtml = (value) => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const getCurrentStageId = () => {
        const competenciesStage = document.getElementById("stage-competencies");
        return competenciesStage && competenciesStage.classList.contains("active")
            ? "competencies"
            : "functional";
    };

    const getCurrentStageLabel = () => {
        return getCurrentStageId() === "competencies"
            ? "Ключевые компетенции"
            : "Общие положения и функционал";
    };

    const getSelectedOptionText = (select) => {
        if (!select || select.selectedIndex < 0) return "";
        const option = select.options[select.selectedIndex];
        if (!option || option.disabled || !option.value) return "";
        return option.textContent.trim();
    };

    const getFirstStageStatus = () => {
        const contextApi = (window.HRProfileApp || {}).profileCreateStageContext;
        if (!contextApi || typeof contextApi.getFirstStageStatus !== "function") {
            return {
                paramsValid: false,
                hasNamedGoal: false,
                hasNamedTask: false,
                hasSelectedFunction: false,
                hasMinimumContext: false
            };
        }

        return contextApi.getFirstStageStatus();
    };

    const getGenerationContext = () => {
        const positionSelect = document.getElementById("param-position");
        const structureValue = document.getElementById("param-structure-value");
        const structureSelect = document.getElementById("param-structure");
        const position = getSelectedOptionText(positionSelect);
        const structureText = structureValue && !structureValue.classList.contains("is-placeholder")
            ? structureValue.textContent.trim()
            : getSelectedOptionText(structureSelect);

        return {
            stageId: getCurrentStageId(),
            stageLabel: getCurrentStageLabel(),
            position,
            structure: structureText,
            firstStageStatus: getFirstStageStatus()
        };
    };

    const getActiveTab = (state) => TABS.find((tab) => tab.id === state.activeTab) || TABS[0];

    const getDraft = (state) => {
        const activeTab = getActiveTab(state).id;
        if (activeTab === "generation" || activeTab === "chat") {
            return (state.drafts && state.drafts[activeTab]) || "";
        }
        return "";
    };

    const parseMarkdown = (text) => {
        let html = escapeHtml(text);
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/`(.*?)`/g, "<code class=\"profile-ai-inline-code\">$1</code>");
        html = html.replace(/^\* (.*?)$/gm, "<li>$1</li>");
        html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => `<ul>${match.replace(/\n/g, "")}</ul>`);
        html = html.replace(/\n/g, "<br>");
        return html;
    };

    const getDayKey = (timestamp) => {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return "unknown";
        return [date.getFullYear(), date.getMonth(), date.getDate()].join("-");
    };

    const getDateLabel = (timestamp) => {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return "Дата не указана";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const target = new Date(date);
        target.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (target.getTime() === today.getTime()) return "Сегодня";
        if (target.getTime() === yesterday.getTime()) return "Вчера";

        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const renderActions = (actions = []) => {
        if (!actions.length) return "";

        return `
            <div class="profile-ai-message-actions">
                ${actions.map((action) => `
                    <button class="profile-ai-action-btn" type="button" data-action-id="${escapeHtml(action.id)}">
                        ${escapeHtml(action.label)}
                    </button>
                `).join("")}
            </div>
        `;
    };

    const getChatWelcomeMessage = () => ({
        id: "profile_ai_chat_welcome",
        sender: "ai",
        timestamp: new Date().toISOString(),
        text: "Я отвечаю на вопросы по методологии профилирования и текущему профилю. В этой вкладке я только консультирую и не изменяю значения формы.",
        actions: [],
        isWelcome: true
    });

    const renderChatQuestions = () => `
        <div class="profile-ai-chat-questions" aria-label="Быстрые вопросы">
            ${CHAT_QUICK_QUESTIONS.map((question) => `
                <button class="profile-ai-chat-question-btn" type="button" data-chat-question="${escapeHtml(question)}">
                    ${escapeHtml(question)}
                </button>
            `).join("")}
        </div>
    `;

    const renderMessages = (messages, options = {}) => {
        let previousDayKey = "";

        return messages.map((message) => {
            const dayKey = getDayKey(message.timestamp);
            const separator = dayKey !== previousDayKey
                ? `<div class="profile-ai-date-separator"><span>${escapeHtml(getDateLabel(message.timestamp))}</span></div>`
                : "";
            previousDayKey = dayKey;

            const isUser = message.sender === "user";
            const senderName = isUser ? "Вы" : "ИИ-Помощник";
            const time = new Date(message.timestamp).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit"
            });

            return `
                ${separator}
                <div class="profile-ai-message-row ${isUser ? "is-user" : "is-ai"}">
                    ${isUser ? "" : "<div class=\"profile-ai-avatar\">ИИ</div>"}
                    <div class="profile-ai-message-content">
                        <div class="profile-ai-message-meta">
                            <span>${senderName}</span>
                            <span>${time}</span>
                        </div>
                        <div class="profile-ai-bubble">
                            ${parseMarkdown(message.text)}
                        </div>
                        ${message.isWelcome ? renderChatQuestions() : ""}
                        ${message.isGenerationWelcome ? (options.generationPrompts || "") : ""}
                        ${renderActions(message.actions)}
                    </div>
                </div>
            `;
        }).join("");
    };

    const renderSegmentedControl = (state) => {
        const activeTab = getActiveTab(state).id;

        return `
            <nav class="profile-ai-tabs" aria-label="Режимы ИИ-помощника">
                ${TABS.map((tab) => `
                    <button
                        class="profile-ai-tab ${tab.id === activeTab ? "is-active" : ""}"
                        type="button"
                        data-ai-tab="${tab.id}"
                        aria-selected="${tab.id === activeTab}"
                    >
                        ${escapeHtml(tab.label)}
                    </button>
                `).join("")}
            </nav>
        `;
    };

    const renderModeIntro = (tab, description) => `
        <section class="profile-ai-mode-intro profile-ai-mode-intro--${tab.tone}">
            <div>
                <span class="profile-ai-mode-kicker">${escapeHtml(tab.label)}</span>
                <h4>${escapeHtml(tab.title)}</h4>
                <p>${escapeHtml(description)}</p>
            </div>
            <span class="profile-ai-mode-badge">${escapeHtml(tab.badge)}</span>
        </section>
    `;

    const getGenerationPrompts = (context) => {
        const isCompetenciesStage = context.stageId === "competencies";
        const positionText = (context.position || "").toLowerCase();

        if (isCompetenciesStage) {
            return [
                "Подобрать компетенции на основе задач и функций первого этапа",
                "Сформировать требования к Hard Skills и ПО",
                "Предложить Soft Skills без перегрузки профиля"
            ];
        }

        if (context.firstStageStatus && context.firstStageStatus.hasMinimumContext) {
            return [
                "Подобрать ключевые компетенции на основе текущей цели, задачи и функции",
                "Заполнить второй этап, не переходя из текущего экрана",
                "Сгенерировать альтернативный вариант первого этапа",
                "Доработать функции первого этапа и сохранить текущий контекст"
            ];
        }

        if (positionText.includes("аналитик")) {
            return [
                `Сгенерировать стандартный профиль для должности «${context.position}»`,
                `Сформировать задачи и функции ${context.position} с фокусом на сбор и анализ требований`,
                `Подготовить профиль ${context.position} для ${context.structure || "целевого подразделения"}`,
                "Добавить функции по взаимодействию с заказчиками и документацией"
            ];
        }

        if (positionText.includes("программист") || positionText.includes("разработчик")) {
            return [
                `Сгенерировать профиль для должности «${context.position}»`,
                "Сформировать задачи разработки, тестирования и поддержки решений",
                "Добавить функции по code review, CI/CD и технической документации",
                "Подготовить профиль с учетом командной разработки"
            ];
        }

        if (positionText.includes("руководитель") || positionText.includes("менеджер")) {
            return [
                `Сгенерировать управленческий профиль для должности «${context.position}»`,
                "Сформировать цели, задачи и функции управления командой",
                "Добавить функции контроля сроков, ресурсов и качества результата",
                `Подготовить профиль для ${context.structure || "проектного или функционального блока"}`
            ];
        }

        if (positionText.includes("дизайнер")) {
            return [
                `Сгенерировать профиль для должности «${context.position}»`,
                "Сформировать задачи исследования, проектирования и проверки интерфейсов",
                "Добавить функции работы с дизайн-системой и прототипами",
                "Подготовить профиль с фокусом на продуктовую команду"
            ];
        }

        if (positionText) {
            return [
                `Сгенерировать профиль для должности «${context.position}»`,
                `Сформировать цели, задачи и функции для ${context.structure || "выбранного подразделения"}`,
                "Добавить типовые функции и роли участия",
                "Подготовить структуру профиля для последующего анализа"
            ];
        }

        const prompts = isCompetenciesStage
            ? []
            : [
                "Сгенерировать профиль системного аналитика",
                "Сформировать цели, задачи и функции для HR-бизнес-партнера",
                "Создать структуру профиля руководителя проектов",
                "Подготовить функционал для backend-разработчика Java"
            ];

        return prompts;
    };

    const renderPromptChips = (context) => {
        const prompts = getGenerationPrompts(context);

        return `
            <div class="profile-ai-chat-questions" aria-label="Быстрые сценарии генерации">
                ${prompts.map((prompt) => `
                    <button class="profile-ai-chat-question-btn profile-ai-generation-scenario-btn" type="button">
                        ${escapeHtml(prompt)}
                    </button>
                `).join("")}
            </div>
        `;
    };

    const renderAILoaderState = ({ title, description, variant = "generation" }) => `
        <section class="profile-ai-ai-loader-state is-${escapeHtml(variant)}" role="status" aria-live="polite">
            <div class="profile-ai-star-loader" aria-hidden="true">
                <svg viewBox="0 0 120 120" focusable="false">
                    <path class="profile-ai-star profile-ai-star--main" d="M60 18L68.5 49.5L100 58L68.5 66.5L60 98L51.5 66.5L20 58L51.5 49.5L60 18Z"></path>
                    <path class="profile-ai-star profile-ai-star--left" d="M29 22L33.2 37.8L49 42L33.2 46.2L29 62L24.8 46.2L9 42L24.8 37.8L29 22Z"></path>
                    <path class="profile-ai-star profile-ai-star--right" d="M94 12L98 26L112 30L98 34L94 48L90 34L76 30L90 26L94 12Z"></path>
                    <path class="profile-ai-star profile-ai-star--bottom" d="M92 72L96.8 89.2L114 94L96.8 98.8L92 116L87.2 98.8L70 94L87.2 89.2L92 72Z"></path>
                </svg>
            </div>
            <div class="profile-ai-loader-copy">
                <b>${escapeHtml(title)}</b>
                <p>${escapeHtml(description)}</p>
            </div>
        </section>
    `;

    const getGenerationWelcomeMessage = () => ({
        id: "profile_ai_generation_welcome",
        sender: "ai",
        timestamp: new Date().toISOString(),
        text: "Могу подготовить структуру профиля по быстрому сценарию или по вашему описанию. Выберите сценарий ниже либо напишите запрос в поле сообщения.",
        actions: [],
        isGenerationWelcome: true
    });

    const renderGenerationMessages = (context, messages = []) => {
        const allMessages = [getGenerationWelcomeMessage(), ...(messages || [])];

        return `
            <div class="profile-ai-messages profile-ai-generation-messages">
                ${renderMessages(allMessages, { generationPrompts: renderPromptChips(context) })}
            </div>
        `;
    };

    const renderGenerationContent = (state) => {
        const tab = TABS.find((item) => item.id === "generation");
        const context = getGenerationContext();
        const isCompetenciesStage = context.stageId === "competencies";
        const isCompetenciesGeneration = isCompetenciesStage || state.generationMode === "competencies";
        const description = isCompetenciesStage
            ? "На этом этапе генерация должна опираться на уже заполненные задачи и функции, чтобы подобрать компетенции и требования."
            : "Опишите должность свободным текстом или выберите готовый сценарий. AI подготовит структуру профиля для формы.";
        const loadingTitle = isCompetenciesGeneration
            ? "AI подбирает ключевые компетенции"
            : "AI формирует структуру профиля";
        const loadingDescription = isCompetenciesGeneration
            ? "Сейчас будут заполнены все аккордеоны второго этапа: компетенции, навыки, ПО, языки, образование, опыт и направления."
            : "Сейчас появятся цель, задачи и функции для первого этапа.";

          return `
              <div class="profile-ai-panel-body profile-ai-panel-body--generation">
                  ${renderGenerationMessages(context, state.generationMessages)}
                  ${state.generationStatus === "loading" ? renderAILoaderState({
                      title: loadingTitle,
                      description: loadingDescription,
                      variant: "generation"
                  }) : ""}
              </div>
          `;
      };

    const renderAnalysisLoader = () => `
        ${renderAILoaderState({
            title: "AI анализирует профиль",
            description: "Проверяю контекст, обязательные поля, структуру функций и заполнение компетенций.",
            variant: "analysis"
        })}
    `;

    const renderAnalysisEmpty = () => `
        <section class="profile-ai-analysis-preview profile-ai-analysis-empty">
            <div class="profile-ai-analysis-state-icon">
                <i data-lucide="file-search"></i>
            </div>
            <h4>Пока нечего анализировать</h4>
            <p>Для полезной проверки нужен минимальный контекст: должность, место в структуре, цель, задача и хотя бы одна функция.</p>
            <button class="profile-ai-analysis-to-generation" type="button" data-analysis-action="switch_generation">
                Перейти к генерации
            </button>
        </section>
    `;

    const renderAnalysisComplete = () => `
        <section class="profile-ai-analysis-preview profile-ai-analysis-complete">
            <div class="profile-ai-analysis-state-icon">
                <i data-lucide="check-circle-2"></i>
            </div>
            <h4>Критичных замечаний не найдено</h4>
            <p>Профиль выглядит достаточно полным для текущего состояния прототипа. Можно продолжать уточнение вручную или перейти к генерации.</p>
        </section>
    `;

    const getAnalysisGroups = () => {
        const modelGroups = (((window.HRProfileApp || {}).profileAIAnalysisCardModel || {}).GROUPS || {});
        const fallbackGroups = {
            CRITICAL: {
                id: "critical",
                type: "critical",
                title: "Критические ошибки",
                description: "Блокируют переход дальше",
                priority: 10
            },
            WARNING: {
                id: "warning",
                type: "warning",
                title: "Предупреждения",
                description: "Влияют на качество заполнения",
                priority: 20
            },
            RECOMMENDATION: {
                id: "recommendation",
                type: "recommendation",
                title: "Рекомендации",
                description: "Помогают обогатить профиль",
                priority: 30
            },
            SUCCESS: {
                id: "success",
                type: "success",
                title: "Исправлено",
                description: "Замечания, которые уже закрыты",
                priority: 40
            }
        };

        return Object.values(Object.keys(modelGroups).length ? modelGroups : fallbackGroups)
            .sort((left, right) => (left.priority || 999) - (right.priority || 999));
    };

    const getAnalysisItemGroupType = (item) => {
        if (item.status === "done" && item.type === "success") return "success";
        return item.type || "recommendation";
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

    const isConcreteRecommendationAction = (action = {}) => (
        action.type === "apply_competency_value" &&
        Boolean(action.label) &&
        Boolean(action.value || action.addValue || action.removeValue || action.language)
    );

    const hasRenderableAnalysisAction = (item = {}) => {
        if (!item.action || item.status === "done") return false;
        if (item.type === "recommendation") {
            return isConcreteRecommendationAction(item.action);
        }
        return item.action.type !== "focus_target";
    };

    const hasUndoableAnalysisAction = (item = {}) => (
        item.status === "done" && (
            item.undoAction ||
            Object.prototype.hasOwnProperty.call(item, "originalValue")
        )
    );

    const getAnalysisActionIcon = (action = {}) => {
        if (action.mode === "remove") return "trash-2";
        if (action.mode === "replace") return "replace";
        if (action.mode === "set_level") return "sliders-horizontal";
        return "plus";
    };

    const getAnalysisCardIcon = (item = {}) => {
        if (item.status === "done") return "check";
        if (item.type === "warning") return "triangle-alert";
        if (item.type === "critical") return "octagon-alert";
        return "sparkles";
    };

    const renderAnalysisCard = (item) => `
        <article
            class="profile-ai-analysis-card is-${escapeHtml(item.type || "recommendation")} ${item.status === "done" ? "is-done" : ""}"
            data-analysis-id="${escapeHtml(item.id)}"
            data-analysis-target="${escapeHtml(item.targetKey || "")}"
        >
            <div class="profile-ai-analysis-card-main">
                <div class="profile-ai-analysis-card-head">
                    <span class="profile-ai-analysis-indicator" aria-hidden="true">
                        <i data-lucide="${getAnalysisCardIcon(item)}"></i>
                    </span>
                    <h4>${escapeHtml(item.title)}</h4>
                </div>
                <p>${escapeHtml(item.description)}</p>
                ${item.suggestedValue && item.status !== "done" ? `
                    <button
                        class="profile-ai-analysis-callout is-value"
                        type="button"
                        data-analysis-action="apply_suggestion"
                        data-analysis-id="${escapeHtml(item.id)}"
                    >
                        <span class="profile-ai-analysis-callout-icon" aria-hidden="true">
                            <i data-lucide="lightbulb"></i>
                        </span>
                        <span class="profile-ai-analysis-callout-copy">
                            <strong>${escapeHtml(item.suggestedValue)}</strong>
                        </span>
                    </button>
                ` : ""}
                ${item.suggestedText && item.status !== "done" ? `
                    <div class="profile-ai-analysis-callout is-value is-suggestion-note">
                        <span class="profile-ai-analysis-callout-icon" aria-hidden="true">
                            <i data-lucide="lightbulb"></i>
                        </span>
                        <span class="profile-ai-analysis-callout-copy">
                            <strong>${escapeHtml(item.suggestedText)}</strong>
                        </span>
                    </div>
                ` : ""}
                ${hasRenderableAnalysisAction(item) ? `
                    <button
                        class="profile-ai-analysis-callout is-action"
                        type="button"
                        data-analysis-action="run_action"
                        data-analysis-id="${escapeHtml(item.id)}"
                    >
                        <span class="profile-ai-analysis-callout-icon" aria-hidden="true">
                            <i data-lucide="${getAnalysisActionIcon(item.action)}"></i>
                        </span>
                        <span class="profile-ai-analysis-callout-copy">
                            <strong>${escapeHtml(item.action.label)}</strong>
                        </span>
                    </button>
                ` : ""}
                ${hasUndoableAnalysisAction(item) ? `
                    <button
                        class="profile-ai-analysis-callout is-undo"
                        type="button"
                        data-analysis-action="undo_action"
                        data-analysis-id="${escapeHtml(item.id)}"
                    >
                        <span class="profile-ai-analysis-callout-icon" aria-hidden="true">
                            <i data-lucide="rotate-ccw"></i>
                        </span>
                        <span class="profile-ai-analysis-callout-copy">
                            <strong>${escapeHtml(item.undoLabel || "Вернуть предыдущее значение")}</strong>
                        </span>
                    </button>
                ` : ""}
            </div>
        </article>
    `;

    const renderAnalysisItems = (items = [], state = {}) => {
        if (!items.length) return renderAnalysisComplete();
        const collapsedGroups = state.analysisCollapsedGroups || {};
        const groupedItems = getAnalysisGroups()
            .map((group) => ({
                ...group,
                items: items.filter((item) => getAnalysisItemGroupType(item) === group.type)
            }))
            .filter((group) => group.items.length);

        return `
            <div class="profile-ai-analysis-list">
                ${groupedItems.map((group) => {
                    const firstActionItem = group.items.find(hasRenderableAnalysisAction);
                    const hasGroupFixAction = Boolean(firstActionItem);
                    const undoableItems = group.items.filter(hasUndoableAnalysisAction);
                    const actionCapableItems = group.items.filter((item) => hasRenderableAnalysisAction(item) || hasUndoableAnalysisAction(item));
                    const hasGroupUndoAction = actionCapableItems.length > 0 && undoableItems.length === actionCapableItems.length;
                    const isCollapsed = Boolean(collapsedGroups[group.id]);
                    return `
                        <section class="profile-ai-analysis-group is-${escapeHtml(group.type)} ${isCollapsed ? "is-collapsed" : ""}">
                            <div class="profile-ai-analysis-group-head">
                                <div class="profile-ai-analysis-group-copy">
                                    <strong>${escapeHtml(group.title)} · ${group.items.length}</strong>
                                    <span>${escapeHtml(group.description)}</span>
                                </div>
                                <div class="profile-ai-analysis-group-controls">
                                    ${hasGroupUndoAction ? `
                                        <button
                                            class="profile-ai-analysis-group-action is-undo"
                                            type="button"
                                            data-analysis-action="undo_group_actions"
                                            data-analysis-group="${escapeHtml(group.type)}"
                                            aria-label="Вернуть предыдущее значение"
                                            title="Вернуть предыдущее значение"
                                        >
                                            <i data-lucide="rotate-ccw"></i>
                                        </button>
                                    ` : hasGroupFixAction ? `
                                        <button
                                            class="profile-ai-analysis-group-action"
                                            type="button"
                                            data-analysis-action="run_group_actions"
                                            data-analysis-group="${escapeHtml(group.type)}"
                                            aria-label="Выполнить действия группы"
                                            title="Выполнить действия группы"
                                        >
                                            <i data-lucide="list-checks"></i>
                                        </button>
                                    ` : ""}
                                    <button
                                        class="profile-ai-analysis-group-toggle"
                                        type="button"
                                        data-analysis-action="toggle_group"
                                        data-analysis-group="${escapeHtml(group.id)}"
                                        aria-expanded="${isCollapsed ? "false" : "true"}"
                                        aria-label="${isCollapsed ? "Развернуть группу" : "Свернуть группу"}"
                                        title="${isCollapsed ? "Развернуть группу" : "Свернуть группу"}"
                                    >
                                        <i data-lucide="${isCollapsed ? "chevron-down" : "chevron-up"}"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="profile-ai-analysis-group-items">
                                ${isCollapsed ? "" : group.items.map(renderAnalysisCard).join("")}
                            </div>
                        </section>
                    `;
                }).join("")}
            </div>
        `;
    };

    const renderAnalysisContent = (state) => {
        const tab = TABS.find((item) => item.id === "analysis");
        const status = state.analysisStatus || "idle";
        const rawItems = state.analysisItems || [];
        const firstStageStatus = getFirstStageStatus();
        const items = firstStageStatus.hasMinimumContext
            ? rawItems
            : rawItems.filter((item) => !isCompetenciesAnalysisItem(item));
        const hasOnlyLockedCompetencyItems = rawItems.length > 0 && !items.length && !firstStageStatus.hasMinimumContext;
        const hasEmptyState = status === "done" && !items.length && (state.analysisEmpty || hasOnlyLockedCompetencyItems);

        return `
            <div class="profile-ai-panel-body profile-ai-panel-body--analysis">
                ${status === "loading" ? renderAnalysisLoader() : ""}
                ${hasEmptyState ? renderAnalysisEmpty() : ""}
                ${status !== "loading" && !hasEmptyState ? renderAnalysisItems(items, state) : ""}
            </div>
        `;
    };

    const renderChatContent = (state) => {
        const tab = TABS.find((item) => item.id === "chat");

        return `
            <div class="profile-ai-panel-body profile-ai-panel-body--chat">
                <div class="profile-ai-messages" id="profile-ai-messages">
                    ${renderMessages([getChatWelcomeMessage(), ...(state.messages || [])])}
                </div>
            </div>
        `;
    };

    const renderActiveContent = (state) => {
        const activeTab = getActiveTab(state).id;
        if (activeTab === "analysis") return renderAnalysisContent(state);
        if (activeTab === "chat") return renderChatContent(state);
        return renderGenerationContent(state);
    };

    const renderFooter = (state) => {
        const activeTab = getActiveTab(state);
        const draft = getDraft(state);

        if (activeTab.id === "analysis") {
            const isAnalyzing = state.analysisStatus === "loading";
            return `
                <footer class="profile-ai-footer profile-ai-footer--analysis">
                    <button class="profile-ai-analysis-start-btn" id="profile-ai-analysis-start-btn" type="button" ${isAnalyzing ? "disabled" : ""}>
                        ${escapeHtml(isAnalyzing ? "Проверяю профиль..." : "Запустить анализ заново")}
                    </button>
                </footer>
            `;
        }

        const isGeneration = activeTab.id === "generation";
        const isGenerating = state.generationStatus === "loading";
        const placeholder = isGeneration
            ? "Опишите профиль"
            : "Задайте вопрос";
        const ariaLabel = isGeneration ? "Сгенерировать структуру профиля" : "Отправить сообщение";

        return `
            <footer class="profile-ai-footer profile-ai-footer--${activeTab.id}">
                <div class="profile-ai-input-shell ${isGeneration ? "is-generation" : "is-chat"}">
                    <textarea id="profile-ai-input" rows="1" placeholder="${escapeHtml(placeholder)}" ${isGenerating ? "disabled" : ""}>${escapeHtml(draft)}</textarea>
                    <button class="profile-ai-submit-btn ${isGeneration ? "is-generation" : "is-chat"}" id="profile-ai-send-btn" type="button" aria-label="${escapeHtml(ariaLabel)}" ${isGenerating ? "disabled" : ""}>
                        <i data-lucide="${isGeneration ? "wand-sparkles" : "send"}"></i>
                    </button>
                </div>
            </footer>
        `;
    };

    const render = () => {
        const root = document.getElementById("profile-ai-assistant-root");
        const stateApi = app.profileAIAssistantState;
        if (!root || !stateApi) return;

        const state = stateApi.getState();
        const activeTab = getActiveTab(state);

        root.innerHTML = `
            <aside id="profile-ai-assistant-drawer" class="profile-ai-drawer is-${activeTab.id} ${state.isOpen ? "is-open" : ""}" style="width: ${Number(state.width) || 490}px;">
                <div class="profile-ai-resize-handle" id="profile-ai-resize-handle"></div>
                <div class="profile-ai-shell">
                    <header class="profile-ai-header">
                        <div class="profile-ai-title-block">
                            <span class="profile-ai-stars" aria-hidden="true">
                                <svg viewBox="0 0 24 24" focusable="false">
                                    <path d="M12 3.25l1.55 4.2a3.7 3.7 0 0 0 2.2 2.2L19.95 11l-4.2 1.55a3.7 3.7 0 0 0-2.2 2.2L12 18.95l-1.55-4.2a3.7 3.7 0 0 0-2.2-2.2L4.05 11l4.2-1.35a3.7 3.7 0 0 0 2.2-2.2L12 3.25Z"></path>
                                    <path d="M5.5 15.25l.55 1.5a1.5 1.5 0 0 0 .9.9l1.5.55-1.5.55a1.5 1.5 0 0 0-.9.9l-.55 1.5-.55-1.5a1.5 1.5 0 0 0-.9-.9l-1.5-.55 1.5-.55a1.5 1.5 0 0 0 .9-.9l.55-1.5Z"></path>
                                    <path d="M18.25 3.25l.45 1.2a1.25 1.25 0 0 0 .75.75l1.2.45-1.2.45a1.25 1.25 0 0 0-.75.75l-.45 1.2-.45-1.2a1.25 1.25 0 0 0-.75-.75l-1.2-.45 1.2-.45a1.25 1.25 0 0 0 .75-.75l.45-1.2Z"></path>
                                </svg>
                            </span>
                            <div class="profile-ai-title-copy">
                                <h3>ИИ-Помощник</h3>
                                <span id="profile-ai-context-text">Контекст: ${escapeHtml(getCurrentStageLabel())}</span>
                            </div>
                        </div>
                        <button class="profile-ai-close-btn" id="profile-ai-close-btn" type="button" aria-label="Закрыть AI-помощник">
                            <i data-lucide="x"></i>
                        </button>
                    </header>
                    ${renderSegmentedControl(state)}
                    <main class="profile-ai-content" id="profile-ai-content">
                        ${renderActiveContent(state)}
                    </main>
                    <div class="profile-ai-typing" id="profile-ai-typing" style="display: none;">
                        <span></span><span></span><span></span>
                        <b>Помощник думает...</b>
                    </div>
                    ${renderFooter(state)}
                </div>
            </aside>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    const scrollToBottom = () => {
        const list = document.getElementById("profile-ai-messages");
        if (list) list.scrollTop = list.scrollHeight;
    };

    const updateContext = () => {
        const context = document.getElementById("profile-ai-context-text");
        if (context) context.textContent = `Контекст: ${getCurrentStageLabel()}`;
    };

    app.profileAIAssistantRender = {
        render,
        scrollToBottom,
        updateContext
    };

    window.HRProfileApp = app;
})();
