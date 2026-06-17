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

    const getAllAreas = () => {
        const uniqueAreas = new Set();
        getAllFunctions().forEach(item => {
            (item.areas || []).forEach(area => {
                if (area) uniqueAreas.add(area);
            });
        });
        return Array.from(uniqueAreas).sort((a, b) => a.localeCompare(b));
    };

    const getOptionById = (items = [], id = "") => items.find(item => item.id === id) || null;

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
        check: '<path d="M20 6 9 17l-5-5"></path>'
    };

    const renderSurveyStageIcon = (iconName) => `
        <svg class="profile-survey-stage-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            ${surveyStageIconPaths[iconName] || surveyStageIconPaths.briefcase}
        </svg>
    `;

    const renderLaunchBanner = () => `
        <section class="profile-survey-banner" aria-label="Опросник создания профиля">
            <div class="profile-survey-banner-icon" aria-hidden="true">
                <i data-lucide="clipboard-list"></i>
            </div>
            <div class="profile-survey-banner-copy">
                <h3>Пройти опрос</h3>
                <p>Опросник разработан для руководителей подразделений с целью минимизации ручного ввода при создании должностной инструкции</p>
            </div>
            <button class="btn-primary profile-survey-start-btn" type="button" id="profile-survey-start-btn">Пройти</button>
        </section>
    `;

    const surveySteps = [
        {
            title: "Функция",
            description: "Основная функция и направление",
            icon: "briefcase",
            iconClass: "survey-function"
        },
        {
            title: "Руководство",
            description: "Наличие подразделения",
            icon: "users",
            iconClass: "survey-leadership"
        },
        {
            title: "Результат",
            description: "Ожидаемый вклад роли",
            icon: "target",
            iconClass: "survey-result"
        },
        {
            title: "Цель",
            description: "Миссия должности",
            icon: "flag",
            iconClass: "survey-goal"
        },
        {
            title: "Подход",
            description: "Метод работы",
            icon: "route",
            iconClass: "survey-approach"
        },
        {
            title: "Время",
            description: "Фокус нагрузки",
            icon: "clock-3",
            iconClass: "survey-time"
        },
        {
            title: "Финал",
            description: "Сводка и применение",
            icon: "clipboard-check",
            iconClass: "survey-final"
        }
    ];

    const isSurveyStepComplete = (state, stepNumber) => {
        if (!state || !state.answers) return false;
        const answers = state.answers;
        if (stepNumber === 1) return Boolean(answers.selectedFunctionId && answers.selectedArea);
        if (stepNumber === 2) return Boolean(answers.leadership);
        if (stepNumber === 3) return Boolean(answers.result);
        if (stepNumber === 4) return Boolean(answers.goal);
        if (stepNumber === 5) return Boolean(answers.approach);
        if (stepNumber === 6) return Boolean(answers.time);
        return false;
    };

    const isSurveyReadyToApply = (state) => [1, 2, 3, 4, 5, 6].every(stepNumber => isSurveyStepComplete(state, stepNumber));

    const renderStepNavigation = (state) => `
        <aside class="profile-survey-stage-nav" aria-label="Этапы опроса">
            ${surveySteps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = state.currentStep === stepNumber;
                const isCompleted = isSurveyStepComplete(state, stepNumber);
                return `
                    <div class="stage-card profile-survey-stage-card ${isActive ? 'active' : ''} ${isCompleted ? 'is-completed' : ''}" data-survey-step-nav="${stepNumber}" role="button" tabindex="0">
                        <div class="stage-icon-wrapper ${escapeHtml(step.iconClass)}">
                            ${renderSurveyStageIcon(isCompleted ? 'check' : step.icon)}
                        </div>
                        <div class="stage-info">
                            <span class="stage-label">${escapeHtml(step.title)}</span>
                            <p class="stage-desc">${escapeHtml(step.description)}</p>
                        </div>
                    </div>
                `;
            }).join('')}
        </aside>
    `;

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
        return `
            <section class="profile-survey-typical-block ${disabled ? 'is-disabled' : ''}">
                <div class="profile-survey-block-title">Доступные готовые шаблоны должностей</div>
                <div class="profile-survey-typical-list">
                    <button class="profile-survey-radio-card ${state.answers.selectedTypicalRole === 'none' ? 'is-selected' : ''} has-radio" type="button" data-survey-typical-role="none" ${disabled ? 'disabled' : ''}>
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
                ${state.isTypicalProfile ? `
                    <div class="profile-survey-note profile-survey-note-info">
                        <i data-lucide="info"></i>
                        <span>Профиль будет сформирован по выбранному типовому шаблону. На следующем шаге откроется финальная сводка.</span>
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

    const renderFunctionStep = (state, options = {}) => {
        const { isActive = false } = options;
        const selectedFunction = getSelectedFunction();
        return `
            <section class="profile-survey-step-card ${isActive ? 'is-current' : ''}" data-survey-step-panel="1">
                <h3>Выберите основную функцию должности</h3>
                <p>Это обязательное поле определяет дальнейшие направления, типовые шаблоны и варианты заполнения профиля.</p>
                ${renderSelectField({
                    label: "Основная функция должности",
                    value: selectedFunction ? selectedFunction.name : "",
                    placeholder: "Выберите функцию",
                    selectKey: "function",
                    required: true
                })}

                ${renderTypicalRoles(state, selectedFunction, false)}

                ${renderSelectField({
                    label: "Укажите конкретное функциональное направление",
                    value: state.answers.selectedArea,
                    placeholder: "Выберите направление",
                    selectKey: "area",
                    required: true
                })}
            </section>
        `;
    };

    const renderLeadershipStep = (state, options = {}) => {
        const { isActive = false } = options;
        return `
        <section class="profile-survey-step-card ${isActive ? 'is-current' : ''}" data-survey-step-panel="2">
            <h3>Является ли должность руководящей?</h3>
            <p>Если в подчинении закреплено структурное подразделение, система добавит управленческую задачу с весом 20%.</p>
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
        </section>
    `;
    };

    const renderOptionStep = (state, config, options = {}) => {
        const { isActive = false, stepNumber = '' } = options;
        const selectedValue = state.answers[config.answerKey];
        const radioAttr = `data-survey-${config.selectKey}`;
        return `
        <section class="profile-survey-step-card ${isActive ? 'is-current' : ''}" data-survey-step-panel="${stepNumber}">
            <h3>${escapeHtml(config.title)}</h3>
            <p>${escapeHtml(config.description)}</p>
            ${(config.items || []).length <= 5
                ? renderRadioChoiceCards(config.items || [], selectedValue, radioAttr)
                : renderSelectField({
                    label: config.fieldLabel || config.title,
                    value: ((config.items || []).find(item => item.id === selectedValue) || {}).title || "",
                    placeholder: config.placeholder || "Выберите значение",
                    selectKey: config.selectKey
                })}
        </section>
    `;
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

    const renderFinalStep = (state, options = {}) => {
        const { isActive = false } = options;
        const summary = buildSummary(state);
        return `
            <section class="profile-survey-step-card ${isActive ? 'is-current' : ''}" data-survey-step-panel="7">
                <h3>Проверьте сводку перед применением</h3>
                <p>Данные будут перенесены в основную форму только после нажатия кнопки «Применить и закрыть».</p>
                <div class="profile-survey-summary">
                    ${renderSummaryRow('Функция', summary.selectedFunction ? summary.selectedFunction.name : '')}
                    ${renderSummaryRow('Направление', state.answers.selectedArea)}
                    ${renderSummaryRow('Типовой шаблон', summary.selectedRole ? summary.selectedRole.title : '')}
                    ${renderSummaryRow('Цель', summary.goal ? summary.goal.title : '')}
                    ${renderSummaryRow('Подход', summary.approach ? summary.approach.title : '')}
                    ${renderSummaryRow('Фокус времени', summary.time ? summary.time.title : '')}
                </div>
                ${state.isTypicalProfile ? `
                    <button class="profile-survey-template-reset" type="button" data-survey-action="reject-template">
                        Типовой профиль не подходит
                    </button>
                ` : ''}
            </section>
        `;
    };

    const renderStepBlock = (state, stepNumber) => {
        const data = app.profileSurveyData || {};
        const options = {
            stepNumber,
            isActive: stepNumber === state.currentStep
        };
        if (stepNumber === 1) return renderFunctionStep(state, options);
        if (stepNumber === 2) return renderLeadershipStep(state, options);
        if (stepNumber === 3) return renderOptionStep(state, {
            kicker: 'Ожидаемый результат',
            title: 'Какой ключевой результат должна обеспечивать должность?',
            description: 'Выберите один вариант, который лучше всего отражает ожидаемый вклад роли.',
            items: data.resultOptions || [],
            answerKey: 'result',
            selectKey: 'result'
        }, options);
        if (stepNumber === 4) return renderOptionStep(state, {
            kicker: 'Цель должности',
            title: 'Какая глобальная миссия роли ближе всего?',
            description: 'Ответ повлияет на формулировку цели в карточке профиля.',
            items: data.goalOptions || [],
            answerKey: 'goal',
            selectKey: 'goal'
        }, options);
        if (stepNumber === 5) return renderOptionStep(state, {
            kicker: 'Подход к работе',
            title: 'Какой подход к работе характерен для должности?',
            description: 'Ответ поможет подобрать релевантные soft skills.',
            items: data.approachOptions || [],
            answerKey: 'approach',
            selectKey: 'approach'
        }, options);
        if (stepNumber === 6) return renderOptionStep(state, {
            kicker: 'Распределение времени',
            title: 'Какой функционал занимает большую часть времени?',
            description: 'Ответ используется для распределения веса задач до 100%.',
            items: data.timeOptions || [],
            answerKey: 'time',
            selectKey: 'time'
        }, options);
        return renderFinalStep(state, options);
    };

    const renderFooter = (state) => {
        const isReadyToApply = isSurveyReadyToApply(state);
        return `
            <footer class="profile-survey-footer">
                <button class="btn-secondary-sm profile-survey-footer-btn" type="button" data-survey-action="exit">
                    Отмена
                </button>
                <button class="btn-primary profile-survey-footer-btn" type="button" data-survey-action="apply" ${isReadyToApply ? '' : 'disabled'}>
                    Применить и закрыть
                </button>
            </footer>
        `;
    };

    const renderWizard = (root, state) => {
        root.innerHTML = `
            <div class="profile-survey-shell">
                <main class="profile-survey-content">
                    <div class="profile-survey-workspace">
                        ${renderStepNavigation(state)}
                        <section class="profile-survey-panel">
                            <div class="profile-survey-step-stack">
                                ${surveySteps.map((step, index) => renderStepBlock(state, index + 1)).join('')}
                            </div>
                        </section>
                    </div>
                </main>
                ${renderFooter(state)}
            </div>
        `;
    };

    const render = () => {
        const activeElementId = document.activeElement ? document.activeElement.id : "";
        const stateApi = app.profileSurveyState;
        const state = stateApi ? stateApi.getState() : null;
        const bannerHost = document.getElementById("profile-survey-banner-host");
        const wizardHost = document.getElementById("profile-survey-host");
        const previousSurveyContent = wizardHost ? wizardHost.querySelector(".profile-survey-content") : null;
        const preservedScrollTop = previousSurveyContent ? previousSurveyContent.scrollTop : 0;
        const functionalContent = document.getElementById("functional-content");
        const stageContainer = document.querySelector("#create-profile-drawer .stages-container");
        const footer = document.querySelector("#create-profile-drawer .drawer-footer");
        const drawer = document.getElementById("create-profile-drawer");
        const drawerTitle = drawer ? drawer.querySelector(".drawer-title") : null;
        const drawerDescription = drawer ? drawer.querySelector(".drawer-survey-description") : null;

        if (bannerHost) {
            bannerHost.innerHTML = renderLaunchBanner();
        }

        if (!wizardHost || !state) return;

        wizardHost.classList.toggle("is-active", state.isActive);
        if (drawer) drawer.classList.toggle("is-survey-mode", state.isActive);
        if (drawerTitle) drawerTitle.textContent = state.isActive ? "Ускоренный сценарий" : "Создание профиля";
        if (drawerDescription) {
            drawerDescription.textContent = "Ответь на несколько вопросов, чтобы быстрее оформить профиль";
        }
        if (functionalContent) functionalContent.classList.toggle("is-survey-hidden", state.isActive);
        if (stageContainer) stageContainer.classList.toggle("is-survey-hidden", state.isActive);
        if (footer) footer.classList.toggle("is-survey-hidden", state.isActive);

        if (state.isActive) {
            renderWizard(wizardHost, state);
            const nextSurveyContent = wizardHost.querySelector(".profile-survey-content");
            if (nextSurveyContent) {
                nextSurveyContent.scrollTop = preservedScrollTop;
                if (pendingScrollStep) {
                    const targetPanel = wizardHost.querySelector(`[data-survey-step-panel="${pendingScrollStep}"]`);
                    if (targetPanel) {
                        requestAnimationFrame(() => {
                            const contentRect = nextSurveyContent.getBoundingClientRect();
                            const targetRect = targetPanel.getBoundingClientRect();
                            const targetTop = targetRect.top - contentRect.top + nextSurveyContent.scrollTop - 24;
                            nextSurveyContent.scrollTo({
                                top: Math.max(0, targetTop),
                                behavior: "smooth"
                            });
                        });
                    }
                    pendingScrollStep = null;
                }
            }
        } else {
            wizardHost.innerHTML = "";
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
        const stateApi = app.profileSurveyState;
        const state = stateApi ? stateApi.getState() : null;
        const wizardHost = document.getElementById("profile-survey-host");
        if (!wizardHost || !state || !state.isActive) return;

        wizardHost.querySelectorAll("[data-survey-step-nav]").forEach((item) => {
            item.classList.toggle("active", Number(item.dataset.surveyStepNav) === state.currentStep);
        });

        wizardHost.querySelectorAll("[data-survey-step-panel]").forEach((item) => {
            item.classList.toggle("is-current", Number(item.dataset.surveyStepPanel) === state.currentStep);
        });

        const footer = wizardHost.querySelector(".profile-survey-footer");
        if (footer) {
            footer.outerHTML = renderFooter(state);
            refreshSurveyIcons();
        }
    };

    app.profileSurveyRender = {
        render,
        buildSummary,
        updateActiveStep,
        requestStepScroll(stepNumber) {
            pendingScrollStep = Number(stepNumber) || null;
        }
    };

    window.HRProfileApp = app;
})();




