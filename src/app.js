document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-btn');
    const navItems = document.querySelectorAll('.nav-item');

    // Toggle Sidebar Collapse
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        
        // Update icon orientation
        const icon = toggleBtn.querySelector('i');
        // Icon update is handled via CSS rotation, but we could also swap icons if needed
    });

    // Handle Nav Item Selection
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active class from all items
            navItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Note: In a real app, this might navigate or prevent default if needed
            // e.preventDefault();
        });
    });

    // --- Create Profile Drawer Logic ---
    const openDrawerBtn = document.querySelector('.btn-primary');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const backDrawerBtn = document.getElementById('back-drawer-btn');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const profileDrawer = document.getElementById('create-profile-drawer');
    const nextStageBtn = document.getElementById('next-stage-btn');
    const prevStageBtn = document.getElementById('prev-stage-btn');

    let isEditMode = false;
    let editingProfileId = null;
    let isViewEditMode = false;
    let isCreateStageNavigationUnlocked = false;

    // View Profile Drawer Elements
    const viewProfileDrawer = document.getElementById('view-profile-drawer');
    const closeViewDrawerBtn = document.getElementById('close-view-drawer-btn');
    const backViewDrawerBtn = document.getElementById('back-view-drawer-btn');
    const viewDrawerTitle = document.getElementById('view-drawer-title');
    const profileApp = window.HRProfileApp || {};
    const profileStore = profileApp.profileStore;
    const profileModel = profileApp.profileModel;
    const profileCreate = profileApp.profileCreate;
    const profileCardActions = profileApp.profileCardActions;

    if (profileStore) {
        profileStore.normalizeAll();
    }

    // Inputs for validation
    const getParamFields = () => ({
        position: document.getElementById('param-position'),
        classifier: document.getElementById('param-classifier'),
        structure: document.getElementById('param-structure'),
        okz: document.getElementById('param-okz')
    });

    const getTriggerValue = (trigger) => (
        trigger
            ? (trigger.dataset.value || trigger.textContent || '').trim()
            : ''
    );

    const isFilledTrigger = (trigger) => (
        Boolean(getTriggerValue(trigger)) &&
        !trigger.classList.contains('is-placeholder') &&
        !trigger.closest('.is-placeholder')
    );

    const getFirstStageAIContextStatus = () => {
        const fields = getParamFields();
        const paramsValid = !!(fields.position && fields.position.value && fields.structure && fields.structure.value);
        const goals = Array.from(document.querySelectorAll('#goals-container .goal-card'));
        let hasNamedGoal = false;
        let hasNamedTask = false;
        let hasSelectedFunction = false;

        goals.forEach(goal => {
            const goalNameTrigger = goal.querySelector('.goal-name-text');
            const goalNameValid = isFilledTrigger(goalNameTrigger);
            if (goalNameValid) {
                hasNamedGoal = true;
            }

            goal.querySelectorAll('.task-body tr').forEach(task => {
                const taskNameTrigger = task.querySelector('.task-name-text');
                const taskNameValid = isFilledTrigger(taskNameTrigger);
                if (goalNameValid && taskNameValid) {
                    hasNamedTask = true;
                }

                task.querySelectorAll('.function-row-item').forEach(row => {
                    const functionTrigger = row.querySelector('.col-select-name .custom-select-trigger');
                    const functionValid = isFilledTrigger(functionTrigger);
                    if (goalNameValid && taskNameValid && functionValid) {
                        hasSelectedFunction = true;
                    }
                });
            });
        });

        return {
            paramsValid,
            hasNamedGoal,
            hasNamedTask,
            hasSelectedFunction,
            hasMinimumContext: paramsValid && hasNamedGoal && hasNamedTask && hasSelectedFunction
        };
    };

    window.HRProfileApp = window.HRProfileApp || {};
    window.HRProfileApp.profileCreateStageContext = {
        getFirstStageStatus: getFirstStageAIContextStatus
    };

    const validateFunctionalStage = () => {
        const fields = getParamFields();
        const addGoalBtn = document.getElementById('add-goal-btn');
        
        const paramsValid = !!(fields.position.value && fields.structure.value);
        const aiContextStatus = getFirstStageAIContextStatus();
        
        if (addGoalBtn) {
            addGoalBtn.disabled = !paramsValid;
        }
        
        const goals = document.querySelectorAll('.goal-card');
        let goalsValid = goals.length > 0;
        
        if (goalsValid) {
            goals.forEach(goal => {
                const goalNameTrigger = goal.querySelector('.goal-name-text');
                const goalNameValid = isFilledTrigger(goalNameTrigger);
                
                const tasks = goal.querySelectorAll('.task-body tr');
                let tasksValid = tasks.length > 0;
                
                if (tasksValid) {
                    tasks.forEach(task => {
                        const taskNameTrigger = task.querySelector('.task-name-text');
                        const taskNameValid = isFilledTrigger(taskNameTrigger);
                        
                        const participationInput = task.querySelector('.task-participation-input');
                        const participationValid = participationInput && participationInput.value.trim() !== '';
                        
                        const funcContainer = task.querySelector('.functions-cell-container');
                        const funcRows = funcContainer ? funcContainer.querySelectorAll('.function-row-item') : [];
                        let funcsValid = funcRows.length > 0;
                        
                        if (funcsValid) {
                            funcRows.forEach(row => {
                                const triggers = row.querySelectorAll('.custom-select-trigger');
                                let rowValid = true;
                                triggers.forEach(t => {
                                    if (t.classList.contains('is-placeholder')) {
                                        rowValid = false;
                                    }
                                });
                                if (!rowValid) {
                                    funcsValid = false;
                                }
                            });
                        }
                        
                        if (!taskNameValid || !funcsValid || !participationValid) {
                            tasksValid = false;
                        }
                    });
                }
                
                if (!goalNameValid || !tasksValid) {
                    goalsValid = false;
                }
            });
        }
        
        nextStageBtn.disabled = !aiContextStatus.hasMinimumContext;

        const stageCompetencies = document.getElementById('stage-competencies');
        const isOnFunctionalStage = !stageCompetencies || !stageCompetencies.classList.contains('active');
        if (isOnFunctionalStage) {
            isCreateStageNavigationUnlocked = aiContextStatus.hasMinimumContext;
            if (typeof updateCreateStageCardsInteractivity === 'function') {
                updateCreateStageCardsInteractivity();
            }
        }

        // Update AI Influence tags for all task tables
        document.querySelectorAll('.task-table').forEach(table => {
            let total = 0;
            table.querySelectorAll('.ai-influence-input').forEach(input => {
                if (!input.disabled && input.value) {
                    const val = parseInt(input.value.replace('%', ''), 10);
                    if (!isNaN(val)) total += val;
                }
            });
            const tag = table.querySelector('th.col-funcs .ai-total-influence-tag');
            if (tag) {
                tag.textContent = `Общее влияние ИИ: ${total}%`;
                tag.style.display = 'none';
            }
        });

        // Update Participation tags for each goal card
        goals.forEach(goal => {
            let totalParticipation = 0;
            const tasks = goal.querySelectorAll('.task-body tr');
            tasks.forEach(task => {
                const participationInput = task.querySelector('.task-participation-input');
                if (participationInput && participationInput.value.trim() !== '') {
                    const val = participationInput.value.replace('%', '').trim();
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                        totalParticipation += num;
                    }
                }
            });

            const goalNameWrapper = goal.querySelector('.col-goal-name');
            let tag = goalNameWrapper.querySelector('.goal-total-participation-tag');
            if (!tag) {
                tag = document.createElement('span');
                tag.className = 'goal-total-participation-tag select-tag-badge';
                tag.style.cssText = 'font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: 500; display: none; align-items: center; justify-content: center; text-transform: none; line-height: 1.2; height: fit-content; flex-shrink: 0;';
                goalNameWrapper.appendChild(tag);
            }
            if (totalParticipation > 0) {
                tag.style.display = 'inline-flex';
                tag.textContent = `Участие: ${totalParticipation}%`;
                if (totalParticipation > 100) {
                    tag.style.backgroundColor = '#FEE2E2';
                    tag.style.color = '#EF4444';
                    tag.style.border = '1px solid #FCA5A5';
                } else {
                    tag.style.backgroundColor = '#F1F5F9';
                    tag.style.color = '#475569';
                    tag.style.border = '1px solid #E2E8F0';
                }
            } else {
                tag.style.display = 'none';
            }
        });


    };

    window.HRProfileApp = window.HRProfileApp || {};
    window.HRProfileApp.profileCreateStageContext = {
        ...(window.HRProfileApp.profileCreateStageContext || {}),
        refreshFunctionalStage: validateFunctionalStage
    };

    const selectStructureNodeByName = (name) => {
        if (!treeContainer || !hiddenSelect || !treeValue) return;
        
        const node = Array.from(treeContainer.querySelectorAll('.tree-node-content')).find(
            el => el.dataset.name === name
        );
        
        if (node) {
            treeContainer.querySelectorAll('.tree-node-content.selected').forEach(el => {
                el.classList.remove('selected');
            });
            node.classList.add('selected');

            treeValue.textContent = name;
            treeValue.classList.remove('is-placeholder');

            hiddenSelect.innerHTML = `<option value="" disabled selected>Выберите подразделение</option>`;
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            option.selected = true;
            hiddenSelect.appendChild(option);
            hiddenSelect.value = name;

            hiddenSelect.dispatchEvent(new Event('input', { bubbles: true }));
            hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));

            let currentWrapper = node.closest('.tree-node-wrapper');
            while (currentWrapper) {
                const parentList = currentWrapper.parentElement;
                if (parentList && parentList.classList.contains('tree-subtree')) {
                    parentList.classList.remove('collapsed');
                    
                    const parentPath = parentList.dataset.parentPath;
                    const toggleBtn = treeContainer.querySelector(`.tree-toggle-btn[data-path="${parentPath}"]`);
                    if (toggleBtn) {
                        toggleBtn.textContent = '−';
                    }
                }
                currentWrapper = parentList ? parentList.closest('.tree-node-wrapper') : null;
            }
        }
    };

    const resetProfileAIAssistantSession = () => {
        const aiState = window.HRProfileApp && window.HRProfileApp.profileAIAssistantState;
        if (aiState && typeof aiState.resetSession === 'function') {
            aiState.resetSession({
                isOpen: false,
                activeTab: 'generation'
            });
        }

        if (typeof window.closeProfileAIAssistant === 'function') {
            window.closeProfileAIAssistant();
            return;
        }

        if (window.HRProfileApp && window.HRProfileApp.profileAIAssistantRender) {
            window.HRProfileApp.profileAIAssistantRender.render();
        }
    };

    const openDrawer = (profileToEdit = null) => {
        resetProfileAIAssistantSession();

        isEditMode = !!profileToEdit;
        editingProfileId = profileToEdit ? profileToEdit.id : null;

        profileDrawer.classList.add('is-open');
        drawerBackdrop.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
        
        // Reset drawer state when opening
        isCreateStageNavigationUnlocked = false;
        nextStageBtn.disabled = true; 
        nextStageBtn.innerText = 'Далее';
        prevStageBtn.style.display = 'none'; 
        resetCompetenciesBtn.style.display = 'none'; // Hide global reset on start
        
        const fields = getParamFields();
        if (fields.position) {
            fields.position.value = "";
            fields.classifier.value = "";
            fields.structure.value = "";
            fields.okz.value = "";
            resetTreeSelect();
        }

        const editGoalsContainer = document.getElementById('goals-container');
        if (editGoalsContainer) {
            editGoalsContainer.innerHTML = '';
        }

        if (profileToEdit) {
            if (typeof applyCompetenciesState === 'function') {
                applyCompetenciesState(profileToEdit.competencies, {
                    useDefaults: !profileToEdit.competenciesAreUserDefined
                });
            }

            if (fields.position) {
                fields.position.value = profileToEdit.name || "";
            }
            if (fields.classifier) {
                fields.classifier.value = profileToEdit.classifier || "";
            }
            if (fields.okz) {
                fields.okz.value = profileToEdit.okzCode || "";
            }
            if (profileToEdit.department) {
                selectStructureNodeByName(profileToEdit.department);
            }

            if (profileToEdit.goals && profileToEdit.goals.length > 0) {
                profileToEdit.goals.forEach(goalData => {
                    createGoalCard(goalData);
                });
            }

            const drawerTitle = profileDrawer.querySelector('.drawer-title h2');
            if (drawerTitle) {
                drawerTitle.textContent = "Редактирование профиля";
            }
        } else {
            if (typeof applyCompetenciesState === 'function') {
                applyCompetenciesState(null, { useDefaults: false });
            }

            const drawerTitle = profileDrawer.querySelector('.drawer-title h2');
            if (drawerTitle) {
                drawerTitle.textContent = "Создание профиля";
            }
        }

        validateFunctionalStage();

        const stageFunctional = document.getElementById('stage-functional');
        const stageCompetencies = document.getElementById('stage-competencies');
        const functionalContent = document.getElementById('functional-content');
        const competenciesContent = document.getElementById('competencies-content');

        stageFunctional.classList.add('active');
        stageFunctional.classList.remove('completed');
        stageCompetencies.classList.add('disabled');
        stageCompetencies.classList.remove('active');
        functionalContent.style.display = 'block';
        competenciesContent.style.display = 'none';
        if (typeof updateCreateStageCardsInteractivity === 'function') {
            updateCreateStageCardsInteractivity();
        }

        lucide.createIcons(); // Refresh icons inside drawer
    };

    const closeDrawer = () => {
        resetProfileAIAssistantSession();
        profileDrawer.classList.remove('is-open');
        if (!viewProfileDrawer || !viewProfileDrawer.classList.contains('is-open')) {
            drawerBackdrop.classList.remove('is-visible');
            document.body.style.overflow = '';
        }
    };

    // Populate profiles' goals on startup deterministically if not present
    const initProfilesGoalsData = () => {
        const goalNames = [
            "Обеспечение планирования и реализации строительных проектов",
            "Управление процессом разработки программного обеспечения",
            "Развитие и поддержка корпоративной ИТ инфраструктуры",
            "Контроль качества выпускаемого продукта",
            "Стратегическое планирование и анализ бизнес-процессов"
        ];

        const taskNames = [
            "Организация строительства наружных инженерных сетей",
            "Составление бюджета и контроль сроков",
            "Взаимодействие с подрядчиками и поставщиками",
            "Анализ рисков и разработка мер реагирования",
            "Подготовка проектной документации"
        ];
        
        const funcNames = [
            "Мониторинг выполнения строительно-монтажных работ",
            "Проведение код-ревью и контроль качества кода",
            "Анализ бизнес-требований и написание спецификаций",
            "Проектирование архитектурных решений систем",
            "Разработка интеграционных сценариев"
        ];
        
        const aiOptions = [
            "Не используется",
            "Текстовый",
            "Графический",
            "Голосовой",
            "Аналитический",
            "Генерация кода",
            "Видео и мультимедиа"
        ];

        const seededRandom = (min, max, seed) => {
            const x = Math.sin(seed) * 10000;
            return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
        };

        const roles = ["Исполняет", "Консультирует", "Согласует"];
        const goalRoles = ["Отвечает", "Исполняет", "Согласует", "Консультирует"];

        (window.profiles || []).forEach(profile => {
            if (profile.goals && profile.goals.length > 0) return; // Keep already defined goals from seed data

            const id = profile.id || 1;
            let seed = id * 100;
            const numGoals = seededRandom(1, 2, seed++);
            const goals = [];

            for (let g = 0; g < numGoals; g++) {
                const goalName = goalNames[seededRandom(0, goalNames.length - 1, seed++)];
                const goalRole = goalRoles[seededRandom(0, goalRoles.length - 1, seed++)];
                const numTasks = seededRandom(1, 2, seed++);
                const tasks = [];

                for (let t = 0; t < numTasks; t++) {
                    const taskName = taskNames[seededRandom(0, taskNames.length - 1, seed++)];
                    const partValue = `${Math.floor(100 / numTasks)}%`;
                    const taskRole = roles[seededRandom(0, roles.length - 1, seed++)];
                    const numFuncs = seededRandom(2, 3, seed++);
                    const functions = [];

                    for (let f = 0; f < numFuncs; f++) {
                        const fName = funcNames[seededRandom(0, funcNames.length - 1, seed++)];
                        const aiIdx = seededRandom(0, aiOptions.length - 1, seed++);
                        const ai = aiOptions[aiIdx];
                        
                        let influence = "";
                        if (ai !== "Не используется") {
                            influence = `${seededRandom(1, 10, seed++) * 10}%`;
                        }
                        
                        const fRole = roles[seededRandom(0, roles.length - 1, seed++)];
                        
                        functions.push({
                            name: fName,
                            ai: ai,
                            influence: influence,
                            role: fRole
                        });
                    }

                    tasks.push({
                        name: taskName,
                        participation: partValue,
                        role: taskRole,
                        functions: functions
                    });
                }

                goals.push({
                    name: goalName,
                    role: goalRole,
                    tasks: tasks
                });
            }

            profile.goals = goals;
        });
    };

    // Run dynamic goals data initialization on script startup
    initProfilesGoalsData();

    const generateViewGoalsHtml = (profile) => {
        if (!profile || !profile.goals || profile.goals.length === 0) return '';
        
        let html = '';
        
        profile.goals.forEach((goal, gIndex) => {
            let tasksHtml = '';
            
            (goal.tasks || []).forEach((task, tIndex) => {
                let funcsHtml = '';
                
                (task.functions || []).forEach(func => {
                    let aiBadge = `<span class="select-placeholder" style="color: #94A3B8;">Маркировка ИИ</span>`;
                    if (func.ai) {
                        const cnt = func.ai.split(', ').filter(Boolean).length;
                        if (cnt > 0) {
                            if (cnt === 1) {
                                const singleVal = func.ai.trim();
                                if (singleVal === "Не используется") {
                                    aiBadge = `<span>Не используется</span>`;
                                } else {
                                    let bgColor = "#DBEAFE";
                                    let color = "#1E40AF";
                                    if (singleVal.includes("Код") || singleVal.includes("Ген")) {
                                        bgColor = "#D1FAE5";
                                        color = "#065F46";
                                    } else if (singleVal.includes("Вид") || singleVal.includes("мульт")) {
                                        bgColor = "#FEE2E2";
                                        color = "#991B1B";
                                    } else if (singleVal.includes("Голос")) {
                                        bgColor = "#FEF3C7";
                                        color = "#92400E";
                                    }
                                    aiBadge = `<span class="select-tag-badge" style="background-color: ${bgColor}; color: ${color}; border: none; font-size: 11px; padding: 2px 6px; border-radius: 4px; display: inline-block;">${singleVal}</span>`;
                                }
                            } else {
                                aiBadge = `<span class="select-tag-badge" style="background-color: #E2E8F0; color: #475569; border: none; font-size: 11px; padding: 2px 6px; border-radius: 4px; display: inline-block;">Выбрано: ${cnt}</span>`;
                            }
                        }
                    }
                    
                    funcsHtml += `
                        <div class="function-row-item" style="pointer-events: none;">
                            <div class="function-drag-handle is-disabled" title="Перетащить">
                                <i data-lucide="grip-vertical"></i>
                            </div>
                            <div class="custom-select-wrapper col-select-name is-disabled" style="flex: 2 1 0%; min-width: 0;">
                                <div class="custom-select-trigger" data-value="${func.name}">${func.name}</div>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                            <div class="custom-select-wrapper col-select-ai is-disabled" style="flex: 1 1 0%; min-width: 0;">
                                <div class="custom-select-trigger" data-value="${func.ai}">
                                    ${aiBadge}
                                </div>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                            <div class="ai-influence-container is-disabled">
                                <input type="text" class="ai-influence-input" value="${func.influence || ''}" placeholder="Влияние ИИ" title="Влияние ИИ" disabled>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                            <div class="custom-select-wrapper col-select-role is-disabled" style="flex: 1 1 0%; min-width: 0;">
                                <div class="custom-select-trigger" data-value="${func.role}">${func.role}</div>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                        </div>
                    `;
                });
                
                tasksHtml += `
                    <tr>
                        <td class="col-num">${tIndex + 1}</td>
                        <td class="col-task-name">
                            <div class="col-task-name-wrapper is-disabled" tabindex="-1">
                                <span class="task-name-text">${task.name}</span>
                                <i data-lucide="chevron-down" class="task-name-chevron"></i>
                            </div>
                        </td>
                        <td class="col-participation">
                            <div class="task-participation-container is-disabled">
                                <input type="text" class="task-participation-input" value="${task.participation || ''}" title="Участие в задаче" autocomplete="off" disabled>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                        </td>
                        <td class="col-role">
                            <div class="custom-select-wrapper col-task-role is-disabled" tabindex="-1">
                                <div class="custom-select-trigger" data-value="${task.role}">${task.role}</div>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                        </td>
                        <td class="col-funcs">
                            <div class="functions-cell-container">
                                <div class="col-functions-selects">
                                    <div class="functions-list-container">
                                        ${funcsHtml}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="col-actions" style="display: none;"></td>
                    </tr>
                `;
            });
            
            // Calculate total AI influence for this table
            let totalInfluence = 0;
            (goal.tasks || []).forEach(task => {
                (task.functions || []).forEach(f => {
                    if (f.influence) {
                        const val = parseInt(f.influence.replace('%', ''), 10);
                        if (!isNaN(val)) totalInfluence += val;
                    }
                });
            });

            // Calculate total participation for this goal
            let totalParticipation = 0;
            (goal.tasks || []).forEach(task => {
                if (task.participation) {
                    const val = parseInt(task.participation.replace('%', ''), 10);
                    if (!isNaN(val)) totalParticipation += val;
                }
            });

            const totalPartBadge = totalParticipation > 0 
                ? `<span class="goal-total-participation-tag select-tag-badge" style="font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; text-transform: none; line-height: 1.2; height: fit-content; flex-shrink: 0; background-color: #F1F5F9; color: #475569; border: 1px solid #E2E8F0;">Участие: ${totalParticipation}%</span>`
                : '';



            html += `
                <div class="goal-card is-view-mode" style="pointer-events: none; opacity: 1;">
                    <div class="goal-card-header">
                        <div class="goal-number" title="Свернуть/Развернуть">
                            <span class="number-text">${gIndex + 1}</span>
                            <i data-lucide="chevron-down" class="chevron-icon"></i>
                        </div>
                        <div class="goal-name-wrapper col-goal-name is-disabled" tabindex="-1">
                            <span class="goal-name-text">${goal.name}</span>
                            ${totalPartBadge}
                        </div>
                        
                        <div class="goal-actions-group">
                            <div class="custom-select-wrapper col-goal-role is-disabled" style="width: 160px;" tabindex="-1">
                                <div class="custom-select-trigger">${goal.role}</div>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="task-table-container">
                        <table class="task-table">
                            <thead>
                                <tr>
                                    <th class="col-num">№</th>
                                    <th class="col-task-name">Наименование задачи</th>
                                    <th class="col-participation">Участие</th>
                                    <th class="col-role">Роль</th>
                                    <th class="col-funcs">Функции</th>
                                    <th class="col-actions" style="display: none;"></th>
                                </tr>
                            </thead>
                            <tbody class="task-body">
                                ${tasksHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });
        
        return html;
    };

    let currentViewProfile = null;

    const syncCurrentViewProfile = () => {
        if (!currentViewProfile) return null;

        if (profileStore) {
            currentViewProfile = profileStore.replace(currentViewProfile) || currentViewProfile;
            return currentViewProfile;
        }

        const idx = (window.profiles || []).findIndex(p => p.id === currentViewProfile.id);
        if (idx !== -1) {
            window.profiles[idx] = currentViewProfile;
        }
        if (window.renderProfilesTable) {
            window.renderProfilesTable(window.profiles);
        }
        return currentViewProfile;
    };

    const setupEditModeDropdowns = (profileOptions, categoryOptions, leaderOptions, statusOptions, curCategories) => {
        const enableSave = () => {
            const btnSave = document.getElementById('btn-save-view-edit');
            if (btnSave) btnSave.disabled = false;
        };



        // Bind date input and code input changes to enable Save
        const dateInput = document.getElementById('attr-edit-date-input');
        if (dateInput) {
            dateInput.addEventListener('change', enableSave);
            dateInput.addEventListener('input', enableSave);
        }
        const codeInput = document.getElementById('attr-edit-code-input');
        if (codeInput) {
            codeInput.addEventListener('input', enableSave);
            codeInput.addEventListener('change', enableSave);
        }

        // Click outside closes all attribute dropdowns
        const handleOutsideClick = (e) => {
            const dropdownWrappers = document.querySelectorAll('.attr-custom-select-wrapper');
            dropdownWrappers.forEach(wrapper => {
                if (!wrapper.contains(e.target)) {
                    wrapper.classList.remove('is-open');
                    const menu = wrapper.querySelector('.attr-dropdown-menu');
                    if (menu) menu.style.display = 'none';
                }
            });
        };
        document.removeEventListener('click', handleOutsideClick);
        document.addEventListener('click', handleOutsideClick);

        // General helper to setup toggle on trigger click
        const setupDropdownToggle = (wrapperId) => {
            const wrapper = document.getElementById(wrapperId);
            if (!wrapper) return;
            const trigger = wrapper.querySelector('.attr-custom-select-trigger');
            const menu = wrapper.querySelector('.attr-dropdown-menu');
            if (!trigger || !menu) return;

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other dropdowns first
                const allWrappers = document.querySelectorAll('.attr-custom-select-wrapper');
                allWrappers.forEach(otherWrapper => {
                    if (otherWrapper !== wrapper) {
                        otherWrapper.classList.remove('is-open');
                        const otherMenu = otherWrapper.querySelector('.attr-dropdown-menu');
                        if (otherMenu) otherMenu.style.display = 'none';
                    }
                });

                const isOpen = wrapper.classList.toggle('is-open');
                menu.style.display = isOpen ? 'flex' : 'none';

                // Focus search input if open
                if (isOpen) {
                    const searchInput = menu.querySelector('.attr-dropdown-search-input');
                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.focus();
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }
            });
        };

        // Setup triggers for all 4 dropdowns
        setupDropdownToggle('attr-edit-profile-wrapper');
        setupDropdownToggle('attr-edit-category-wrapper');
        setupDropdownToggle('attr-edit-leader-wrapper');
        setupDropdownToggle('attr-edit-status-wrapper');

        // 1. PROFILE DROPDOWN logic
        const profileList = document.getElementById('attr-edit-profile-list');
        const profileWrapper = document.getElementById('attr-edit-profile-wrapper');
        if (profileList && profileWrapper) {
            const trigger = profileWrapper.querySelector('.attr-custom-select-trigger');
            const searchInput = profileWrapper.querySelector('.attr-dropdown-search-input');
            const menu = profileWrapper.querySelector('.attr-dropdown-menu');

            const renderProfiles = (filterText = '') => {
                const query = filterText.toLowerCase();
                const filtered = profileOptions.filter(name => name.toLowerCase().includes(query));
                
                profileList.innerHTML = '';
                if (filtered.length === 0) {
                    profileList.innerHTML = '<div class="attr-dropdown-empty">Ничего не найдено</div>';
                    return;
                }

                const selectedVal = trigger.getAttribute('data-value');
                filtered.forEach(name => {
                    const isSel = name === selectedVal;
                    const item = document.createElement('div');
                    item.className = `attr-dropdown-item ${isSel ? 'selected' : ''}`;
                    item.innerHTML = `
                        <span>${name}</span>
                        <div class="attr-item-selection">
                            ${isSel ? '<i data-lucide="check"></i>' : ''}
                        </div>
                    `;
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        trigger.setAttribute('data-value', name);
                        trigger.innerHTML = name;
                        trigger.classList.remove('is-placeholder');
                        
                        wrapperClose(profileWrapper, menu);
                        enableSave();
                    });
                    profileList.appendChild(item);
                });
                if (window.lucide) window.lucide.createIcons();
            };

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    renderProfiles(e.target.value);
                });
            }
            renderProfiles();
        }

        // 2. CATEGORY MULTI-SELECT DROPDOWN logic
        const categoryList = document.getElementById('attr-edit-category-list');
        const categoryWrapper = document.getElementById('attr-edit-category-wrapper');
        if (categoryList && categoryWrapper) {
            const trigger = categoryWrapper.querySelector('.attr-custom-select-trigger');
            const searchInput = categoryWrapper.querySelector('.attr-dropdown-search-input');
            
            let selectedCats = [...curCategories];

            const updateCategoryTrigger = (trigger, selectedCats) => {
                if (!trigger) return;
                trigger.setAttribute('data-value', selectedCats.join(','));
                if (selectedCats.length === 0) {
                    trigger.innerHTML = '<span style="color:#94A3B8;">Выберите категории...</span>';
                    trigger.classList.add('is-placeholder');
                    return;
                }
                trigger.classList.remove('is-placeholder');

                trigger.innerHTML = '';
                const container = document.createElement('div');
                container.className = 'category-tags-container';
                trigger.appendChild(container);

                const doCalculation = () => {
                    container.innerHTML = '';
                    const availableWidth = trigger.clientWidth - 44; // Padding: 12px left, 32px right

                    const createTagElement = (cat) => {
                        const tag = document.createElement('span');
                        tag.className = 'category-tag';
                        tag.innerHTML = `
                            <span class="category-tag-text">${cat}</span>
                            <span class="category-tag-remove" title="Удалить">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </span>
                        `;
                        const removeBtn = tag.querySelector('.category-tag-remove');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const idx = selectedCats.indexOf(cat);
                                if (idx > -1) {
                                    selectedCats.splice(idx, 1);
                                }
                                updateCategoryTrigger(trigger, selectedCats);
                                enableSave();
                                if (typeof renderCategories === 'function') {
                                    renderCategories(searchInput ? searchInput.value : '');
                                }
                            });
                        }
                        return tag;
                    };

                    if (availableWidth <= 0) {
                        const maxFallback = 2;
                        if (selectedCats.length <= maxFallback) {
                            selectedCats.forEach(cat => {
                                container.appendChild(createTagElement(cat));
                            });
                        } else {
                            selectedCats.slice(0, maxFallback).forEach(cat => {
                                container.appendChild(createTagElement(cat));
                            });
                            const more = document.createElement('span');
                            more.className = 'category-more-badge';
                            more.textContent = `+${selectedCats.length - maxFallback}`;
                            container.appendChild(more);
                        }
                        return;
                    }

                    // Render all tags first to check if they all fit
                    selectedCats.forEach(cat => {
                        container.appendChild(createTagElement(cat));
                    });

                    // If all of them fit, we are done
                    if (container.scrollWidth <= availableWidth) {
                        return;
                    }

                    // Otherwise, we loop and remove tags from the end one by one,
                    // appending a badge "+N", until it fits
                    const moreBadge = document.createElement('span');
                    moreBadge.className = 'category-more-badge';

                    let tagsCount = selectedCats.length;
                    while (tagsCount > 0) {
                        container.removeChild(container.lastChild);
                        tagsCount--;

                        const hiddenCount = selectedCats.length - tagsCount;
                        moreBadge.textContent = `+${hiddenCount}`;
                        container.appendChild(moreBadge);

                        if (container.scrollWidth <= availableWidth) {
                            break;
                        }

                        container.removeChild(moreBadge);
                    }
                };

                doCalculation();
                setTimeout(doCalculation, 0);
            };

            const renderCategories = (filterText = '') => {
                const query = filterText.toLowerCase();
                const filtered = categoryOptions.filter(cat => cat.toLowerCase().includes(query));

                categoryList.innerHTML = '';
                if (filtered.length === 0) {
                    categoryList.innerHTML = '<div class="attr-dropdown-empty">Ничего не найдено</div>';
                    return;
                }

                filtered.forEach(cat => {
                    const isChecked = selectedCats.includes(cat);
                    const item = document.createElement('div');
                    item.className = 'attr-dropdown-item multi-select';
                    item.innerHTML = `
                        <input type="checkbox" class="attr-item-checkbox" ${isChecked ? 'checked' : ''}>
                        <span>${cat}</span>
                    `;
                    
                    const toggleSelect = () => {
                        const idx = selectedCats.indexOf(cat);
                        if (idx > -1) {
                            selectedCats.splice(idx, 1);
                        } else {
                            selectedCats.push(cat);
                        }
                        
                        const chk = item.querySelector('.attr-item-checkbox');
                        if (chk) chk.checked = !isChecked;

                        updateCategoryTrigger(trigger, selectedCats);

                        enableSave();
                        renderCategories(searchInput ? searchInput.value : '');
                    };

                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleSelect();
                    });

                    categoryList.appendChild(item);
                });
            };

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    renderCategories(e.target.value);
                });
            }
            renderCategories();
            updateCategoryTrigger(trigger, selectedCats);
        }

        // 3. LEADER DROPDOWN logic (with name, surname, patronymic search)
        const leaderList = document.getElementById('attr-edit-leader-list');
        const leaderWrapper = document.getElementById('attr-edit-leader-wrapper');
        if (leaderList && leaderWrapper) {
            const trigger = leaderWrapper.querySelector('.attr-custom-select-trigger');
            const searchInput = leaderWrapper.querySelector('.attr-dropdown-search-input');
            const menu = leaderWrapper.querySelector('.attr-dropdown-menu');

            const renderLeaders = (filterText = '') => {
                const query = filterText.toLowerCase();
                const filtered = leaderOptions.filter(leader => 
                    leader.name.toLowerCase().includes(query)
                );

                leaderList.innerHTML = '';
                if (filtered.length === 0) {
                    leaderList.innerHTML = '<div class="attr-dropdown-empty">Ничего не найдено</div>';
                    return;
                }

                const selectedVal = trigger.getAttribute('data-value');
                filtered.forEach(leader => {
                    const isSel = leader.name === selectedVal;
                    const item = document.createElement('div');
                    item.className = `attr-dropdown-item ${isSel ? 'selected' : ''}`;
                    item.innerHTML = `
                        <div class="attr-leader-option">
                            <span class="attr-leader-option-name">${leader.name}</span>
                            <span class="attr-leader-option-position">${leader.position || 'Руководитель'}</span>
                        </div>
                        <div class="attr-item-selection">
                            ${isSel ? '<i data-lucide="check"></i>' : ''}
                        </div>
                    `;
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        trigger.setAttribute('data-value', leader.name);
                        trigger.setAttribute('data-position', leader.position);
                        trigger.innerHTML = `<span class="attr-select-trigger-text">${leader.name}</span>`;
                        trigger.setAttribute('title', leader.name);
                        trigger.classList.remove('is-placeholder');

                        wrapperClose(leaderWrapper, menu);
                        enableSave();
                    });
                    leaderList.appendChild(item);
                });
                if (window.lucide) window.lucide.createIcons();
            };

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    renderLeaders(e.target.value);
                });
            }
            renderLeaders();
        }

        // 4. STATUS DROPDOWN logic
        const statusList = document.getElementById('attr-edit-status-list');
        const statusWrapper = document.getElementById('attr-edit-status-wrapper');
        if (statusList && statusWrapper) {
            const trigger = statusWrapper.querySelector('.attr-custom-select-trigger');
            const menu = statusWrapper.querySelector('.attr-dropdown-menu');

            const renderStatuses = () => {
                statusList.innerHTML = '';
                const selectedVal = trigger.getAttribute('data-value');

                statusOptions.forEach(status => {
                    const isSel = status === selectedVal;
                    const item = document.createElement('div');
                    item.className = `attr-dropdown-item ${isSel ? 'selected' : ''}`;
                    item.innerHTML = `
                        <span>${status}</span>
                        <div class="attr-item-selection">
                            ${isSel ? '<i data-lucide="check"></i>' : ''}
                        </div>
                    `;
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        trigger.setAttribute('data-value', status);
                        trigger.innerHTML = status;
                        trigger.classList.remove('is-placeholder');

                        wrapperClose(statusWrapper, menu);
                        enableSave();
                    });
                    statusList.appendChild(item);
                });
                if (window.lucide) window.lucide.createIcons();
            };

            renderStatuses();
        }

        const wrapperClose = (wrapper, menu) => {
            wrapper.classList.remove('is-open');
            if (menu) menu.style.display = 'none';
        };
    };

    const renderProfileAttributes = (profile, isEditMode) => {
        const attributesContainer = document.getElementById('view-profile-attributes-container');
        if (!attributesContainer || !profile) return;

        if (!isEditMode) {
            const dateVal = window.formatDate ? window.formatDate(profile.updatedAt) : (profile.updatedAt || '');
            const getStatusBadge = window.getStatusBadge || ((status) => `<span class="status-badge draft">${status}</span>`);
            const statusBadgeHtml = getStatusBadge(profile.status);

            const categoryHtml = (profile.categories || []).map(cat => {
                let tagClass = 'other';
                const catLower = cat.toLowerCase();
                if (catLower.includes('разработ') || catLower.includes('backend') || catLower.includes('frontend') || catLower.includes('ит') || catLower.includes('дизайн') || catLower.includes('безопасн') || catLower.includes('аналитик')) {
                    tagClass = 'tech';
                } else if (catLower.includes('управлен') || catLower.includes('менеджмент') || catLower.includes('hr') || catLower.includes('маркетинг') || catLower.includes('финансы')) {
                    tagClass = 'mgmt';
                }
                return `<span class="category-tag-badge ${tagClass}">${cat}</span>`;
            }).join(' ');

            const typicalBadgeHtml = profile.isTypicalProfile 
                ? `<span class="badge-typical-profile" style="margin-left: 8px;">ТИПОВОЙ ПРОФИЛЬ</span>` 
                : '';

            attributesContainer.innerHTML = `
                <!-- Профиль -->
                <div class="profile-attr-row">
                    <div class="profile-attr-label">Профиль</div>
                    <div class="profile-attr-value">
                        <span>${profile.name || ''}</span>
                        ${typicalBadgeHtml}
                    </div>
                    <div class="profile-attr-action">
                        <a href="#" class="profile-attr-link">Раскрыть</a>
                    </div>
                </div>

                <!-- Код профиля -->
                <div class="profile-attr-row">
                    <div class="profile-attr-label">Код профиля:</div>
                    <div class="profile-attr-value">${profile.code || ''}</div>
                </div>

                <!-- Классификатор -->
                <div class="profile-attr-row">
                    <div class="profile-attr-label">Классификатор</div>
                    <div class="profile-attr-value" id="view-profile-classifier-val">${profile.classifier || ''}</div>
                </div>

                <!-- Категория -->
                <div class="profile-attr-row">
                    <div class="profile-attr-label">Категория</div>
                    <div class="profile-attr-value">${categoryHtml || '—'}</div>
                    <div class="profile-attr-action">
                        <a href="#" class="profile-attr-link">Раскрыть</a>
                    </div>
                </div>

                <!-- Код ОКЗ -->
                <div class="profile-attr-row">
                    <div class="profile-attr-label">Код ОКЗ</div>
                    <div class="profile-attr-value" id="view-profile-okz-val">${profile.okzCode || '—'}</div>
                </div>

                <!-- Руководитель -->
                <div class="profile-attr-row">
                    <div class="profile-attr-label">Руководитель</div>
                    <div class="profile-attr-value">
                        <div class="leader-info-block">
                            <span class="leader-name">${profile.leaderName || '—'}</span>
                            <span class="leader-position">${profile.leaderPosition || '—'}</span>
                        </div>
                    </div>
                </div>

                <!-- Дата изменения -->
                <div class="profile-attr-row">
                    <div class="profile-attr-label">Дата изменения</div>
                    <div class="profile-attr-value">${dateVal}</div>
                </div>

                <!-- Статус -->
                <div class="profile-attr-row">
                    <div class="profile-attr-label">Статус</div>
                    <div class="profile-attr-value" id="view-profile-status-val">${statusBadgeHtml}</div>
                </div>
            `;
        } else {
            const allProfiles = window.profiles || [];
            
            const profileOptions = Array.from(new Set(allProfiles.map(p => p.name).filter(Boolean))).sort();
            const categoryOptions = Array.from(new Set(allProfiles.flatMap(p => p.categories || []).filter(Boolean))).sort();
            
            const leadersMap = new Map();
            allProfiles.forEach(p => {
                if (p.leaderName) {
                    leadersMap.set(p.leaderName, p.leaderPosition || '');
                }
            });
            const leaderOptions = Array.from(leadersMap.entries()).map(([name, position]) => ({ name, position })).sort((a, b) => a.name.localeCompare(b.name));
            
            const standardStatuses = ["Активен", "Черновик", "В архиве", "На согласовании"];
            const dynamicStatuses = Array.from(new Set(allProfiles.map(p => p.status).filter(Boolean)));
            const statusOptions = Array.from(new Set([...standardStatuses, ...dynamicStatuses]));

            const curName = profile.name || '';
            const curCode = profile.code || '';
            const curCategories = profile.categories || [];
            const curLeaderName = profile.leaderName || '';
            const curLeaderPosition = profile.leaderPosition || '';
            const curDate = profile.updatedAt ? profile.updatedAt.split('T')[0] : '';
            const curStatus = profile.status || '';

            const categoryTriggerText = curCategories.length > 0 ? curCategories.join(', ') : '';
            const categoryPlaceholderClass = curCategories.length === 0 ? 'is-placeholder' : '';

            const leaderTriggerText = curLeaderName ? `<span class="attr-select-trigger-text">${curLeaderName}</span>` : '';
            const leaderPlaceholderClass = !curLeaderName ? 'is-placeholder' : '';

            attributesContainer.innerHTML = `
                <div class="profile-attributes-edit-grid">
                    <!-- 1. Профиль (Select with Search) -->
                    <div class="attr-edit-form-group">
                        <label class="attr-edit-label">Профиль</label>
                        <div class="attr-custom-select-wrapper" id="attr-edit-profile-wrapper">
                            <div class="attr-custom-select-trigger" id="attr-edit-profile-trigger" data-value="${curName}">
                                ${curName || '<span style="color:#94A3B8;">Выберите профиль...</span>'}
                            </div>
                            <div class="attr-custom-select-chevron">
                                <i data-lucide="chevron-down"></i>
                            </div>
                            <div class="attr-dropdown-menu" style="display: none;">
                                <div class="attr-dropdown-search-box">
                                    <input type="text" class="attr-dropdown-search-input" placeholder="Поиск профиля..." autocomplete="off">
                                </div>
                                <div class="attr-dropdown-list" id="attr-edit-profile-list">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Код профиля (Text input) -->
                    <div class="attr-edit-form-group">
                        <label class="attr-edit-label">Код профиля</label>
                        <input type="text" class="attr-edit-input" id="attr-edit-code-input" placeholder="Введите код профиля..." value="${curCode}" autocomplete="off">
                    </div>

                    <!-- 3. Категория (Multi-select with Search) -->
                    <div class="attr-edit-form-group">
                        <label class="attr-edit-label">Категория</label>
                        <div class="attr-custom-select-wrapper" id="attr-edit-category-wrapper">
                            <div class="attr-custom-select-trigger ${categoryPlaceholderClass}" id="attr-edit-category-trigger" data-value="${curCategories.join(',')}">
                                ${categoryTriggerText || '<span style="color:#94A3B8;">Выберите категории...</span>'}
                            </div>
                            <div class="attr-custom-select-chevron">
                                <i data-lucide="chevron-down"></i>
                            </div>
                            <div class="attr-dropdown-menu" style="display: none;">
                                <div class="attr-dropdown-search-box">
                                    <input type="text" class="attr-dropdown-search-input" placeholder="Поиск категорий..." autocomplete="off">
                                </div>
                                <div class="attr-dropdown-list" id="attr-edit-category-list">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 4. Руководитель (Select with Search by name, surname, patronymic) -->
                    <div class="attr-edit-form-group">
                        <label class="attr-edit-label">Руководитель</label>
                        <div class="attr-custom-select-wrapper" id="attr-edit-leader-wrapper">
                            <div class="attr-custom-select-trigger ${leaderPlaceholderClass}" id="attr-edit-leader-trigger" data-value="${curLeaderName}" data-position="${curLeaderPosition}" title="${curLeaderName}">
                                ${leaderTriggerText || '<span style="color:#94A3B8;">Выберите руководителя...</span>'}
                            </div>
                            <div class="attr-custom-select-chevron">
                                <i data-lucide="chevron-down"></i>
                            </div>
                            <div class="attr-dropdown-menu" style="display: none;">
                                <div class="attr-dropdown-search-box">
                                    <input type="text" class="attr-dropdown-search-input" placeholder="Поиск руководителя..." autocomplete="off">
                                </div>
                                <div class="attr-dropdown-list" id="attr-edit-leader-list">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 5. Дата изменения (Date input) -->
                    <div class="attr-edit-form-group">
                        <label class="attr-edit-label">Дата изменения</label>
                        <input type="date" class="attr-edit-input" id="attr-edit-date-input" value="${curDate}">
                    </div>

                    <!-- 6. Статус (Select dropdown, no search needed) -->
                    <div class="attr-edit-form-group">
                        <label class="attr-edit-label">Статус</label>
                        <div class="attr-custom-select-wrapper" id="attr-edit-status-wrapper">
                            <div class="attr-custom-select-trigger" id="attr-edit-status-trigger" data-value="${curStatus}">
                                ${curStatus || '<span style="color:#94A3B8;">Выберите статус...</span>'}
                            </div>
                            <div class="attr-custom-select-chevron">
                                <i data-lucide="chevron-down"></i>
                            </div>
                            <div class="attr-dropdown-menu" style="display: none;">
                                <div class="attr-dropdown-list" id="attr-edit-status-list">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            setupEditModeDropdowns(profileOptions, categoryOptions, leaderOptions, statusOptions, curCategories);
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    const openViewProfileDrawer = (profileName) => {
        const profile = profileStore ? profileStore.findByName(profileName) : (window.profiles || []).find(p => p.name === profileName);
        currentViewProfile = profile;

        if (typeof applyCompetenciesState === 'function') {
            applyCompetenciesState(profile ? profile.competencies : null);
        }

        const btnSendReviewEl = document.getElementById('btn-send-review');
        if (btnSendReviewEl) {
            if (profile && profile.status === 'На оценке') {
                btnSendReviewEl.style.display = 'none';
            } else {
                btnSendReviewEl.style.display = '';
            }
        }

        if (viewDrawerTitle) {
            viewDrawerTitle.textContent = profileName;
        }

        // Заполнение хлебных крошек
        const breadcrumbsList = document.getElementById('view-drawer-breadcrumbs-list');
        if (breadcrumbsList) {
            breadcrumbsList.innerHTML = `
                <span>Центральный контур корпоративной структуры</span>
                <div class="breadcrumbs-separator"><i data-lucide="chevron-right"></i></div>
                <span>Отдел рабочей документации</span>
                <div class="breadcrumbs-separator"><i data-lucide="chevron-right"></i></div>
                <span class="active-node">${profile ? profile.department : 'Отдел концептуальных решений'}</span>
            `;
        }

        // Заполнение списка атрибутов
        renderProfileAttributes(profile, false);

        const goalsContainer = document.getElementById('view-profile-goals-container');
        if (goalsContainer) {
            goalsContainer.innerHTML = generateViewGoalsHtml(profile);
            
            // Reset tabs visually to the first one
            const tabs = document.querySelectorAll('.view-tab-btn');
            tabs.forEach((t, i) => {
                if(i === 0) t.classList.add('active');
                else t.classList.remove('active');
            });
        }


        if (viewProfileDrawer) {
            viewProfileDrawer.classList.add('is-open');
        }
        if (drawerBackdrop) {
            drawerBackdrop.classList.add('is-visible');
        }
        document.body.style.overflow = 'hidden';
        lucide.createIcons(); // Refresh icons inside drawer
    };

    const closeViewProfileDrawer = () => {
        if (viewProfileDrawer) {
            viewProfileDrawer.classList.remove('is-open');
        }
        
        const compContent = document.getElementById('competencies-content');
        const funcContent = document.getElementById('functional-content');
        if (compContent && funcContent && compContent.parentElement !== funcContent.parentElement) {
            compContent.classList.remove('is-view-mode');
            compContent.style.display = 'none';
            funcContent.after(compContent);
        }
        if (!profileDrawer || !profileDrawer.classList.contains('is-open')) {
            if (drawerBackdrop) {
                drawerBackdrop.classList.remove('is-visible');
            }
            document.body.style.overflow = '';
        }
        // Reset view edit mode state
        if (isViewEditMode) {
            isViewEditMode = false;
            const btnEdit = document.getElementById('btn-edit-profile');
            const viewFooter = document.getElementById('view-drawer-footer');
            const btnAddGoal = document.getElementById('btn-view-add-goal');
            if (btnEdit) {
                btnEdit.classList.remove('active-edit-btn');
                btnEdit.innerHTML = '<i data-lucide="edit-3"></i><span>Редактировать</span>';
            }
            if (viewFooter) viewFooter.style.display = 'none';
            if (btnAddGoal) btnAddGoal.style.display = 'none';
            lucide.createIcons();
        }
    };

    // --- Corporate Structure Tree Select Logic ---
    const CORPORATE_STRUCTURE = {
        name: "Центральный контур корпоративной структуры",
        children: [
            {
                name: "Управление стратегического развития",
                children: [
                    {
                        name: "Группа стратегического анализа",
                        children: [
                            { name: "Направление отраслевого мониторинга" },
                            { name: "Направление оценки инициатив" }
                        ]
                    },
                    {
                        name: "Группа методологии развития",
                        children: [
                            { name: "Направление целевой модели" },
                            { name: "Направление дорожных карт" }
                        ]
                    }
                ]
            },
            {
                name: "Департамент финансов и учета",
                children: [
                    {
                        name: "Управление бюджетирования",
                        children: [
                            { name: "Отдел планирования бюджета" },
                            { name: "Отдел контроля исполнения бюджета" },
                            { name: "Отдел финансовой отчетности" }
                        ]
                    },
                    {
                        name: "Управление бухгалтерского учета",
                        children: [
                            { name: "Отдел первичной документации" },
                            { name: "Отдел налогового учета" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел внутреннего мониторинга процессов",
                children: [
                    {
                        name: "Группа анализа процессов",
                        children: [
                            { name: "Сектор сбора данных" },
                            { name: "Сектор выявления отклонений" }
                        ]
                    },
                    {
                        name: "Группа контрольных мероприятий",
                        children: [
                            { name: "Сектор проверок" },
                            { name: "Сектор подготовки заключений" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел внутреннего мониторинга процессов",
                children: [
                    {
                        name: "Группа регламентного контроля",
                        children: [
                            { name: "Сектор контроля сроков" },
                            { name: "Сектор контроля полноты данных" }
                        ]
                    },
                    {
                        name: "Группа процессной аналитики",
                        children: [
                            { name: "Сектор описания процессов" },
                            { name: "Сектор оптимизации процессов" },
                            { name: "Сектор процессных метрик" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел рабочей документации проектов капитального строительства",
                children: [
                    {
                        name: "Дирекция проектной документации",
                        children: [
                            { name: "Отдел комплектования проектной документации" },
                            { name: "Отдел проверки проектных решений" }
                        ]
                    },
                    {
                        name: "Отдел концептуальных решений",
                        children: [
                            {
                                name: "Группа архитектурных концепций",
                                children: [
                                    { name: "Сектор предпроектных решений" },
                                    { name: "Сектор визуализации концепций" }
                                ]
                            },
                            {
                                name: "Группа инженерных концепций",
                                children: [
                                    { name: "Сектор инженерных ограничений" },
                                    { name: "Сектор технико-экономической оценки" },
                                    { name: "Сектор согласования концепций" }
                                ]
                            }
                        ]
                    },
                    {
                        name: "Отдел разрешительной документации",
                        children: [
                            { name: "Сектор экспертизы" },
                            { name: "Сектор сопровождения разрешений на строительство и согласования" },
                            { name: "Подразделение контроля нормативных заключений" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел продуктовых инициатив",
                children: [
                    {
                        name: "Группа исследования инициатив",
                        children: [
                            { name: "Сектор сбора потребностей" },
                            { name: "Сектор анализа ценности" }
                        ]
                    },
                    {
                        name: "Группа запуска инициатив",
                        children: [
                            { name: "Сектор прототипирования решений" },
                            { name: "Сектор пилотного внедрения" },
                            { name: "Сектор оценки результата" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел продуктовых инициатив",
                children: [
                    {
                        name: "Группа продуктового портфеля",
                        children: [
                            { name: "Сектор приоритизации инициатив" },
                            { name: "Сектор ведения продуктовой карты" }
                        ]
                    },
                    {
                        name: "Группа сопровождения продуктов",
                        children: [
                            { name: "Сектор обратной связи" },
                            { name: "Сектор развития функциональности" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел организационных документов",
                children: [
                    {
                        name: "Группа подготовки организационных документов",
                        children: [
                            { name: "Сектор приказов" },
                            { name: "Сектор положений" }
                        ]
                    },
                    {
                        name: "Группа актуализации документов",
                        children: [
                            { name: "Сектор контроля версий" },
                            { name: "Сектор согласования изменений" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел регламентов",
                children: [
                    {
                        name: "Группа разработки регламентов",
                        children: [
                            { name: "Сектор описания процедур" },
                            { name: "Сектор нормативной проверки" }
                        ]
                    },
                    {
                        name: "Группа сопровождения регламентов",
                        children: [
                            { name: "Сектор актуализации" },
                            { name: "Сектор методической поддержки" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел административных распоряжений",
                children: [
                    {
                        name: "Группа подготовки распоряжений",
                        children: [
                            { name: "Сектор внутренних поручений" },
                            { name: "Сектор организационных указаний" }
                        ]
                    },
                    {
                        name: "Группа контроля исполнения",
                        children: [
                            { name: "Сектор сроков исполнения" },
                            { name: "Сектор отчетности по распоряжениям" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел архивной документации",
                children: [
                    {
                        name: "Группа архивного хранения",
                        children: [
                            { name: "Сектор бумажного архива" },
                            { name: "Сектор электронного архива" }
                        ]
                    },
                    {
                        name: "Группа выдачи архивных материалов",
                        children: [
                            { name: "Сектор обработки запросов" },
                            { name: "Сектор учета выдачи" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел внутреннего делопроизводства",
                children: [
                    {
                        name: "Группа входящей корреспонденции",
                        children: [
                            { name: "Сектор регистрации" },
                            { name: "Сектор маршрутизации" }
                        ]
                    },
                    {
                        name: "Группа исходящей корреспонденции",
                        children: [
                            { name: "Сектор подготовки отправки" },
                            { name: "Сектор контроля доставки" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел служебных документов",
                children: [
                    {
                        name: "Группа служебных записок",
                        children: [
                            { name: "Сектор подготовки записок" },
                            { name: "Сектор согласования записок" }
                        ]
                    },
                    {
                        name: "Группа внутренних справок",
                        children: [
                            { name: "Сектор формирования справок" },
                            { name: "Сектор проверки данных" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел управленческих поручений",
                children: [
                    {
                        name: "Группа постановки поручений",
                        children: [
                            { name: "Сектор регистрации поручений" },
                            { name: "Сектор назначения ответственных" }
                        ]
                    },
                    {
                        name: "Группа мониторинга поручений",
                        children: [
                            { name: "Сектор контроля сроков" },
                            { name: "Сектор статусов исполнения" },
                            { name: "Сектор эскалации просрочек" }
                        ]
                    }
                ]
            },
            {
                name: "Отдел документационного контроля",
                children: [
                    {
                        name: "Группа проверки документации",
                        children: [
                            { name: "Сектор полноты комплектов" },
                            { name: "Сектор корректности оформления" }
                        ]
                    },
                    {
                        name: "Группа контрольных замечаний",
                        children: [
                            { name: "Сектор фиксации замечаний" },
                            { name: "Сектор контроля устранения" }
                        ]
                    }
                ]
            }
        ]
    };

    const treeContainer = document.getElementById('param-structure-dropdown');
    const treeTrigger = document.getElementById('param-structure-trigger');
    const treeValue = document.getElementById('param-structure-value');
    const hiddenSelect = document.getElementById('param-structure');

    const renderTreeNodes = (node, path) => {
        const hasChildren = node.children && node.children.length > 0;
        const isRoot = path === "0";
        
        // Root is expanded initially, all other subfolders collapsed
        const isExpanded = isRoot; 
        
        let html = `<li class="tree-node-wrapper" data-path="${path}">`;
        html += `<div class="tree-item-container">`;
        
        if (hasChildren) {
            const symbol = isExpanded ? '−' : '+';
            html += `<button type="button" class="tree-toggle-btn" data-path="${path}">${symbol}</button>`;
        } else {
            html += `<div class="tree-toggle-spacer"></div>`;
        }
        
        html += `<div class="tree-node-content" data-path="${path}" data-name="${node.name.replace(/"/g, '&quot;')}">${node.name}</div>`;
        html += `</div>`;
        
        if (hasChildren) {
            const collapsedClass = isExpanded ? '' : 'collapsed';
            html += `<ul class="tree-list tree-subtree ${collapsedClass}" data-parent-path="${path}">`;
            node.children.forEach((child, index) => {
                html += renderTreeNodes(child, `${path}.${index}`);
            });
            html += `</ul>`;
        }
        
        html += `</li>`;
        return html;
    };

    const resetTreeSelect = () => {
        if (!treeContainer || !treeTrigger || !treeValue || !hiddenSelect) return;
        
        // Deselect any selected items
        treeContainer.querySelectorAll('.tree-node-content.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Reset label and hidden select
        treeValue.textContent = "Выберите подразделение";
        treeValue.classList.add('is-placeholder');
        
        hiddenSelect.innerHTML = `<option value="" disabled selected>Выберите подразделение</option>`;
        hiddenSelect.value = "";
        
        // Trigger validation state update
        validateFunctionalStage();

        // Collapse all subtrees except the root node
        treeContainer.querySelectorAll('.tree-subtree').forEach(ul => {
            const parentPath = ul.dataset.parentPath;
            if (parentPath !== "0") {
                ul.classList.add('collapsed');
            } else {
                ul.classList.remove('collapsed');
            }
        });
        
        treeContainer.querySelectorAll('.tree-toggle-btn').forEach(btn => {
            const path = btn.dataset.path;
            if (path !== "0") {
                btn.textContent = "+";
            } else {
                btn.textContent = "−";
            }
        });
    };

    const initTreeSelect = () => {
        if (!treeContainer || !treeTrigger) return;

        // Render corporate structure tree into the dropdown container
        treeContainer.innerHTML = `<ul class="tree-list">${renderTreeNodes(CORPORATE_STRUCTURE, "0")}</ul>`;

        // Toggle open/close state of the dropdown list
        treeTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = treeContainer.classList.toggle('is-open');
            treeTrigger.classList.toggle('is-active', isOpen);
        });

        // Expand / Collapse folders
        treeContainer.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.tree-toggle-btn');
            if (toggleBtn) {
                e.stopPropagation();
                const path = toggleBtn.dataset.path;
                const sublist = treeContainer.querySelector(`ul[data-parent-path="${path}"]`);
                if (sublist) {
                    const isCollapsed = sublist.classList.toggle('collapsed');
                    toggleBtn.textContent = isCollapsed ? '+' : '−';
                }
                return;
            }

            const nodeContent = e.target.closest('.tree-node-content');
            if (nodeContent) {
                e.stopPropagation();
                
                // Remove selection from previous item and set it on new one
                treeContainer.querySelectorAll('.tree-node-content.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                nodeContent.classList.add('selected');

                const selectedName = nodeContent.dataset.name;

                // Update trigger label
                treeValue.textContent = selectedName;
                treeValue.classList.remove('is-placeholder');

                // Write to original hidden select element
                hiddenSelect.innerHTML = `<option value="" disabled selected>Выберите подразделение</option>`;
                const option = document.createElement('option');
                option.value = selectedName;
                option.textContent = selectedName;
                option.selected = true;
                hiddenSelect.appendChild(option);
                hiddenSelect.value = selectedName;

                // Dispatch event trigger for form validation
                hiddenSelect.dispatchEvent(new Event('input', { bubbles: true }));
                hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));

                // Close dropdown
                treeContainer.classList.remove('is-open');
                treeTrigger.classList.remove('is-active');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!treeTrigger.contains(e.target) && !treeContainer.contains(e.target)) {
                treeContainer.classList.remove('is-open');
                treeTrigger.classList.remove('is-active');
            }
        });
    };

    // Run custom tree select initialization
    initTreeSelect();

    openDrawerBtn.addEventListener('click', openDrawer);
    closeDrawerBtn.addEventListener('click', closeDrawer);
    if (backDrawerBtn) {
        backDrawerBtn.addEventListener('click', closeDrawer);
    }
    
    // View Profile Drawer Close Events
    if (closeViewDrawerBtn) {
        closeViewDrawerBtn.addEventListener('click', closeViewProfileDrawer);
    }
    if (backViewDrawerBtn) {
        backViewDrawerBtn.addEventListener('click', closeViewProfileDrawer);
    }

    // Backdrop closes all drawers
    drawerBackdrop.addEventListener('click', () => {
        closeDrawer();
        closeViewProfileDrawer();
    });

    // Edit Profile button interaction from view drawer toolbar
    const btnEditProfile = document.getElementById('btn-edit-profile');
    if (btnEditProfile) {
        btnEditProfile.addEventListener('click', () => {
            if (currentViewProfile) {
                if (isViewEditMode) {
                    exitViewEditMode();
                } else {
                    enterViewEditMode();
                }
            }
        });
    }

    // Save view edit mode
    const btnSaveViewEdit = document.getElementById('btn-save-view-edit');
    if (btnSaveViewEdit) {
        btnSaveViewEdit.addEventListener('click', () => {
            saveViewEditMode();
        });
    }

    // Cancel view edit mode
    const btnCancelViewEdit = document.getElementById('btn-cancel-view-edit');
    if (btnCancelViewEdit) {
        btnCancelViewEdit.addEventListener('click', () => {
            exitViewEditMode();
        });
    }

    // Add Goal in View Edit Mode
    const btnViewAddGoal = document.getElementById('btn-view-add-goal');
    if (btnViewAddGoal) {
        btnViewAddGoal.addEventListener('click', () => {
            const container = document.getElementById('view-profile-goals-container');
            if (container) {
                createGoalCard(null, container);
                const btnSave = document.getElementById('btn-save-view-edit');
                if (btnSave && isViewEditMode) btnSave.disabled = false;
            }
        });
    }

    // Copy path button interaction
    const copyPathBtn = document.getElementById('copy-path-btn');
    if (copyPathBtn) {
        copyPathBtn.addEventListener('click', () => {
            const activeNode = document.querySelector('#view-drawer-breadcrumbs-list .active-node');
            const dep = activeNode ? activeNode.textContent.trim() : '';
            const fullPath = `Центральный контур корпоративной структуры > Отдел рабочей документации > ${dep}`;
            navigator.clipboard.writeText(fullPath).then(() => {
                const originalHTML = copyPathBtn.innerHTML;
                copyPathBtn.innerHTML = '<i data-lucide="check" style="color: #2E7D32;"></i>';
                lucide.createIcons();
                setTimeout(() => {
                    copyPathBtn.innerHTML = originalHTML;
                    lucide.createIcons();
                }, 1500);
            });
        });
    }

    // Archive profile button interaction and confirmation modal
    const btnArchiveProfile = document.getElementById('btn-archive-profile');
    const archiveModal = document.getElementById('archive-confirm-modal');
    const btnCloseArchiveModal = document.getElementById('btn-close-archive-modal');
    const btnCancelArchive = document.getElementById('btn-cancel-archive');
    const btnConfirmArchive = document.getElementById('btn-confirm-archive');

    if (btnArchiveProfile && archiveModal) {
        btnArchiveProfile.addEventListener('click', () => {
            archiveModal.classList.add('is-open');
        });
    }

    const closeArchiveModal = () => {
        if (archiveModal) {
            archiveModal.classList.remove('is-open');
        }
    };

    if (btnCloseArchiveModal) {
        btnCloseArchiveModal.addEventListener('click', closeArchiveModal);
    }
    if (btnCancelArchive) {
        btnCancelArchive.addEventListener('click', closeArchiveModal);
    }
    if (archiveModal) {
        archiveModal.addEventListener('click', (e) => {
            if (e.target === archiveModal) {
                closeArchiveModal();
            }
        });
    }

    if (btnConfirmArchive) {
        btnConfirmArchive.addEventListener('click', () => {
            if (currentViewProfile) {
                // Update status of current profile to "В архиве"
                currentViewProfile.status = 'В архиве';
                currentViewProfile.updatedAt = new Date().toISOString();

                syncCurrentViewProfile();

                // Close the modal and the profile drawer
                closeArchiveModal();
                closeViewProfileDrawer();

                // Display a gorgeous success toast notification on the right side
                showToast('Профиль должности успешно перенесен в архив!', true, true);
            }
        });
    }

    // Change classifier button interaction and modal
    const btnEditClassifier = document.getElementById('btn-edit-classifier');
    const classifierModal = document.getElementById('edit-classifier-modal');
    const btnCloseClassifierModal = document.getElementById('btn-close-classifier-modal');
    const btnCancelClassifier = document.getElementById('btn-cancel-classifier');
    const btnSaveClassifier = document.getElementById('btn-save-classifier');
    const inputClassifierVal = document.getElementById('input-classifier-val');

    if (btnEditClassifier && classifierModal && inputClassifierVal) {
        btnEditClassifier.addEventListener('click', () => {
            if (currentViewProfile) {
                inputClassifierVal.value = currentViewProfile.classifier || '';
                classifierModal.classList.add('is-open');
                setTimeout(() => {
                    inputClassifierVal.focus();
                }, 100);
            }
        });
    }

    const closeClassifierModal = () => {
        if (classifierModal) {
            classifierModal.classList.remove('is-open');
        }
    };

    if (btnCloseClassifierModal) {
        btnCloseClassifierModal.addEventListener('click', closeClassifierModal);
    }
    if (btnCancelClassifier) {
        btnCancelClassifier.addEventListener('click', closeClassifierModal);
    }
    if (classifierModal) {
        classifierModal.addEventListener('click', (e) => {
            if (e.target === classifierModal) {
                closeClassifierModal();
            }
        });
    }

    if (btnSaveClassifier) {
        btnSaveClassifier.addEventListener('click', () => {
            if (currentViewProfile && inputClassifierVal) {
                const newVal = inputClassifierVal.value.trim();
                
                // Update memory profile object
                currentViewProfile.classifier = newVal;
                currentViewProfile.updatedAt = new Date().toISOString();

                syncCurrentViewProfile();

                // Update the real-time displayed value inside the profile drawer
                const displayedValCell = document.getElementById('view-profile-classifier-val');
                if (displayedValCell) {
                    displayedValCell.textContent = newVal || '—';
                }

                // Close the modal
                closeClassifierModal();

                // Display a gorgeous success toast
                showToast('Классификатор успешно изменен!', true, true);
            }
        });
    }

    // Change OKZ code button interaction and modal
    const btnEditOkz = document.getElementById('btn-edit-okz');
    const okzModal = document.getElementById('edit-okz-modal');
    const btnCloseOkzModal = document.getElementById('btn-close-okz-modal');
    const btnCancelOkz = document.getElementById('btn-cancel-okz');
    const btnApplyOkz = document.getElementById('btn-apply-okz');
    const inputOkzVal = document.getElementById('input-okz-val');
    const currentOkzDisplay = document.getElementById('current-okz-value-display');

    if (btnEditOkz && okzModal && inputOkzVal) {
        btnEditOkz.addEventListener('click', () => {
            if (currentViewProfile) {
                const val = currentViewProfile.okzCode || '—';
                if (currentOkzDisplay) {
                    currentOkzDisplay.textContent = val;
                }
                inputOkzVal.value = currentViewProfile.okzCode || '';
                okzModal.classList.add('is-open');
                setTimeout(() => {
                    inputOkzVal.focus();
                }, 100);
            }
        });
    }

    const closeOkzModal = () => {
        if (okzModal) {
            okzModal.classList.remove('is-open');
        }
    };

    if (btnCloseOkzModal) {
        btnCloseOkzModal.addEventListener('click', closeOkzModal);
    }
    if (btnCancelOkz) {
        btnCancelOkz.addEventListener('click', closeOkzModal);
    }
    if (okzModal) {
        okzModal.addEventListener('click', (e) => {
            if (e.target === okzModal) {
                closeOkzModal();
            }
        });
    }

    if (btnApplyOkz) {
        btnApplyOkz.addEventListener('click', () => {
            if (currentViewProfile && inputOkzVal) {
                const newVal = inputOkzVal.value.trim();

                // Update memory profile object
                currentViewProfile.okzCode = newVal;
                currentViewProfile.updatedAt = new Date().toISOString();

                syncCurrentViewProfile();

                // Update the real-time displayed value inside the profile drawer
                const displayedValCell = document.getElementById('view-profile-okz-val');
                if (displayedValCell) {
                    displayedValCell.textContent = newVal || '—';
                }

                // Close the modal
                closeOkzModal();

                // Display a gorgeous success toast
                showToast('Код ОКЗ успешно изменен!', true, true);
            }
        });
    }

    // Send for appraisal button interaction and confirmation modal
    const btnSendReview = document.getElementById('btn-send-review');
    const sendReviewModal = document.getElementById('send-review-confirm-modal');
    const btnCloseSendReviewModal = document.getElementById('btn-close-send-review-modal');
    const btnCancelSendReview = document.getElementById('btn-cancel-send-review');
    const btnConfirmSendReview = document.getElementById('btn-confirm-send-review');

    if (btnSendReview && sendReviewModal) {
        btnSendReview.addEventListener('click', () => {
            sendReviewModal.classList.add('is-open');
        });
    }

    const closeSendReviewModal = () => {
        if (sendReviewModal) {
            sendReviewModal.classList.remove('is-open');
        }
    };

    if (btnCloseSendReviewModal) {
        btnCloseSendReviewModal.addEventListener('click', closeSendReviewModal);
    }
    if (btnCancelSendReview) {
        btnCancelSendReview.addEventListener('click', closeSendReviewModal);
    }
    if (sendReviewModal) {
        sendReviewModal.addEventListener('click', (e) => {
            if (e.target === sendReviewModal) {
                closeSendReviewModal();
            }
        });
    }

    if (btnConfirmSendReview) {
        btnConfirmSendReview.addEventListener('click', () => {
            if (currentViewProfile) {
                // Update status of current profile to "На оценке"
                currentViewProfile.status = 'На оценке';
                currentViewProfile.updatedAt = new Date().toISOString();

                syncCurrentViewProfile();

                // Update the real-time displayed value inside the profile drawer
                const displayedStatusVal = document.getElementById('view-profile-status-val');
                if (displayedStatusVal) {
                    const getStatusBadge = window.getStatusBadge || ((status) => `<span class="status-badge draft">${status}</span>`);
                    displayedStatusVal.innerHTML = getStatusBadge('На оценке');
                }

                // Hide "Send for appraisal" button on the fly
                const btnSendReviewEl = document.getElementById('btn-send-review');
                if (btnSendReviewEl) {
                    btnSendReviewEl.style.display = 'none';
                }

                // Close the modal
                closeSendReviewModal();

                // Display a gorgeous success toast
                showToast('Профиль должности успешно отправлен на оценку!', true, true);
            }
        });
    }

    // Delegated click handler for opening view profile drawer when clicking any profile name link
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.profile-link');
        if (link) {
            e.preventDefault();
            const name = link.textContent.trim();
            openViewProfileDrawer(name);
        }
    });

    // Add listeners for validation
    document.addEventListener('input', (e) => {
        if (e.target.id && e.target.id.startsWith('param-')) {
            validateFunctionalStage();
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.id && e.target.id.startsWith('param-')) {
            validateFunctionalStage();
        }
    });

    // Close floating dropdowns on outside click
    document.addEventListener('click', (e) => {
        // Close task name dropdown if click is outside
        if (activeTaskNameDropdown && !e.target.closest('.col-task-name-wrapper') && !activeTaskNameDropdown.contains(e.target)) {
            closeTaskNameDropdown();
        }
        // Close goal name dropdown if click is outside
        if (activeGoalNameDropdown && !e.target.closest('.col-goal-name') && !activeGoalNameDropdown.contains(e.target)) {
            closeGoalNameDropdown();
        }
    });

    // Close floating dropdowns on drawer scroll
    const drawerBodyEl = document.querySelector('.drawer-body');
    if (drawerBodyEl) {
        drawerBodyEl.addEventListener('scroll', () => {
            if (activeTaskNameDropdown) closeTaskNameDropdown();
            if (activeGoalNameDropdown) closeGoalNameDropdown();
        });
    }

    // Toast Notification Helper
    const showToast = (message, isRightSide = false, isSuccess = false) => {
        let toast = document.getElementById('validation-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'validation-toast';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        
        if (isRightSide) {
            toast.classList.add('right-side');
        } else {
            toast.classList.remove('right-side');
        }

        if (isSuccess) {
            toast.classList.add('success');
            toast.innerHTML = `<i data-lucide="check-circle"></i> <span>${message}</span>`;
        } else {
            toast.classList.remove('success');
            toast.innerHTML = `<i data-lucide="alert-circle"></i> <span>${message}</span>`;
        }
        
        lucide.createIcons();
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };
    window.showToast = showToast;

    const updateCreateStageCardsInteractivity = () => {
        const stageFunctional = document.getElementById('stage-functional');
        const stageCompetencies = document.getElementById('stage-competencies');
        if (!stageFunctional || !stageCompetencies) return;

        stageFunctional.classList.toggle('can-navigate', isCreateStageNavigationUnlocked);
        stageCompetencies.classList.toggle('can-navigate', isCreateStageNavigationUnlocked);
        stageCompetencies.classList.toggle(
            'disabled',
            !isCreateStageNavigationUnlocked && !stageCompetencies.classList.contains('active')
        );
        stageFunctional.setAttribute('tabindex', isCreateStageNavigationUnlocked ? '0' : '-1');
        stageCompetencies.setAttribute('tabindex', isCreateStageNavigationUnlocked ? '0' : '-1');
        stageFunctional.setAttribute('role', 'button');
        stageCompetencies.setAttribute('role', 'button');
        stageFunctional.setAttribute('aria-disabled', String(!isCreateStageNavigationUnlocked));
        stageCompetencies.setAttribute('aria-disabled', String(!isCreateStageNavigationUnlocked));
    };

    const setCreateProfileStage = (stageName) => {
        const stageFunctional = document.getElementById('stage-functional');
        const stageCompetencies = document.getElementById('stage-competencies');
        const functionalContent = document.getElementById('functional-content');
        const competenciesContent = document.getElementById('competencies-content');
        const resetCompetenciesButton = document.getElementById('reset-competencies-btn');
        if (!stageFunctional || !stageCompetencies || !functionalContent || !competenciesContent) return;

        const isCompetenciesStage = stageName === 'competencies';

        stageFunctional.classList.toggle('active', !isCompetenciesStage);
        stageFunctional.classList.toggle('completed', isCompetenciesStage);
        stageCompetencies.classList.toggle('active', isCompetenciesStage);
        stageCompetencies.classList.toggle('disabled', !isCreateStageNavigationUnlocked && !isCompetenciesStage);

        functionalContent.style.display = isCompetenciesStage ? 'none' : 'block';
        competenciesContent.style.display = isCompetenciesStage ? 'block' : 'none';

        nextStageBtn.innerText = isCompetenciesStage ? 'Создать профиль должности' : 'Далее';
        prevStageBtn.style.display = isCompetenciesStage ? 'block' : 'none';
        if (resetCompetenciesButton) {
            resetCompetenciesButton.style.display = isCompetenciesStage ? 'block' : 'none';
        }

        if (isCompetenciesStage) {
            validateCompetenciesStage();
        } else {
            validateFunctionalStage();
        }

        updateCreateStageCardsInteractivity();
        if (window.HRProfileApp && window.HRProfileApp.profileAIAssistantRender) {
            window.HRProfileApp.profileAIAssistantRender.updateContext();
        }
        lucide.createIcons();
    };

      window.HRProfileApp = window.HRProfileApp || {};
      window.HRProfileApp.profileCreateStageContext = {
          ...(window.HRProfileApp.profileCreateStageContext || {}),
          navigateToStage: (stageName) => {
              if (stageName !== 'competencies') {
                  setCreateProfileStage('functional');
                  return true;
              }

              const aiContextStatus = getFirstStageAIContextStatus();
              if (!aiContextStatus.hasMinimumContext) {
                  showToast('Заполните первый этап: должность, место в структуре, цель, задачу и функцию');
                  return false;
              }

              isCreateStageNavigationUnlocked = true;
              setCreateProfileStage('competencies');
              return true;
          },
          canNavigateToStage: (stageName) => {
              if (stageName !== 'competencies') return true;
              return getFirstStageAIContextStatus().hasMinimumContext;
          }
      };

    // Stage Switching Logic
    nextStageBtn.addEventListener('click', (event) => {
        if (nextStageBtn.disabled) return;

        const isAlreadyCompetenciesStage = document.getElementById('stage-competencies')?.classList.contains('active');
        if (isAlreadyCompetenciesStage) {
            return;
        }

        const aiContextStatus = getFirstStageAIContextStatus();
        if (aiContextStatus.hasMinimumContext) {
            document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
            document.querySelectorAll('.goal-card.has-error').forEach(el => el.classList.remove('has-error'));
            isCreateStageNavigationUnlocked = true;
            setCreateProfileStage('competencies');
            event.stopImmediatePropagation();
            return;
        }

        // Validation for Goals and Tasks
        let hasErrors = false;
        
        document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
        document.querySelectorAll('.goal-card.has-error').forEach(el => el.classList.remove('has-error'));

        const goals = document.querySelectorAll('.goal-card');
        
        if (goals.length === 0) {
            showToast('Необходимо добавить цели и задачи перед переходом на следующий этап');
            return;
        }

        goals.forEach(goal => {
            let goalHasError = false;

            const goalNameWrapper = goal.querySelector('.col-goal-name');
            const goalNameTrigger = goalNameWrapper.querySelector('.goal-name-text');
            if (!isFilledTrigger(goalNameTrigger)) {
                goalNameWrapper.classList.add('error-field');
                goalHasError = true;
                hasErrors = true;
            }

            const tasks = goal.querySelectorAll('.task-body tr');
            if (tasks.length === 0) {
                // If a goal is added but has no tasks, consider it an error
                goalHasError = true;
                hasErrors = true;
            }

            tasks.forEach(task => {
                const taskNameWrapper = task.querySelector('.col-task-name-wrapper');
                const taskNameTrigger = taskNameWrapper ? taskNameWrapper.querySelector('.task-name-text') : null;
                const participationInput = task.querySelector('.task-participation-input');
                const funcContainer = task.querySelector('.functions-cell-container');

                if (taskNameWrapper && !isFilledTrigger(taskNameTrigger)) {
                    taskNameWrapper.classList.add('error-field');
                    goalHasError = true;
                    hasErrors = true;
                }

                if (participationInput && participationInput.value.trim() === '') {
                    participationInput.classList.add('error-field');
                    goalHasError = true;
                    hasErrors = true;
                }
                
                if (funcContainer) {
                    const rowItems = funcContainer.querySelectorAll('.function-row-item');
                    if (rowItems.length === 0) {
                        funcContainer.classList.add('error-field');
                        goalHasError = true;
                        hasErrors = true;
                    } else {
                        rowItems.forEach(rowItem => {
                            const selectWrappers = rowItem.querySelectorAll('.custom-select-wrapper');
                            selectWrappers.forEach(wrapper => {
                                const trigger = wrapper.querySelector('.custom-select-trigger');
                                if (!isFilledTrigger(trigger)) {
                                    wrapper.classList.add('error-field');
                                    goalHasError = true;
                                    hasErrors = true;
                                }
                            });
                        });
                    }
                }
            });

            if (goalHasError) {
                goal.classList.add('has-error');
            }
        });

        if (hasErrors) {
            showToast('Необходимо заполнить все обязательные поля для перехода на этап Компетенции');
            return;
        }

        const stageFunctional = document.getElementById('stage-functional');
        const stageCompetencies = document.getElementById('stage-competencies');
        const functionalContent = document.getElementById('functional-content');
        const competenciesContent = document.getElementById('competencies-content');

        isCreateStageNavigationUnlocked = true;
        setCreateProfileStage('competencies');
        event.stopImmediatePropagation();
        return;

        // Update visuals for Competencies stage
        stageFunctional.classList.remove('active');
        stageFunctional.classList.add('completed');
        
        stageCompetencies.classList.remove('disabled');
        stageCompetencies.classList.add('active');

        functionalContent.style.display = 'none';
        competenciesContent.style.display = 'block';

        // Update footer buttons
        nextStageBtn.innerText = 'Создать профиль должности';
        prevStageBtn.style.display = 'block';
        resetCompetenciesBtn.style.display = 'block'; // Show global reset on competencies stage
        
        // Re-validate competencies stage
        validateCompetenciesStage(); 
        
        lucide.createIcons();
    });

    // Back Button Functionality
    prevStageBtn.addEventListener('click', () => {
        const stageFunctional = document.getElementById('stage-functional');
        const stageCompetencies = document.getElementById('stage-competencies');
        const functionalContent = document.getElementById('functional-content');
        const competenciesContent = document.getElementById('competencies-content');

        setCreateProfileStage('functional');
        return;

        // Revert visuals
        stageFunctional.classList.add('active');
        stageFunctional.classList.remove('completed');
        
        stageCompetencies.classList.add('disabled');
        stageCompetencies.classList.remove('active');

        functionalContent.style.display = 'block';
        competenciesContent.style.display = 'none';

        // Revert footer buttons
        nextStageBtn.innerText = 'Далее';
        prevStageBtn.style.display = 'none';
        resetCompetenciesBtn.style.display = 'none'; // Hide global reset when going back
        
        // Re-validate functional stage
        validateFunctionalStage();
    });

    const navigateByStageCard = (stageName) => {
        if (!isCreateStageNavigationUnlocked) return;

        if (stageName === 'functional') {
            setCreateProfileStage('functional');
            return;
        }

        if (stageName === 'competencies') {
            const stageCompetencies = document.getElementById('stage-competencies');
            if (stageCompetencies && stageCompetencies.classList.contains('active')) return;
            validateFunctionalStage();
            if (nextStageBtn.disabled) {
                showToast('Заполните обязательные поля первого этапа, чтобы вернуться к компетенциям');
                return;
            }
            isCreateStageNavigationUnlocked = true;
            setCreateProfileStage('competencies');
        }
    };

    const bindStageCardNavigation = () => {
        const stageFunctional = document.getElementById('stage-functional');
        const stageCompetencies = document.getElementById('stage-competencies');
        if (!stageFunctional || !stageCompetencies) return;

        stageFunctional.addEventListener('click', (event) => {
            event.stopPropagation();
            navigateByStageCard('functional');
        });
        stageCompetencies.addEventListener('click', (event) => {
            event.stopPropagation();
            navigateByStageCard('competencies');
        });

        [stageFunctional, stageCompetencies].forEach((stageCard) => {
            stageCard.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                navigateByStageCard(stageCard.id === 'stage-functional' ? 'functional' : 'competencies');
            });
        });

        updateCreateStageCardsInteractivity();
    };

    bindStageCardNavigation();

    // Reset All Competencies logic
    const resetCompetenciesBtn = document.getElementById('reset-competencies-btn');
    if (resetCompetenciesBtn) {
        resetCompetenciesBtn.addEventListener('click', () => {
            // Clear all selected arrays
            selectedSoftSkills = [];
            selectedHardSkills = [];
            selectedLanguages = [];
            selectedTech = [];
            selectedCerts = [];
            selectedPermits = [];
            selectedEdu = [];
            selectedExp = [];
            selectedFuncAreas = [];

            // Update all UI modules
            updateSkillsUI();
            updateHardSkillsUI();
            updateLanguagesUI();
            updateTechUI();
            updateCertUI();
            updatePermitUI();
            updateEduUI();
            updateExpUI();
            updateFuncAreaUI();
            
            // Refresh dropdown lists to update selection state
            renderDropdownList();
            renderHardSkillsList("");
            renderLangList("");
            renderTechList("");
            renderCertList("");
            renderPermitList("");
            renderEduList("");
            renderExpList();
            renderFuncList("");

            // Re-validate stage
            validateCompetenciesStage();
            
            showToast('Все данные этапа сброшены');
        });
    }


    // --- Goal and Task Dropdown Scopes & Globals ---
    let activeGoalDropdown = null; // Goal Role dropdown
    let activeTaskRoleDropdown = null; // Task Role dropdown
    let activeTaskParticipationDropdown = null; // Task Participation dropdown
    let activeCustomSelectDropdown = null; // Smart Select Function dropdown
    let activeAddFuncDropdown = null; // Smart Select Add Function dropdown
    let activeAiInfluenceDropdown = null; // AI Influence dropdown

    const closeGoalDropdown = () => {
        if (activeGoalDropdown) {
            activeGoalDropdown.remove();
            activeGoalDropdown = null;
            document.querySelectorAll('.col-goal-role').forEach(w => w.classList.remove('is-active'));
        }
    };

    const closeTaskRoleDropdown = () => {
        if (activeTaskRoleDropdown) {
            activeTaskRoleDropdown.remove();
            activeTaskRoleDropdown = null;
            document.querySelectorAll('.col-task-role').forEach(w => w.classList.remove('is-active'));
        }
    };

    const closeTaskParticipationDropdown = () => {
        if (activeTaskParticipationDropdown) {
            activeTaskParticipationDropdown.remove();
            activeTaskParticipationDropdown = null;
            document.querySelectorAll('.task-participation-container').forEach(w => w.classList.remove('is-active'));
        }
    };

    const closeCustomSelectDropdown = () => {
        if (activeCustomSelectDropdown) {
            activeCustomSelectDropdown.remove();
            activeCustomSelectDropdown = null;
            document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('is-active'));
        }
    };

    const closeAddFuncDropdown = () => {
        if (activeAddFuncDropdown) {
            activeAddFuncDropdown.remove();
            activeAddFuncDropdown = null;
        }
    };

    const closeAiInfluenceDropdown = () => {
        if (activeAiInfluenceDropdown) {
            activeAiInfluenceDropdown.remove();
            activeAiInfluenceDropdown = null;
            document.querySelectorAll('.ai-influence-container').forEach(w => w.classList.remove('is-active'));
        }
    };

    const closeAllGoalTaskDropdowns = () => {
        closeGoalDropdown();
        closeGoalNameDropdown();
        closeGoalMenuDropdown();
        closeTaskNameDropdown();
        closeTaskRoleDropdown();
        closeTaskParticipationDropdown();
        closeCustomSelectDropdown();
        closeAddFuncDropdown();
        closeAiInfluenceDropdown();
    };

    // --- Goal Role Dropdown Logic ---
    const openGoalRoleDropdown = (selectWrapper) => {
        closeAllGoalTaskDropdowns();
        selectWrapper.classList.add('is-active');

        const trigger = selectWrapper.querySelector('.custom-select-trigger');
        const options = ["Отвечает", "Согласует", "Консультирует", "Исполняет"];

        activeGoalDropdown = document.createElement('div');
        activeGoalDropdown.className = 'smart-dropdown custom-select-smart-dropdown';

        // Clean list of items without search and close buttons
        let dropdownHTML = `<div class="dropdown-list">`;
        options.forEach(opt => {
            const isSelected = trigger.dataset.value === opt;
            dropdownHTML += `
                <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-value="${opt}">
                    <span class="item-text">${opt}</span>
                    <div class="item-selection-state">
                        ${isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                    </div>
                </div>`;
        });
        dropdownHTML += `</div>`;
        activeGoalDropdown.innerHTML = dropdownHTML;

        const rect = selectWrapper.getBoundingClientRect();
        activeGoalDropdown.style.visibility = 'hidden';
        document.body.appendChild(activeGoalDropdown);

        const dropdownHeight = activeGoalDropdown.offsetHeight;
        const dropdownWidth = Math.max(rect.width, 160);

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            activeGoalDropdown.style.top = `${rect.top - dropdownHeight - 4}px`;
        } else {
            activeGoalDropdown.style.top = `${rect.bottom + 4}px`;
        }

        activeGoalDropdown.style.left = `${Math.min(rect.left, window.innerWidth - dropdownWidth - 16)}px`;
        activeGoalDropdown.style.width = `${dropdownWidth}px`;
        activeGoalDropdown.style.visibility = 'visible';

        lucide.createIcons();

        activeGoalDropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
            itemEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = itemEl.dataset.value;
                trigger.textContent = val;
                trigger.dataset.value = val;
                trigger.classList.remove('is-placeholder');
                selectWrapper.classList.remove('error-field');
                closeGoalDropdown();
                validateFunctionalStage();
            });
        });
    };

    // --- Task Role Dropdown Logic ---
    const openTaskRoleDropdown = (selectWrapper) => {
        closeAllGoalTaskDropdowns();
        selectWrapper.classList.add('is-active');

        const trigger = selectWrapper.querySelector('.custom-select-trigger');
        const options = ["Исполняет", "Консультирует", "Согласует"];

        activeTaskRoleDropdown = document.createElement('div');
        activeTaskRoleDropdown.className = 'smart-dropdown custom-select-smart-dropdown';

        let dropdownHTML = `<div class="dropdown-list">`;
        options.forEach(opt => {
            const isSelected = trigger.dataset.value === opt;
            dropdownHTML += `
                <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-value="${opt}">
                    <span class="item-text">${opt}</span>
                    <div class="item-selection-state">
                        ${isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                    </div>
                </div>`;
        });
        dropdownHTML += `</div>`;
        activeTaskRoleDropdown.innerHTML = dropdownHTML;

        const rect = selectWrapper.getBoundingClientRect();
        activeTaskRoleDropdown.style.visibility = 'hidden';
        document.body.appendChild(activeTaskRoleDropdown);

        const dropdownHeight = activeTaskRoleDropdown.offsetHeight;
        const dropdownWidth = Math.max(rect.width, 160);

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            activeTaskRoleDropdown.style.top = `${rect.top - dropdownHeight - 4}px`;
        } else {
            activeTaskRoleDropdown.style.top = `${rect.bottom + 4}px`;
        }

        activeTaskRoleDropdown.style.left = `${Math.min(rect.left, window.innerWidth - dropdownWidth - 16)}px`;
        activeTaskRoleDropdown.style.width = `${dropdownWidth}px`;
        activeTaskRoleDropdown.style.visibility = 'visible';

        lucide.createIcons();

        activeTaskRoleDropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
            itemEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = itemEl.dataset.value;
                trigger.textContent = val;
                trigger.dataset.value = val;
                trigger.classList.remove('is-placeholder');
                selectWrapper.classList.remove('error-field');
                closeTaskRoleDropdown();
                updateClearButtonVisibility(selectWrapper);
                validateFunctionalStage();
            });
        });
    };

    // --- Task Participation Dropdown Logic ---
    const openTaskParticipationDropdown = (inputEl) => {
        closeAllGoalTaskDropdowns();

        const container = inputEl.closest('.task-participation-container');
        if (container) container.classList.add('is-active');

        activeTaskParticipationDropdown = document.createElement('div');
        activeTaskParticipationDropdown.className = 'smart-dropdown custom-select-smart-dropdown';

        const options = ["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];

        let dropdownHTML = `<div class="dropdown-list">`;
        options.forEach(opt => {
            const isSelected = inputEl.value === opt;
            dropdownHTML += `
                <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-value="${opt}">
                    <span class="item-text">${opt}</span>
                    <div class="item-selection-state">
                        ${isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                    </div>
                </div>`;
        });
        dropdownHTML += `</div>`;
        activeTaskParticipationDropdown.innerHTML = dropdownHTML;

        const rect = inputEl.getBoundingClientRect();
        activeTaskParticipationDropdown.style.visibility = 'hidden';
        document.body.appendChild(activeTaskParticipationDropdown);

        const dropdownHeight = activeTaskParticipationDropdown.offsetHeight;
        const dropdownWidth = 110;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            activeTaskParticipationDropdown.style.top = `${rect.top - dropdownHeight - 4}px`;
        } else {
            activeTaskParticipationDropdown.style.top = `${rect.bottom + 4}px`;
        }

        activeTaskParticipationDropdown.style.left = `${Math.min(rect.left, window.innerWidth - dropdownWidth - 16)}px`;
        activeTaskParticipationDropdown.style.width = `${dropdownWidth}px`;
        activeTaskParticipationDropdown.style.visibility = 'visible';

        lucide.createIcons();

        activeTaskParticipationDropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
            itemEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = itemEl.dataset.value;
                inputEl.value = val;
                inputEl.classList.remove('error-field');
                closeTaskParticipationDropdown();
                validateFunctionalStage();
            });
        });
    };

    // Close all goal/task dropdowns on click outside
    document.addEventListener('click', (e) => {
        if (activeGoalDropdown && !activeGoalDropdown.contains(e.target) && !e.target.closest('.col-goal-role')) {
            closeGoalDropdown();
        }
        if (activeGoalNameDropdown && !activeGoalNameDropdown.contains(e.target) && !e.target.closest('.col-goal-name')) {
            closeGoalNameDropdown();
        }
        if (activeGoalMenuDropdown && !activeGoalMenuDropdown.contains(e.target) && !e.target.closest('.btn-goal-menu')) {
            closeGoalMenuDropdown();
        }
        if (activeTaskNameDropdown && !activeTaskNameDropdown.contains(e.target) && !e.target.closest('.col-task-name-wrapper')) {
            closeTaskNameDropdown();
        }
        if (activeTaskRoleDropdown && !activeTaskRoleDropdown.contains(e.target) && !e.target.closest('.col-task-role')) {
            closeTaskRoleDropdown();
        }
        if (activeTaskParticipationDropdown && !activeTaskParticipationDropdown.contains(e.target) && !e.target.closest('.task-participation-input')) {
            closeTaskParticipationDropdown();
        }
        if (activeCustomSelectDropdown && !activeCustomSelectDropdown.contains(e.target) && !e.target.closest('.custom-select-wrapper')) {
            closeCustomSelectDropdown();
        }
        if (activeAddFuncDropdown && !activeAddFuncDropdown.contains(e.target) && !e.target.closest('.btn-add-function-row')) {
            closeAddFuncDropdown();
        }
        if (activeAiInfluenceDropdown && !activeAiInfluenceDropdown.contains(e.target) && !e.target.closest('.ai-influence-input')) {
            closeAiInfluenceDropdown();
        }
    });

    const drawerBody = document.querySelector('.drawer-body');
    if (drawerBody) {
        drawerBody.addEventListener('scroll', () => {
            closeAllGoalTaskDropdowns();
        });
    }
    window.addEventListener('resize', () => {
        closeAllGoalTaskDropdowns();
    });

    // --- Goal Menu Dropdown Logic ---
    let activeGoalMenuDropdown = null;

    const closeGoalMenuDropdown = () => {
        if (activeGoalMenuDropdown) {
            activeGoalMenuDropdown.remove();
            activeGoalMenuDropdown = null;
            document.querySelectorAll('.btn-goal-menu').forEach(b => b.classList.remove('is-active'));
        }
    };

    const openGoalMenuDropdown = (btn, card) => {
        closeAllGoalTaskDropdowns();
        btn.classList.add('is-active');
        
        activeGoalMenuDropdown = document.createElement('div');
        activeGoalMenuDropdown.className = 'smart-dropdown custom-select-smart-dropdown';
        
        activeGoalMenuDropdown.innerHTML = `
            <div class="dropdown-list">
                <div class="dropdown-item" data-action="duplicate">
                    <i data-lucide="copy" style="width: 16px; height: 16px; margin-right: 8px;"></i>
                    <span class="item-text">Дублировать</span>
                </div>
                <div class="dropdown-item" data-action="delete" style="color: #FA5252;">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px; margin-right: 8px;"></i>
                    <span class="item-text">Удалить</span>
                </div>
            </div>
        `;
        
        const rect = btn.getBoundingClientRect();
        activeGoalMenuDropdown.style.visibility = 'hidden';
        document.body.appendChild(activeGoalMenuDropdown);
        
        const dropdownHeight = activeGoalMenuDropdown.offsetHeight;
        const dropdownWidth = 180;
        
        activeGoalMenuDropdown.style.top = `${rect.bottom + 4}px`;
        activeGoalMenuDropdown.style.left = `${Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 16)}px`;
        activeGoalMenuDropdown.style.width = `${dropdownWidth}px`;
        activeGoalMenuDropdown.style.visibility = 'visible';
        
        lucide.createIcons();
        
        activeGoalMenuDropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
            itemEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = itemEl.dataset.action;
                closeGoalMenuDropdown();
                
                if (action === 'delete') {
                    // Check if there are tasks
                    const tbody = card.querySelector('.task-body');
                    if (!tbody || tbody.children.length === 0) {
                        card.remove();
                        updateIndices();
                    } else {
                        showDeleteGoalModal(card);
                    }
                } else if (action === 'duplicate') {
                    duplicateGoalCard(card);
                }
            });
        });
    };
    
    const showDeleteGoalModal = (card) => {
        const modalHTML = `
            <div class="modal-overlay is-open">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Удаление цели</h3>
                        <button class="modal-close"><i data-lucide="x"></i></button>
                    </div>
                    <div class="modal-body">
                        <p>Вы уверены, что хотите удалить эту цель со всеми её задачами?</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary-sm modal-cancel">Отмена</button>
                        <button class="btn-danger modal-confirm">Удалить</button>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        const overlay = modalContainer.querySelector('.modal-overlay');
        document.body.appendChild(overlay);
        lucide.createIcons();
        
        const closeMod = () => overlay.remove();
        
        overlay.querySelector('.modal-close').addEventListener('click', closeMod);
        overlay.querySelector('.modal-cancel').addEventListener('click', closeMod);
        overlay.querySelector('.modal-confirm').addEventListener('click', () => {
            card.remove();
            updateIndices();
            closeMod();
            validateFunctionalStage();
        });
    };

    const duplicateGoalCard = (card) => {
        createGoalCard();
        const newestCard = goalsContainer.lastElementChild;
        
        const originalName = card.querySelector('.goal-name-text').textContent;
        const originalNameVal = card.querySelector('.goal-name-text').dataset.value;
        const originalRole = card.querySelector('.col-goal-role .custom-select-trigger').textContent;
        const originalRoleVal = card.querySelector('.col-goal-role .custom-select-trigger').dataset.value;
        
        if (originalNameVal) {
            const newNameTrigger = newestCard.querySelector('.goal-name-text');
            newNameTrigger.textContent = originalName;
            newNameTrigger.dataset.value = originalNameVal;
            newNameTrigger.classList.remove('is-placeholder');
        }
        
        if (originalRoleVal) {
            const newRoleTrigger = newestCard.querySelector('.col-goal-role .custom-select-trigger');
            newRoleTrigger.textContent = originalRole;
            newRoleTrigger.dataset.value = originalRoleVal;
            newRoleTrigger.classList.remove('is-placeholder');
        }
        
        validateFunctionalStage();
    };

    // --- Goal Name Dropdown Logic ---
    let GOALS_CATALOG = [
        { name: "Обеспечение качества разработки", isCustom: false },
        { name: "Внедрение новых технологий", isCustom: false },
        { name: "Своевременный выпуск релизов", isCustom: false },
        { name: "Автоматизация бизнес-процессов", isCustom: false },
        { name: "Обучение и развитие команды", isCustom: false },
        { name: "Поддержка ИТ-инфраструктуры", isCustom: false },
        { name: "Повышение удовлетворенности", isCustom: false }
    ].sort((a, b) => a.name.localeCompare(b.name));

    let TASKS_CATALOG = [
        { name: "Анализ требований заказчика", isCustom: false },
        { name: "Разработка технической документации", isCustom: false },
        { name: "Проведение код-ревью", isCustom: false },
        { name: "Планирование и оценка задач спринта", isCustom: false },
        { name: "Устранение инцидентов и дефектов", isCustom: false },
        { name: "Согласование с заинтересованными сторонами", isCustom: false },
        { name: "Подготовка отчётности", isCustom: false },
        { name: "Тестирование и верификация решений", isCustom: false },
        { name: "Настройка инфраструктуры и окружения", isCustom: false },
        { name: "Обеспечение информационной безопасности", isCustom: false },
        { name: "Обучение и менторинг сотрудников", isCustom: false },
        { name: "Оптимизация бизнес-процессов", isCustom: false },
        { name: "Управление рисками проекта", isCustom: false },
        { name: "Интеграция сторонних систем", isCustom: false },
        { name: "Мониторинг и поддержка систем", isCustom: false }
    ].sort((a, b) => a.name.localeCompare(b.name));

    let activeGoalNameDropdown = null;
    let activeTaskNameDropdown = null;

    const closeGoalNameDropdown = () => {
        if (activeGoalNameDropdown) {
            activeGoalNameDropdown.remove();
            activeGoalNameDropdown = null;
            document.querySelectorAll('.col-goal-name').forEach(w => w.classList.remove('is-active'));
        }
    };

    const closeTaskNameDropdown = () => {
        if (activeTaskNameDropdown) {
            activeTaskNameDropdown.remove();
            activeTaskNameDropdown = null;
            document.querySelectorAll('.col-task-name-wrapper').forEach(w => w.classList.remove('is-active'));
        }
    };

    const openGoalNameDropdown = (wrapper) => {
        closeAllGoalTaskDropdowns();
        wrapper.classList.add('is-active');

        const trigger = wrapper.querySelector('.goal-name-text');
        
        activeGoalNameDropdown = document.createElement('div');
        activeGoalNameDropdown.className = 'smart-dropdown custom-select-smart-dropdown';

        const renderDropdownContent = (filter = "") => {
            const lowerFilter = filter.toLowerCase();
            let dropdownHTML = `
                <div class="dropdown-search-box">
                    <div class="search-input-wrapper">
                        <i data-lucide="search" class="search-icon"></i>
                        <input type="text" class="dropdown-search-input" placeholder="Поиск..." value="${filter}">
                    </div>
                </div>
                <div class="dropdown-list">
            `;

            const items = GOALS_CATALOG.filter(i => i.name.toLowerCase().includes(lowerFilter));

            if (items.length > 0) {
                const customItems = items.filter(i => i.isCustom);
                const standardItems = items.filter(i => !i.isCustom);
                
                if (customItems.length > 0) {
                    dropdownHTML += `<div class="custom-items-block" style="border-bottom: 1px solid var(--border-color); margin-bottom: 4px; padding-bottom: 4px;">`;
                    customItems.forEach(item => {
                        const isSelected = trigger.dataset.value === item.name;
                        dropdownHTML += `
                            <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-value="${item.name}">
                                <span class="item-text">${item.name}</span>
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    <button type="button" class="btn-item-delete btn-goal-delete" title="Удалить" data-delete-target="${item.name}">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                    <div class="item-selection-state">
                                        ${isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                                    </div>
                                </div>
                            </div>`;
                    });
                    dropdownHTML += `</div>`;
                }

                if (standardItems.length > 0) {
                    standardItems.forEach(item => {
                        const isSelected = trigger.dataset.value === item.name;
                        dropdownHTML += `
                            <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-value="${item.name}">
                                <span class="item-text">${item.name}</span>
                                <div class="item-selection-state">
                                    ${isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                                </div>
                            </div>`;
                    });
                }
            } else if (filter.trim() !== "") {
                dropdownHTML += `
                    <div class="dropdown-empty-state">
                        <button type="button" class="add-new-goal-btn btn-secondary-sm" style="width: 100%;">
                            <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                            Добавить цель
                        </button>
                    </div>
                `;
            } else {
                dropdownHTML += `<div class="dropdown-empty-state">Нет результатов...</div>`;
            }

            dropdownHTML += `</div>`;
            activeGoalNameDropdown.innerHTML = dropdownHTML;
            lucide.createIcons();

            const searchInput = activeGoalNameDropdown.querySelector('.dropdown-search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                
                searchInput.addEventListener('input', (e) => {
                    renderDropdownContent(e.target.value);
                });
                
                searchInput.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            activeGoalNameDropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
                itemEl.addEventListener('click', (e) => {
                    // Prevent click from firing if we clicked the delete button
                    if (e.target.closest('.btn-goal-delete')) return;
                    
                    e.stopPropagation();
                    const val = itemEl.dataset.value;
                    trigger.textContent = val;
                    trigger.dataset.value = val;
                    trigger.classList.remove('is-placeholder');
                    wrapper.classList.remove('error-field');
                    closeGoalNameDropdown();
                    validateFunctionalStage();
                });
            });

            activeGoalNameDropdown.querySelectorAll('.btn-goal-delete').forEach(delBtn => {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const targetName = delBtn.dataset.deleteTarget;
                    GOALS_CATALOG = GOALS_CATALOG.filter(i => i.name !== targetName);
                    renderDropdownContent(searchInput ? searchInput.value : "");
                });
            });

            const addNewBtn = activeGoalNameDropdown.querySelector('.add-new-goal-btn');
            if (addNewBtn) {
                addNewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newGoal = filter.trim();
                    if (newGoal && !GOALS_CATALOG.some(i => i.name === newGoal)) {
                        GOALS_CATALOG.push({ name: newGoal, isCustom: true });
                        GOALS_CATALOG.sort((a, b) => a.name.localeCompare(b.name));
                    }
                    trigger.textContent = newGoal;
                    trigger.dataset.value = newGoal;
                    trigger.classList.remove('is-placeholder');
                    wrapper.classList.remove('error-field');
                    closeGoalNameDropdown();
                    validateFunctionalStage();
                });
            }
        };

        renderDropdownContent();

        const rect = wrapper.getBoundingClientRect();
        activeGoalNameDropdown.style.visibility = 'hidden';
        document.body.appendChild(activeGoalNameDropdown);
        
        // Ensure icons are created after the element is in the DOM
        lucide.createIcons();

        const dropdownHeight = activeGoalNameDropdown.offsetHeight;
        // User explicitly specified: max width 350px
        const dropdownWidth = Math.min(Math.max(rect.width, 240), 350);

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            activeGoalNameDropdown.style.top = `${rect.top - dropdownHeight - 4}px`;
        } else {
            activeGoalNameDropdown.style.top = `${rect.bottom + 4}px`;
        }

        activeGoalNameDropdown.style.left = `${Math.min(rect.left, window.innerWidth - dropdownWidth - 16)}px`;
        activeGoalNameDropdown.style.width = `${dropdownWidth}px`;
        activeGoalNameDropdown.style.visibility = 'visible';
    };

    // --- Task Name Dropdown Logic ---
    const openTaskNameDropdown = (wrapper) => {
        closeAllGoalTaskDropdowns();
        wrapper.classList.add('is-active');

        const trigger = wrapper.querySelector('.task-name-text');

        activeTaskNameDropdown = document.createElement('div');
        activeTaskNameDropdown.className = 'smart-dropdown custom-select-smart-dropdown';

        const renderTaskDropdownContent = (filter = "") => {
            const lowerFilter = filter.toLowerCase();
            let dropdownHTML = `
                <div class="dropdown-search-box">
                    <div class="search-input-wrapper">
                        <i data-lucide="search" class="search-icon"></i>
                        <input type="text" class="dropdown-search-input" placeholder="Поиск..." value="${filter}">
                    </div>
                </div>
                <div class="dropdown-list">
            `;

            const items = TASKS_CATALOG.filter(i => i.name.toLowerCase().includes(lowerFilter));

            if (items.length > 0) {
                const customItems = items.filter(i => i.isCustom);
                const standardItems = items.filter(i => !i.isCustom);

                if (customItems.length > 0) {
                    dropdownHTML += `<div class="custom-items-block" style="border-bottom: 1px solid var(--border-color); margin-bottom: 4px; padding-bottom: 4px;">`;
                    customItems.forEach(item => {
                        const isSelected = trigger.dataset.value === item.name;
                        dropdownHTML += `
                            <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-value="${item.name}">
                                <span class="item-text">${item.name}</span>
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    <button type="button" class="btn-item-delete btn-task-delete" title="Удалить" data-delete-target="${item.name}">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                    <div class="item-selection-state">
                                        ${isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                                    </div>
                                </div>
                            </div>`;
                    });
                    dropdownHTML += `</div>`;
                }

                if (standardItems.length > 0) {
                    standardItems.forEach(item => {
                        const isSelected = trigger.dataset.value === item.name;
                        dropdownHTML += `
                            <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-value="${item.name}">
                                <span class="item-text">${item.name}</span>
                                <div class="item-selection-state">
                                    ${isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                                </div>
                            </div>`;
                    });
                }
            } else if (filter.trim() !== "") {
                dropdownHTML += `
                    <div class="dropdown-empty-state">
                        <button type="button" class="add-new-task-btn btn-secondary-sm" style="width: 100%;">
                            <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                            Новая задача
                        </button>
                    </div>
                `;
            } else {
                dropdownHTML += `<div class="dropdown-empty-state">Нет результатов...</div>`;
            }

            dropdownHTML += `</div>`;
            activeTaskNameDropdown.innerHTML = dropdownHTML;
            lucide.createIcons();

            const searchInput = activeTaskNameDropdown.querySelector('.dropdown-search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);

                searchInput.addEventListener('input', (e) => {
                    renderTaskDropdownContent(e.target.value);
                });

                searchInput.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            activeTaskNameDropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
                itemEl.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-task-delete')) return;
                    e.stopPropagation();
                    const val = itemEl.dataset.value;
                    trigger.textContent = val;
                    trigger.dataset.value = val;
                    trigger.classList.remove('is-placeholder');
                    wrapper.classList.remove('error-field');
                    closeTaskNameDropdown();
                    validateFunctionalStage();
                });
            });

            activeTaskNameDropdown.querySelectorAll('.btn-task-delete').forEach(delBtn => {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const targetName = delBtn.dataset.deleteTarget;
                    TASKS_CATALOG = TASKS_CATALOG.filter(i => i.name !== targetName);
                    renderTaskDropdownContent(searchInput ? searchInput.value : "");
                });
            });

            const addNewBtn = activeTaskNameDropdown.querySelector('.add-new-task-btn');
            if (addNewBtn) {
                addNewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newTask = filter.trim();
                    if (newTask && !TASKS_CATALOG.some(i => i.name === newTask)) {
                        TASKS_CATALOG.push({ name: newTask, isCustom: true });
                        TASKS_CATALOG.sort((a, b) => a.name.localeCompare(b.name));
                    }
                    trigger.textContent = newTask;
                    trigger.dataset.value = newTask;
                    trigger.classList.remove('is-placeholder');
                    wrapper.classList.remove('error-field');
                    closeTaskNameDropdown();
                    validateFunctionalStage();
                });
            }
        };

        renderTaskDropdownContent();

        const rect = wrapper.getBoundingClientRect();
        activeTaskNameDropdown.style.visibility = 'hidden';
        document.body.appendChild(activeTaskNameDropdown);
        lucide.createIcons();

        const dropdownHeight = activeTaskNameDropdown.offsetHeight;
        const dropdownWidth = Math.min(Math.max(rect.width, 240), 350);

        // Always open below the select
        activeTaskNameDropdown.style.top = `${rect.bottom + 4}px`;

        activeTaskNameDropdown.style.left = `${Math.min(rect.left, window.innerWidth - dropdownWidth - 16)}px`;
        activeTaskNameDropdown.style.width = `${dropdownWidth}px`;
        activeTaskNameDropdown.style.visibility = 'visible';
    };

    // --- Tasks and Functions Section ---
    const addGoalBtn = document.getElementById('add-goal-btn');
    const goalsContainer = document.getElementById('goals-container');

    const createGoalCard = (initialGoalData = null, targetContainer = null) => {
        const goalId = Date.now() + Math.random();
        const activeContainer = targetContainer || goalsContainer;
        const goalIndex = activeContainer.children.length + 1;

        const card = document.createElement('div');
        card.className = 'goal-card';
        card.dataset.id = goalId;
        
        const goalName = initialGoalData && initialGoalData.name ? initialGoalData.name : 'Введите наименование цели';
        const isGoalPlaceholderClass = initialGoalData && initialGoalData.name ? '' : 'is-placeholder';
        
        const goalRole = initialGoalData && initialGoalData.role ? initialGoalData.role : 'Выберите роль';
        const isRolePlaceholderClass = initialGoalData && initialGoalData.role ? '' : 'is-placeholder';

        card.innerHTML = `
            <div class="goal-card-header">
                <div class="goal-number" title="Свернуть/Развернуть">
                    <span class="number-text">${goalIndex}</span>
                    <i data-lucide="chevron-down" class="chevron-icon"></i>
                </div>
                <div class="goal-name-wrapper col-goal-name ${isGoalPlaceholderClass}" tabindex="0">
                    <span class="goal-name-text" data-value="${initialGoalData && initialGoalData.name ? initialGoalData.name : ''}">${goalName}</span>
                </div>
                
                <div class="goal-actions-group">
                    <div class="custom-select-wrapper col-goal-role" style="width: 160px;">
                        <div class="custom-select-trigger ${isRolePlaceholderClass}" data-placeholder="Выберите роль" data-value="${initialGoalData && initialGoalData.role ? initialGoalData.role : ''}">${goalRole}</div>
                        <i data-lucide="chevron-down" class="select-chevron"></i>
                    </div>
                    
                    <button class="btn-secondary-sm btn-add-task">
                        <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                        Добавить задачу
                    </button>
                    
                    <button class="btn-delete-goal" title="Удалить цель">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            
            <div class="task-table-container" style="display: none;">
                <table class="task-table">
                    <thead>
                        <tr>
                            <th class="col-num">№</th>
                            <th class="col-task-name">Наименование задачи</th>
                            <th class="col-participation">Участие</th>
                            <th class="col-role">Роль</th>
                            <th class="col-funcs">
                                Функции
                                <span class="ai-total-influence-tag select-tag-badge" style="background-color: #F1F5F9; color: #475569; border: 1px solid #E2E8F0; font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: 500; display: none; align-items: center; justify-content: center; text-transform: none;">Общее влияние ИИ: 0%</span>
                            </th>
                            <th class="col-actions"></th>
                        </tr>
                    </thead>
                    <tbody class="task-body">
                    </tbody>
                </table>
            </div>
        `;

        activeContainer.appendChild(card);
        
        if (initialGoalData && initialGoalData.tasks && initialGoalData.tasks.length > 0) {
            initialGoalData.tasks.forEach(taskData => {
                addTaskRow(card, taskData);
            });
        }
        
        lucide.createIcons();
        validateFunctionalStage();
    };

    // --- Smart Select Functions Logic ---
    let FUNCTIONS_CATALOG = [
        { name: "Вовлекать руководство Компании в активности...", isCustom: false },
        { name: "Создавать ИИ компонент", isCustom: false },
        { name: "Анализ бизнес-требований и написание спецификаций", isCustom: false },
        { name: "Проектирование архитектурных решений", isCustom: false },
        { name: "Проведение код-ревью (Code Review)", isCustom: false },
        { name: "Оптимизация баз данных", isCustom: false },
        { name: "Разработка интеграционных сценариев", isCustom: false },
        { name: "Мониторинг производительности систем", isCustom: false },
        { name: "Подготовка технической документации", isCustom: false },
        { name: "Управление релизами и деплоем", isCustom: false },
        { name: "Тестирование отказоустойчивости", isCustom: false },
        { name: "Разработка пользовательских интерфейсов", isCustom: false },
        { name: "Интеграция сторонних сервисов", isCustom: false },
        { name: "Настройка CI/CD пайплайнов", isCustom: false },
        { name: "Консультирование смежных команд", isCustom: false },
        { name: "Участие в планировании спринтов", isCustom: false },
        { name: "Исследование новых технологий", isCustom: false }
    ].sort((a, b) => a.name.localeCompare(b.name));

    let globalDraggedItem = null;
    let globalSourceContainer = null;

    const updateDragAndDropState = (listCont) => {
        const rows = Array.from(listCont.querySelectorAll('.function-row-item'));
        const isDraggable = rows.length > 1;

        rows.forEach(row => {
            const handle = row.querySelector('.function-drag-handle');
            const deleteBtn = row.querySelector('.btn-delete-function-row');

            if (isDraggable) {
                if (handle) {
                    handle.classList.remove('is-disabled');
                    handle.setAttribute('title', 'Перетащить для изменения порядка');
                }
                if (deleteBtn) {
                    deleteBtn.disabled = false;
                    deleteBtn.classList.remove('is-disabled');
                    deleteBtn.setAttribute('title', 'Удалить функцию');
                }
            } else {
                row.setAttribute('draggable', 'false');
                if (handle) {
                    handle.classList.add('is-disabled');
                    handle.setAttribute('title', 'Перетаскивание недоступно (добавьте еще функции)');
                }
                if (deleteBtn) {
                    deleteBtn.disabled = true;
                    deleteBtn.classList.add('is-disabled');
                    deleteBtn.setAttribute('title', 'Нельзя удалить единственную функцию');
                }
            }
        });
    };
    const updateClearButtonVisibility = (selectWrapper) => {
        const trigger = selectWrapper.querySelector('.custom-select-trigger');
        const clearBtn = selectWrapper.querySelector('.btn-clear-select');
        if (!clearBtn) return;

        const hasValue = trigger.dataset.value && trigger.dataset.value.trim() !== "" && !trigger.classList.contains('is-placeholder');

        if (hasValue) {
            clearBtn.style.display = 'inline-flex';
        } else {
            clearBtn.style.display = 'none';
        }
    };
    const initSmartSelect = (row, initialDataList = null) => {
        const container = row.querySelector('.functions-cell-container');
        const listContainer = container.querySelector('.functions-list-container');
        const addBtn = container.querySelector('.btn-add-function-row');
        const pasteBtn = container.querySelector('.btn-paste-function-row');

        listContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(listContainer, e.clientY);
            if (globalDraggedItem && globalDraggedItem.classList.contains('function-row-item')) {
                if (afterElement == null) {
                    listContainer.appendChild(globalDraggedItem);
                } else {
                    listContainer.insertBefore(globalDraggedItem, afterElement);
                }
            }
        });

        const getDragAfterElement = (container, y) => {
            const draggableElements = [...container.querySelectorAll('.function-row-item:not(.is-dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        };

        const openCustomSelectDropdown = (selectWrapper) => {
            closeAllGoalTaskDropdowns();
            selectWrapper.classList.add('is-active');

            const trigger = selectWrapper.querySelector('.custom-select-trigger');
            const isName = selectWrapper.classList.contains('col-select-name');
            const isAi = selectWrapper.classList.contains('col-select-ai');
            const isRole = selectWrapper.classList.contains('col-select-role');

            let options = [];
            let placeholder = trigger.dataset.placeholder;
            let type = "";

            if (isName) {
                options = FUNCTIONS_CATALOG.map(i => i.name);
                type = "name";
            } else if (isAi) {
                options = ["Не используется", "Текстовый", "Графический", "Голосовой", "Аналитический", "Генерация кода", "Видео и мультимедиа"];
                type = "ai";
            } else if (isRole) {
                options = ["Исполняет", "Консультирует", "Согласует"];
                type = "role";
            }

            const renderDropdownContent = (filter = "") => {
                let activeFilter = filter;
                if (activeCustomSelectDropdown) {
                    const currentInput = activeCustomSelectDropdown.querySelector('.dropdown-search-input');
                    if (currentInput) activeFilter = currentInput.value;
                    activeCustomSelectDropdown.remove();
                }

                activeCustomSelectDropdown = document.createElement('div');
                activeCustomSelectDropdown.className = 'smart-dropdown custom-select-smart-dropdown';

                let dropdownHTML = "";
                if (!isAi && !isRole) {
                    dropdownHTML += `
                        <div class="dropdown-search-box">
                            <div class="search-input-wrapper">
                                <i data-lucide="search" class="search-icon"></i>
                                <input type="text" class="dropdown-search-input" placeholder="Поиск..." autocomplete="off" value="${activeFilter}">
                            </div>
                            <button type="button" class="btn-close-dropdown" title="Закрыть">
                                <i data-lucide="x"></i>
                            </button>
                        </div>
                    `;
                }
                dropdownHTML += `<div class="dropdown-list">`;

                const filteredItems = options.filter(opt => 
                    opt.toLowerCase().includes(activeFilter.toLowerCase())
                );

                let selectedValues = [];
                if (isAi && trigger.dataset.value) {
                    selectedValues = trigger.dataset.value.split(', ').filter(Boolean);
                } else if (trigger.dataset.value) {
                    selectedValues = [trigger.dataset.value];
                }

                if (filteredItems.length > 0) {
                    filteredItems.forEach(opt => {
                        const isSelected = selectedValues.includes(opt);
                        const highlighted = activeFilter ? opt.replace(new RegExp(`(${activeFilter})`, 'gi'), '<mark>$1</mark>') : opt;
                        dropdownHTML += `
                            <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-value="${opt}">
                                <span class="item-text">${highlighted}</span>
                                <div class="item-selection-state">
                                    ${isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                                </div>
                            </div>`;
                    });
                } else if (type === 'name' && activeFilter) {
                    dropdownHTML += `
                        <div class="dropdown-empty-state">
                            <button type="button" class="add-new-function-btn">
                                + Добавить функцию
                            </button>
                        </div>
                    `;
                } else {
                    dropdownHTML += `<div class="dropdown-empty-state">Нет результатов...</div>`;
                }

                dropdownHTML += `</div>`;
                activeCustomSelectDropdown.innerHTML = dropdownHTML;

                const rect = selectWrapper.getBoundingClientRect();
                activeCustomSelectDropdown.style.visibility = 'hidden';
                document.body.appendChild(activeCustomSelectDropdown);
                
                const dropdownHeight = activeCustomSelectDropdown.offsetHeight;
                const dropdownWidth = Math.max(rect.width, 240);

                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;

                if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                    activeCustomSelectDropdown.style.top = `${rect.top - dropdownHeight - 4}px`;
                } else {
                    activeCustomSelectDropdown.style.top = `${rect.bottom + 4}px`;
                }

                activeCustomSelectDropdown.style.left = `${Math.min(rect.left, window.innerWidth - dropdownWidth - 16)}px`;
                activeCustomSelectDropdown.style.width = `${dropdownWidth}px`;
                activeCustomSelectDropdown.style.visibility = 'visible';

                lucide.createIcons();

                const searchInput = activeCustomSelectDropdown.querySelector('.dropdown-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                    
                    searchInput.addEventListener('input', (e) => {
                        renderDropdownContent(e.target.value);
                    });
                    
                    searchInput.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }

                const closeBtn = activeCustomSelectDropdown.querySelector('.btn-close-dropdown');
                if (closeBtn) {
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        closeCustomSelectDropdown();
                    });
                }

                activeCustomSelectDropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
                    itemEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const val = itemEl.dataset.value;
                        
                        if (isAi) {
                            let currentValues = trigger.dataset.value ? trigger.dataset.value.split(', ').filter(Boolean) : [];
                            if (val === "Не используется") {
                                if (currentValues.includes("Не используется")) {
                                    currentValues = [];
                                } else {
                                    currentValues = ["Не используется"];
                                }
                            } else {
                                currentValues = currentValues.filter(v => v !== "Не используется");
                                if (currentValues.includes(val)) {
                                    currentValues = currentValues.filter(v => v !== val);
                                } else {
                                    currentValues.push(val);
                                }
                            }
                            
                            if (currentValues.length === 0) {
                                trigger.textContent = trigger.dataset.placeholder || "Маркировка ИИ";
                                trigger.dataset.value = "";
                                trigger.classList.add('is-placeholder');
                            } else {
                                trigger.innerHTML = `<span class="select-tag-badge">Выбрано: ${currentValues.length}</span>`;
                                trigger.dataset.value = currentValues.join(', ');
                                trigger.classList.remove('is-placeholder');
                            }
                            selectWrapper.classList.remove('error-field');
                            
                            renderDropdownContent(activeFilter);
                            updateClearButtonVisibility(selectWrapper);
                            
                            const rowItem = selectWrapper.closest('.function-row-item');
                            if (rowItem) {
                                updateAiInfluenceState(rowItem);
                            }
                            validateFunctionalStage();
                        } else {
                            trigger.textContent = val;
                            trigger.dataset.value = val;
                            trigger.classList.remove('is-placeholder');
                            selectWrapper.classList.remove('error-field');
                            closeCustomSelectDropdown();
                            updateClearButtonVisibility(selectWrapper);
                            validateFunctionalStage();
                        }
                    });
                });

                const addNewBtn = activeCustomSelectDropdown.querySelector('.add-new-function-btn');
                if (addNewBtn) {
                    addNewBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const newFunc = activeFilter.trim();
                        if (newFunc && !FUNCTIONS_CATALOG.some(i => i.name === newFunc)) {
                            FUNCTIONS_CATALOG.push({ name: newFunc, isCustom: true });
                            FUNCTIONS_CATALOG.sort((a, b) => a.name.localeCompare(b.name));
                        }
                        trigger.textContent = newFunc;
                        trigger.dataset.value = newFunc;
                        trigger.classList.remove('is-placeholder');
                        selectWrapper.classList.remove('error-field');
                        closeCustomSelectDropdown();
                        validateFunctionalStage();
                    });
                }
            };

            renderDropdownContent("");
        };

        const updateAiInfluenceState = (rowItem) => {
            const aiTrigger = rowItem.querySelector('.col-select-ai .custom-select-trigger');
            const influenceContainer = rowItem.querySelector('.ai-influence-container');
            const influenceInput = rowItem.querySelector('.ai-influence-input');
            if (!aiTrigger || !influenceContainer || !influenceInput) return;

            const val = aiTrigger.dataset.value || "";
            const values = val.split(', ').filter(Boolean);
            
            const hasAiActive = values.length > 0 && !values.includes("Не используется");
            
            if (hasAiActive) {
                influenceInput.removeAttribute('disabled');
            } else {
                influenceInput.setAttribute('disabled', 'true');
                influenceInput.value = "";
            }
        };

        const openAiInfluenceDropdown = (inputEl) => {
            if (inputEl.disabled) return;
            closeAllGoalTaskDropdowns();

            const container = inputEl.closest('.ai-influence-container');
            if (container) container.classList.add('is-active');

            activeAiInfluenceDropdown = document.createElement('div');
            activeAiInfluenceDropdown.className = 'smart-dropdown custom-select-smart-dropdown';

            let dropdownHTML = `<div class="dropdown-list">`;
            for (let i = 10; i <= 100; i += 10) {
                const val = `${i}%`;
                const isSelected = inputEl.value === val;
                dropdownHTML += `
                    <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-value="${val}">
                        <span class="item-text">${val}</span>
                        <div class="item-selection-state">
                            ${isSelected ? '<i data-lucide="check" class="check-icon"></i>' : ''}
                        </div>
                    </div>`;
            }
            dropdownHTML += `</div>`;
            activeAiInfluenceDropdown.innerHTML = dropdownHTML;

            const rect = inputEl.getBoundingClientRect();
            activeAiInfluenceDropdown.style.visibility = 'hidden';
            document.body.appendChild(activeAiInfluenceDropdown);

            const dropdownHeight = activeAiInfluenceDropdown.offsetHeight;
            const dropdownWidth = 110;

            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                activeAiInfluenceDropdown.style.top = `${rect.top - dropdownHeight - 4}px`;
            } else {
                activeAiInfluenceDropdown.style.top = `${rect.bottom + 4}px`;
            }

            activeAiInfluenceDropdown.style.left = `${Math.min(rect.left, window.innerWidth - dropdownWidth - 16)}px`;
            activeAiInfluenceDropdown.style.width = `${dropdownWidth}px`;
            activeAiInfluenceDropdown.style.visibility = 'visible';

            lucide.createIcons();

            activeAiInfluenceDropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
                itemEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const val = itemEl.dataset.value;
                    inputEl.value = val;
                    closeAiInfluenceDropdown();
                    validateFunctionalStage();
                });
            });
        };

        const addFunctionRowItem = (initialData = null) => {
            const rowItem = document.createElement('div');
            rowItem.className = 'function-row-item';
            rowItem.innerHTML = `
                <div class="function-drag-handle" title="Перетащить">
                    <i data-lucide="grip-vertical"></i>
                </div>
                <div class="custom-select-wrapper col-select-name" style="flex: 2 1 0%; min-width: 0;">
                    <div class="custom-select-trigger is-placeholder" data-placeholder="Выберите функцию">Выберите функцию</div>
                    <button type="button" class="btn-clear-select" title="Сбросить значение" style="display: none;">
                        <i data-lucide="x"></i>
                    </button>
                    <i data-lucide="chevron-down" class="select-chevron"></i>
                </div>
                <div class="custom-select-wrapper col-select-ai" style="flex: 1 1 0%; min-width: 0;">
                    <div class="custom-select-trigger is-placeholder" data-placeholder="Маркировка ИИ">Маркировка ИИ</div>
                    <button type="button" class="btn-clear-select" title="Сбросить значение" style="display: none;">
                        <i data-lucide="x"></i>
                    </button>
                    <i data-lucide="chevron-down" class="select-chevron"></i>
                </div>
                <div class="ai-influence-container">
                    <input type="text" class="ai-influence-input" placeholder="Влияние ИИ" title="Влияние ИИ" disabled autocomplete="off">
                    <i data-lucide="chevron-down" class="select-chevron"></i>
                </div>
                <div class="custom-select-wrapper col-select-role" style="flex: 1 1 0%; min-width: 0;">
                    <div class="custom-select-trigger is-placeholder" data-placeholder="Роль функции">Роль функции</div>
                    <button type="button" class="btn-clear-select" title="Сбросить значение" style="display: none;">
                        <i data-lucide="x"></i>
                    </button>
                    <i data-lucide="chevron-down" class="select-chevron"></i>
                </div>
                <button type="button" class="btn-copy-function-row" title="Копировать функцию">
                    <i data-lucide="copy"></i>
                </button>
                <button type="button" class="btn-delete-function-row" title="Удалить функцию">
                    <i data-lucide="x"></i>
                </button>
            `;

            listContainer.appendChild(rowItem);
            lucide.createIcons();
            validateFunctionalStage();

            // Drag handle listeners
            const handle = rowItem.querySelector('.function-drag-handle');
            if (handle) {
                handle.addEventListener('mousedown', () => {
                    const rowCount = listContainer.querySelectorAll('.function-row-item').length;
                    if (rowCount > 1) {
                        rowItem.setAttribute('draggable', 'true');
                    }
                });

                handle.addEventListener('mouseup', () => {
                    rowItem.setAttribute('draggable', 'false');
                });
            }

            rowItem.addEventListener('dragstart', (e) => {
                globalDraggedItem = rowItem;
                globalSourceContainer = listContainer;
                rowItem.classList.add('is-dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            rowItem.addEventListener('dragend', () => {
                rowItem.classList.remove('is-dragging');
                rowItem.setAttribute('draggable', 'false');
                
                // Update drag-and-drop state on all containers in the drawer
                document.querySelectorAll('.functions-list-container').forEach(listCont => {
                    updateDragAndDropState(listCont);
                });
                
                globalDraggedItem = null;
                globalSourceContainer = null;
                validateFunctionalStage();
            });

            // AI Influence input event listeners
            const influenceInput = rowItem.querySelector('.ai-influence-input');
            if (influenceInput) {
                influenceInput.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openAiInfluenceDropdown(influenceInput);
                });
                influenceInput.addEventListener('input', () => {
                    validateFunctionalStage();
                });
                influenceInput.addEventListener('focus', () => {
                    openAiInfluenceDropdown(influenceInput);
                });
                influenceInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        influenceInput.blur();
                    }
                });
                influenceInput.addEventListener('blur', () => {
                    let val = influenceInput.value.trim();
                    if (val && !val.endsWith('%')) {
                        influenceInput.value = val + '%';
                        validateFunctionalStage();
                    }
                    setTimeout(() => {
                        closeAiInfluenceDropdown();
                    }, 150);
                });
            }

            // Set initial state of AI influence input to disabled
            updateAiInfluenceState(rowItem);

            if (initialData) {
                const nameTrigger = rowItem.querySelector('.col-select-name .custom-select-trigger');
                const aiTrigger = rowItem.querySelector('.col-select-ai .custom-select-trigger');
                const roleTrigger = rowItem.querySelector('.col-select-role .custom-select-trigger');

                if (initialData.name) {
                    nameTrigger.textContent = initialData.name;
                    nameTrigger.dataset.value = initialData.name;
                    nameTrigger.classList.remove('is-placeholder');
                }
                if (initialData.ai) {
                    const cnt = initialData.ai.split(', ').filter(Boolean).length;
                    if (cnt > 0) {
                        aiTrigger.innerHTML = `<span class="select-tag-badge">Выбрано: ${cnt}</span>`;
                    } else {
                        aiTrigger.textContent = aiTrigger.dataset.placeholder || "Маркировка ИИ";
                    }
                    aiTrigger.dataset.value = initialData.ai;
                    aiTrigger.classList.remove('is-placeholder');
                }
                if (initialData.role) {
                    roleTrigger.textContent = initialData.role;
                    roleTrigger.dataset.value = initialData.role;
                    roleTrigger.classList.remove('is-placeholder');
                }
                if (initialData.influence) {
                    if (influenceInput) {
                        influenceInput.value = initialData.influence;
                    }
                }
                
                updateAiInfluenceState(rowItem);
            }

            rowItem.querySelectorAll('.custom-select-wrapper').forEach(selectWrapper => {
                selectWrapper.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openCustomSelectDropdown(selectWrapper);
                });

                // Clear button click handler
                const clearBtn = selectWrapper.querySelector('.btn-clear-select');
                if (clearBtn) {
                    clearBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const trigger = selectWrapper.querySelector('.custom-select-trigger');
                        trigger.textContent = trigger.dataset.placeholder || "";
                        trigger.dataset.value = "";
                        trigger.classList.add('is-placeholder');
                        selectWrapper.classList.remove('error-field');
                        
                        closeCustomSelectDropdown();
                        updateClearButtonVisibility(selectWrapper);
                        
                        const isAi = selectWrapper.classList.contains('col-select-ai');
                        if (isAi) {
                            updateAiInfluenceState(rowItem);
                        }
                        validateFunctionalStage();
                    });
                }
                updateClearButtonVisibility(selectWrapper);
            });

            const copyBtn = rowItem.querySelector('.btn-copy-function-row');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    const nameTrigger = rowItem.querySelector('.col-select-name .custom-select-trigger');
                    const aiTrigger = rowItem.querySelector('.col-select-ai .custom-select-trigger');
                    const roleTrigger = rowItem.querySelector('.col-select-role .custom-select-trigger');
                    const influenceInput = rowItem.querySelector('.ai-influence-input');
                    
                    const funcName = nameTrigger ? (nameTrigger.dataset.value || '') : '';
                    const funcAi = aiTrigger ? (aiTrigger.dataset.value || '') : '';
                    const funcRole = roleTrigger ? (roleTrigger.dataset.value || '') : '';
                    const funcInfluence = influenceInput ? (influenceInput.value || '') : '';
                    
                    window.copiedFunction = {
                        name: funcName,
                        ai: funcAi,
                        role: funcRole,
                        influence: funcInfluence
                    };
                    
                    showToast('Функция успешно скопирована!', true, true);
                    
                    // Show paste button in all task columns
                    document.querySelectorAll('.btn-paste-function-row').forEach(btn => {
                        btn.style.display = 'inline-flex';
                    });
                });
            }

            const deleteBtn = rowItem.querySelector('.btn-delete-function-row');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                rowItem.remove();
                closeCustomSelectDropdown();
                updateDragAndDropState(listContainer);
                validateFunctionalStage();
            });

            updateDragAndDropState(listContainer);
        };

        // Add first empty function row automatically or pre-fill with initial data
        if (initialDataList && initialDataList.length > 0) {
            initialDataList.forEach(funcData => {
                addFunctionRowItem(funcData);
            });
        } else {
            addFunctionRowItem();
        }

        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeAddFuncDropdown) {
                closeAddFuncDropdown();
                return;
            }
            
            closeAllGoalTaskDropdowns();

            activeAddFuncDropdown = document.createElement('div');
            activeAddFuncDropdown.className = 'smart-dropdown custom-select-smart-dropdown';

            const renderAddDropdownContent = (filter = "") => {
                const lowerFilter = filter.toLowerCase();
                let dropdownHTML = `
                    <div class="dropdown-search-box">
                        <div class="search-input-wrapper">
                            <i data-lucide="search" class="search-icon"></i>
                            <input type="text" class="dropdown-search-input" placeholder="Поиск..." value="${filter}">
                        </div>
                        <button class="btn-close-dropdown" title="Закрыть">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="dropdown-list">
                `;

                const items = FUNCTIONS_CATALOG.filter(i => !i.isCustom && i.name.toLowerCase().includes(lowerFilter));

                if (items.length > 0) {
                    items.forEach(item => {
                        dropdownHTML += `
                            <div class="dropdown-item" data-value="${item.name}">
                                <span class="item-text">${item.name}</span>
                            </div>`;
                    });
                } else {
                    dropdownHTML += `<div class="dropdown-empty-state">Нет результатов...</div>`;
                }

                dropdownHTML += `</div>`;
                activeAddFuncDropdown.innerHTML = dropdownHTML;

                lucide.createIcons();

                const searchInput = activeAddFuncDropdown.querySelector('.dropdown-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                    
                    searchInput.addEventListener('input', (e) => {
                        renderAddDropdownContent(e.target.value);
                    });
                    
                    searchInput.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }

                const closeBtn = activeAddFuncDropdown.querySelector('.btn-close-dropdown');
                if (closeBtn) {
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        closeAddFuncDropdown();
                    });
                }

                activeAddFuncDropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
                    itemEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const val = itemEl.dataset.value;
                        // Add new function row with the selected function name
                        addFunctionRowItem({ name: val });
                    });
                });
            };

            renderAddDropdownContent();

            const rect = addBtn.getBoundingClientRect();
            activeAddFuncDropdown.style.visibility = 'hidden';
            document.body.appendChild(activeAddFuncDropdown);

            const dropdownHeight = activeAddFuncDropdown.offsetHeight;
            const dropdownWidth = Math.max(rect.width, 360);

            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                activeAddFuncDropdown.style.top = `${rect.top - dropdownHeight - 4}px`;
            } else {
                activeAddFuncDropdown.style.top = `${rect.bottom + 4}px`;
            }

            activeAddFuncDropdown.style.left = `${Math.min(rect.left, window.innerWidth - dropdownWidth - 16)}px`;
            activeAddFuncDropdown.style.width = `${dropdownWidth}px`;
            activeAddFuncDropdown.style.visibility = 'visible';
        });

        // Initialize paste button and bind paste event handler
        if (pasteBtn) {
            if (window.copiedFunction) {
                pasteBtn.style.display = 'inline-flex';
            } else {
                pasteBtn.style.display = 'none';
            }
            pasteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.copiedFunction) {
                    // Check if the only existing function row is completely empty, and if so, remove it
                    const items = listContainer.querySelectorAll('.function-row-item');
                    if (items.length === 1) {
                        const item = items[0];
                        const nameTrigger = item.querySelector('.col-select-name .custom-select-trigger');
                        const aiTrigger = item.querySelector('.col-select-ai .custom-select-trigger');
                        const roleTrigger = item.querySelector('.col-select-role .custom-select-trigger');
                        const influenceInput = item.querySelector('.ai-influence-input');
                        
                        const isEmpty = (!nameTrigger || !nameTrigger.dataset.value) && 
                                        (!aiTrigger || !aiTrigger.dataset.value || aiTrigger.dataset.value === '') && 
                                        (!roleTrigger || !roleTrigger.dataset.value || roleTrigger.dataset.value === '') && 
                                        (!influenceInput || !influenceInput.value);
                        if (isEmpty) {
                            item.remove();
                        }
                    }
                    
                    addFunctionRowItem(window.copiedFunction);
                    validateFunctionalStage();
                    
                    // Hide all paste buttons globally across all tasks and goals
                    document.querySelectorAll('.btn-paste-function-row').forEach(btn => {
                        btn.style.display = 'none';
                    });
                    // Clear buffer
                    window.copiedFunction = null;
                }
            });
        }
    };

    const addTaskRow = (goalCard, initialTaskData = null) => {
        const tableContainer = goalCard.querySelector('.task-table-container');
        const tbody = goalCard.querySelector('.task-body');
        tableContainer.style.display = 'block';

        const rowIndex = tbody.children.length + 1;
        const row = document.createElement('tr');
        
        const taskName = initialTaskData && initialTaskData.name ? initialTaskData.name : 'Введите задачу';
        const isTaskPlaceholderClass = initialTaskData && initialTaskData.name ? '' : 'is-placeholder';
        
        const taskParticipation = initialTaskData && initialTaskData.participation ? initialTaskData.participation : '';
        const taskRole = initialTaskData && initialTaskData.role ? initialTaskData.role : 'Исполняет';

        row.innerHTML = `
            <td class="col-num">${rowIndex}</td>
            <td class="col-task-name">
                <div class="col-task-name-wrapper ${isTaskPlaceholderClass}" tabindex="0">
                    <span class="task-name-text" data-value="${initialTaskData && initialTaskData.name ? initialTaskData.name : ''}">${taskName}</span>
                    <i data-lucide="chevron-down" class="task-name-chevron"></i>
                </div>
            </td>
            <td class="col-participation">
                <div class="task-participation-container">
                    <input type="text" class="task-participation-input" placeholder="Выбрать" title="Участие в задаче" autocomplete="off" value="${taskParticipation}">
                    <i data-lucide="chevron-down" class="select-chevron"></i>
                </div>
            </td>
            <td class="col-role">
                <div class="custom-select-wrapper col-task-role" tabindex="0">
                    <div class="custom-select-trigger" data-value="${taskRole}">${taskRole}</div>
                    <button type="button" class="btn-clear-select" title="Сбросить значение" style="display: none;">
                        <i data-lucide="x"></i>
                    </button>
                    <i data-lucide="chevron-down" class="select-chevron"></i>
                </div>
            </td>
            <td class="col-funcs">
                <div class="functions-cell-container">
                    <div class="col-functions-selects">
                        <div class="functions-list-container"></div>
                    </div>
                    <div class="col-funcs-btn-wrapper">
                        <button class="btn-add-function-row" type="button">
                            <i data-lucide="plus"></i>
                            <span>Добавить функцию</span>
                        </button>
                        <button class="btn-paste-function-row" type="button" style="display: none;">
                            <i data-lucide="clipboard-list"></i>
                            <span>Вставить функцию</span>
                        </button>
                    </div>
                </div>
            </td>
            <td class="col-actions">
                <button class="btn-delete-task" title="Удалить задачу" type="button">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);

        // Init task name smart select
        const taskNameWrapper = row.querySelector('.col-task-name-wrapper');
        if (taskNameWrapper) {
            taskNameWrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                openTaskNameDropdown(taskNameWrapper);
            });
        }

        initSmartSelect(row, initialTaskData && initialTaskData.functions ? initialTaskData.functions : null);

        // Init task participation input
        const participationInput = row.querySelector('.task-participation-input');
        if (participationInput) {
            participationInput.addEventListener('click', (e) => {
                e.stopPropagation();
                openTaskParticipationDropdown(participationInput);
            });
            participationInput.addEventListener('input', () => {
                participationInput.classList.remove('error-field');
                validateFunctionalStage();
            });
            participationInput.addEventListener('focus', () => {
                openTaskParticipationDropdown(participationInput);
            });
            participationInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    participationInput.blur();
                }
            });
            participationInput.addEventListener('blur', () => {
                let val = participationInput.value.trim();
                if (val && !val.endsWith('%')) {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                        participationInput.value = num + '%';
                    } else {
                        participationInput.value = val + '%';
                    }
                }
                validateFunctionalStage();
            });
        }

        // Init task role custom select
        const roleWrapper = row.querySelector('.col-task-role');
        if (roleWrapper) {
            roleWrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                openTaskRoleDropdown(roleWrapper);
            });

            // Set up clear button click listener
            const clearBtn = roleWrapper.querySelector('.btn-clear-select');
            if (clearBtn) {
                clearBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const trigger = roleWrapper.querySelector('.custom-select-trigger');
                    trigger.textContent = trigger.dataset.placeholder || "";
                    trigger.dataset.value = "";
                    trigger.classList.add('is-placeholder');
                    roleWrapper.classList.remove('error-field');
                    
                    closeTaskRoleDropdown();
                    updateClearButtonVisibility(roleWrapper);
                    validateFunctionalStage();
                });
            }
            updateClearButtonVisibility(roleWrapper);
        }

        lucide.createIcons();
        validateFunctionalStage();
    };

    const updateIndices = (targetContainer = null) => {
        const container = targetContainer || goalsContainer;
        // Update goals
        Array.from(container.children).forEach((card, index) => {
            card.querySelector('.number-text').innerText = index + 1;
            
            // Update tasks within goal
            const tbody = card.querySelector('.task-body');
            Array.from(tbody.children).forEach((row, rIndex) => {
                row.querySelector('.col-num').innerText = rIndex + 1;
            });
        });
    };

    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', createGoalCard);
    }

    const setPositionIfEmpty = (positionValue = 'system-analyst') => {
        const fields = getParamFields();
        if (!fields.position || fields.position.value) return false;

        fields.position.value = positionValue;
        fields.position.dispatchEvent(new Event('input', { bubbles: true }));
        fields.position.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    };

    const setStructureIfEmpty = (structureName = 'Департамент разработки') => {
        const fields = getParamFields();
        if (!fields.structure || fields.structure.value) return false;

        selectStructureNodeByName(structureName);

        if (!fields.structure.value) {
            const treeValueEl = document.getElementById('param-structure-value');
            fields.structure.innerHTML = `<option value="${structureName}" selected>${structureName}</option>`;
            fields.structure.value = structureName;
            if (treeValueEl) {
                treeValueEl.textContent = structureName;
                treeValueEl.classList.remove('is-placeholder');
            }
            fields.structure.dispatchEvent(new Event('input', { bubbles: true }));
            fields.structure.dispatchEvent(new Event('change', { bubbles: true }));
        }

        return true;
    };

    const buildAIFirstStageDraft = (promptText = '') => {
        const fields = getParamFields();
        const selectedPositionText = fields.position && fields.position.selectedOptions && fields.position.selectedOptions[0]
            ? fields.position.selectedOptions[0].textContent.trim()
            : '';
        const positionContext = selectedPositionText && fields.position.value ? selectedPositionText : promptText;
        const normalizedContext = positionContext.toLowerCase();

        if (normalizedContext.includes('руковод') || normalizedContext.includes('менеджер') || normalizedContext.includes('проект')) {
            return {
                name: 'Обеспечение управления проектной деятельностью',
                role: 'Отвечает',
                tasks: [
                    {
                        name: 'Планирование и координация проектных работ',
                        participation: '45%',
                        role: 'Исполняет',
                        functions: [
                            { name: 'Формировать план проекта и контрольные точки', ai: 'Аналитический', influence: '20%', role: 'Исполняет' },
                            { name: 'Координировать участников проектной команды', ai: 'Не используется', influence: '', role: 'Исполняет' },
                            { name: 'Контролировать сроки и качество выполнения задач', ai: 'Аналитический', influence: '25%', role: 'Исполняет' }
                        ]
                    },
                    {
                        name: 'Управление рисками и коммуникациями проекта',
                        participation: '55%',
                        role: 'Исполняет',
                        functions: [
                            { name: 'Выявлять проектные риски и формировать меры реагирования', ai: 'Аналитический', influence: '30%', role: 'Исполняет' },
                            { name: 'Подготавливать статусную отчетность по проекту', ai: 'Текстовый', influence: '20%', role: 'Исполняет' },
                            { name: 'Согласовывать изменения с заинтересованными сторонами', ai: 'Не используется', influence: '', role: 'Согласует' }
                        ]
                    }
                ]
            };
        }

        if (normalizedContext.includes('разработ') || normalizedContext.includes('программист') || normalizedContext.includes('backend') || normalizedContext.includes('frontend')) {
            return {
                name: 'Развитие и сопровождение программных решений',
                role: 'Отвечает',
                tasks: [
                    {
                        name: 'Проектирование и разработка функциональности продукта',
                        participation: '60%',
                        role: 'Исполняет',
                        functions: [
                            { name: 'Разрабатывать программные компоненты по требованиям', ai: 'Генерация кода', influence: '35%', role: 'Исполняет' },
                            { name: 'Проводить код-ревью и улучшать качество решений', ai: 'Аналитический', influence: '20%', role: 'Исполняет' },
                            { name: 'Подготавливать техническую документацию по изменениям', ai: 'Текстовый', influence: '25%', role: 'Исполняет' }
                        ]
                    },
                    {
                        name: 'Поддержка стабильности и интеграций',
                        participation: '40%',
                        role: 'Исполняет',
                        functions: [
                            { name: 'Настраивать интеграции со смежными системами', ai: 'Аналитический', influence: '20%', role: 'Исполняет' },
                            { name: 'Анализировать дефекты и устранять причины инцидентов', ai: 'Аналитический', influence: '30%', role: 'Исполняет' },
                            { name: 'Участвовать в релизах и проверке работоспособности', ai: 'Не используется', influence: '', role: 'Исполняет' }
                        ]
                    }
                ]
            };
        }

        return {
            name: 'Обеспечение анализа и развития бизнес-процессов',
            role: 'Отвечает',
            tasks: [
                {
                    name: 'Сбор и анализ требований заинтересованных сторон',
                    participation: '50%',
                    role: 'Исполняет',
                    functions: [
                        { name: 'Проводить интервью с заказчиками и пользователями', ai: 'Текстовый', influence: '20%', role: 'Исполняет' },
                        { name: 'Анализировать бизнес-требования и ограничения процесса', ai: 'Аналитический', influence: '35%', role: 'Исполняет' },
                        { name: 'Формировать описание целевого процесса и критерии приемки', ai: 'Текстовый', influence: '30%', role: 'Исполняет' }
                    ]
                },
                {
                    name: 'Подготовка решений и сопровождение изменений',
                    participation: '50%',
                    role: 'Исполняет',
                    functions: [
                        { name: 'Описывать функциональные требования для команды реализации', ai: 'Текстовый', influence: '30%', role: 'Исполняет' },
                        { name: 'Согласовывать изменения с владельцами процесса', ai: 'Не используется', influence: '', role: 'Согласует' },
                        { name: 'Проверять соответствие результата исходным требованиям', ai: 'Аналитический', influence: '25%', role: 'Исполняет' }
                    ]
                }
            ]
        };
    };

    const applyAIFirstStageDraft = (promptText = '') => {
        const fields = getParamFields();
        const generatedGoal = buildAIFirstStageDraft(promptText);
        const existingGeneratedCards = goalsContainer
            ? Array.from(goalsContainer.querySelectorAll('.goal-card[data-ai-generated="profile-ai"]'))
            : [];

        existingGeneratedCards.forEach(card => card.remove());

        const positionWasSet = setPositionIfEmpty('system-analyst');
        const structureWasSet = setStructureIfEmpty('Департамент разработки');

        if (goalsContainer) {
            createGoalCard(generatedGoal);
            const createdCard = goalsContainer.lastElementChild;
            if (createdCard) {
                createdCard.dataset.aiGenerated = 'profile-ai';
                createdCard.classList.add('is-ai-generated');
            }
            updateIndices();
        }

        validateFunctionalStage();

        const tasksCount = generatedGoal.tasks.length;
        const functionsCount = generatedGoal.tasks.reduce((sum, task) => sum + (task.functions ? task.functions.length : 0), 0);

        return {
            goalName: generatedGoal.name,
            goalsAdded: 1,
            tasksAdded: tasksCount,
            functionsAdded: functionsCount,
            positionWasSet,
            structureWasSet,
            canGoNext: Boolean(nextStageBtn && !nextStageBtn.disabled),
            position: fields.position ? fields.position.value : '',
            structure: fields.structure ? fields.structure.value : ''
        };
    };

    window.HRProfileApp = window.HRProfileApp || {};
    window.HRProfileApp.profileCreateStageGenerator = {
        applyFirstStageDraft: applyAIFirstStageDraft
    };

    // Event Delegation for Card Actions
    if (goalsContainer) {
        goalsContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.goal-card');
            if (!card) return;

            // Goal card name select dropdown toggle
            const goalNameWrapper = e.target.closest('.col-goal-name');
            if (goalNameWrapper) {
                e.stopPropagation();
                openGoalNameDropdown(goalNameWrapper);
            }

            // Goal card role select dropdown toggle
            const goalRoleWrapper = e.target.closest('.col-goal-role');
            if (goalRoleWrapper) {
                e.stopPropagation();
                openGoalRoleDropdown(goalRoleWrapper);
            }

            // Accordion toggle
            if (e.target.closest('.goal-number')) {
                card.classList.toggle('is-collapsed');
            }

            // Add task
            if (e.target.closest('.btn-add-task')) {
                addTaskRow(card);
            }

            // Delete goal
            if (e.target.closest('.btn-delete-goal')) {
                e.stopPropagation();
                const tbody = card.querySelector('.task-body');
                if (!tbody || tbody.children.length === 0) {
                    card.remove();
                    updateIndices();
                    validateFunctionalStage();
                } else {
                    showDeleteGoalModal(card);
                }
            }

            // Delete task
            if (e.target.closest('.btn-delete-task')) {
                const row = e.target.closest('tr');
                const tbody = row.closest('.task-body');
                const tableContainer = card.querySelector('.task-table-container');
                row.remove();
                
                if (tbody.children.length === 0) {
                    tableContainer.style.display = 'none';
                }
                updateIndices();
                validateFunctionalStage();
            }
        });
    }

    // --- View Edit Mode: event delegation for #view-profile-goals-container ---
    const viewGoalsContainer = document.getElementById('view-profile-goals-container');
    if (viewGoalsContainer) {
        viewGoalsContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.goal-card');
            if (!card) return;

            const goalNameWrapper = e.target.closest('.col-goal-name');
            if (goalNameWrapper) {
                e.stopPropagation();
                openGoalNameDropdown(goalNameWrapper);
            }

            const goalRoleWrapper = e.target.closest('.col-goal-role');
            if (goalRoleWrapper) {
                e.stopPropagation();
                openGoalRoleDropdown(goalRoleWrapper);
            }

            if (e.target.closest('.goal-number')) {
                card.classList.toggle('is-collapsed');
            }

            if (e.target.closest('.btn-add-task')) {
                addTaskRow(card);
            }

            if (e.target.closest('.btn-delete-goal')) {
                e.stopPropagation();
                const tbody = card.querySelector('.task-body');
                if (!tbody || tbody.children.length === 0) {
                    card.remove();
                    updateIndices(viewGoalsContainer);
                } else {
                    showDeleteGoalModal(card);
                }
            }

            if (e.target.closest('.btn-delete-task')) {
                const row = e.target.closest('tr');
                const tbody = row.closest('.task-body');
                const tableContainer = card.querySelector('.task-table-container');
                row.remove();
                if (tbody.children.length === 0) {
                    tableContainer.style.display = 'none';
                }
                updateIndices(viewGoalsContainer);
            }
        });

        // Track changes to enable the save button
        const enableSaveViewEdit = () => {
            const btnSave = document.getElementById('btn-save-view-edit');
            if (btnSave && isViewEditMode) {
                btnSave.disabled = false;
            }
        };

        viewGoalsContainer.addEventListener('input', enableSaveViewEdit);
        viewGoalsContainer.addEventListener('change', enableSaveViewEdit);

        const observer = new MutationObserver(() => {
            if (isViewEditMode) {
                enableSaveViewEdit();
            }
        });
        observer.observe(viewGoalsContainer, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-value'] });
    }

    // --- View Edit Mode functions ---
    const enterViewEditMode = () => {
        isViewEditMode = true;
        
        if (currentViewProfile) {
            renderProfileAttributes(currentViewProfile, true);
        }

        const container = document.getElementById('view-profile-goals-container');
        if (!container) return;

        const activeTab = document.querySelector('.view-tab-btn.active');
        const tabText = activeTab ? activeTab.innerText.trim() : '';

        const compContent = document.getElementById('competencies-content');
        if (compContent) compContent.classList.remove('is-view-mode');

        if (tabText === 'Общие положения и функционал') {
            container.innerHTML = '';
            container.style.gap = '16px';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';

            if (currentViewProfile && currentViewProfile.goals && currentViewProfile.goals.length > 0) {
                currentViewProfile.goals.forEach(goalData => {
                    createGoalCard(goalData, container);
                });
            } else {
                createGoalCard(null, container);
            }
        }

        // Change edit button style
        const btnEdit = document.getElementById('btn-edit-profile');
        if (btnEdit) {
            btnEdit.classList.add('active-edit-btn');
            btnEdit.innerHTML = '<i data-lucide="check" style="color: #10B981;"></i><span>Редактировать</span>';
        }

        // Show footer and disable save button initially
        const viewFooter = document.getElementById('view-drawer-footer');
        const btnSave = document.getElementById('btn-save-view-edit');
        const btnAddGoal = document.getElementById('btn-view-add-goal');
        if (viewFooter) viewFooter.style.display = 'flex';
        if (btnSave) btnSave.disabled = true;
        
        if (btnAddGoal) {
            btnAddGoal.style.display = (tabText === 'Общие положения и функционал') ? 'inline-flex' : 'none';
        }
        
        const helpLink = document.querySelector('.view-tab-link-right');
        if (helpLink) {
            helpLink.style.display = (tabText === 'Общие положения и функционал') ? '' : 'none';
        }

        lucide.createIcons();
    };

    const exitViewEditMode = () => {
        isViewEditMode = false;
        
        if (currentViewProfile) {
            renderProfileAttributes(currentViewProfile, false);
        }
        
        const activeTab = document.querySelector('.view-tab-btn.active');
        const tabText = activeTab ? activeTab.innerText.trim() : '';
        const container = document.getElementById('view-profile-goals-container');

        if (tabText === 'Общие положения и функционал') {
            if (container && currentViewProfile) {
                container.innerHTML = generateViewGoalsHtml(currentViewProfile);
            }
        }
        
        const compContent = document.getElementById('competencies-content');
        if (compContent) compContent.classList.add('is-view-mode');
        
        const btnEdit = document.getElementById('btn-edit-profile');
        const viewFooter = document.getElementById('view-drawer-footer');
        const btnAddGoal = document.getElementById('btn-view-add-goal');
        
        if (btnEdit) {
            btnEdit.classList.remove('active-edit-btn');
            btnEdit.innerHTML = '<i data-lucide="edit-3"></i><span>Редактировать</span>';
        }
        if (viewFooter) viewFooter.style.display = 'none';
        if (btnAddGoal) btnAddGoal.style.display = 'none';

        lucide.createIcons();
    };

    const isViewTab = (tabElement, tabName) => {
        if (!tabElement) return false;

        const dataTab = tabElement.getAttribute('data-tab');
        if (dataTab === tabName) return true;

        const tabText = (tabElement.innerText || tabElement.textContent || '').trim().toLowerCase();
        if (tabName === 'functional') {
            return tabText.includes('\u043e\u0431\u0449\u0438\u0435 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u044f') || tabText.includes('\u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b');
        }
        if (tabName === 'competencies') {
            return tabText.includes('\u043a\u043e\u043c\u043f\u0435\u0442\u0435\u043d\u0446');
        }

        return false;
    };

    const saveViewEditMode = () => {
        if (!currentViewProfile) return;
        
        const activeTab = document.querySelector('.view-tab-btn.active');
        const tabText = activeTab ? activeTab.innerText.trim() : '';
        
        // Extract general attributes in edit mode
        const profileTrigger = document.getElementById('attr-edit-profile-trigger');
        const codeInput = document.getElementById('attr-edit-code-input');
        const categoryTrigger = document.getElementById('attr-edit-category-trigger');
        const leaderTrigger = document.getElementById('attr-edit-leader-trigger');
        const dateInput = document.getElementById('attr-edit-date-input');
        const statusTrigger = document.getElementById('attr-edit-status-trigger');

        if (profileTrigger) {
            currentViewProfile.name = profileTrigger.getAttribute('data-value') || '';
        }
        if (codeInput) {
            currentViewProfile.code = codeInput.value || '';
        }
        if (categoryTrigger) {
            const catVal = categoryTrigger.getAttribute('data-value');
            currentViewProfile.categories = catVal ? catVal.split(',').map(s => s.trim()).filter(Boolean) : [];
        }
        if (leaderTrigger) {
            currentViewProfile.leaderName = leaderTrigger.getAttribute('data-value') || '';
            currentViewProfile.leaderPosition = leaderTrigger.getAttribute('data-position') || '';
        }
        if (dateInput && dateInput.value) {
            try {
                currentViewProfile.updatedAt = new Date(dateInput.value).toISOString();
            } catch (e) {
                currentViewProfile.updatedAt = dateInput.value;
            }
        }
        if (statusTrigger) {
            currentViewProfile.status = statusTrigger.getAttribute('data-value') || '';
        }

        if (isViewTab(activeTab, 'functional')) {
            const extractedGoals = extractGoalsFromDOM('view-profile-goals-container');
            currentViewProfile.goals = extractedGoals;
        }

        if (isViewTab(activeTab, 'competencies')) {
            currentViewProfile.competencies = extractCompetenciesState();
        }

        syncCurrentViewProfile();
        
        showToast('Изменения успешно сохранены!', true, true);
        exitViewEditMode();
    };

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (profileDrawer && profileDrawer.classList.contains('is-open')) {
                closeDrawer();
            }
            if (viewProfileDrawer && viewProfileDrawer.classList.contains('is-open')) {
                closeViewProfileDrawer();
            }
        }
    });

    // --- Soft Skills Section Logic ---
    const SOFT_SKILLS_CATALOG = [
        { id: 1, name: "Командная работа", desc: "Умение эффективно взаимодействовать с коллегами для достижения общих целей." },
        { id: 2, name: "Критическое мышление", desc: "Способность анализировать информацию и принимать взвешенные решения." },
        { id: 3, name: "Тайм-менеджмент", desc: "Эффективное планирование рабочего времени и соблюдение дедлайнов." },
        { id: 4, name: "Эмоциональный интеллект", desc: "Понимание своих и чужих эмоций для конструктивного общения." },
        { id: 5, name: "Адаптивность", desc: "Способность быстро подстраиваться под меняющиеся условия и задачи." },
        { id: 6, name: "Переговоры", desc: "Навык ведения диалога для нахождения взаимовыгодных решений." },
        { id: 7, name: "Лидерство", desc: "Умение вдохновлять команду и брать на себя ответственность." },
        { id: 8, name: "Решение конфликтов", desc: "Способность находить выход из спорных ситуаций без ущерба для дела." },
        { id: 9, name: "Презентационные навыки", desc: "Умение четко и убедительно излагать свои идеи аудитории." },
        { id: 10, name: "Креативность", desc: "Поиск нестандартных подходов к решению стандартных задач." }
    ];

    const LEVEL_DESCRIPTIONS = {
        1: "1 — Начальный: знает теорию",
        2: "2 — Опытный: применяет в работе",
        3: "3 — Продвинутый: решает сложные кейсы",
        4: "4 — Эксперт: обучает других"
    };

    let selectedSoftSkills = [];
    const MAX_SKILLS = 8;

    const softSkillsAccordion = document.getElementById('soft-skills-accordion');
    const softSkillsHeader = document.getElementById('soft-skills-header');
    const addSkillBtn = document.getElementById('add-soft-skill-btn');
    const skillsDropdown = document.getElementById('soft-skills-dropdown');
    const dropdownList = document.getElementById('soft-skills-list');
    const softSkillsSearch = document.getElementById('soft-skills-search');
    const softSkillsCreate = document.getElementById('soft-skills-create');
    const dropdownClose = skillsDropdown.querySelector('.dropdown-close');
    const skillsGrid = document.getElementById('soft-skills-grid');
    const skillsEmpty = document.getElementById('soft-skills-empty');
    const skillsCounter = document.getElementById('soft-skills-counter');
    const customSoftSkills = new Set();

    // Toggle Accordion
    softSkillsHeader.addEventListener('click', (e) => {
        // Don't toggle if clicking the Add button or dropdown
        if (e.target.closest('#add-soft-skill-btn') || e.target.closest('#soft-skills-dropdown')) return;
        softSkillsAccordion.classList.toggle('is-open');
    });

    const closeAllDropdowns = (exceptElement) => {
        const dropdowns = [
            document.getElementById('soft-skills-dropdown'),
            document.getElementById('hard-skills-dropdown'),
            document.getElementById('languages-dropdown'),
            document.getElementById('tech-dropdown'),
            document.getElementById('certs-dropdown'),
            document.getElementById('edu-skills-dropdown'),
            document.getElementById('extra-permits-dropdown'),
            document.getElementById('func-dropdown')
        ];
        
        dropdowns.forEach(dropdown => {
            if (dropdown && dropdown !== exceptElement) {
                dropdown.classList.remove('is-open');
            }
        });

        document.querySelectorAll('.direction-dropdown').forEach(dropdown => {
            if (dropdown !== exceptElement) {
                dropdown.style.display = 'none';
            }
        });
    };

    // Toggle Dropdown
    addSkillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(skillsDropdown);
        
        // Auto-expand if closed
        if (!softSkillsAccordion.classList.contains('is-open')) {
            softSkillsAccordion.classList.add('is-open');
        }

        skillsDropdown.classList.toggle('is-open');
        if (skillsDropdown.classList.contains('is-open')) {
            softSkillsSearch.value = "";
            renderDropdownList("");
            setTimeout(() => softSkillsSearch.focus(), 100);
        }
    });

    dropdownClose.addEventListener('click', (e) => {
        e.stopPropagation();
        skillsDropdown.classList.remove('is-open');
    });

    document.addEventListener('click', (e) => {
        if (!skillsDropdown.contains(e.target) && !addSkillBtn.contains(e.target)) {
            skillsDropdown.classList.remove('is-open');
        }
    });

    softSkillsSearch.addEventListener('input', (e) => {
        renderDropdownList(e.target.value);
    });

    const renderDropdownList = (query = "") => {
        const filtered = SOFT_SKILLS_CATALOG.filter(skill => 
            skill.name.toLowerCase().includes(query.toLowerCase())
        );

        const customItems = filtered.filter(skill => skill.isCustom);
        const regularItems = filtered.filter(skill => !skill.isCustom);

        let html = "";
        if (customItems.length > 0) {
            html += customItems.map((skill, index) => {
                const isSelected = selectedSoftSkills.some(s => s.id === skill.id);
                const isLastCustom = index === customItems.length - 1;
                return `
                    <div class="dropdown-item-skill is-custom-skill ${isSelected ? 'selected' : ''} ${isLastCustom ? 'last-custom' : ''}" data-id="${skill.id}">
                        <span>${skill.name}</span>
                        <div class="actions-wrapper">
                            <button class="btn-delete-custom-skill" title="Удалить компетенцию" type="button">
                                <i data-lucide="trash-2"></i>
                            </button>
                            <i data-lucide="check" class="check-icon"></i>
                        </div>
                    </div>
                `;
            }).join('');
        }

        html += regularItems.map(skill => {
            const isSelected = selectedSoftSkills.some(s => s.id === skill.id);
            return `
                <div class="dropdown-item-skill ${isSelected ? 'selected' : ''}" data-id="${skill.id}">
                    <span>${skill.name}</span>
                    <i data-lucide="check" class="check-icon"></i>
                </div>
            `;
        }).join('');

        dropdownList.innerHTML = html;
        lucide.createIcons();

        // Show Create button if no exact match and query not empty
        const exactMatch = SOFT_SKILLS_CATALOG.some(item => item.name.toLowerCase() === query.trim().toLowerCase());
        if (!exactMatch && query.trim() !== "") {
            softSkillsCreate.style.display = 'block';
        } else {
            softSkillsCreate.style.display = 'none';
        }

        dropdownList.querySelectorAll('.dropdown-item-skill').forEach(item => {
            const deleteBtn = item.querySelector('.btn-delete-custom-skill');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(item.dataset.id);
                    customSoftSkills.delete(id);
                    // Remove from catalog
                    const catIndex = SOFT_SKILLS_CATALOG.findIndex(s => s.id === id);
                    if (catIndex > -1) {
                        SOFT_SKILLS_CATALOG.splice(catIndex, 1);
                    }
                    // Remove from selected list
                    const selIndex = selectedSoftSkills.findIndex(s => s.id === id);
                    if (selIndex > -1) {
                        selectedSoftSkills.splice(selIndex, 1);
                        updateSkillsUI();
                        validateCompetenciesStage();
                    }
                    renderDropdownList(softSkillsSearch.value);
                });
            }

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(item.dataset.id);
                toggleSkillSelection(id);
            });
        });
    };

    // Create New Competence
    softSkillsCreate.querySelector('.btn-create-skill').addEventListener('click', (e) => {
        e.stopPropagation();
        const newVal = softSkillsSearch.value.trim();
        if (newVal) {
            let existing = SOFT_SKILLS_CATALOG.find(s => s.name.toLowerCase() === newVal.toLowerCase());
            if (!existing) {
                const newSkill = {
                    id: Date.now(),
                    name: newVal,
                    desc: "Пользовательская компетенция",
                    isCustom: true
                };
                SOFT_SKILLS_CATALOG.unshift(newSkill); // Prepend to top
                customSoftSkills.add(newSkill.id);
                existing = newSkill;
            }
            toggleSkillSelection(existing.id);
            softSkillsSearch.value = "";
            renderDropdownList("");
        }
    });

    const toggleSkillSelection = (id) => {
        const index = selectedSoftSkills.findIndex(s => s.id === id);
        if (index > -1) {
            selectedSoftSkills.splice(index, 1);
        } else {
            if (selectedSoftSkills.length >= MAX_SKILLS) {
                showToast('Достигнуто максимальное количество выбранных значений (не более 8)!', true);
                return;
            }
            const skill = SOFT_SKILLS_CATALOG.find(s => s.id === id);
            selectedSoftSkills.push({ ...skill, score: 0 });

            // Auto-expand if closed
            if (!softSkillsAccordion.classList.contains('is-open')) {
                softSkillsAccordion.classList.add('is-open');
            }
        }
        
        updateSkillsUI();
        renderDropdownList(softSkillsSearch.value);
        validateCompetenciesStage();
    };

    const updateSkillsUI = () => {
        // Counter
        const count = selectedSoftSkills.length;
        skillsCounter.innerText = `${count} выбрано`;
        skillsCounter.className = count > 0 ? 'skills-counter valid' : 'skills-counter';

        // Add Button state
        addSkillBtn.disabled = count >= MAX_SKILLS;

        // Reset Button state
        document.getElementById('reset-soft-skills-btn').style.display = count > 0 ? 'flex' : 'none';

        // Empty state vs Grid
        if (count === 0) {
            skillsEmpty.style.display = 'flex';
            skillsGrid.style.display = 'none';
        } else {
            skillsEmpty.style.display = 'none';
            skillsGrid.style.display = 'grid';
            renderSkillsGrid();
        }
    };

    // Individual Reset Soft Skills
    document.getElementById('reset-soft-skills-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedSoftSkills = [];
        updateSkillsUI();
        renderDropdownList();
        validateCompetenciesStage();
    });

    const renderSkillsGrid = () => {
        skillsGrid.innerHTML = selectedSoftSkills.map(skill => `
            <div class="skill-card" data-id="${skill.id}">
                <div class="skill-card-header">
                    <h4 class="skill-card-title">${skill.name}</h4>
                    <button class="btn-delete-skill" title="Удалить">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <p class="skill-card-desc" style="margin: 0;">${skill.desc}</p>
            </div>
        `).join('');
        lucide.createIcons();

        // Listeners for skill cards
        skillsGrid.querySelectorAll('.skill-card').forEach(card => {
            const id = parseInt(card.dataset.id);

            // Delete
            card.querySelector('.btn-delete-skill').addEventListener('click', () => {
                toggleSkillSelection(id);
            });
        });
    };

    const validateCompetenciesStage = () => {
        const softCount = selectedSoftSkills.length;
        const hardCount = selectedHardSkills.length;
        const langCount = selectedLanguages.length;
        const langAllScored = selectedLanguages.every(l => l.level !== null);
        const techCount = selectedTech.length;
        const certCount = selectedCerts.length;
        const permitCount = selectedPermits.length;
        const eduCount = selectedEdu.length;
        const expCount = selectedExp.length;
        const hasTotalExp = selectedExp.some(e => e.id === 'total' && e.years && e.years !== 'Нет опыта');
        const funcCount = selectedFuncAreas.length;
        
        // Validation constraint: ALL 9 competency sections must have at least one valid selection!
        const allSectionsFilled = 
            softCount > 0 &&
            hardCount > 0 &&
            langCount > 0 && langAllScored &&
            techCount > 0 &&
            certCount > 0 &&
            permitCount > 0 &&
            eduCount > 0 &&
            expCount > 0 && hasTotalExp &&
            funcCount > 0;

        if (allSectionsFilled) {
            nextStageBtn.disabled = false;
        } else {
            // Only disable if we are on the competencies stage
            if (document.getElementById('stage-competencies').classList.contains('active')) {
                nextStageBtn.disabled = true;
            }
        }
    };

    // --- Professional Skills Section Logic ---
    const HARD_SKILLS_CATALOG = [
        "SQL (PostgreSQL, MySQL)", "JavaScript (React, Vue, Node.js)", "Python (Django, FastAPI)", 
        "Java (Spring Boot)", "Docker & Kubernetes", "CI/CD (GitLab, Jenkins)", "C# (.NET Core)",
        "TypeScript", "HTML5 & CSS3", "BPMN 2.0", "UML", "REST API Design", "Microservices",
        "Unit Testing (Jest, JUnit)", "Agile (Scrum, Kanban)", "Git (GitHub, GitLab)",
        "System Architecture", "Cloud Platforms (AWS, Azure, GCP)", "Redis", "Elasticsearch",
        "Figma", "Adobe Photoshop", "Чтение чертежей", "AutoCAD", "BIM-моделирование",
        "Управление проектами", "Финансовый анализ", "Юридическая экспертиза"
    ].sort();

    let selectedHardSkills = [];
    const customHardSkills = new Set();

    const hardSkillsAccordion = document.getElementById('hard-skills-accordion');
    const hardSkillsHeader = document.getElementById('hard-skills-header');
    const addHardSkillBtn = document.getElementById('add-hard-skill-btn');
    const hardSkillsDropdown = document.getElementById('hard-skills-dropdown');
    const hardSkillsSearch = document.getElementById('hard-skills-search');
    const hardSkillsList = document.getElementById('hard-skills-list');
    const hardSkillsCreate = document.getElementById('hard-skills-create');
    const hardSkillsCloud = document.getElementById('hard-skills-cloud');
    const hardSkillsEmpty = document.getElementById('hard-skills-empty');
    const hardSkillsCounter = document.getElementById('hard-skills-counter');

    // Toggle Accordion
    hardSkillsHeader.addEventListener('click', (e) => {
        if (e.target.closest('#add-hard-skill-btn') || e.target.closest('#hard-skills-dropdown')) return;
        hardSkillsAccordion.classList.toggle('is-open');
    });

    // Toggle Dropdown & Expand Accordion
    addHardSkillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(hardSkillsDropdown);
        
        // Specific requirement: Expand accordion if closed
        if (!hardSkillsAccordion.classList.contains('is-open')) {
            hardSkillsAccordion.classList.add('is-open');
        }
        
        hardSkillsDropdown.classList.toggle('is-open');
        if (hardSkillsDropdown.classList.contains('is-open')) {
            hardSkillsSearch.value = "";
            renderHardSkillsList("");
            setTimeout(() => hardSkillsSearch.focus(), 100);
        }
    });

    // Search Logic
    hardSkillsSearch.addEventListener('input', (e) => {
        renderHardSkillsList(e.target.value);
    });

    const renderHardSkillsList = (query) => {
        const filtered = HARD_SKILLS_CATALOG.filter(skill => 
            skill.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            hardSkillsList.innerHTML = "";
            hardSkillsList.style.display = 'none';

            // Show Create button if no exact match and query not empty
            const exactMatch = HARD_SKILLS_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
            if (!exactMatch && query.trim() !== "") {
                hardSkillsCreate.style.display = 'block';
            } else {
                hardSkillsCreate.style.display = 'none';
            }
            return;
        }

        hardSkillsList.style.display = 'block';

        const customItems = filtered.filter(skill => customHardSkills.has(skill));
        const regularItems = filtered.filter(skill => !customHardSkills.has(skill));

        let html = "";
        if (customItems.length > 0) {
            html += customItems.map((skill, index) => {
                const isSelected = selectedHardSkills.includes(skill);
                const isLastCustom = index === customItems.length - 1;
                return `
                    <div class="dropdown-item-skill is-custom-skill ${isSelected ? 'selected' : ''} ${isLastCustom ? 'last-custom' : ''}" data-value="${skill}">
                        <span>${skill}</span>
                        <div class="actions-wrapper">
                            <button class="btn-delete-custom-skill" title="Удалить навык" type="button">
                                <i data-lucide="trash-2"></i>
                            </button>
                            <i data-lucide="check" class="check-icon"></i>
                        </div>
                    </div>
                `;
            }).join('');
        }

        html += regularItems.map(skill => {
            const isSelected = selectedHardSkills.includes(skill);
            return `
                <div class="dropdown-item-skill ${isSelected ? 'selected' : ''}" data-value="${skill}">
                    <span>${skill}</span>
                    <i data-lucide="check" class="check-icon"></i>
                </div>
            `;
        }).join('');

        hardSkillsList.innerHTML = html;
        lucide.createIcons();

        // Show Create button if no exact match and query not empty
        const exactMatch = HARD_SKILLS_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
        if (!exactMatch && query.trim() !== "") {
            hardSkillsCreate.style.display = 'block';
        } else {
            hardSkillsCreate.style.display = 'none';
        }

        hardSkillsList.querySelectorAll('.dropdown-item-skill').forEach(item => {
            const deleteBtn = item.querySelector('.btn-delete-custom-skill');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const val = item.dataset.value;
                    customHardSkills.delete(val);
                    const catIndex = HARD_SKILLS_CATALOG.indexOf(val);
                    if (catIndex > -1) {
                        HARD_SKILLS_CATALOG.splice(catIndex, 1);
                    }
                    const selIndex = selectedHardSkills.indexOf(val);
                    if (selIndex > -1) {
                        selectedHardSkills.splice(selIndex, 1);
                        updateHardSkillsUI();
                        validateCompetenciesStage();
                    }
                    renderHardSkillsList(hardSkillsSearch.value);
                });
            }

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleHardSkill(item.dataset.value);
            });
        });
    };

    // Create New Skill
    hardSkillsCreate.querySelector('.btn-create-skill').addEventListener('click', (e) => {
        e.stopPropagation();
        const newVal = hardSkillsSearch.value.trim();
        if (newVal) {
            if (!HARD_SKILLS_CATALOG.some(item => item.toLowerCase() === newVal.toLowerCase())) {
                HARD_SKILLS_CATALOG.push(newVal);
                HARD_SKILLS_CATALOG.sort();
            }
            customHardSkills.add(newVal);
            toggleHardSkill(newVal);
            hardSkillsSearch.value = "";
            renderHardSkillsList("");
        }
    });

    const toggleHardSkill = (skill) => {
        const index = selectedHardSkills.indexOf(skill);
        if (index > -1) {
            selectedHardSkills.splice(index, 1);
        } else {
            if (selectedHardSkills.length >= 8) {
                showToast('Достигнуто максимальное количество выбранных значений (не более 8)!', true);
                return;
            }
            selectedHardSkills.push(skill);

            // Auto-expand if closed
            if (!hardSkillsAccordion.classList.contains('is-open')) {
                hardSkillsAccordion.classList.add('is-open');
            }
        }
        
        updateHardSkillsUI();
        renderHardSkillsList(hardSkillsSearch.value);
        validateCompetenciesStage();
    };

    const updateHardSkillsUI = () => {
        const count = selectedHardSkills.length;
        hardSkillsCounter.innerText = `${count} выбрано`;
        hardSkillsCounter.className = count > 0 ? 'skills-counter valid' : 'skills-counter';

        // Reset Button state
        document.getElementById('reset-hard-skills-btn').style.display = count > 0 ? 'flex' : 'none';
        
        if (count === 0) {
            hardSkillsEmpty.style.display = 'flex';
            hardSkillsCloud.style.display = 'none';
        } else {
            hardSkillsEmpty.style.display = 'none';
            hardSkillsCloud.style.display = 'flex';
            renderTagCloud();
        }
    };

    // Individual Reset Hard Skills
    document.getElementById('reset-hard-skills-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedHardSkills = [];
        updateHardSkillsUI();
        renderHardSkillsList("");
        validateCompetenciesStage();
    });

    const renderTagCloud = () => {
        hardSkillsCloud.innerHTML = selectedHardSkills.map(skill => `
            <div class="skill-tag">
                <span>${skill}</span>
                <button class="btn-remove-tag" data-value="${skill}">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();

        hardSkillsCloud.querySelectorAll('.btn-remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleHardSkill(btn.dataset.value);
            });
        });
    };

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!hardSkillsDropdown.contains(e.target) && !addHardSkillBtn.contains(e.target)) {
            hardSkillsDropdown.classList.remove('is-open');
        }
    });

    hardSkillsDropdown.querySelector('.dropdown-close').addEventListener('click', (e) => {
        e.stopPropagation();
        hardSkillsDropdown.classList.remove('is-open');
    });

    // --- Foreign Languages Section Logic ---
    const LANGUAGES_CATALOG = [
        "Английский", "Китайский", "Немецкий", "Французский", "Испанский", 
        "Итальянский", "Японский", "Корейский", "Арабский", "Португальский", "Турецкий"
    ].sort();

    const LANG_LEVEL_DESCRIPTIONS = {
        'A1': 'A1 — Beginner (Элементарное владение)',
        'A2': 'A2 — Elementary (Базовые знания)',
        'B1': 'B1 — Intermediate (Средний уровень)',
        'B2': 'B2 — Upper Intermediate (Свободное общение)',
        'C1': 'C1 — Advanced (Профессиональное владение)',
        'C2': 'C2 — Proficiency (Владение в совершенстве)'
    };

    let selectedLanguages = [];

    const langSkillsAccordion = document.getElementById('lang-skills-accordion');
    const langSkillsHeader = document.getElementById('lang-skills-header');
    const addLangBtn = document.getElementById('add-lang-skill-btn');
    const langDropdown = document.getElementById('lang-skills-dropdown');
    const langSearch = document.getElementById('lang-skills-search');
    const langList = document.getElementById('lang-skills-list');
    const langGrid = document.getElementById('lang-skills-grid');
    const langEmpty = document.getElementById('lang-skills-empty');
    const langCounter = document.getElementById('lang-skills-counter');

    // Toggle Accordion
    langSkillsHeader.addEventListener('click', (e) => {
        if (e.target.closest('#add-lang-skill-btn') || e.target.closest('#lang-skills-dropdown')) return;
        langSkillsAccordion.classList.toggle('is-open');
    });

    // Toggle Dropdown
    addLangBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(langDropdown);
        langDropdown.classList.toggle('is-open');
        if (langDropdown.classList.contains('is-open')) {
            langSearch.value = "";
            renderLangList("");
            setTimeout(() => langSearch.focus(), 100);
        }
    });

    langSearch.addEventListener('input', (e) => {
        renderLangList(e.target.value);
    });

    const renderLangList = (query) => {
        const filtered = LANGUAGES_CATALOG.filter(lang => 
            lang.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            langList.innerHTML = `
                <div class="dropdown-empty-state">
                    <div class="dropdown-empty-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-slash">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                        </svg>
                    </div>
                    <div class="dropdown-empty-text">Результат поиска: значение не найдено</div>
                </div>
            `;
            return;
        }

        langList.innerHTML = filtered.map(lang => {
            const isSelected = selectedLanguages.some(l => l.name === lang);
            return `
                <div class="dropdown-item-skill ${isSelected ? 'selected' : ''}" data-value="${lang}">
                    <span>${lang}</span>
                    <i data-lucide="check" class="check-icon"></i>
                </div>
            `;
        }).join('');
        lucide.createIcons();

        langList.querySelectorAll('.dropdown-item-skill').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleLanguage(item.dataset.value);
            });
        });
    };

    const toggleLanguage = (name) => {
        const index = selectedLanguages.findIndex(l => l.name === name);
        if (index > -1) {
            selectedLanguages.splice(index, 1);
        } else {
            if (selectedLanguages.length >= 8) {
                showToast('Достигнуто максимальное количество выбранных значений (не более 8)!', true);
                return;
            }
            selectedLanguages.push({ name, level: null });

            // Auto-expand if closed
            if (!langSkillsAccordion.classList.contains('is-open')) {
                langSkillsAccordion.classList.add('is-open');
            }
        }
        
        updateLanguagesUI();
        renderLangList(langSearch.value);
        validateCompetenciesStage();
    };

    const updateLanguagesUI = () => {
        const count = selectedLanguages.length;
        langCounter.innerText = `${count} выбрано`;
        langCounter.className = count > 0 ? 'skills-counter valid' : 'skills-counter';

        // Reset Button state
        document.getElementById('reset-lang-skills-btn').style.display = count > 0 ? 'flex' : 'none';
        
        if (count === 0) {
            langEmpty.style.display = 'flex';
            langGrid.style.display = 'none';
        } else {
            langEmpty.style.display = 'none';
            langGrid.style.display = 'grid';
            renderLangGrid();
        }
    };

    // Individual Reset Languages
    document.getElementById('reset-lang-skills-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedLanguages = [];
        updateLanguagesUI();
        renderLangList("");
        validateCompetenciesStage();
    });

    const renderLangGrid = () => {
        langGrid.innerHTML = selectedLanguages.map(lang => `
            <div class="skill-card" data-name="${lang.name}">
                <div class="skill-card-header">
                    <h4 class="skill-card-title">${lang.name}</h4>
                    <button class="btn-delete-skill" title="Удалить">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="skill-scoring">
                    <div class="segmented-control-lang">
                        ${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => `
                            <button class="segment-btn-lang ${lang.level === lvl ? 'active' : ''}" data-level="${lvl}">${lvl}</button>
                        `).join('')}
                    </div>
                    <div class="level-signature">
                        ${lang.level ? `<span>${LANG_LEVEL_DESCRIPTIONS[lang.level]}</span>` : 'Выберите уровень'}
                    </div>
                </div>
            </div>
        `).join('');
        lucide.createIcons();

        langGrid.querySelectorAll('.skill-card').forEach(card => {
            const name = card.dataset.name;

            // Delete
            card.querySelector('.btn-delete-skill').addEventListener('click', () => {
                toggleLanguage(name);
            });

            // Scoring
            card.querySelectorAll('.segment-btn-lang').forEach(btn => {
                btn.addEventListener('click', () => {
                    const level = btn.dataset.level;
                    const lang = selectedLanguages.find(l => l.name === name);
                    lang.level = level;
                    updateLanguagesUI();
                    validateCompetenciesStage();
                });
            });
        });
    };

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!langDropdown.contains(e.target) && !addLangBtn.contains(e.target)) {
            langDropdown.classList.remove('is-open');
        }
    });

    langDropdown.querySelector('.dropdown-close').addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.remove('is-open');
    });

    // --- Software Knowledge Section Logic ---
    const TECH_CATALOG = [
        "Microsoft Excel", "Microsoft PowerPoint", "Microsoft Word", "Microsoft Outlook",
        "Jira", "Confluence", "SAP", "1C:Предприятие", "Trello", "Slack", "Zoom",
        "Adobe Photoshop", "Adobe Illustrator", "Figma", "AutoCAD", "ArchiCAD",
        "Bitrix24", "Visual Studio Code", "IntelliJ IDEA", "Postman", "Tableau", "Power BI"
    ].sort();

    let selectedTech = [];

    const softTechAccordion = document.getElementById('soft-tech-accordion');
    const softTechHeader = document.getElementById('soft-tech-header');
    const addTechBtn = document.getElementById('add-soft-tech-btn');
    const techDropdown = document.getElementById('soft-tech-dropdown');
    const techSearch = document.getElementById('soft-tech-search');
    const techList = document.getElementById('soft-tech-list');
    const techCreate = document.getElementById('soft-tech-create');
    const techCloud = document.getElementById('soft-tech-cloud');
    const techEmpty = document.getElementById('soft-tech-empty');
    const techCounter = document.getElementById('soft-tech-counter');

    // Toggle Accordion
    softTechHeader.addEventListener('click', (e) => {
        if (e.target.closest('#add-soft-tech-btn') || e.target.closest('#soft-tech-dropdown')) return;
        softTechAccordion.classList.toggle('is-open');
    });

    // Toggle Dropdown
    addTechBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(techDropdown);
        techDropdown.classList.toggle('is-open');
        if (techDropdown.classList.contains('is-open')) {
            techSearch.value = "";
            renderTechList("");
            setTimeout(() => techSearch.focus(), 100);
        }
    });

    techSearch.addEventListener('input', (e) => {
        renderTechList(e.target.value);
    });

    const renderTechList = (query) => {
        const filtered = TECH_CATALOG.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            techList.innerHTML = `
                <div class="dropdown-empty-state">
                    <div class="dropdown-empty-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-slash">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                        </svg>
                    </div>
                    <div class="dropdown-empty-text">Результат поиска: значение не найдено</div>
                </div>
            `;
            const exactMatch = TECH_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
            if (!exactMatch && query.trim() !== "") {
                techCreate.style.display = 'block';
            } else {
                techCreate.style.display = 'none';
            }
            return;
        }

        techList.innerHTML = filtered.map(item => {
            const isSelected = selectedTech.includes(item);
            return `
                <div class="dropdown-item-skill ${isSelected ? 'selected' : ''}" data-value="${item}">
                    <span>${item}</span>
                    <i data-lucide="check" class="check-icon"></i>
                </div>
            `;
        }).join('');
        lucide.createIcons();

        // Show Create button if no exact match and query not empty
        const exactMatch = TECH_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
        if (!exactMatch && query.trim() !== "") {
            techCreate.style.display = 'block';
        } else {
            techCreate.style.display = 'none';
        }

        techList.querySelectorAll('.dropdown-item-skill').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTech(item.dataset.value);
            });
        });
    };

    // Create New Tech
    techCreate.querySelector('.btn-create-skill').addEventListener('click', (e) => {
        e.stopPropagation();
        const newVal = techSearch.value.trim();
        if (newVal) {
            if (!TECH_CATALOG.some(item => item.toLowerCase() === newVal.toLowerCase())) {
                TECH_CATALOG.push(newVal);
                TECH_CATALOG.sort();
            }
            toggleTech(newVal);
            techSearch.value = "";
            renderTechList("");
        }
    });

    const toggleTech = (item) => {
        const index = selectedTech.indexOf(item);
        if (index > -1) {
            selectedTech.splice(index, 1);
        } else {
            if (selectedTech.length >= 8) {
                showToast('Достигнуто максимальное количество выбранных значений (не более 8)!', true);
                return;
            }
            selectedTech.push(item);

            // Auto-expand if closed
            if (!softTechAccordion.classList.contains('is-open')) {
                softTechAccordion.classList.add('is-open');
            }
        }
        
        updateTechUI();
        renderTechList(techSearch.value);
        validateCompetenciesStage();
    };

    const updateTechUI = () => {
        const count = selectedTech.length;
        techCounter.innerText = `${count} выбрано`;
        techCounter.className = count > 0 ? 'skills-counter valid' : 'skills-counter';

        // Reset Button state
        document.getElementById('reset-soft-tech-btn').style.display = count > 0 ? 'flex' : 'none';
        
        if (count === 0) {
            techEmpty.style.display = 'flex';
            techCloud.style.display = 'none';
        } else {
            techEmpty.style.display = 'none';
            techCloud.style.display = 'flex';
            renderTechCloud();
        }
    };

    // Individual Reset Software
    document.getElementById('reset-soft-tech-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedTech = [];
        updateTechUI();
        renderTechList("");
        validateCompetenciesStage();
    });

    const renderTechCloud = () => {
        techCloud.innerHTML = selectedTech.map(item => `
            <div class="skill-tag">
                <span>${item}</span>
                <button class="btn-remove-tag" data-value="${item}">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();

        techCloud.querySelectorAll('.btn-remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTech(btn.dataset.value);
            });
        });
    };

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!techDropdown.contains(e.target) && !addTechBtn.contains(e.target)) {
            techDropdown.classList.remove('is-open');
        }
    });

    techDropdown.querySelector('.dropdown-close').addEventListener('click', (e) => {
        e.stopPropagation();
        techDropdown.classList.remove('is-open');
    });

    // --- Certificates and Permits Section Logic ---
    const CERT_CATALOG = [
        "PMP (Project Management Professional)", "ACCA", "CFA", "CISA", 
        "Допуск по электробезопасности IV гр.", "Квалификационный аттестат аудитора",
        "Удостоверение по охране труда", "Пожарно-технический минимум",
        "ISO 9001 Lead Auditor", "Google Analytics Individual Qualification",
        "AWS Certified Solutions Architect", "Cisco CCNA", "Microsoft Certified: Azure Administrator"
    ].sort();

    let selectedCerts = [];

    const certSkillsAccordion = document.getElementById('cert-skills-accordion');
    const certSkillsHeader = document.getElementById('cert-skills-header');
    const addCertBtn = document.getElementById('add-cert-skill-btn');
    const certDropdown = document.getElementById('cert-skills-dropdown');
    const certSearch = document.getElementById('cert-skills-search');
    const certList = document.getElementById('cert-skills-list');
    const certCreate = document.getElementById('cert-skills-create');
    const certCloud = document.getElementById('cert-skills-cloud');
    const certEmpty = document.getElementById('cert-skills-empty');
    const certCounter = document.getElementById('cert-skills-counter');

    // Toggle Accordion
    certSkillsHeader.addEventListener('click', (e) => {
        if (e.target.closest('#add-cert-skill-btn') || e.target.closest('#cert-skills-dropdown')) return;
        certSkillsAccordion.classList.toggle('is-open');
    });

    // Toggle Dropdown
    addCertBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(certDropdown);
        certDropdown.classList.toggle('is-open');
        if (certDropdown.classList.contains('is-open')) {
            certSearch.value = "";
            renderCertList("");
            setTimeout(() => certSearch.focus(), 100);
        }
    });

    certSearch.addEventListener('input', (e) => {
        renderCertList(e.target.value);
    });

    const renderCertList = (query) => {
        const filtered = CERT_CATALOG.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            certList.innerHTML = `
                <div class="dropdown-empty-state">
                    <div class="dropdown-empty-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-slash">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                        </svg>
                    </div>
                    <div class="dropdown-empty-text">Результат поиска: значение не найдено</div>
                </div>
            `;
            const exactMatch = CERT_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
            if (!exactMatch && query.trim() !== "") {
                certCreate.style.display = 'block';
            } else {
                certCreate.style.display = 'none';
            }
            return;
        }

        certList.innerHTML = filtered.map(item => {
            const isSelected = selectedCerts.includes(item);
            return `
                <div class="dropdown-item-skill ${isSelected ? 'selected' : ''}" data-value="${item}">
                    <span>${item}</span>
                    <i data-lucide="check" class="check-icon"></i>
                </div>
            `;
        }).join('');
        lucide.createIcons();

        // Show Create button if no exact match and query not empty
        const exactMatch = CERT_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
        if (!exactMatch && query.trim() !== "") {
            certCreate.style.display = 'block';
        } else {
            certCreate.style.display = 'none';
        }

        certList.querySelectorAll('.dropdown-item-skill').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCert(item.dataset.value);
            });
        });
    };

    // Create New Cert
    certCreate.querySelector('.btn-create-skill').addEventListener('click', (e) => {
        e.stopPropagation();
        const newVal = certSearch.value.trim();
        if (newVal) {
            if (!CERT_CATALOG.some(item => item.toLowerCase() === newVal.toLowerCase())) {
                CERT_CATALOG.push(newVal);
                CERT_CATALOG.sort();
            }
            toggleCert(newVal);
            certSearch.value = "";
            renderCertList("");
        }
    });

    const toggleCert = (item) => {
        const index = selectedCerts.indexOf(item);
        if (index > -1) {
            selectedCerts.splice(index, 1);
        } else {
            if (selectedCerts.length >= 8) {
                showToast('Достигнуто максимальное количество выбранных значений (не более 8)!', true);
                return;
            }
            selectedCerts.push(item);

            // Auto-expand if closed
            if (!certSkillsAccordion.classList.contains('is-open')) {
                certSkillsAccordion.classList.add('is-open');
            }
        }
        
        updateCertUI();
        renderCertList(certSearch.value);
        validateCompetenciesStage();
    };

    const updateCertUI = () => {
        const count = selectedCerts.length;
        certCounter.innerText = `${count} выбрано`;
        certCounter.className = count > 0 ? 'skills-counter valid' : 'skills-counter';

        // Reset Button state
        document.getElementById('reset-cert-skills-btn').style.display = count > 0 ? 'flex' : 'none';
        
        if (count === 0) {
            certEmpty.style.display = 'flex';
            certCloud.style.display = 'none';
        } else {
            certEmpty.style.display = 'none';
            certCloud.style.display = 'flex';
            renderCertCloud();
        }
    };

    // Individual Reset Certificates
    document.getElementById('reset-cert-skills-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedCerts = [];
        updateCertUI();
        renderCertList("");
        validateCompetenciesStage();
    });

    const renderCertCloud = () => {
        certCloud.innerHTML = selectedCerts.map(item => `
            <div class="skill-tag">
                <span>${item}</span>
                <button class="btn-remove-tag" data-value="${item}">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();

        certCloud.querySelectorAll('.btn-remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCert(btn.dataset.value);
            });
        });
    };

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!certDropdown.contains(e.target) && !addCertBtn.contains(e.target)) {
            certDropdown.classList.remove('is-open');
        }
    });

    certDropdown.querySelector('.dropdown-close').addEventListener('click', (e) => {
        e.stopPropagation();
        certDropdown.classList.remove('is-open');
    });

    // --- Additional Work Permits Section Logic ---
    const PERMITS_CATALOG = [
        "Работа на высоте (I, II, III группы)", "Электробезопасность II гр.", 
        "Электробезопасность III гр.", "Электробезопасность IV гр.",
        "Допуск к работе с сосудами под давлением", "Допуск к верхолазным работам",
        "Работа с ГСМ (горюче-смазочными материалами)", "Работа в замкнутых пространствах",
        "Допуск к управлению спецтехникой", "Газосварочные работы",
        "Стропальные работы", "Работа с химически агрессивными средами"
    ].sort();

    let selectedPermits = [];

    const extraPermitsAccordion = document.getElementById('extra-permits-accordion');
    const extraPermitsHeader = document.getElementById('extra-permits-header');
    const addPermitBtn = document.getElementById('add-extra-permit-btn');
    const extraPermitsDropdown = document.getElementById('extra-permits-dropdown');
    const extraPermitsSearch = document.getElementById('extra-permits-search');
    const extraPermitsList = document.getElementById('extra-permits-list');
    const extraPermitsCreate = document.getElementById('extra-permits-create');
    const extraPermitsCloud = document.getElementById('extra-permits-cloud');
    const extraPermitsEmpty = document.getElementById('extra-permits-empty');
    const extraPermitsCounter = document.getElementById('extra-permits-counter');

    // Toggle Accordion
    extraPermitsHeader.addEventListener('click', (e) => {
        if (e.target.closest('#add-extra-permit-btn') || e.target.closest('#extra-permits-dropdown')) return;
        extraPermitsAccordion.classList.toggle('is-open');
    });

    // Toggle Dropdown
    addPermitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(extraPermitsDropdown);
        extraPermitsDropdown.classList.toggle('is-open');
        if (extraPermitsDropdown.classList.contains('is-open')) {
            extraPermitsSearch.value = "";
            renderPermitList("");
            setTimeout(() => extraPermitsSearch.focus(), 100);
        }
    });

    extraPermitsSearch.addEventListener('input', (e) => {
        renderPermitList(e.target.value);
    });

    const renderPermitList = (query) => {
        const filtered = PERMITS_CATALOG.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            extraPermitsList.innerHTML = `
                <div class="dropdown-empty-state">
                    <div class="dropdown-empty-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-slash">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                        </svg>
                    </div>
                    <div class="dropdown-empty-text">Результат поиска: значение не найдено</div>
                </div>
            `;
            const exactMatch = PERMITS_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
            if (!exactMatch && query.trim() !== "") {
                extraPermitsCreate.style.display = 'block';
            } else {
                extraPermitsCreate.style.display = 'none';
            }
            return;
        }

        extraPermitsList.innerHTML = filtered.map(item => {
            const isSelected = selectedPermits.includes(item);
            return `
                <div class="dropdown-item-skill ${isSelected ? 'selected' : ''}" data-value="${item}">
                    <span>${item}</span>
                    <i data-lucide="check" class="check-icon"></i>
                </div>
            `;
        }).join('');
        lucide.createIcons();

        // Show Create button if no exact match and query not empty
        const exactMatch = PERMITS_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
        if (!exactMatch && query.trim() !== "") {
            extraPermitsCreate.style.display = 'block';
        } else {
            extraPermitsCreate.style.display = 'none';
        }

        extraPermitsList.querySelectorAll('.dropdown-item-skill').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePermit(item.dataset.value);
            });
        });
    };

    // Create New Permit
    extraPermitsCreate.querySelector('.btn-create-skill').addEventListener('click', (e) => {
        e.stopPropagation();
        const newVal = extraPermitsSearch.value.trim();
        if (newVal) {
            if (!PERMITS_CATALOG.some(item => item.toLowerCase() === newVal.toLowerCase())) {
                PERMITS_CATALOG.push(newVal);
                PERMITS_CATALOG.sort();
            }
            togglePermit(newVal);
            extraPermitsSearch.value = "";
            renderPermitList("");
        }
    });

    const togglePermit = (item) => {
        const index = selectedPermits.indexOf(item);
        if (index > -1) {
            selectedPermits.splice(index, 1);
        } else {
            if (selectedPermits.length >= 8) {
                showToast('Достигнуто максимальное количество выбранных значений (не более 8)!', true);
                return;
            }
            selectedPermits.push(item);

            // Auto-expand if closed
            if (!extraPermitsAccordion.classList.contains('is-open')) {
                extraPermitsAccordion.classList.add('is-open');
            }
        }
        
        updatePermitUI();
        renderPermitList(extraPermitsSearch.value);
        validateCompetenciesStage();
    };

    const updatePermitUI = () => {
        const count = selectedPermits.length;
        extraPermitsCounter.innerText = `${count} выбрано`;
        extraPermitsCounter.className = count > 0 ? 'skills-counter valid' : 'skills-counter';

        // Reset Button state
        document.getElementById('reset-extra-permits-btn').style.display = count > 0 ? 'flex' : 'none';
        
        if (count === 0) {
            extraPermitsEmpty.style.display = 'flex';
            extraPermitsCloud.style.display = 'none';
        } else {
            extraPermitsEmpty.style.display = 'none';
            extraPermitsCloud.style.display = 'flex';
            renderPermitCloud();
        }
    };

    // Individual Reset Extra Permits
    document.getElementById('reset-extra-permits-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedPermits = [];
        updatePermitUI();
        renderPermitList("");
        validateCompetenciesStage();
    });

    const renderPermitCloud = () => {
        extraPermitsCloud.innerHTML = selectedPermits.map(item => `
            <div class="skill-tag">
                <span>${item}</span>
                <button class="btn-remove-tag" data-value="${item}">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();

        extraPermitsCloud.querySelectorAll('.btn-remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePermit(btn.dataset.value);
            });
        });
    };

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!extraPermitsDropdown.contains(e.target) && !addPermitBtn.contains(e.target)) {
            extraPermitsDropdown.classList.remove('is-open');
        }
    });

    extraPermitsDropdown.querySelector('.dropdown-close').addEventListener('click', (e) => {
        e.stopPropagation();
        extraPermitsDropdown.classList.remove('is-open');
    });

    // --- Education Section Logic ---
    const EDU_CATALOG = [
        "Высшее образование", "Бакалавриат", "Магистратура", "Среднее образование",
        "Средне-специальное", "Дополнительное бизнес-образование (MBA и EMBA)",
        "Аспирантура", "Специалист"
    ];

    let selectedEdu = [];

    const eduSkillsAccordion = document.getElementById('edu-skills-accordion');
    const eduSkillsHeader = document.getElementById('edu-skills-header');
    const addEduBtn = document.getElementById('add-edu-skill-btn');
    const eduDropdown = document.getElementById('edu-skills-dropdown');
    const eduSearch = document.getElementById('edu-skills-search');
    const eduList = document.getElementById('edu-skills-list');
    const eduCreate = document.getElementById('edu-skills-create');
    const newEduText = document.getElementById('new-edu-text');
    const eduCloud = document.getElementById('edu-skills-cloud');
    const eduEmpty = document.getElementById('edu-skills-empty');
    const eduCounter = document.getElementById('edu-skills-counter');

    // Toggle Accordion
    eduSkillsHeader.addEventListener('click', (e) => {
        if (e.target.closest('#add-edu-skill-btn') || e.target.closest('#edu-skills-dropdown')) return;
        eduSkillsAccordion.classList.toggle('is-open');
    });

    // Toggle Dropdown
    addEduBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(eduDropdown);
        eduDropdown.classList.toggle('is-open');
        if (eduDropdown.classList.contains('is-open')) {
            eduSearch.value = "";
            renderEduList("");
            setTimeout(() => eduSearch.focus(), 100);
        }
    });

    eduSearch.addEventListener('input', (e) => {
        renderEduList(e.target.value);
    });

    const renderEduList = (query) => {
        const filtered = EDU_CATALOG.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            eduList.innerHTML = `
                <div class="dropdown-empty-state">
                    <div class="dropdown-empty-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-slash">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                        </svg>
                    </div>
                    <div class="dropdown-empty-text">Результат поиска: значение не найдено</div>
                </div>
            `;
            return;
        }

        eduList.innerHTML = filtered.map(item => {
            const isSelected = selectedEdu.some(e => e.name === item);
            return `
                <div class="dropdown-item-skill ${isSelected ? 'selected' : ''}" data-value="${item}">
                    <span>${item}</span>
                    <i data-lucide="check" class="check-icon"></i>
                </div>
            `;
        }).join('');
        lucide.createIcons();

        eduList.querySelectorAll('.dropdown-item-skill').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleEdu(item.dataset.value);
            });
        });
    };

    const toggleEdu = (item) => {
        const index = selectedEdu.findIndex(e => e.name === item);
        if (index > -1) {
            selectedEdu = [];
        } else {
            selectedEdu = [{ name: item, directions: [] }];

            // Auto-expand if closed
            if (!eduSkillsAccordion.classList.contains('is-open')) {
                eduSkillsAccordion.classList.add('is-open');
            }

            // Close dropdown since it is a single choice
            eduDropdown.classList.remove('is-open');
        }
        
        updateEduUI();
        renderEduList(eduSearch.value);
        validateCompetenciesStage();
    };

    const updateEduUI = () => {
        const count = selectedEdu.length;
        eduCounter.innerText = `${count} выбрано`;
        eduCounter.className = count > 0 ? 'skills-counter valid' : 'skills-counter';

        // Reset Button state
        document.getElementById('reset-edu-skills-btn').style.display = count > 0 ? 'flex' : 'none';
        
        if (count === 0) {
            eduEmpty.style.display = 'flex';
            eduCloud.style.display = 'none';
        } else {
            eduEmpty.style.display = 'none';
            eduCloud.style.display = 'flex';
            renderEduCloud();
        }
    };

    // Individual Reset Education
    document.getElementById('reset-edu-skills-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedEdu = [];
        updateEduUI();
        renderEduList("");
        validateCompetenciesStage();
    });

    const renderDirectionList = (query, item, container, card) => {
        const EDU_DIRECTIONS = [
            "Информационные технологии", "Экономика и финансы", "Менеджмент и управление",
            "Юриспруденция", "Маркетинг и реклама", "Строительство и архитектура (ПГС)",
            "Управление персоналом (HR)", "Логистика и закупки", "Дизайн и проектирование"
        ].sort();

        const filtered = EDU_DIRECTIONS.filter(dir => 
            dir.toLowerCase().includes(query.toLowerCase())
        );

        container.innerHTML = filtered.map(dir => {
            const isSelected = item.directions.includes(dir);
            return `
                <div class="dropdown-item-skill ${isSelected ? 'selected' : ''}" data-value="${dir}">
                    <span>${dir}</span>
                    <i data-lucide="check" class="check-icon"></i>
                </div>
            `;
        }).join('');
        lucide.createIcons();

        container.querySelectorAll('.dropdown-item-skill').forEach(row => {
            row.addEventListener('click', (e) => {
                e.stopPropagation();
                const dir = row.dataset.value;
                const dirIndex = item.directions.indexOf(dir);
                if (dirIndex > -1) {
                    item.directions.splice(dirIndex, 1);
                } else {
                    item.directions.push(dir);
                }
                
                // Update tags and active dropdown state in-place without closing the dropdown!
                updateCardDirections(card, item, query, container);
                validateCompetenciesStage();
            });
        });
    };

    const updateCardDirections = (card, item, query, listContainer) => {
        // Update visibility of reset card button
        const resetBtn = card.querySelector('.btn-reset-card');
        if (resetBtn) {
            resetBtn.style.display = item.directions.length > 0 ? 'flex' : 'none';
        }

        // 1. Render tags
        const tagsContainer = card.querySelector('.edu-directions-tags');
        if (item.directions.length === 0) {
            tagsContainer.innerHTML = `<div class="edu-placeholder-text">Направления не указаны</div>`;
        } else {
            tagsContainer.innerHTML = item.directions.map(dir => `
                <div class="skill-tag">
                    <span>${dir}</span>
                    <button class="btn-remove-tag" data-value="${dir}">
                        <i data-lucide="x"></i>
                    </button>
                </div>
            `).join('');
            lucide.createIcons();
        }

        // Attach listeners for remove buttons
        tagsContainer.querySelectorAll('.btn-remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dir = btn.dataset.value;
                const dirIndex = item.directions.indexOf(dir);
                if (dirIndex > -1) {
                    item.directions.splice(dirIndex, 1);
                    // Update both tags and active dropdown items
                    updateCardDirections(card, item, query, listContainer);
                    validateCompetenciesStage();
                }
            });
        });

        // 2. Render dropdown list if open/rendered
        if (listContainer) {
            renderDirectionList(query, item, listContainer, card);
        }
    };

    const renderEduCloud = () => {
        eduCloud.innerHTML = selectedEdu.map(item => `
            <div class="skill-card edu-card" data-name="${item.name}">
                <div class="skill-card-header">
                    <h4 class="skill-card-title">${item.name}</h4>
                    <div class="edu-header-actions">
                        <button class="btn-reset-card btn-reset-accordion" title="Сбросить направления" style="${item.directions.length > 0 ? 'display: flex;' : 'display: none;'}">
                            <i data-lucide="rotate-ccw"></i>
                        </button>
                        <button class="btn-add-direction">
                            <i data-lucide="plus"></i>Добавить направление
                        </button>
                        <button class="btn-delete-skill btn-delete-edu" title="Удалить уровень">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Direction Dropdown -->
                <div class="direction-dropdown smart-dropdown" style="display: none;">
                    <div class="dropdown-header">
                        <div class="search-box">
                            <i data-lucide="search"></i>
                            <input type="text" class="direction-search-input" placeholder="Поиск направления...">
                        </div>
                        <button class="direction-dropdown-close"><i data-lucide="x"></i></button>
                    </div>
                    <div class="dropdown-list direction-list-container">
                        <!-- Injected by renderDirectionList -->
                    </div>
                </div>

                <!-- Selected Directions Tags -->
                <div class="edu-directions-tags">
                    ${item.directions.length === 0 ? `
                        <div class="edu-placeholder-text">Направления не указаны</div>
                    ` : item.directions.map(dir => `
                        <div class="skill-tag">
                            <span>${dir}</span>
                            <button class="btn-remove-tag" data-value="${dir}">
                                <i data-lucide="x"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        lucide.createIcons();

        // Attach listeners for each edu-card
        eduCloud.querySelectorAll('.edu-card').forEach(card => {
            const name = card.dataset.name;
            const item = selectedEdu.find(e => e.name === name);
            const addDirBtn = card.querySelector('.btn-add-direction');
            const deleteEduBtn = card.querySelector('.btn-delete-edu');
            const resetCardBtn = card.querySelector('.btn-reset-card');
            const dropdown = card.querySelector('.direction-dropdown');
            const searchInput = card.querySelector('.direction-search-input');
            const listContainer = card.querySelector('.direction-list-container');
            const dropdownClose = card.querySelector('.direction-dropdown-close');

            // Reset Card Directions
            if (resetCardBtn) {
                resetCardBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.directions = [];
                    updateCardDirections(card, item, searchInput.value, listContainer);
                    validateCompetenciesStage();
                });
            }

            // Delete level
            deleteEduBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleEdu(name);
            });

            // Toggle dropdown
            addDirBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close all other dropdowns in the whole side-drawer!
                closeAllDropdowns(dropdown);

                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                if (dropdown.style.display === 'block') {
                    searchInput.value = '';
                    renderDirectionList('', item, listContainer, card);
                    setTimeout(() => searchInput.focus(), 100);
                }
            });

            // Close dropdown
            dropdownClose.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.style.display = 'none';
            });

            // Search input
            searchInput.addEventListener('click', (e) => e.stopPropagation());
            searchInput.addEventListener('input', (e) => {
                renderDirectionList(e.target.value, item, listContainer, card);
            });

            // Remove direction tag
            card.querySelectorAll('.btn-remove-tag').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const dir = btn.dataset.value;
                    const dirIndex = item.directions.indexOf(dir);
                    if (dirIndex > -1) {
                        item.directions.splice(dirIndex, 1);
                        updateCardDirections(card, item, searchInput.value, listContainer);
                        validateCompetenciesStage();
                    }
                });
            });
        });
    };

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!eduDropdown.contains(e.target) && !addEduBtn.contains(e.target)) {
            eduDropdown.classList.remove('is-open');
        }
        // Close direction dropdowns if clicked outside
        document.querySelectorAll('.direction-dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target) && !e.target.closest('.btn-add-direction')) {
                dropdown.style.display = 'none';
            }
        });
    });

    eduDropdown.querySelector('.dropdown-close').addEventListener('click', (e) => {
        e.stopPropagation();
        eduDropdown.classList.remove('is-open');
    });

    // --- Experience Section Logic ---
    const EXP_TYPES = [
        { id: 'total', name: 'Общий стаж работы' },
        { id: 'mgmt', name: 'Опыт на руководящих должностях' }
    ];

    let selectedExp = [];

    const expSkillsAccordion = document.getElementById('exp-skills-accordion');
    const expSkillsHeader = document.getElementById('exp-skills-header');
    const addExpBtn = document.getElementById('add-exp-skill-btn');
    const expGrid = document.getElementById('exp-skills-grid');
    const expEmpty = document.getElementById('exp-skills-empty');
    const expCounter = document.getElementById('exp-skills-counter');

    // Toggle Accordion
    expSkillsHeader.addEventListener('click', (e) => {
        if (e.target.closest('#add-exp-skill-btn')) return;
        expSkillsAccordion.classList.toggle('is-open');
    });

    // Directly specify total experience
    addExpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const totalExist = selectedExp.some(exp => exp.id === 'total');
        if (!totalExist) {
            const type = EXP_TYPES.find(t => t.id === 'total');
            selectedExp.push({ id: type.id, name: type.name, years: '1-3 года', mandatory: true });

            // Auto-expand if closed
            if (!expSkillsAccordion.classList.contains('is-open')) {
                expSkillsAccordion.classList.add('is-open');
            }

            updateExpUI();
            validateCompetenciesStage();
        }
    });

    const toggleExperience = (id) => {
        const index = selectedExp.findIndex(e => e.id === id);
        if (index > -1) {
            selectedExp.splice(index, 1);
            if (id === 'total') {
                // If we remove total, we must also remove mgmt!
                const mgmtIndex = selectedExp.findIndex(e => e.id === 'mgmt');
                if (mgmtIndex > -1) {
                    selectedExp.splice(mgmtIndex, 1);
                }
            }
        } else {
            const type = EXP_TYPES.find(t => t.id === id);
            selectedExp.push({ id: type.id, name: type.name, years: '1-3 года', mandatory: true });

            // Auto-expand if closed
            if (!expSkillsAccordion.classList.contains('is-open')) {
                expSkillsAccordion.classList.add('is-open');
            }
        }
        
        updateExpUI();
        validateCompetenciesStage();
    };

    const updateExpUI = () => {
        const totalExp = selectedExp.find(e => e.id === 'total');

        // Hide Specify button if totalExp is present
        if (totalExp) {
            addExpBtn.style.display = 'none';
        } else {
            addExpBtn.style.display = 'inline-flex';
        }

        // Reset Button state
        document.getElementById('reset-exp-skills-btn').style.display = selectedExp.length > 0 ? 'flex' : 'none';
        if (totalExp && totalExp.years !== 'Нет опыта') {
            expCounter.innerText = `Общий: ${totalExp.years}`;
        } else if (totalExp) {
            expCounter.innerText = `Общий: ${totalExp.years}`;
        } else {
            expCounter.innerText = selectedExp.length > 0 ? `${selectedExp.length} типа` : 'Не указан';
        }
        
        // Tag valid styling
        if (selectedExp.length > 0) {
            expCounter.classList.add('valid');
        } else {
            expCounter.classList.remove('valid');
        }
        
        if (selectedExp.length === 0) {
            expEmpty.style.display = 'flex';
            expGrid.style.display = 'none';
        } else {
            expEmpty.style.display = 'none';
            expGrid.style.display = 'grid';
            renderExpGrid();
        }
    };

    // Individual Reset Experience
    document.getElementById('reset-exp-skills-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedExp = [];
        updateExpUI();
        validateCompetenciesStage();
    });

    const renderExpGrid = () => {
        const values = ['Нет опыта', '1-3 года', '3-6 лет', 'более 6 лет'];
        expGrid.innerHTML = selectedExp.map(exp => `
            <div class="skill-card" data-id="${exp.id}">
                <div class="skill-card-header">
                    <h4 class="skill-card-title">${exp.name}</h4>
                    <div class="skill-card-actions" style="display: flex; align-items: center;">
                        ${exp.id === 'total' && !selectedExp.some(e => e.id === 'mgmt') ? `
                            <button class="btn-add-mgmt-experience" type="button" title="Добавить опыт на руководящих должностях">
                                <i data-lucide="plus"></i>
                                <span>На руководящих должностях</span>
                            </button>
                        ` : ''}
                        <button class="btn-delete-skill" title="Удалить">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <div class="segmented-control-exp">
                    ${values.map(val => `
                        <button class="segment-btn-exp ${exp.years === val ? 'active' : ''}" data-value="${val}">${val}</button>
                    `).join('')}
                </div>
            </div>
        `).join('');
        lucide.createIcons();

        expGrid.querySelectorAll('.skill-card').forEach(card => {
            const id = card.dataset.id;
            const exp = selectedExp.find(e => e.id === id);

            // Add Management Click
            const addMgmtBtn = card.querySelector('.btn-add-mgmt-experience');
            if (addMgmtBtn) {
                addMgmtBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleExperience('mgmt');
                });
            }

            // Delete
            card.querySelector('.btn-delete-skill').addEventListener('click', () => {
                toggleExperience(id);
            });

            // Segment control buttons
            card.querySelectorAll('.segment-btn-exp').forEach(btn => {
                btn.addEventListener('click', () => {
                    const newVal = btn.dataset.value;
                    if (id === 'mgmt') {
                        const total = selectedExp.find(e => e.id === 'total');
                        const values = ['Нет опыта', '1-3 года', '3-6 лет', 'более 6 лет'];
                        if (total) {
                            const totalIndex = values.indexOf(total.years);
                            const mgmtIndex = values.indexOf(newVal);
                            if (mgmtIndex > totalIndex) {
                                showToast('Руководящий стаж не может превышать общий!', true);
                                    return;
                            }
                        }
                    }
                    if (id === 'total') {
                        const mgmt = selectedExp.find(e => e.id === 'mgmt');
                        const values = ['Нет опыта', '1-3 года', '3-6 лет', 'более 6 лет'];
                        if (mgmt) {
                            const totalIndex = values.indexOf(newVal);
                            const mgmtIndex = values.indexOf(mgmt.years);
                            if (totalIndex < mgmtIndex) {
                                showToast('Общий стаж не может быть меньше руководящего!', true);
                                return;
                            }
                        }
                    }
                    exp.years = newVal;
                    updateExpUI();
                    validateCompetenciesStage();
                });
            });
        });
    };

    // --- Functional Area Section Logic ---
    const FUNC_AREAS_CATALOG = [
        "Информационные технологии (IT)", "Строительство и девелопмент", "Маркетинг и PR",
        "Продажи и развитие бизнеса", "Управление проектами (PMO)", "Финансы и аудит",
        "Юридическое сопровождение", "Управление персоналом (HR)", "Логистика и снабжение",
        "Административное управление", "Безопасность", "Эксплуатация и сервис"
    ].sort();

    let selectedFuncAreas = [];

    const extractCompetenciesState = () => {
        const competencies = {
            softSkills: selectedSoftSkills.map(skill => ({ ...skill })),
            hardSkills: [...selectedHardSkills],
            languages: selectedLanguages.map(language => ({ ...language })),
            technologies: [...selectedTech],
            certificates: [...selectedCerts],
            permits: [...selectedPermits],
            education: selectedEdu.map(education => ({ ...education, directions: [...(education.directions || [])] })),
            experience: selectedExp.map(experience => ({ ...experience })),
            functionalAreas: [...selectedFuncAreas]
        };

        return profileModel ? profileModel.normalizeCompetencies(competencies, {}, { useDefaults: false }) : competencies;
    };

    window.HRProfileApp = window.HRProfileApp || {};
    window.HRProfileApp.profileCreateStageContext = {
        ...(window.HRProfileApp.profileCreateStageContext || {}),
        getCompetenciesState: extractCompetenciesState
    };

    const funcAreaAccordion = document.getElementById('func-area-accordion');
    const funcAreaHeader = document.getElementById('func-area-header');
    const addFuncBtn = document.getElementById('add-func-area-btn');
    const funcDropdown = document.getElementById('func-area-dropdown');
    const funcSearch = document.getElementById('func-area-search');
    const funcList = document.getElementById('func-area-list');
    const funcCreate = document.getElementById('func-area-create');
    const funcCloud = document.getElementById('func-area-cloud');
    const funcEmpty = document.getElementById('func-area-empty');
    const funcCounter = document.getElementById('func-area-counter');

    // Toggle Accordion
    funcAreaHeader.addEventListener('click', (e) => {
        if (e.target.closest('#add-func-area-btn') || e.target.closest('#func-area-dropdown')) return;
        funcAreaAccordion.classList.toggle('is-open');
    });

    // Toggle Dropdown
    addFuncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(funcDropdown);
        funcDropdown.classList.toggle('is-open');
        if (funcDropdown.classList.contains('is-open')) {
            funcSearch.value = "";
            renderFuncList("");
            setTimeout(() => funcSearch.focus(), 100);
        }
    });

    funcSearch.addEventListener('input', (e) => {
        renderFuncList(e.target.value);
    });

    const renderFuncList = (query) => {
        const filtered = FUNC_AREAS_CATALOG.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            funcList.innerHTML = `
                <div class="dropdown-empty-state">
                    <div class="dropdown-empty-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-slash">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                        </svg>
                    </div>
                    <div class="dropdown-empty-text">Результат поиска: значение не найдено</div>
                </div>
            `;
            const exactMatch = FUNC_AREAS_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
            if (!exactMatch && query.trim() !== "") {
                funcCreate.style.display = 'block';
            } else {
                funcCreate.style.display = 'none';
            }
            return;
        }

        funcList.innerHTML = filtered.map(item => {
            const isSelected = selectedFuncAreas.includes(item);
            return `
                <div class="dropdown-item-skill ${isSelected ? 'selected' : ''}" data-value="${item}">
                    <span>${item}</span>
                    <i data-lucide="check" class="check-icon"></i>
                </div>
            `;
        }).join('');
        lucide.createIcons();

        // Show Create button if no match and query not empty
        const exactMatch = FUNC_AREAS_CATALOG.some(item => item.toLowerCase() === query.trim().toLowerCase());
        if (!exactMatch && query.trim() !== "") {
            funcCreate.style.display = 'block';
        } else {
            funcCreate.style.display = 'none';
        }

        funcList.querySelectorAll('.dropdown-item-skill').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFuncArea(item.dataset.value);
            });
        });
    };

    // Create New Func Area
    funcCreate.querySelector('.btn-create-skill').addEventListener('click', (e) => {
        e.stopPropagation();
        const newVal = funcSearch.value.trim();
        if (newVal) {
            if (!FUNC_AREAS_CATALOG.includes(newVal)) {
                FUNC_AREAS_CATALOG.push(newVal);
                FUNC_AREAS_CATALOG.sort();
            }
            toggleFuncArea(newVal);
            funcSearch.value = "";
            renderFuncList("");
        }
    });

    const toggleFuncArea = (item) => {
        const index = selectedFuncAreas.indexOf(item);
        if (index > -1) {
            selectedFuncAreas.splice(index, 1);
        } else {
            if (selectedFuncAreas.length >= 8) {
                showToast('Достигнуто максимальное количество выбранных значений (не более 8)!', true);
                return;
            }
            selectedFuncAreas.push(item);

            // Auto-expand if closed
            if (!funcAreaAccordion.classList.contains('is-open')) {
                funcAreaAccordion.classList.add('is-open');
            }
        }
        
        updateFuncAreaUI();
        renderFuncList(funcSearch.value);
        validateCompetenciesStage();
    };

    const updateFuncAreaUI = () => {
        const count = selectedFuncAreas.length;
        funcCounter.innerText = `${count} выбрано`;
        funcCounter.className = count > 0 ? 'skills-counter valid' : 'skills-counter';

        // Reset Button state
        document.getElementById('reset-func-area-btn').style.display = count > 0 ? 'flex' : 'none';
        
        if (count === 0) {
            funcEmpty.style.display = 'flex';
            funcCloud.style.display = 'none';
        } else {
            funcEmpty.style.display = 'none';
            funcCloud.style.display = 'flex';
            renderFuncCloud();
        }
    };

    // Individual Reset Functional Area
    document.getElementById('reset-func-area-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFuncAreas = [];
        updateFuncAreaUI();
        renderFuncList("");
        validateCompetenciesStage();
    });

    const renderFuncCloud = () => {
        funcCloud.innerHTML = selectedFuncAreas.map((item, index) => `
            <div class="skill-tag">
                <span>${item}</span>
                <button class="btn-remove-tag" data-value="${item}">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();

        funcCloud.querySelectorAll('.btn-remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFuncArea(btn.dataset.value);
            });
        });
    };

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!funcDropdown.contains(e.target) && !addFuncBtn.contains(e.target)) {
            funcDropdown.classList.remove('is-open');
        }
    });

    funcDropdown.querySelector('.dropdown-close').addEventListener('click', (e) => {
        e.stopPropagation();
        funcDropdown.classList.remove('is-open');
    });

    const applyCompetenciesState = (competencies = null, options = {}) => {
        const shouldUseDefaults = options.useDefaults === true;
        const normalized = profileModel
            ? profileModel.normalizeCompetencies(
                competencies || profileModel.createEmptyCompetencies(),
                {},
                { useDefaults: shouldUseDefaults }
            )
            : (competencies || {});

        selectedSoftSkills = (normalized.softSkills || []).map(skill => ({ ...skill }));
        selectedHardSkills = [...(normalized.hardSkills || [])];
        selectedLanguages = (normalized.languages || []).map(language => ({ ...language }));
        selectedTech = [...(normalized.technologies || [])];
        selectedCerts = [...(normalized.certificates || [])];
        selectedPermits = [...(normalized.permits || [])];
        selectedEdu = (normalized.education || []).map(education => ({
            ...education,
            directions: [...(education.directions || [])]
        }));
        selectedExp = (normalized.experience || []).map(experience => ({ ...experience }));
        selectedFuncAreas = [...(normalized.functionalAreas || [])];

        updateSkillsUI();
        updateHardSkillsUI();
        updateLanguagesUI();
        updateTechUI();
        updateCertUI();
        updatePermitUI();
        updateEduUI();
        updateExpUI();
        updateFuncAreaUI();
        validateCompetenciesStage();
    };

    const findSoftSkillByName = (name) => (
        SOFT_SKILLS_CATALOG.find(skill => skill.name.toLowerCase() === String(name || '').toLowerCase())
    );

    const ensureSoftSkillByName = (name, score = 3) => {
        let skill = findSoftSkillByName(name);
        if (!skill && name) {
            skill = {
                id: Date.now(),
                name,
                desc: 'Компетенция, предложенная AI-помощником',
                isCustom: true
            };
            SOFT_SKILLS_CATALOG.unshift(skill);
            customSoftSkills.add(skill.id);
        }
        if (!skill || selectedSoftSkills.some(item => item.name === skill.name)) return false;
        if (selectedSoftSkills.length >= MAX_SKILLS) return false;

        selectedSoftSkills.push({ ...skill, score });
        softSkillsAccordion.classList.add('is-open');
        updateSkillsUI();
        renderDropdownList('');
        validateCompetenciesStage();
        return true;
    };

    const removeSoftSkillByName = (name) => {
        const index = selectedSoftSkills.findIndex(skill => skill.name === name);
        if (index < 0) return false;
        selectedSoftSkills.splice(index, 1);
        updateSkillsUI();
        renderDropdownList('');
        validateCompetenciesStage();
        return true;
    };

    const ensureListValue = (list, value, limit = 8) => {
        if (!value || list.includes(value) || list.length >= limit) return false;
        list.push(value);
        return true;
    };

    const removeListValue = (list, value) => {
        const index = list.indexOf(value);
        if (index < 0) return false;
        list.splice(index, 1);
        return true;
    };

    const applyCompetencyRecommendationAction = (action = {}) => {
        let changed = false;
        const section = action.section;
        const mode = action.mode || 'add';
        const value = action.value || action.addValue;
        const removeValue = action.removeValue;
        const nextValue = action.addValue || action.value;

        if (section === 'softSkills') {
            if ((mode === 'remove' || mode === 'replace') && removeValue) {
                changed = removeSoftSkillByName(removeValue) || changed;
            }
            if ((mode === 'add' || mode === 'replace') && nextValue) {
                changed = ensureSoftSkillByName(nextValue, action.score || 3) || changed;
            }
        }

        if (section === 'hardSkills') {
            if ((mode === 'remove' || mode === 'replace') && removeValue) {
                changed = removeListValue(selectedHardSkills, removeValue) || changed;
            }
            if ((mode === 'add' || mode === 'replace') && nextValue) {
                if (!HARD_SKILLS_CATALOG.includes(nextValue)) {
                    HARD_SKILLS_CATALOG.push(nextValue);
                    HARD_SKILLS_CATALOG.sort();
                    customHardSkills.add(nextValue);
                }
                changed = ensureListValue(selectedHardSkills, nextValue) || changed;
            }
            if (changed) {
                hardSkillsAccordion.classList.add('is-open');
                updateHardSkillsUI();
                renderHardSkillsList('');
                validateCompetenciesStage();
            }
        }

        if (section === 'technologies') {
            if ((mode === 'remove' || mode === 'replace') && removeValue) {
                changed = removeListValue(selectedTech, removeValue) || changed;
            }
            if ((mode === 'add' || mode === 'replace') && nextValue) {
                if (!TECH_CATALOG.includes(nextValue)) {
                    TECH_CATALOG.push(nextValue);
                    TECH_CATALOG.sort();
                }
                changed = ensureListValue(selectedTech, nextValue) || changed;
            }
            if (changed) {
                softTechAccordion.classList.add('is-open');
                updateTechUI();
                renderTechList('');
                validateCompetenciesStage();
            }
        }

        if (section === 'languages') {
            const languageName = action.language || value;
            const level = Object.prototype.hasOwnProperty.call(action, 'level') ? action.level : (action.addValue || 'B1');
            const language = selectedLanguages.find(item => item.name === languageName);

            if (mode === 'remove' && language) {
                selectedLanguages = selectedLanguages.filter(item => item.name !== languageName);
                changed = true;
            } else if (language) {
                language.level = level;
                changed = true;
            } else if (languageName) {
                selectedLanguages.push({ name: languageName, level });
                changed = true;
            }
            if (changed) {
                langSkillsAccordion.classList.add('is-open');
                updateLanguagesUI();
                renderLangList('');
                validateCompetenciesStage();
            }
        }

        if (section === 'functionalAreas') {
            if ((mode === 'remove' || mode === 'replace') && removeValue) {
                changed = removeListValue(selectedFuncAreas, removeValue) || changed;
            }
            if ((mode === 'add' || mode === 'replace') && nextValue) {
                if (!FUNC_AREAS_CATALOG.includes(nextValue)) {
                    FUNC_AREAS_CATALOG.push(nextValue);
                    FUNC_AREAS_CATALOG.sort();
                }
                changed = ensureListValue(selectedFuncAreas, nextValue) || changed;
            }
            if (changed) {
                funcAreaAccordion.classList.add('is-open');
                updateFuncAreaUI();
                renderFuncList('');
                validateCompetenciesStage();
            }
        }

        return changed;
    };

    window.HRProfileApp = window.HRProfileApp || {};
    window.HRProfileApp.profileCreateStageContext = {
        ...(window.HRProfileApp.profileCreateStageContext || {}),
        applyCompetencyRecommendationAction
    };

    const getSoftSkillDraft = (id, score = 3) => {
        const skill = SOFT_SKILLS_CATALOG.find(item => item.id === id);
        return skill ? { ...skill, score } : null;
    };

    const getTextFromSelect = (select) => {
        if (!select) return '';
        const selectedOption = select.options && select.selectedIndex >= 0
            ? select.options[select.selectedIndex]
            : null;
        if (!selectedOption || !selectedOption.value) return '';
        return selectedOption.textContent.trim();
    };

    const getCompetencyGenerationContext = (promptText = '') => {
        const fields = getParamFields();
        const position = getTextFromSelect(fields.position);
        const structureValue = document.getElementById('param-structure-value');
        const structure = structureValue && !structureValue.classList.contains('is-placeholder')
            ? structureValue.textContent.trim()
            : getTextFromSelect(fields.structure);
        const goals = extractGoalsFromDOM();
        const goalText = goals.map(goal => [
            goal.name,
            ...(goal.tasks || []).flatMap(task => [
                task.name,
                ...(task.functions || []).map(func => func.name)
            ])
        ]).flat().filter(Boolean).join(' ');

        return `${promptText} ${position} ${structure} ${goalText}`.toLowerCase();
    };

    const detectCompetencyDraftType = (contextText) => {
        const isDeveloper = [
            'разработ', 'програм', 'backend', 'frontend', 'java', 'javascript',
            'api', 'сервис', 'код', 'интеграц', 'devops'
        ].some(term => contextText.includes(term));
        const isProject = [
            'проект', 'руковод', 'менедж', 'срок', 'ресурс', 'координац',
            'управлен', 'стейкхолдер', 'roadmap'
        ].some(term => contextText.includes(term));
        const isFinance = [
            'финанс', 'бюджет', 'эконом', 'аудит', 'отчет', 'план-факт',
            'аналитик финансов'
        ].some(term => contextText.includes(term));

        if (isDeveloper) return 'developer';
        if (isProject) return 'project';
        if (isFinance) return 'finance';
        return 'analyst';
    };

    const buildAICompetenciesDraft = (promptText = '') => {
        const contextText = getCompetencyGenerationContext(promptText);
        const draftType = detectCompetencyDraftType(contextText);
        const softSkillsByType = {
            developer: [
                getSoftSkillDraft(2, 3),
                getSoftSkillDraft(5, 3),
                getSoftSkillDraft(1, 3)
            ],
            project: [
                getSoftSkillDraft(7, 3),
                getSoftSkillDraft(6, 3),
                getSoftSkillDraft(9, 3)
            ],
            finance: [
                getSoftSkillDraft(2, 3),
                getSoftSkillDraft(3, 3),
                getSoftSkillDraft(9, 2)
            ],
            analyst: [
                getSoftSkillDraft(2, 3),
                getSoftSkillDraft(1, 3),
                getSoftSkillDraft(9, 2)
            ]
        };
        const drafts = {
            developer: {
                hardSkills: ["JavaScript (React, Vue, Node.js)", "REST API Design", "Docker & Kubernetes", "CI/CD (GitLab, Jenkins)"],
                languages: [{ name: "Английский", level: "B1" }],
                technologies: ["Visual Studio Code", "Postman", "Jira", "Confluence"],
                certificates: ["Microsoft Certified: Azure Administrator"],
                permits: ["Электробезопасность IV гр."],
                education: [{ name: "Высшее образование", directions: ["Информационные технологии"] }],
                experience: [{ id: "total", name: "Общий стаж работы", years: "3-6 лет", mandatory: true }],
                functionalAreas: ["Информационные технологии (IT)", "Безопасность"]
            },
            project: {
                hardSkills: ["Управление проектами", "Agile (Scrum, Kanban)", "BPMN 2.0"],
                languages: [{ name: "Английский", level: "B2" }],
                technologies: ["Microsoft Excel", "Microsoft PowerPoint", "Jira", "Confluence"],
                certificates: ["PMP (Project Management Professional)"],
                permits: ["Работа в замкнутых пространствах"],
                education: [{ name: "Высшее образование", directions: ["Менеджмент и управление"] }],
                experience: [
                    { id: "total", name: "Общий стаж работы", years: "3-6 лет", mandatory: true },
                    { id: "mgmt", name: "Опыт на руководящих должностях", years: "1-3 года", mandatory: true }
                ],
                functionalAreas: ["Управление проектами (PMO)", "Административное управление"]
            },
            finance: {
                hardSkills: ["Финансовый анализ", "Управление проектами", "Agile (Scrum, Kanban)"],
                languages: [{ name: "Английский", level: "B2" }],
                technologies: ["Microsoft Excel", "Tableau", "1C:Предприятие", "Power BI"],
                certificates: ["ACCA"],
                permits: ["Работа с ГСМ (горюче-смазочными материалами)"],
                education: [{ name: "Магистратура", directions: ["Экономика и финансы"] }],
                experience: [{ id: "total", name: "Общий стаж работы", years: "3-6 лет", mandatory: true }],
                functionalAreas: ["Финансы и аудит", "Продажи и развитие бизнеса"]
            },
            analyst: {
                hardSkills: ["BPMN 2.0", "SQL (PostgreSQL, MySQL)", "REST API Design", "Agile (Scrum, Kanban)"],
                languages: [{ name: "Английский", level: "B1" }],
                technologies: ["Microsoft Excel", "Power BI", "Jira", "Confluence"],
                certificates: ["Google Analytics Individual Qualification"],
                permits: ["Электробезопасность IV гр."],
                education: [{ name: "Высшее образование", directions: ["Информационные технологии", "Менеджмент и управление"] }],
                experience: [{ id: "total", name: "Общий стаж работы", years: "1-3 года", mandatory: true }],
                functionalAreas: ["Информационные технологии (IT)", "Управление проектами (PMO)"]
            }
        };

        return {
            draftType,
            competencies: {
                softSkills: (softSkillsByType[draftType] || softSkillsByType.analyst).filter(Boolean),
                ...drafts[draftType]
            }
        };
    };

    const expandAICompetencyAccordions = () => {
        [
            'soft-skills-accordion',
            'hard-skills-accordion',
            'lang-skills-accordion',
            'soft-tech-accordion',
            'cert-skills-accordion',
            'extra-permits-accordion',
            'edu-skills-accordion',
            'exp-skills-accordion',
            'func-area-accordion'
        ].forEach((id) => {
            const accordion = document.getElementById(id);
            if (accordion) accordion.classList.add('is-open', 'is-ai-generated');
        });
    };

    const applyAICompetenciesDraft = (promptText = '') => {
        const { draftType, competencies } = buildAICompetenciesDraft(promptText);
        applyCompetenciesState(competencies);
        expandAICompetencyAccordions();

        return {
            draftType,
            softSkillsAdded: competencies.softSkills.length,
            hardSkillsAdded: competencies.hardSkills.length,
            languagesAdded: competencies.languages.length,
            technologiesAdded: competencies.technologies.length,
            certificatesAdded: competencies.certificates.length,
            permitsAdded: competencies.permits.length,
            educationAdded: competencies.education.length,
            experienceAdded: competencies.experience.length,
            functionalAreasAdded: competencies.functionalAreas.length
        };
    };

    window.HRProfileApp = window.HRProfileApp || {};
    window.HRProfileApp.profileCreateStageGenerator = {
        ...(window.HRProfileApp.profileCreateStageGenerator || {}),
        applyCompetenciesDraft: applyAICompetenciesDraft
    };

    const extractGoalsFromDOM = (containerId = 'goals-container') => {
        const goals = [];
        const editGoalsContainer = document.getElementById(containerId);
        if (!editGoalsContainer) return goals;
        
        const goalCards = editGoalsContainer.querySelectorAll('.goal-card');
        
        goalCards.forEach(card => {
            const goalNameTrigger = card.querySelector('.goal-name-text');
            const goalName = isFilledTrigger(goalNameTrigger) ? getTriggerValue(goalNameTrigger) : '';
            
            const goalRoleTrigger = card.querySelector('.col-goal-role .custom-select-trigger');
            const goalRole = isFilledTrigger(goalRoleTrigger) ? getTriggerValue(goalRoleTrigger) : '';
            
            const tasks = [];
            const taskRows = card.querySelectorAll('.task-body tr');
            
            taskRows.forEach(row => {
                const taskNameTrigger = row.querySelector('.task-name-text');
                const taskName = isFilledTrigger(taskNameTrigger) ? getTriggerValue(taskNameTrigger) : '';
                
                const participationInput = row.querySelector('.task-participation-input');
                const participation = participationInput ? participationInput.value.trim() : '';
                
                const taskRoleTrigger = row.querySelector('.col-task-role .custom-select-trigger');
                const taskRole = isFilledTrigger(taskRoleTrigger) ? getTriggerValue(taskRoleTrigger) : '';
                
                const functions = [];
                const funcRows = row.querySelectorAll('.function-row-item');
                
                funcRows.forEach(funcRow => {
                    const funcNameTrigger = funcRow.querySelector('.col-select-name .custom-select-trigger');
                    const funcName = isFilledTrigger(funcNameTrigger) ? getTriggerValue(funcNameTrigger) : '';
                    
                    const funcAiTrigger = funcRow.querySelector('.col-select-ai .custom-select-trigger');
                    const funcAi = isFilledTrigger(funcAiTrigger) ? getTriggerValue(funcAiTrigger) : '';
                    
                    const influenceInput = funcRow.querySelector('.ai-influence-input');
                    const influence = influenceInput ? influenceInput.value.trim() : '';
                    
                    const funcRoleTrigger = funcRow.querySelector('.col-select-role .custom-select-trigger');
                    const funcRole = isFilledTrigger(funcRoleTrigger) ? getTriggerValue(funcRoleTrigger) : '';
                    
                    if (funcName) {
                        functions.push({
                            name: funcName,
                            ai: funcAi || 'Не используется',
                            influence: influence,
                            role: funcRole || 'Исполняет'
                        });
                    }
                });
                
                if (taskName) {
                    tasks.push({
                        name: taskName,
                        participation: participation,
                        role: taskRole || 'Исполняет',
                        functions: functions
                    });
                }
            });
            
            if (goalName) {
                goals.push({
                    name: goalName,
                    role: goalRole || 'Отвечает',
                    tasks: tasks
                });
            }
        });
        
        return goals;
    };

    nextStageBtn.addEventListener('click', () => {
        if (nextStageBtn.innerText === 'Создать профиль должности' && !nextStageBtn.disabled) {
            const fields = getParamFields();
            const nameVal = fields.position ? fields.position.value.trim() : '';
            const classifierVal = fields.classifier ? fields.classifier.value.trim() : '';
            const departmentVal = fields.structure ? fields.structure.value.trim() : '';
            const okzVal = fields.okz ? fields.okz.value.trim() : '';
            const extractedGoals = extractGoalsFromDOM();
            const profilePayload = profileCreate
                ? profileCreate.buildProfilePayload({
                    name: nameVal,
                    classifier: classifierVal,
                    department: departmentVal,
                    okzCode: okzVal,
                    goals: extractedGoals,
                    competencies: extractCompetenciesState()
                })
                : {
                    name: nameVal,
                    classifier: classifierVal,
                    department: departmentVal || (profileModel ? profileModel.SYSTEM_DEFAULTS.department : ''),
                    okzCode: okzVal,
                    goals: extractedGoals,
                    competencies: extractCompetenciesState()
                };

            if (isEditMode && editingProfileId !== null) {
                const profile = profileStore ? profileStore.update(editingProfileId, profilePayload) : null;
                if (profile) {
                    currentViewProfile = profile;
                    openViewProfileDrawer(profile.name);
                    
                    showToast('Профиль должности успешно обновлен!', true, true);
                }
            } else {
                const newProfile = profileStore ? profileStore.add(profilePayload) : null;
                currentViewProfile = newProfile;
                
                showToast('Профиль должности успешно создан!', true, true);
            }

            closeDrawer();
        }
    });

    // --- Requests Tab Functionality ---
    const showDeleteRequestModal = (requestId, onConfirm) => {
        const modalHTML = `
            <div class="modal-overlay is-open">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Удаление заявки</h3>
                        <button class="modal-close"><i data-lucide="x"></i></button>
                    </div>
                    <div class="modal-body">
                        <p>Вы действительно хотите удалить заявку <strong>${requestId}</strong>?</p>
                        <p style="margin-top: 8px; font-size: 13px; color: #888888;">Это действие необратимо, и заявка будет полностью удалена из системы.</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-cancel-modal" id="btn-cancel-delete-req" style="background: none; border: 1px solid var(--border-color, #E2E8F0); color: var(--text-secondary, #64748B); padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s;">Отмена</button>
                        <button class="btn-danger" id="btn-confirm-delete-req">Удалить</button>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        const overlay = modalContainer.querySelector('.modal-overlay');
        document.body.appendChild(overlay);
        lucide.createIcons();
        
        const closeMod = () => overlay.remove();
        
        overlay.querySelector('.modal-close').addEventListener('click', closeMod);
        overlay.querySelector('#btn-cancel-delete-req').addEventListener('click', closeMod);
        overlay.querySelector('#btn-confirm-delete-req').addEventListener('click', () => {
            onConfirm();
            closeMod();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeMod();
            }
        });
    };

    window.confirmDeleteRequest = (requestId) => {
        showDeleteRequestModal(requestId, () => {
            if (window.requests) {
                window.requests = window.requests.filter(req => req.id !== requestId);
            }
            renderRequestsTabContent();
            if (typeof window.showToast === 'function') {
                window.showToast(`Заявка ${requestId} успешно удалена`, true, true);
            }
        });
    };

    const renderRequestsTabContent = () => {
        const goalsContainer = document.getElementById('view-profile-goals-container');
        if (!goalsContainer || !currentViewProfile) return;
        
        const currentRequests = (window.requests || []).filter(req => req.profileId === currentViewProfile.id);
        
        if (currentRequests.length === 0) {
            goalsContainer.innerHTML = `
                <div class="requests-empty-state">
                    <i data-lucide="inbox"></i>
                    <span>Заявки на изменение этого профиля отсутствуют</span>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        let html = `
            <div class="requests-table-container">
                <table class="requests-table">
                    <thead>
                        <tr>
                            <th style="width: 120px;">ID</th>
                            <th>Инициатор</th>
                            <th>Статус заявки</th>
                            <th>Дата изменения</th>
                            <th>Текущее согласующее лицо</th>
                            <th style="width: 60px; text-align: center;"></th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        currentRequests.forEach(req => {
            let badgeClass = 'status-draft';
            let displayStatus = req.status;
            if (displayStatus === 'Одобрена') {
                displayStatus = 'Согласована';
            }
            
            if (displayStatus === 'В работе') badgeClass = 'status-in-progress';
            else if (displayStatus === 'Согласована') badgeClass = 'status-approved';
            else if (displayStatus === 'Отклонена') badgeClass = 'status-rejected';
            else if (displayStatus === 'Черновик') badgeClass = 'status-draft';
            else if (displayStatus === 'На согласовании') badgeClass = 'status-on-review';
            
            html += `
                <tr data-request-id="${req.id}">
                    <td>
                        <div class="request-id-container">
                            <a href="#" class="request-id-link" onclick="event.preventDefault();">${req.id}</a>
                            <span class="request-id-chevron"><i data-lucide="chevron-right"></i></span>
                        </div>
                    </td>
                    <td>
                        <span class="request-user-name">${req.initiatorName}</span>
                        <span class="request-user-position">${req.initiatorPosition}</span>
                    </td>
                    <td>
                        <span class="request-status-badge ${badgeClass}">${displayStatus}</span>
                    </td>
                    <td>
                        <span style="font-size: 13px; color: #475569;">${req.changedAt}</span>
                    </td>
                    <td>
                        <span class="request-user-name">${req.currentApproverName || '—'}</span>
                        <span class="request-user-position">${req.currentApproverPosition || ''}</span>
                    </td>
                    <td style="text-align: center;">
                        <button class="request-delete-btn" title="Удалить заявку" onclick="event.stopPropagation(); window.confirmDeleteRequest('${req.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        goalsContainer.innerHTML = html;
        lucide.createIcons();
    };

    // --- View Profile Tabs Logic ---
    document.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.view-tab-btn');
        if (tabBtn) {
            const tabsContainer = tabBtn.closest('.view-drawer-tabs');
            if (tabsContainer) {
                tabsContainer.querySelectorAll('.view-tab-btn').forEach(btn => btn.classList.remove('active'));
                tabBtn.classList.add('active');
                
                const tabText = tabBtn.innerText.trim();
                const goalsContainer = document.getElementById('view-profile-goals-container');
                const compContent = document.getElementById('competencies-content');
                const funcContent = document.getElementById('functional-content');
                
                if (goalsContainer) {
                    if (tabText === 'Общие положения и функционал') {
                        if (compContent && funcContent && compContent.parentElement !== funcContent.parentElement) {
                            compContent.classList.remove('is-view-mode');
                            compContent.style.display = 'none';
                            funcContent.after(compContent);
                        }
                        if (isViewEditMode) {
                            // If in edit mode, re-render the editable goals
                            goalsContainer.innerHTML = '';
                            if (currentViewProfile && currentViewProfile.goals) {
                                currentViewProfile.goals.forEach(goalData => {
                                    createGoalCard(goalData, goalsContainer);
                                });
                            }
                        } else {
                            goalsContainer.innerHTML = generateViewGoalsHtml(currentViewProfile);
                        }
                    } else if (tabText === 'Ключевые компетенции') {
                        goalsContainer.innerHTML = '';
                        if (currentViewProfile && typeof applyCompetenciesState === 'function') {
                            applyCompetenciesState(currentViewProfile.competencies);
                        }
                        if (compContent) {
                            goalsContainer.appendChild(compContent);
                            compContent.style.display = 'block';
                            if (isViewEditMode) {
                                compContent.classList.remove('is-view-mode');
                            } else {
                                compContent.classList.add('is-view-mode');
                            }
                        }
                    } else if (tabText === 'Вознаграждение') {
                        if (compContent && funcContent && compContent.parentElement !== funcContent.parentElement) {
                            compContent.classList.remove('is-view-mode');
                            compContent.style.display = 'none';
                            funcContent.after(compContent);
                        }
                        goalsContainer.innerHTML = `
                            <div class="reward-content">
                                <button class="reward-eval-btn">Отправить на оценку</button>
                                <div class="reward-info-banner">
                                    <i data-lucide="info"></i>
                                    <span>Узнай вилку для приема сотрудника в его регионе по ссылке</span>
                                </div>
                                <div class="reward-block">
                                    <div class="reward-block-header">Оклад</div>
                                    <div class="reward-block-grid">
                                        <div class="reward-col">
                                            <div class="reward-col-label">Минимум</div>
                                            <div class="reward-col-value">125 000 ₽</div>
                                        </div>
                                        <div class="reward-col">
                                            <div class="reward-col-label">Медиана</div>
                                            <div class="reward-col-value">139 000 ₽</div>
                                        </div>
                                        <div class="reward-col">
                                            <div class="reward-col-label">Максимум</div>
                                            <div class="reward-col-value">152 000 ₽</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="reward-block">
                                    <div class="reward-block-header">Совокупный доход</div>
                                    <div class="reward-block-grid">
                                        <div class="reward-col">
                                            <div class="reward-col-label">Минимум</div>
                                            <div class="reward-col-value">148 000 ₽</div>
                                        </div>
                                        <div class="reward-col">
                                            <div class="reward-col-label">Медиана</div>
                                            <div class="reward-col-value">167 000 ₽</div>
                                        </div>
                                        <div class="reward-col">
                                            <div class="reward-col-label">Максимум</div>
                                            <div class="reward-col-value">186 000 ₽</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="reward-accordion" onclick="this.classList.toggle('is-open')">
                                    <div class="reward-accordion-header">
                                        <div class="reward-accordion-icon"><i data-lucide="chevron-down"></i></div>
                                        <div class="reward-accordion-title">Регулярная премия</div>
                                    </div>
                                    <div class="reward-accordion-content">Данные по регулярной премии (в разработке)</div>
                                </div>
                                <div class="reward-accordion" onclick="this.classList.toggle('is-open')">
                                    <div class="reward-accordion-header">
                                        <div class="reward-accordion-icon"><i data-lucide="chevron-down"></i></div>
                                        <div class="reward-accordion-title">Нерегулярная премия</div>
                                    </div>
                                    <div class="reward-accordion-content">Данные по нерегулярной премии (в разработке)</div>
                                </div>
                            </div>
                        `;
                        lucide.createIcons();
                    } else if (tabText === 'Заявки') {
                        if (compContent && funcContent && compContent.parentElement !== funcContent.parentElement) {
                            compContent.classList.remove('is-view-mode');
                            compContent.style.display = 'none';
                            funcContent.after(compContent);
                        }
                        renderRequestsTabContent();
                    } else {
                        if (compContent && funcContent && compContent.parentElement !== funcContent.parentElement) {
                            compContent.classList.remove('is-view-mode');
                            compContent.style.display = 'none';
                            funcContent.after(compContent);
                        }
                        goalsContainer.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; min-height: 200px; color: #94A3B8; font-size: 14px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px;">
                                Наполнение раздела "${tabText}" находится в разработке
                            </div>
                        `;
                    }
                    
                    const helpLink = document.querySelector('.view-tab-link-right');
                    const btnAddGoal = document.getElementById('btn-view-add-goal');
                    if (tabText === 'Общие положения и функционал') {
                        if (helpLink) helpLink.style.display = '';
                        if (btnAddGoal && isViewEditMode) btnAddGoal.style.display = 'inline-flex';
                    } else {
                        if (helpLink) helpLink.style.display = 'none';
                        if (btnAddGoal) btnAddGoal.style.display = 'none';
                    }
                }
            }
        }
    });

    // --- Pre-populate Competencies for Demo purposes ---
    const prepopulateCompetencies = () => {
        // Soft Skills
        if (typeof SOFT_SKILLS_CATALOG !== 'undefined' && SOFT_SKILLS_CATALOG.length >= 2) {
            selectedSoftSkills.push({ ...SOFT_SKILLS_CATALOG[0], score: 0 });
            selectedSoftSkills.push({ ...SOFT_SKILLS_CATALOG[1], score: 0 });
            updateSkillsUI();
            const acc = document.getElementById('soft-skills-accordion');
            if (acc) acc.classList.add('is-open');
        }

        // Hard Skills
        if (typeof HARD_SKILLS_CATALOG !== 'undefined' && HARD_SKILLS_CATALOG.length >= 2) {
            selectedHardSkills.push(HARD_SKILLS_CATALOG[0]);
            selectedHardSkills.push(HARD_SKILLS_CATALOG[1]);
            updateHardSkillsUI();
            const acc = document.getElementById('hard-skills-accordion');
            if (acc) acc.classList.add('is-open');
        }

        // Languages
        if (typeof LANGUAGES_CATALOG !== 'undefined' && LANGUAGES_CATALOG.length >= 1) {
            selectedLanguages.push({ name: LANGUAGES_CATALOG[0], level: 'Продвинутый' });
            updateLanguagesUI();
            const acc = document.getElementById('lang-skills-accordion');
            if (acc) acc.classList.add('is-open');
        }

        // Tech
        if (typeof TECH_CATALOG !== 'undefined' && TECH_CATALOG.length >= 2) {
            selectedTech.push(TECH_CATALOG[0]);
            selectedTech.push(TECH_CATALOG[1]);
            updateTechUI();
            const acc = document.getElementById('soft-tech-accordion');
            if (acc) acc.classList.add('is-open');
        }

        // Certs
        if (typeof CERT_CATALOG !== 'undefined' && CERT_CATALOG.length >= 1) {
            selectedCerts.push(CERT_CATALOG[0]);
            updateCertUI();
            const acc = document.getElementById('cert-skills-accordion');
            if (acc) acc.classList.add('is-open');
        }

        // Edu
        if (typeof EDU_CATALOG !== 'undefined' && EDU_CATALOG.length >= 1) {
            selectedEdu.push({
                name: EDU_CATALOG[0],
                directions: ["Менеджмент и управление"]
            });
            updateEduUI();
            const acc = document.getElementById('edu-skills-accordion');
            if (acc) acc.classList.add('is-open');
        }
        
        // Exp
        selectedExp.push({
            id: "total",
            label: "Общий стаж работы",
            value: "3-6 лет",
            mgmt: null
        });
        updateExpUI();
        const acc = document.getElementById('exp-skills-accordion');
        if (acc) acc.classList.add('is-open');
    };

    prepopulateCompetencies();
});
