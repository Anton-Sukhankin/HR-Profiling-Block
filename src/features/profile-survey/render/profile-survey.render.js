(function () {
    const app = window.HRProfileApp || {};

    const escapeHtml = (value = "") => String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const getAllFunctions = () => {
        const data = app.profileSurveyData || {};
        const state = app.profileSurveyState ? app.profileSurveyState.getState() : null;
        return [
            ...(state ? state.customFunctions : []),
            ...((data.functions || []))
        ];
    };

    const getSelectedFunction = () => {
        const state = app.profileSurveyState ? app.profileSurveyState.getState() : null;
        if (!state) return null;
        return getAllFunctions().find(item => item.id === state.answers.selectedFunctionId) || null;
    };

    const getOptionById = (items = [], id = "") => items.find(item => item.id === id) || null;

    const hasTypicalRoleCatalog = (selectedFunction) => Boolean(
        selectedFunction &&
        selectedFunction.hasTypicalRoles &&
        Array.isArray(selectedFunction.typicalRoles) &&
        selectedFunction.typicalRoles.length
    );

    const refreshSurveyIcons = () => {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
            requestAnimationFrame(() => {
                if (window.lucide && typeof window.lucide.createIcons === "function") {
                    window.lucide.createIcons();
                }
            });
        }
    };

    const surveyStageIconPaths = {
        briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
        target: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
        flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line>',
        route: '<circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7H6.5a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle>',
        "clock-3": '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16.5 12"></polyline>',
        "clipboard-check": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path>',
        "chevron-down": '<path d="m6 9 6 6 6-6"></path>',
        check: '<path d="M20 6 9 17l-5-5"></path>'
    };

    const renderSurveyStageIcon = (iconName, className = "") => `
        <svg class="profile-survey-stage-icon ${escapeHtml(className)}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            ${surveyStageIconPaths[iconName] || surveyStageIconPaths.briefcase}
        </svg>
    `;

    const surveySteps = [
        {
            title: "Выберите основную функцию должности",
            description: "Это обязательное поле определяет дальнейшие направления, типовые шаблоны и варианты заполнения профиля.",
            icon: "briefcase",
            iconClass: "survey-function"
        },
        {
            title: "Является ли должность руководящей?",
            description: "Если в подчинении закреплено структурное подразделение, система добавит управленческую задачу с весом 20%.",
            icon: "users",
            iconClass: "survey-leadership"
        },
        {
            title: "Какой ключевой результат должна обеспечивать должность?",
            description: "Выберите один вариант, который лучше всего отражает ожидаемый вклад роли.",
            icon: "target",
            iconClass: "survey-result"
        },
        {
            title: "Какая глобальная миссия роли ближе всего?",
            description: "Ответ повлияет на формулировку цели в карточке профиля.",
            icon: "flag",
            iconClass: "survey-goal"
        },
        {
            title: "Какой подход к работе характерен для должности?",
            description: "Ответ поможет подобрать релевантные soft skills.",
            icon: "route",
            iconClass: "survey-approach"
        },
        {
            title: "Какой функционал занимает большую часть времени?",
            description: "Ответ используется для распределения веса задач до 100%.",
            icon: "clock-3",
            iconClass: "survey-time"
        },
        {
            title: "Проверьте сводку перед применением",
            description: "Выбранные значения уже отображаются в основной форме. Проверьте результат и закройте опросник.",
            icon: "clipboard-check",
            iconClass: "survey-final"
        }
    ];

    const isSurveyStepComplete = (state, stepNumber) => {
        if (!state || !state.answers) return false;
        const answers = state.answers;
        if (stepNumber === 1) {
            const selectedFunction = getSelectedFunction();
            const hasBaseContext = Boolean(answers.selectedFunctionId && answers.selectedArea);
            if (!hasBaseContext) return false;
            if (!hasTypicalRoleCatalog(selectedFunction)) return true;
            if (state.surveyScenario === "typical") {
                return Boolean(answers.selectedTypicalRole && answers.selectedTypicalRole !== "none");
            }
            return state.surveyScenario === "nonTypical" && state.hasVisitedTypicalRoles && answers.selectedTypicalRole === "none";
        }
        if (stepNumber === 2) return Boolean(answers.leadership);
        if (stepNumber === 3) return Boolean(answers.result);
        if (stepNumber === 4) return Boolean(answers.goal);
        if (stepNumber === 5) return Boolean(answers.approach);
        if (stepNumber === 6) return Boolean(answers.time);
        return false;
    };

    const isSurveyReadyToApply = (state) => {
        if (!state || !state.answers) return false;
        const answers = state.answers;
        const hasBaseContext = Boolean(answers.selectedFunctionId && answers.selectedArea);
        if (!hasBaseContext) return false;

        if (state.surveyScenario === "typical") {
            return Boolean(answers.selectedTypicalRole && answers.selectedTypicalRole !== "none");
        }

        if (state.surveyScenario === "nonTypical") {
            return [1, 2, 3, 4, 5, 6].every(stepNumber => isSurveyStepComplete(state, stepNumber));
        }

        return false;
    };

    const shouldRenderSurveyStep = (state, stepNumber) => {
        if (stepNumber === 1 || stepNumber === surveySteps.length) return true;
        return state && state.surveyScenario === "nonTypical";
    };

    const isSurveyAccordionOpen = (state, stepNumber) => Boolean(state.openAccordions && state.openAccordions[String(stepNumber)]);

    const renderSelectField = ({
        label = "",
        value = "",
        placeholder = "",
        selectKey = "",
        required = false,
        disabled = false
    }) => `
        <label class="profile-survey-field-label">${escapeHtml(label)}${required ? ' <span>*</span>' : ''}</label>
        <div class="col-task-name-wrapper profile-survey-select-wrapper ${value ? '' : 'is-placeholder'} ${disabled ? 'is-disabled' : ''}" data-survey-select="${escapeHtml(selectKey)}" tabindex="${disabled ? '-1' : '0'}" aria-disabled="${disabled ? 'true' : 'false'}">
            <span class="task-name-text ${value ? '' : 'is-placeholder'}" data-placeholder="${escapeHtml(placeholder)}">${escapeHtml(value || placeholder)}</span>
            <i data-lucide="chevron-down" class="task-name-chevron"></i>
        </div>
    `;

    const renderTypicalRoles = (state, selectedFunction, disabled = false) => {
        if (!selectedFunction || !selectedFunction.hasTypicalRoles || !selectedFunction.typicalRoles.length) return '';
        const isManualRoleSelected = state.surveyScenario === "nonTypical" &&
            state.hasVisitedTypicalRoles &&
            state.answers.selectedTypicalRole === "none";
        return `
            <section class="profile-survey-typical-block ${disabled ? 'is-disabled' : ''}">
                <div class="profile-survey-block-title">Доступные готовые шаблоны должностей</div>
                <div class="profile-survey-typical-list">
                    <button class="profile-survey-radio-card ${isManualRoleSelected ? 'is-selected' : ''} has-radio" type="button" data-survey-typical-role="none" ${disabled ? 'disabled' : ''}>
                        <span class="profile-survey-radio-indicator"></span>
                        <span>
                            <strong>Не относится к типовым ролям</strong>
                            <small>Продолжить ручное прохождение опросника</small>
                        </span>
                    </button>
                    ${selectedFunction.typicalRoles.map(role => `
                        <button class="profile-survey-radio-card ${state.answers.selectedTypicalRole === role.id ? 'is-selected' : ''} has-radio" type="button" data-survey-typical-role="${escapeHtml(role.id)}" ${disabled ? 'disabled' : ''}>
                            <span class="profile-survey-radio-indicator"></span>
                            <span>
                                <strong>${escapeHtml(role.title)}</strong>
                                <small>${escapeHtml(role.description)}</small>
                            </span>
                        </button>
                    `).join('')}
                </div>
                ${state.surveyScenario === "typical" ? `
                    <div class="profile-survey-note profile-survey-note-info">
                        <i data-lucide="info"></i>
                        <span>Профиль будет сформирован по выбранному типовому шаблону. Вы можете проверить сводку или отказаться от шаблона.</span>
                    </div>
                ` : ''}
            </section>
        `;
    };

    const renderRadioChoiceCards = (items = [], selectedValue = "", attrName = "") => `
        <div class="profile-survey-typical-list profile-survey-choice-list">
            ${items.map(item => `
                <button class="profile-survey-radio-card ${selectedValue === item.id ? 'is-selected' : ''} has-radio" type="button" ${attrName}="${escapeHtml(item.id)}">
                    <span class="profile-survey-radio-indicator"></span>
                    <span>
                        <strong>${escapeHtml(item.title)}</strong>
                        ${item.description ? `<small>${escapeHtml(item.description)}</small>` : ''}
                    </span>
                </button>
            `).join('')}
        </div>
    `;

    const renderFunctionStepBody = (state) => {
        const selectedFunction = getSelectedFunction();
        return `
            ${renderSelectField({
                label: "Основная функция должности",
                value: selectedFunction ? selectedFunction.name : "",
                placeholder: "Выберите функцию",
                selectKey: "function",
                required: true
            })}

            ${renderSelectField({
                label: "Укажите конкретное функциональное направление",
                value: state.answers.selectedArea,
                placeholder: "Выберите направление",
                selectKey: "area",
                required: true
            })}

            ${renderTypicalRoles(state, selectedFunction, false)}
        `;
    };

    const renderLeadershipStepBody = (state) => `
        ${renderRadioChoiceCards([
            { id: 'yes', title: 'Да', description: 'Есть структурное подразделение в подчинении' },
            { id: 'no', title: 'Нет', description: 'Роль не является руководящей' }
        ], state.answers.leadership, 'data-survey-leadership')}
        ${state.answers.leadership === 'yes' ? `
            <div class="profile-survey-note profile-survey-note-info">
                <i data-lucide="sparkles"></i>
                <span>Будет добавлена задача «Управление операционной деятельностью» с весом 20%.</span>
            </div>
        ` : ''}
    `;

    const renderOptionStepBody = (state, config) => {
        const selectedValue = state.answers[config.answerKey];
        const radioAttr = `data-survey-${config.selectKey}`;
        return (config.items || []).length <= 5
            ? renderRadioChoiceCards(config.items || [], selectedValue, radioAttr)
            : renderSelectField({
                label: config.fieldLabel || config.title,
                value: ((config.items || []).find(item => item.id === selectedValue) || {}).title || "",
                placeholder: config.placeholder || "Выберите значение",
                selectKey: config.selectKey
            });
    };

    const buildSummary = (state) => {
        const data = app.profileSurveyData || {};
        const selectedFunction = getSelectedFunction();
        const selectedRole = selectedFunction && selectedFunction.typicalRoles
            ? selectedFunction.typicalRoles.find(role => role.id === state.answers.selectedTypicalRole)
            : null;
        const result = getOptionById(data.resultOptions, state.answers.result);
        const goal = getOptionById(data.goalOptions, state.answers.goal);
        const approach = getOptionById(data.approachOptions, state.answers.approach);
        const time = getOptionById(data.timeOptions, state.answers.time);
        return { selectedFunction, selectedRole, result, goal, approach, time };
    };

    const renderSummaryRow = (label, value) => {
        const hasValue = Boolean(value);
        return `
            <div>
                <span>${escapeHtml(label)}</span>
                <strong class="${hasValue ? 'is-filled' : 'is-empty'}">${escapeHtml(hasValue ? value : '-')}</strong>
            </div>
        `;
    };

    const renderFinalStepBody = (state) => {
        const summary = buildSummary(state);
        const shouldShowTypicalTemplate = state.surveyScenario === "typical" && summary.selectedRole;
        return `
            <div class="profile-survey-summary">
                ${renderSummaryRow('Функция', summary.selectedFunction ? summary.selectedFunction.name : '')}
                ${renderSummaryRow('Направление', state.answers.selectedArea)}
                ${shouldShowTypicalTemplate ? renderSummaryRow('Типовой шаблон', summary.selectedRole.title) : ''}
                ${renderSummaryRow('Цель', summary.goal ? summary.goal.title : '')}
                ${renderSummaryRow('Подход', summary.approach ? summary.approach.title : '')}
                ${renderSummaryRow('Фокус времени', summary.time ? summary.time.title : '')}
            </div>
            ${state.surveyScenario === "typical" ? `
                <button class="profile-survey-template-reset" type="button" data-survey-action="reject-template">
                    Типовой профиль не подходит
                </button>
            ` : ''}
        `;
    };

    const renderStepBody = (state, stepNumber) => {
        const data = app.profileSurveyData || {};
        if (stepNumber === 1) return renderFunctionStepBody(state);
        if (stepNumber === 2) return renderLeadershipStepBody(state);
        if (stepNumber === 3) return renderOptionStepBody(state, {
            title: surveySteps[2].title,
            items: data.resultOptions || [],
            answerKey: 'result',
            selectKey: 'result'
        });
        if (stepNumber === 4) return renderOptionStepBody(state, {
            title: surveySteps[3].title,
            items: data.goalOptions || [],
            answerKey: 'goal',
            selectKey: 'goal'
        });
        if (stepNumber === 5) return renderOptionStepBody(state, {
            title: surveySteps[4].title,
            items: data.approachOptions || [],
            answerKey: 'approach',
            selectKey: 'approach'
        });
        if (stepNumber === 6) return renderOptionStepBody(state, {
            title: surveySteps[5].title,
            items: data.timeOptions || [],
            answerKey: 'time',
            selectKey: 'time'
        });
        return renderFinalStepBody(state);
    };

    const renderSurveyAccordion = (state, step, stepNumber) => {
        const isOpen = isSurveyAccordionOpen(state, stepNumber);
        const isCompleted = isSurveyStepComplete(state, stepNumber);
        const layer = surveySteps.length - stepNumber + 1;
        return `
            <article class="stage-card profile-survey-stage-card profile-survey-accordion-card ${isOpen ? 'is-open' : ''} ${isCompleted ? 'is-completed' : ''}" data-survey-accordion="${stepNumber}" style="--survey-accordion-layer: ${layer};">
                <button class="profile-survey-accordion-header" type="button" data-survey-accordion-toggle="${stepNumber}" aria-expanded="${isOpen ? 'true' : 'false'}">
                    <div class="stage-icon-wrapper ${escapeHtml(step.iconClass)}">
                        ${renderSurveyStageIcon(isCompleted ? 'check' : step.icon, 'profile-survey-stage-icon-main')}
                        ${renderSurveyStageIcon('chevron-down', 'profile-survey-stage-icon-toggle')}
                    </div>
                    <div class="stage-info">
                        <span class="stage-label">${escapeHtml(step.title)}</span>
                        <p class="stage-desc">${escapeHtml(step.description)}</p>
                    </div>
                </button>
                <div class="profile-survey-accordion-body" ${isOpen ? '' : 'hidden'}>
                    ${renderStepBody(state, stepNumber)}
                </div>
            </article>
        `;
    };

    const renderSurveyFinalBlock = (state, step, stepNumber) => {
        const layer = surveySteps.length - stepNumber + 1;
        return `
            <article class="stage-card profile-survey-stage-card profile-survey-accordion-card profile-survey-final-block is-open is-static" data-survey-summary-block="${stepNumber}" style="--survey-accordion-layer: ${layer};">
                <div class="profile-survey-accordion-header" aria-expanded="true">
                    <div class="stage-icon-wrapper ${escapeHtml(step.iconClass)}">
                        ${renderSurveyStageIcon(step.icon, 'profile-survey-stage-icon-main')}
                    </div>
                    <div class="stage-info">
                        <span class="stage-label">${escapeHtml(step.title)}</span>
                        <p class="stage-desc">${escapeHtml(step.description)}</p>
                    </div>
                </div>
                <div class="profile-survey-accordion-body">
                    ${renderStepBody(state, stepNumber)}
                </div>
            </article>
        `;
    };

    const renderSurveyStepBlock = (state, step, stepNumber) => (
        stepNumber === surveySteps.length
            ? renderSurveyFinalBlock(state, step, stepNumber)
            : renderSurveyAccordion(state, step, stepNumber)
    );

    const renderFooter = (state) => {
        const isReadyToApply = isSurveyReadyToApply(state);
        return `
            <footer class="profile-survey-footer">
                <button class="btn-secondary-sm profile-survey-footer-btn" type="button" data-survey-action="exit">
                    Отмена
                </button>
                <button class="btn-primary profile-survey-footer-btn" type="button" data-survey-action="apply" ${isReadyToApply ? '' : 'disabled'}>
                    Применить
                </button>
            </footer>
        `;
    };

    const renderDrawer = (root, state) => {
        root.innerHTML = `
            <aside class="profile-survey-drawer" role="complementary" aria-label="Опросник создания профиля">
                <header class="profile-survey-drawer-header">
                    <div class="profile-survey-drawer-title-group">
                        <h2>Ассистент профилирования</h2>
                        <p>Ответь на несколько вопросов, чтобы быстрее оформить профиль</p>
                    </div>
                    <button class="profile-survey-drawer-close" type="button" data-survey-action="exit" aria-label="Закрыть опросник">
                        <i data-lucide="x"></i>
                    </button>
                </header>
                <div class="profile-survey-drawer-scroll-shell">
                    <main class="profile-survey-drawer-body" data-survey-scroll-area>
                        <div class="profile-survey-accordion-stack">
                            ${surveySteps
                                .map((step, index) => ({ step, stepNumber: index + 1 }))
                                .filter(item => shouldRenderSurveyStep(state, item.stepNumber))
                                .map(item => renderSurveyStepBlock(state, item.step, item.stepNumber))
                                .join('')}
                        </div>
                    </main>
                    <div class="profile-survey-scrollbar" aria-hidden="true">
                        <div class="profile-survey-scrollbar-thumb" data-survey-scroll-thumb></div>
                    </div>
                </div>
                ${renderFooter(state)}
            </aside>
        `;
    };

    const render = () => {
        const activeElementId = document.activeElement ? document.activeElement.id : "";
        const stateApi = app.profileSurveyState;
        const state = stateApi ? stateApi.getState() : null;
        const surveyHost = document.getElementById("profile-survey-host");
        const surveyTrigger = document.getElementById("profile-survey-start-btn");
        const drawer = document.getElementById("create-profile-drawer");
        const previousScrollArea = surveyHost ? surveyHost.querySelector("[data-survey-scroll-area]") : null;
        const preservedScrollTop = previousScrollArea ? previousScrollArea.scrollTop : 0;

        if (surveyTrigger && state) {
            surveyTrigger.classList.toggle("is-active", state.isActive);
            surveyTrigger.setAttribute("aria-expanded", state.isActive ? "true" : "false");
        }

        if (!surveyHost || !state) return;

        surveyHost.classList.toggle("is-active", state.isActive);
        if (drawer) drawer.classList.toggle("has-survey-drawer", state.isActive);

        if (state.isActive) {
            renderDrawer(surveyHost, state);
            const nextScrollArea = surveyHost.querySelector("[data-survey-scroll-area]");
            if (nextScrollArea && preservedScrollTop > 0) {
                nextScrollArea.scrollTop = preservedScrollTop;
                requestAnimationFrame(() => {
                    nextScrollArea.scrollTop = preservedScrollTop;
                });
            }
        } else {
            surveyHost.innerHTML = "";
        }

        refreshSurveyIcons();

        if (activeElementId && activeElementId.startsWith("profile-survey-")) {
            const nextActiveElement = document.getElementById(activeElementId);
            if (nextActiveElement && typeof nextActiveElement.focus === "function") {
                nextActiveElement.focus();
                if (typeof nextActiveElement.setSelectionRange === "function") {
                    const valueLength = nextActiveElement.value.length;
                    nextActiveElement.setSelectionRange(valueLength, valueLength);
                }
            }
        }
    };

    const updateActiveStep = () => {
        refreshSurveyIcons();
    };

    app.profileSurveyRender = {
        render,
        buildSummary,
        updateActiveStep,
        requestStepScroll() {}
    };

    window.HRProfileApp = app;
})();
