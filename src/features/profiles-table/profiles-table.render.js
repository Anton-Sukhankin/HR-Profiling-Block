/**
 * samolet HR TECH - Profiles Table Dynamic Renderer
 * Этот скрипт отвечает за динамическое заполнение таблицы должностных профилей
 * данными из src/data/profiles.seed.js (window.profiles) без нарушения исходной верстки.
 */

// Вспомогательная функция для форматирования даты в формат DD.MM.YYYY
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    // Проверяем валидность даты
    if (isNaN(date.getTime())) return dateStr;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
}

// Вспомогательная функция для получения HTML-кода бейджа статуса с нужным классом
function getStatusBadge(status) {
    let className = 'draft';
    const text = status || 'Черновик';
    
    // Сопоставляем статус с CSS классами из style.css
    if (status === 'Активен' || status === 'Утверждено') {
        className = 'approved';
    } else if (status === 'На оценке') {
        className = 'on-review';
    } else if (status === 'Черновик') {
        className = 'draft';
    } else if (status === 'В архиве') {
        className = 'draft'; // Серый цвет для архивного статуса
    }
    
    return `<span class="status-badge ${className}">${escapeHtml(text)}</span>`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Вспомогательная функция для создания HTML строки таблицы для одного профиля
function createRowHtml(profile) {
    const formattedDate = formatDate(profile.updatedAt);
    const statusBadge = getStatusBadge(profile.status);
    const id = escapeHtml(profile.id || '');
    const code = escapeHtml(profile.code || '');
    const name = escapeHtml(profile.name || '');
    const department = escapeHtml(profile.department || '');
    const band = escapeHtml(profile.band || '');
    const classifier = escapeHtml(profile.classifier || '');
    const date = escapeHtml(formattedDate);
    
    // Отрисовка галочки "Привязка к позиции" (hasBinding)
    const bindingHtml = profile.hasBinding 
        ? `<div class="binding-check-box"><i data-lucide="check" class="binding-check-icon"></i></div>` 
        : '';
        
    // Отрисовка типовой должности (isTypicalPosition)
    const typicalHtml = `
        <div class="standard-cell">
            <span>${profile.isTypicalPosition ? 'Да' : 'Нет'}</span>
        </div>
    `;

    return `
        <div class="table-row" data-id="${id}">
            <div class="table-cell checkbox-cell">
                <input type="checkbox" class="row-checkbox">
            </div>
            <div class="table-cell col-code">${code}</div>
            <div class="table-cell col-profile">
                <a href="#" class="profile-link" title="${name}">${name}</a>
            </div>
            <div class="table-cell col-structure">${department}</div>
            <div class="table-cell col-band">${band}</div>
            <div class="table-cell col-binding">${bindingHtml}</div>
            <div class="table-cell col-classifier">${classifier}</div>
            <div class="table-cell col-standard">${typicalHtml}</div>
            <div class="table-cell col-date">${date}</div>
            <div class="table-cell col-status">${statusBadge}</div>
        </div>
    `;
}

// Настройка интерактивного поведения чекбоксов (Выбрать все / Выбрать отдельные строки)
function initCheckboxes() {
    const selectAllCheckbox = document.getElementById('select-all');
    if (!selectAllCheckbox) return;

    // Сбрасываем флаг "Выбрать все" при перезагрузке данных
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;

    // Слушатель изменения состояния главного чекбокса
    selectAllCheckbox.onchange = () => {
        const rowCheckboxes = document.querySelectorAll('.table-body .row-checkbox');
        rowCheckboxes.forEach(cb => {
            cb.checked = selectAllCheckbox.checked;
            const row = cb.closest('.table-row');
            if (row) {
                row.classList.toggle('selected', selectAllCheckbox.checked);
            }
        });
    };

    // Делегирование событий для чекбоксов строк
    const tableBody = document.querySelector('.table-body');
    if (tableBody) {
        tableBody.onchange = (e) => {
            if (e.target && e.target.classList.contains('row-checkbox')) {
                const row = e.target.closest('.table-row');
                if (row) {
                    row.classList.toggle('selected', e.target.checked);
                }
                updateSelectAllState();
            }
        };
    }
}

// Обновление состояния главного чекбокса (включая indeterminate состояние)
function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('select-all');
    if (!selectAllCheckbox) return;

    const rowCheckboxes = document.querySelectorAll('.table-body .row-checkbox');
    if (rowCheckboxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }

    let checkedCount = 0;
    rowCheckboxes.forEach(cb => {
        if (cb.checked) checkedCount++;
    });

    if (checkedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === rowCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true; // Частичный выбор (промежуточное состояние)
    }
}

/**
 * Главная функция для заполнения таблицы профилями
 * @param {Array} profilesData - Массив объектов профилей
 */
function renderProfilesTable(profilesData) {
    const tableBody = document.querySelector('.table-body');
    if (!tableBody) {
        console.error('Элемент с классом .table-body не найден.');
        return;
    }

    // Очищаем старые демонстрационные данные
    tableBody.innerHTML = '';

    // Заполняем новыми строками из данных
    if (Array.isArray(profilesData) && profilesData.length > 0) {
        profilesData.forEach(profile => {
            tableBody.insertAdjacentHTML('beforeend', createRowHtml(profile));
        });
    } else {
        tableBody.innerHTML = `
            <div class="table-row" style="justify-content: center; padding: 32px; color: var(--text-secondary); width: 100%;">
                Профили не найдены
            </div>
        `;
    }

    // Инициализируем новые Lucide иконки, чтобы они отображались корректно
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Настраиваем работу чекбоксов
    initCheckboxes();
}

// Запускаем автоматическое заполнение после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Берем массив данных из window.profiles
    const profiles = window.profiles || [];
    renderProfilesTable(profiles);
});

// Экспортируем функцию глобально
window.renderProfilesTable = renderProfilesTable;
