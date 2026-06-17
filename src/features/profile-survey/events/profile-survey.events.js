(function () {
    const app = window.HRProfileApp || {};

    const getStateApi = () => window.HRProfileApp && window.HRProfileApp.profileSurveyState;
    const getData = () => (window.HRProfileApp && window.HRProfileApp.profileSurveyData) || {};
    const getRender = () => window.HRProfileApp && window.HRProfileApp.profileSurveyRender;

    const getAllFunctions = () => {
        const data = getData();
        const state = getStateApi().getState();
        return [...state.customFunctions, ...(data.functions || [])];
    };

    const getSelectedFunction = () => {
        const state = getStateApi().getState();
        return getAllFunctions().find(item => item.id === state.answers.selectedFunctionId) || null;
    };

    const getOptionById = (items = [], id = "") => items.find(item => item.id === id) || null;

    function getAllFunctionsForState(state = {}) {
        const data = getData();
        return [
            ...((state && state.customFunctions) || []),
            ...((data.functions || []))
        ];
    }

    function hasTypicalRoleCatalog(selectedFunction) {
        return Boolean(
            selectedFunction &&
            selectedFunction.hasTypicalRoles &&
            Array.isArray(selectedFunction.typicalRoles) &&
            selectedFunction.typicalRoles.length
        );
    }

    function resolveSurveyScenario(state = {}) {
        const answers = state.answers || {};
        if (!answers.selectedFunctionId) {
            return "undetermined";
        }

        const selectedFunction = getAllFunctionsForState(state)
            .find(item => item.id === answers.selectedFunctionId) || null;

        if (!hasTypicalRoleCatalog(selectedFunction)) {
            return answers.selectedArea ? "nonTypical" : "undetermined";
        }

        if (answers.selectedTypicalRole && answers.selectedTypicalRole !== "none") {
            return "typical";
        }

        if (state.hasVisitedTypicalRoles && answers.selectedTypicalRole === "none") {
            return "nonTypical";
        }

        return "undetermined";
    }

    const setAnswers = (answers = {}, extra = {}) => {
        const stateApi = getStateApi();
        if (!stateApi) return null;
        const current = stateApi.getState();
        const nextDraft = {
            ...current,
            ...extra,
            answers: { ...current.answers, ...answers }
        };
        const nextScenario = resolveSurveyScenario(nextDraft);
        const nextState = stateApi.setState({
            ...extra,
            surveyScenario: nextScenario,
            isTypicalProfile: nextScenario === "typical",
            answers: nextDraft.answers
        });
        syncSurveyToProfile();
        return nextState;
    };

    let activeSurveyDropdown = null;
    let activeSurveyDropdownWrapper = null;
    let surveyScrollbarFrame = null;

    const renderSearchIcon = () => `
        <svg class="search-icon profile-survey-search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
        </svg>
    `;

    const closeSurveyDropdown = () => {
        if (activeSurveyDropdown) {
            activeSurveyDropdown.remove();
            activeSurveyDropdown = null;
        }
        if (activeSurveyDropdownWrapper) {
            activeSurveyDropdownWrapper.classList.remove("is-active");
            activeSurveyDropdownWrapper = null;
        }
    };

    const updateSurveyScrollbar = () => {
        surveyScrollbarFrame = null;
        const scrollArea = document.querySelector("[data-survey-scroll-area]");
        const shell = scrollArea ? scrollArea.closest(".profile-survey-drawer-scroll-shell") : null;
        const track = shell ? shell.querySelector(".profile-survey-scrollbar") : null;
        const thumb = shell ? shell.querySelector("[data-survey-scroll-thumb]") : null;
        if (!scrollArea || !shell || !track || !thumb) return;

        const maxScroll = scrollArea.scrollHeight - scrollArea.clientHeight;
        const isScrollable = maxScroll > 1;
        shell.classList.toggle("is-scrollable", isScrollable);
        if (!isScrollable) {
            thumb.style.height = "0px";
            thumb.style.transform = "translateY(0)";
            return;
        }

        const trackHeight = track.clientHeight;
        const thumbHeight = Math.max(32, Math.round((scrollArea.clientHeight / scrollArea.scrollHeight) * trackHeight));
        const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
        const thumbTop = Math.round((scrollArea.scrollTop / maxScroll) * maxThumbTop);
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${thumbTop}px)`;
    };

    const scheduleSurveyScrollbarUpdate = () => {
        if (surveyScrollbarFrame) return;
        surveyScrollbarFrame = requestAnimationFrame(updateSurveyScrollbar);
    };

    const getSelectedTypicalRole = () => {
        const state = getStateApi().getState();
        const selectedFunction = getSelectedFunction();
        if (!selectedFunction || !selectedFunction.typicalRoles) return null;
        return selectedFunction.typicalRoles.find(role => role.id === state.answers.selectedTypicalRole) || null;
    };

    const buildSurveyResult = () => {
        const state = getStateApi().getState();
        const data = getData();
        const selectedFunction = getSelectedFunction();
        const selectedRole = getSelectedTypicalRole();
        const selectedGoal = getOptionById(data.goalOptions || [], state.answers.goal) || (data.goalOptions || [])[0];
        const selectedTime = getOptionById(data.timeOptions || [], state.answers.time) || (data.timeOptions || [])[0];
        const selectedApproach = getOptionById(data.approachOptions || [], state.answers.approach);
        const mainTaskName = selectedTime ? selectedTime.taskName : "Анализ требований заказчика";
        const mainFunctions = (data.taskFunctions && data.taskFunctions[mainTaskName]) || [];
        const leadershipEnabled = state.answers.leadership === "yes" || Boolean(selectedRole);
        const mainParticipation = leadershipEnabled ? "80%" : "100%";

        const tasks = [
            {
                name: mainTaskName,
                participation: mainParticipation,
                role: "Исполняет",
                functions: mainFunctions.map((name, index) => ({
                    name,
                    ai: index === 1 ? "Аналитический" : "Текстовый",
                    influence: index === 0 ? "20%" : (index === 1 ? "35%" : "25%"),
                    role: "Исполняет"
                }))
            }
        ];

        if (leadershipEnabled) {
            tasks.push({
                name: "Управление операционной деятельностью",
                participation: "20%",
                role: "Исполняет",
                functions: [
                    { name: "Ставить задачи сотрудникам подразделения", ai: "Не используется", influence: "", role: "Исполняет" },
                    { name: "Контролировать выполнение задач подразделения", ai: "Аналитический", influence: "20%", role: "Исполняет" },
                    { name: "Координировать взаимодействие участников процесса", ai: "Текстовый", influence: "15%", role: "Исполняет" }
                ]
            });
        }

        return {
            source: "profile-survey",
            scenario: state.surveyScenario,
            positionValue: selectedRole ? "project-manager" : "system-analyst",
            structureName: "Департамент разработки",
            classifier: selectedFunction ? selectedFunction.name : "",
            okzCode: "",
            goal: {
                name: selectedGoal ? selectedGoal.goalName : "Обеспечение анализа и развития бизнес-процессов",
                role: "Отвечает",
                tasks
            },
            competencies: {
                ...(data.competencies || {}),
                softSkills: selectedApproach && selectedApproach.softSkills
                    ? selectedApproach.softSkills.map((name, index) => ({ id: 950 + index, name, desc: "Подобрано по результатам опросника", score: 3 }))
                    : ((data.competencies || {}).softSkills || [])
            },
            summary: {
                functionName: selectedFunction ? selectedFunction.name : "",
                area: state.answers.selectedArea,
                typicalRole: selectedRole ? selectedRole.title : "",
                isTypicalProfile: state.surveyScenario === "typical"
            }
        };
    };

    const syncSurveyToProfile = () => {
        const stateApi = getStateApi();
        const state = stateApi ? stateApi.getState() : null;
        if (!state || !state.isActive) return false;
        const answers = state.answers || {};
        const hasAnySurveyAnswer = Object.entries(answers)
            .some(([key, value]) => key !== "selectedTypicalRole" && Boolean(String(value || "").trim()));
        if (!hasAnySurveyAnswer) return false;

        const integration = window.HRProfileApp && window.HRProfileApp.profileSurveyIntegration;
        const result = buildSurveyResult();

        if (integration && typeof integration.syncSurveyResult === "function") {
            return Boolean(integration.syncSurveyResult(result));
        }
        if (integration && typeof integration.applySurveyResult === "function") {
            return Boolean(integration.applySurveyResult(result, { silent: true, live: true }));
        }
        return false;
    };

    const closeProfileCreationDrawer = () => {
        const surveyState = getStateApi();
        if (surveyState && typeof surveyState.setState === "function") {
            surveyState.setState({ isActive: false, appliedAt: new Date().toISOString() });
        }

        const drawer = document.getElementById("create-profile-drawer");
        const backdrop = document.getElementById("drawer-backdrop");
        const surveyHost = document.getElementById("profile-survey-host");
        const surveyTrigger = document.getElementById("profile-survey-start-btn");
        if (drawer) drawer.classList.remove("is-open", "has-survey-drawer");
        if (backdrop) backdrop.classList.remove("is-visible");
        if (surveyHost) {
            surveyHost.classList.remove("is-active");
            surveyHost.innerHTML = "";
        }
        if (surveyTrigger) {
            surveyTrigger.classList.remove("is-active");
            surveyTrigger.setAttribute("aria-expanded", "false");
        }
        document.body.style.overflow = "";
    };

    const createProfileDirectlyFromSurveyResult = (surveyResult = {}) => {
        const appApi = window.HRProfileApp || {};
        const profileStore = appApi.profileStore;
        const profileCreate = appApi.profileCreate;
        const profileModel = appApi.profileModel;
        if (!profileStore || typeof profileStore.add !== "function") return false;

        const payload = profileCreate && typeof profileCreate.buildProfilePayload === "function"
            ? profileCreate.buildProfilePayload({
                name: surveyResult.positionValue || "",
                classifier: surveyResult.classifier || "",
                department: surveyResult.structureName || "",
                okzCode: surveyResult.okzCode || "",
                goals: surveyResult.goal ? [surveyResult.goal] : [],
                competencies: surveyResult.competencies
            })
            : {
                name: surveyResult.positionValue || "",
                classifier: surveyResult.classifier || "",
                department: surveyResult.structureName || (profileModel ? profileModel.SYSTEM_DEFAULTS.department : ""),
                okzCode: surveyResult.okzCode || "",
                goals: surveyResult.goal ? [surveyResult.goal] : [],
                competenciesAreUserDefined: true,
                competencies: surveyResult.competencies
            };

        const createdProfile = profileStore.add(payload);
        if (!createdProfile) return false;

        if (typeof window.showToast === "function") {
            window.showToast("Профиль должности успешно создан!", true, true);
        }
        closeProfileCreationDrawer();
        return true;
    };

    const canGoNext = (state) => {
        if (state.currentStep === 1) return Boolean(state.answers.selectedFunctionId && state.answers.selectedArea);
        return true;
    };

    const goNext = () => {
        const stateApi = getStateApi();
        const state = stateApi.getState();
        if (!canGoNext(state)) return;
        if (state.currentStep === 1 && state.isTypicalProfile) {
            stateApi.setState({ currentStep: state.totalSteps });
            return;
        }
        stateApi.setState({ currentStep: Math.min(state.totalSteps, state.currentStep + 1) });
    };

    const goBack = () => {
        const stateApi = getStateApi();
        const state = stateApi.getState();
        stateApi.setState({ currentStep: Math.max(1, state.currentStep - 1) });
    };

    const skip = () => {
        const stateApi = getStateApi();
        const state = stateApi.getState();
        if (state.currentStep <= 1 || state.currentStep >= state.totalSteps) return;
        goNext();
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
            return Boolean(
                answers.leadership &&
                answers.result &&
                answers.goal &&
                answers.approach &&
                answers.time
            );
        }

        return false;
    };

    const addFunctionValue = (query = "") => {
        const stateApi = getStateApi();
        const state = stateApi.getState();
        const name = String(query || state.answers.functionSearchQuery).trim();
        if (!name) return;
        const id = `custom-${Date.now()}`;
        const customFunction = {
            id,
            name,
            hasTypicalRoles: false,
            status: "verification",
            areas: ["Новое функциональное направление"],
            typicalRoles: []
        };
        stateApi.setState({
            customFunctions: [customFunction, ...state.customFunctions],
            surveyScenario: "nonTypical",
            isTypicalProfile: false,
            hasVisitedTypicalRoles: false,
            answers: {
                ...state.answers,
                selectedFunctionId: id,
                selectedArea: "Новое функциональное направление",
                areaSearchQuery: "Новое функциональное направление",
                selectedTypicalRole: "none"
            }
        });
        syncSurveyToProfile();
    };

    const addAreaValue = (query = "") => {
        const stateApi = getStateApi();
        const state = stateApi.getState();
        const name = String(query || state.answers.areaSearchQuery).trim();
        if (!name) return;

        const areaKey = state.answers.selectedFunctionId || "__global";
        const currentAreas = state.customAreas && state.customAreas[areaKey]
            ? state.customAreas[areaKey]
            : [];
        const nextAreas = currentAreas.includes(name) ? currentAreas : [name, ...currentAreas];
        const nextDraft = {
            ...state,
            answers: {
                ...state.answers,
                selectedArea: name,
                areaSearchQuery: name
            },
            customAreas: {
                ...(state.customAreas || {}),
                [areaKey]: nextAreas
            }
        };
        const nextScenario = resolveSurveyScenario(nextDraft);

        stateApi.setState({
            customAreas: nextDraft.customAreas,
            surveyScenario: nextScenario,
            isTypicalProfile: nextScenario === "typical",
            answers: nextDraft.answers
        });
        syncSurveyToProfile();
    };

    const removeFunctionValue = (functionId) => {
        const stateApi = getStateApi();
        const state = stateApi.getState();
        if (!functionId) return;

        const isSelected = state.answers.selectedFunctionId === functionId;
        const nextCustomAreas = { ...(state.customAreas || {}) };
        delete nextCustomAreas[functionId];

        stateApi.setState({
            customFunctions: state.customFunctions.filter(item => item.id !== functionId),
            customAreas: nextCustomAreas,
            answers: {
                ...state.answers,
                selectedFunctionId: isSelected ? "" : state.answers.selectedFunctionId,
                functionSearchQuery: isSelected ? "" : state.answers.functionSearchQuery,
                selectedArea: isSelected ? "" : state.answers.selectedArea,
                areaSearchQuery: isSelected ? "" : state.answers.areaSearchQuery,
                selectedTypicalRole: isSelected ? "none" : state.answers.selectedTypicalRole
            },
            surveyScenario: isSelected ? "undetermined" : state.surveyScenario,
            isTypicalProfile: isSelected ? false : state.isTypicalProfile,
            hasVisitedTypicalRoles: isSelected ? false : state.hasVisitedTypicalRoles
        });
        syncSurveyToProfile();
    };

    const removeAreaValue = (areaName) => {
        const stateApi = getStateApi();
        const state = stateApi.getState();
        if (!areaName) return;

        const areaKey = state.answers.selectedFunctionId || "__global";
        const currentAreas = state.customAreas && state.customAreas[areaKey]
            ? state.customAreas[areaKey]
            : [];
        const isSelected = state.answers.selectedArea === areaName;

        stateApi.setState({
            customAreas: {
                ...(state.customAreas || {}),
                [areaKey]: currentAreas.filter(item => item !== areaName)
            },
            answers: {
                ...state.answers,
                selectedArea: isSelected ? "" : state.answers.selectedArea,
                areaSearchQuery: isSelected ? "" : state.answers.areaSearchQuery,
                selectedTypicalRole: isSelected ? "none" : state.answers.selectedTypicalRole
            },
            surveyScenario: isSelected ? "undetermined" : state.surveyScenario,
            isTypicalProfile: isSelected ? false : state.isTypicalProfile,
            hasVisitedTypicalRoles: isSelected ? false : state.hasVisitedTypicalRoles
        });
        syncSurveyToProfile();
    };

    const getDropdownConfig = (selectKey, filter = "") => {
        const state = getStateApi().getState();
        const data = getData();
        const normalizedFilter = filter.trim().toLowerCase();
        const selectedFunction = getSelectedFunction();

        if (selectKey === "function") {
            const customFunctionIds = new Set(state.customFunctions.map(item => item.id));
            const items = getAllFunctions()
                .filter(item => item.name.toLowerCase().includes(normalizedFilter))
                .map(item => ({
                    value: item.id,
                    label: item.name,
                    isSelected: state.answers.selectedFunctionId === item.id,
                    isCustom: customFunctionIds.has(item.id),
                    deleteType: "function",
                    meta: [
                        item.status === "verification" ? '<span class="profile-survey-verify-tag">на верификации</span>' : '',
                        item.hasTypicalRoles ? '<span class="profile-survey-typical-tag">Типовые должности</span>' : ''
                    ].filter(Boolean).join('')
                }));

            return {
                placeholder: "Поиск функции",
                items,
                emptyText: "Нет результатов...",
                createLabel: "Новое значение",
                allowCreate: Boolean(filter.trim()),
                onSelect: (value) => {
                    const fn = getAllFunctions().find(item => item.id === value);
                    setAnswers({
                        selectedFunctionId: value,
                        functionSearchQuery: fn ? fn.name : "",
                        selectedArea: "",
                        areaSearchQuery: "",
                        selectedTypicalRole: "none"
                    }, { isTypicalProfile: false, hasVisitedTypicalRoles: false });
                },
                onCreate: (value) => addFunctionValue(value),
                onDelete: (value) => removeFunctionValue(value)
            };
        }

        if (selectKey === "area") {
            const globalCustomAreas = state.customAreas && state.customAreas.__global ? state.customAreas.__global : [];
            const functionCustomAreas = selectedFunction && state.customAreas && state.customAreas[selectedFunction.id]
                ? state.customAreas[selectedFunction.id]
                : [];
            const areas = selectedFunction && selectedFunction.areas && selectedFunction.areas.length
                ? [...functionCustomAreas, ...selectedFunction.areas]
                : [...globalCustomAreas, ...Array.from(new Set(getAllFunctions().flatMap(item => item.areas || []))).sort((a, b) => a.localeCompare(b))];
            const uniqueAreas = Array.from(new Set(areas));
            const customAreaSet = new Set(selectedFunction && selectedFunction.areas && selectedFunction.areas.length
                ? functionCustomAreas
                : globalCustomAreas);
            return {
                placeholder: "Поиск направления",
                items: uniqueAreas
                    .filter(item => item.toLowerCase().includes(normalizedFilter))
                    .map(item => ({
                        value: item,
                        label: item,
                        isSelected: state.answers.selectedArea === item,
                        isCustom: customAreaSet.has(item),
                        deleteType: "area"
                    })),
                emptyText: "Нет результатов...",
                createLabel: "Новое значение",
                allowCreate: Boolean(filter.trim()),
                onSelect: (value) => setAnswers({ selectedArea: value, areaSearchQuery: value }),
                onCreate: (value) => addAreaValue(value),
                onDelete: (value) => removeAreaValue(value)
            };
        }

        const surveyOptionConfigs = {
            leadership: {
                placeholder: "Поиск варианта",
                answerKey: "leadership",
                items: [
                    { id: "yes", title: "Да" },
                    { id: "no", title: "Нет" }
                ]
            },
            result: {
                placeholder: "Поиск результата",
                answerKey: "result",
                items: data.resultOptions || []
            },
            goal: {
                placeholder: "Поиск цели",
                answerKey: "goal",
                items: data.goalOptions || []
            },
            approach: {
                placeholder: "Поиск подхода",
                answerKey: "approach",
                items: data.approachOptions || []
            },
            time: {
                placeholder: "Поиск варианта",
                answerKey: "time",
                items: data.timeOptions || []
            }
        };

        const config = surveyOptionConfigs[selectKey];
        if (!config) return null;

        return {
            placeholder: config.placeholder,
            items: config.items
                .filter(item => String(item.title || "").toLowerCase().includes(normalizedFilter))
                .map(item => ({
                    value: item.id,
                    label: item.title,
                    isSelected: state.answers[config.answerKey] === item.id
                })),
            emptyText: "Нет результатов...",
            allowCreate: false,
            onSelect: (value) => setAnswers({ [config.answerKey]: value })
        };
    };

    const openSurveyDropdown = (wrapper) => {
        if (!wrapper || wrapper.classList.contains("is-disabled")) return;
        const selectKey = wrapper.dataset.surveySelect;
        if (!selectKey) return;

        if (activeSurveyDropdown && activeSurveyDropdownWrapper === wrapper) {
            closeSurveyDropdown();
            return;
        }

        closeSurveyDropdown();
        activeSurveyDropdownWrapper = wrapper;
        activeSurveyDropdownWrapper.classList.add("is-active");
        activeSurveyDropdown = document.createElement("div");
        activeSurveyDropdown.className = "smart-dropdown custom-select-smart-dropdown profile-survey-smart-dropdown";

        const renderDropdownContent = (filter = "") => {
            const config = getDropdownConfig(selectKey, filter);
            if (!config) return;

            let dropdownHTML = `
                <div class="dropdown-search-box">
                    <div class="search-input-wrapper">
                        ${renderSearchIcon()}
                        <input type="text" class="dropdown-search-input" placeholder="${config.placeholder}" value="${filter}">
                    </div>
                </div>
                <div class="dropdown-list">
            `;

            if (config.items.length > 0) {
                config.items.forEach(item => {
                    dropdownHTML += `
                        <div class="dropdown-item ${item.isSelected ? 'selected' : ''} ${item.isCustom ? 'profile-survey-custom-dropdown-item' : ''}" data-survey-dropdown-value="${item.value}">
                            <span class="item-text">${item.label}</span>
                            <div class="profile-survey-dropdown-meta">
                                ${item.meta || ""}
                                ${item.isCustom ? `
                                    <button class="profile-survey-dropdown-delete-btn" type="button" data-survey-dropdown-delete="${item.value}" data-survey-dropdown-delete-type="${item.deleteType}" aria-label="Удалить значение">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                            <path d="M3 6h18"></path>
                                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                            <path d="M10 11v6"></path>
                                            <path d="M14 11v6"></path>
                                        </svg>
                                    </button>
                                ` : ""}
                                <div class="item-selection-state">
                                    ${item.isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else if (config.allowCreate && filter.trim() !== "") {
                dropdownHTML += `
                    <div class="dropdown-empty-state">
                        <button type="button" class="profile-survey-create-btn btn-secondary-sm">
                            <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                            ${config.createLabel}
                        </button>
                    </div>
                `;
            } else {
                dropdownHTML += `<div class="dropdown-empty-state">${config.emptyText}</div>`;
            }

            dropdownHTML += `</div>`;
            activeSurveyDropdown.innerHTML = dropdownHTML;
            if (window.createLucideIcons) {
                window.createLucideIcons();
            } else if (window.lucide && typeof window.lucide.createIcons === "function") {
                window.lucide.createIcons();
            }

            const searchInput = activeSurveyDropdown.querySelector(".dropdown-search-input");
            if (searchInput) {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                searchInput.addEventListener("input", (event) => {
                    renderDropdownContent(event.target.value);
                });
                searchInput.addEventListener("click", (event) => {
                    event.stopPropagation();
                });
            }

            activeSurveyDropdown.querySelectorAll("[data-survey-dropdown-value]").forEach(itemEl => {
                itemEl.addEventListener("click", (event) => {
                    event.stopPropagation();
                    if (event.target.closest("[data-survey-dropdown-delete]")) return;
                    config.onSelect(itemEl.dataset.surveyDropdownValue);
                    closeSurveyDropdown();
                });
            });

            activeSurveyDropdown.querySelectorAll("[data-survey-dropdown-delete]").forEach(deleteEl => {
                deleteEl.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (typeof config.onDelete === "function") {
                        config.onDelete(deleteEl.dataset.surveyDropdownDelete);
                    }
                    closeSurveyDropdown();
                });
            });

            const createBtn = activeSurveyDropdown.querySelector(".profile-survey-create-btn");
            if (createBtn) {
                createBtn.addEventListener("click", (event) => {
                    event.stopPropagation();
                    if (typeof config.onCreate === "function") {
                        config.onCreate(filter);
                    }
                    closeSurveyDropdown();
                });
            }
        };

        renderDropdownContent();

        activeSurveyDropdown.style.visibility = "hidden";
        wrapper.appendChild(activeSurveyDropdown);
        activeSurveyDropdown.style.visibility = "visible";
    };

    const updateAccordionDomState = (toggle, isOpen) => {
        const card = toggle ? toggle.closest("[data-survey-accordion]") : null;
        if (!card) return;

        const body = card.querySelector(".profile-survey-accordion-body");
        card.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        if (body) {
            body.hidden = !isOpen;
        }
        scheduleSurveyScrollbarUpdate();
    };

    const applyResult = () => {
        const stateApi = getStateApi();
        const state = stateApi ? stateApi.getState() : null;
        if (!isSurveyReadyToApply(state)) return;

        const integration = window.HRProfileApp && window.HRProfileApp.profileSurveyIntegration;
        const fallback = window.HRProfileApp && window.HRProfileApp.profileCreateStageGenerator;
        const result = buildSurveyResult();
        let applied = false;

        if (integration && typeof integration.applySurveyResult === "function") {
            applied = Boolean(integration.applySurveyResult(result, { silent: true, live: false }));
        } else if (fallback && typeof fallback.applyFirstStageDraft === "function") {
            fallback.applyFirstStageDraft(result.summary.functionName || "опросник");
            applied = true;
        }

        let created = integration && typeof integration.createProfileFromSurvey === "function"
            ? Boolean(integration.createProfileFromSurvey(result))
            : false;
        if (!created) {
            created = createProfileDirectlyFromSurveyResult(result);
        }
        if (!created) {
            if (typeof window.showToast === "function") {
                window.showToast("Не удалось создать профиль из опросника");
            }
        }
    };

    const handleClick = (event) => {
        const target = event.target;
        const stateApi = getStateApi();
        if (!stateApi) return;

        if (target.closest("#profile-survey-start-btn")) {
            if (typeof window.closeProfileAIAssistant === "function") {
                window.closeProfileAIAssistant();
            }
            closeSurveyDropdown();
            stateApi.setState({ isActive: true, currentStep: 1, openAccordions: {} });
            syncSurveyToProfile();
            const renderApi = getRender();
            if (renderApi && typeof renderApi.render === "function") {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        renderApi.render();
                    });
                });
            }
            return;
        }

        const accordionToggle = target.closest("[data-survey-accordion-toggle]");
        if (accordionToggle) {
            const stepNumber = Number(accordionToggle.dataset.surveyAccordionToggle);
            const current = stateApi.getState();
            const key = String(stepNumber);
            const nextIsOpen = !Boolean(current.openAccordions && current.openAccordions[key]);
            closeSurveyDropdown();
            stateApi.setState({
                currentStep: stepNumber,
                openAccordions: {
                    ...(current.openAccordions || {}),
                    [key]: nextIsOpen
                }
            }, { skipRender: true });
            updateAccordionDomState(accordionToggle, nextIsOpen);
            return;
        }

        const actionEl = target.closest("[data-survey-action]");
        if (actionEl) {
            const action = actionEl.dataset.surveyAction;
            if (action === "exit") {
                closeSurveyDropdown();
                stateApi.setState({ isActive: false });
            }
            if (action === "back") goBack();
            if (action === "next") goNext();
            if (action === "skip") skip();
            if (action === "apply") applyResult();
            if (action === "add-function-value") addFunctionValue();
            if (action === "reject-template") {
                stateApi.setState({
                    isTypicalProfile: false,
                    hasVisitedTypicalRoles: true,
                    surveyScenario: "nonTypical",
                    answers: { ...stateApi.getState().answers, selectedTypicalRole: "none" }
                });
                syncSurveyToProfile();
            }
            return;
        }

        const selectWrapper = target.closest("[data-survey-select]");
        if (selectWrapper) {
            openSurveyDropdown(selectWrapper);
            return;
        }

        const functionEl = target.closest("[data-survey-function-id]");
        if (functionEl) {
            const fn = getAllFunctions().find(item => item.id === functionEl.dataset.surveyFunctionId);
            setAnswers({
                selectedFunctionId: functionEl.dataset.surveyFunctionId,
                functionSearchQuery: fn ? fn.name : "",
                selectedArea: "",
                areaSearchQuery: "",
                selectedTypicalRole: "none"
            }, {
                isTypicalProfile: false,
                hasVisitedTypicalRoles: false,
                surveyScenario: "undetermined"
            });
            return;
        }

        const roleEl = target.closest("[data-survey-typical-role]");
        if (roleEl) {
            const roleId = roleEl.dataset.surveyTypicalRole;
            setAnswers({ selectedTypicalRole: roleId }, {
                hasVisitedTypicalRoles: true,
                isTypicalProfile: roleId !== "none",
                surveyScenario: roleId === "none" ? "nonTypical" : "typical"
            });
            return;
        }

        const areaEl = target.closest("[data-survey-area]");
        if (areaEl) {
            setAnswers({ selectedArea: areaEl.dataset.surveyArea, areaSearchQuery: areaEl.dataset.surveyArea });
            return;
        }

        const mappings = [
            ["surveyLeadership", "leadership"],
            ["surveyResult", "result"],
            ["surveyGoal", "goal"],
            ["surveyApproach", "approach"],
            ["surveyTime", "time"]
        ];
        for (const [datasetKey, answerKey] of mappings) {
            const attr = `data-${datasetKey.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
            const optionEl = target.closest(`[${attr}]`);
            if (optionEl) {
                setAnswers({ [answerKey]: optionEl.getAttribute(attr) });
                return;
            }
        }

        if (activeSurveyDropdown && !target.closest(".custom-select-smart-dropdown")) {
            closeSurveyDropdown();
        }
    };

    const init = () => {
        const render = getRender();
        if (!getStateApi() || !render) return;
        render.render();
        scheduleSurveyScrollbarUpdate();
        document.addEventListener("profile-survey-state-change", (event) => {
            closeSurveyDropdown();
            if (event.detail && event.detail.skipRender) {
                if (typeof render.updateActiveStep === "function") {
                    render.updateActiveStep();
                }
                scheduleSurveyScrollbarUpdate();
                return;
            }
            render.render();
            scheduleSurveyScrollbarUpdate();
        });
        document.addEventListener("click", handleClick);
        document.addEventListener("scroll", (event) => {
            const target = event.target;
            if (target && target.nodeType === 1 && target.matches("[data-survey-scroll-area]")) {
                scheduleSurveyScrollbarUpdate();
            }
        }, true);
        window.addEventListener("resize", scheduleSurveyScrollbarUpdate);
    };

    app.profileSurveyEvents = { init, buildSurveyResult, closeSurveyDropdown };
    window.HRProfileApp = app;
})();

