// локализация
const L = window.LOCALE || {};

function t(path) {
    const keys = path.split('.');
    let value = L;
    for (const key of keys) {
        value = value?.[key];
        if (value === undefined) return path;
    }
    return value;
}

/**
 * GEM_IMAGES - URL изображений рунитов
 * В версии без эффектов используются только дефолтные иконки
 */
const GEM_IMAGES = {
    order: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_202.png', // Обет как дефолт для Порядка
    chaos: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_205.png'  // Ропот как дефолт для Хаоса
};

/**
 * Динамически локализованные типы кор
 */
function getArkgridCoreTypes() {
    return {
        order: [
            {id: 'sun', name: t('cores.sun'), icon: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_96.png'},
            {id: 'moon', name: t('cores.moon'), icon: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_97.png'},
            {id: 'star', name: t('cores.star'), icon: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_98.png'}
        ],
        chaos: [
            {id: 'sun', name: t('cores.sun'), icon: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_99.png'},
            {id: 'moon', name: t('cores.moon'), icon: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_100.png'},
            {id: 'star', name: t('cores.star'), icon: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_101.png'}
        ]
    };
}

/**
 * Динамически локализованные данные грейдов
 */
function getArkgridGradeData() {
    return {
        heroic: {name: t('grades.heroic'), willpower: 9, activationPoints: [10]},
        legendary: {name: t('grades.legendary'), willpower: 12, activationPoints: [10, 14]},
        relic: {name: t('grades.relic'), willpower: 15, activationPoints: [10, 14, 17, 18, 19, 20]},
        ancient: {name: t('grades.ancient'), willpower: 17, activationPoints: [10, 14, 17, 18, 19, 20]}
    };
}

/**
 * Цвета грейдов
 */
const GRADE_COLORS = {
    "heroic": "#ba00f9",
    "legendary": "#f99200",
    "relic": "#fa5d00",
    "ancient": "#B3956C",
};

const MAX_GEMS_PER_CORE = 4;


const chaosCoreColumn = document.getElementById('chaos-core-column');
const orderCoreColumn = document.getElementById('order-core-column');
const addGemBtn = document.getElementById('add-gem-btn');
const calculateBtn = document.getElementById('calculate-btn');
const orderGemList = document.getElementById('order-gem-list');
const chaosGemList = document.getElementById('chaos-gem-list');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');

const saveModal = document.getElementById('save-modal');
const saveNameInput = document.getElementById('save-name-input');
const saveModalConfirmBtn = document.getElementById('save-modal-confirm-btn');
const saveModalCancelBtn = document.getElementById('save-modal-cancel-btn');

const loadModal = document.getElementById('load-modal');
const savesList = document.getElementById('saves-list');
const noSavesMessage = document.getElementById('no-saves-message');
const loadModalCancelBtn = document.getElementById('load-modal-cancel-btn');

const alertModal = document.getElementById('alert-modal');
const alertModalMessage = document.getElementById('alert-modal-message');
const alertModalOkBtn = document.getElementById('alert-modal-ok-btn');

const gemEditModal = document.getElementById('gem-edit-modal');
const gemEditForm = document.getElementById('gem-edit-form');
const gemEditSaveBtn = document.getElementById('gem-edit-save-btn');
const gemEditCancelBtn = document.getElementById('gem-edit-cancel-btn');

const spinnerModal = document.getElementById('spinner-modal');
const spinnerText = document.querySelector('#spinner-modal .spinner-text');


let orderGems = [];
let chaosGems = [];
let nextGemId = 0;
let currentlyEditingGem = null;
let selectedCores = {};

let assignedGemIds = new Map();

// Цвета для типов ядер
const CORE_TYPE_COLORS = {
    sun: '#FF8C00',   // Оранжевый для Солнца
    moon: '#4A90D9',  // Голубой для Луны
    star: '#9B59B6'   // Фиолетовый для Звезды
};

const CORE_TYPE_ICONS = {
    sun: '☀',
    moon: '☽',
    star: '★'
};

const STORAGE_PREFIX = 'lostark_arkgrid_without_';


document.addEventListener('DOMContentLoaded', init);

function init() {
    initializeTabs();

    const chaosGemListSection = document.getElementById('chaos-gem-list-section');
    const orderGemListSection = document.getElementById('order-gem-list-section');
    if (chaosGemListSection) chaosGemListSection.style.display = 'none';
    if (orderGemListSection) orderGemListSection.style.display = 'block';

    orderGemList.dataset.emptyText = t('messages.noGemsRegistered');
    chaosGemList.dataset.emptyText = t('messages.noGemsRegistered');

    const ARKGRID_CORE_TYPES = getArkgridCoreTypes();

    for (let i = 1; i <= 3; i++) {
        orderCoreColumn.appendChild(createCoreSlot('order', i));
        chaosCoreColumn.appendChild(createCoreSlot('chaos', i));
    }

    const gemInputForm = document.getElementById('gem-input-form');
    const gemTypeDropdown = createCustomDropdown('gem-type', t('ui.gemType'),
        [{id: 'order', name: t('gems.order').replace('рунит', '').replace(' Gem', ''), icon: GEM_IMAGES.order},
            {id: 'chaos', name: t('gems.chaos').replace('рунит', '').replace(' Gem', ''), icon: GEM_IMAGES.chaos}],
        (w, s) => {
            w.dataset.value = s.value;
            w.querySelector('.custom-select-trigger').innerHTML = s.icon ? `<img src="${s.icon}" alt="${s.text}"><span>${s.text}</span>` : `<span>${s.text}</span>`;
            w.querySelector('.custom-options').style.display = 'none';
            w.classList.remove('open');
        });
    const willpowerDropdown = createCustomDropdown('gem-willpower', t('ui.willpower'),
        [{id: 3, name: 3}, {id: 4, name: 4}, {id: 5, name: 5}, {id: 6, name: 6}, {id: 7, name: 7}],
        (w, s) => {
            w.dataset.value = s.value;
            w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
            w.querySelector('.custom-options').style.display = 'none';
            w.classList.remove('open');
        });
    const pointDropdown = createCustomDropdown('gem-point', t('ui.points'),
        [{id: 1, name: 1}, {id: 2, name: 2}, {id: 3, name: 3}, {id: 4, name: 4}, {id: 5, name: 5}],
        (w, s) => {
            w.dataset.value = s.value;
            w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
            w.querySelector('.custom-options').style.display = 'none';
            w.classList.remove('open');
        });

    const row1 = document.createElement('div');
    row1.className = 'gem-input-row single';
    row1.appendChild(gemTypeDropdown);

    const row2 = document.createElement('div');
    row2.className = 'gem-input-row';
    row2.appendChild(willpowerDropdown);
    row2.appendChild(pointDropdown);

    const row3 = document.createElement('div');
    row3.className = 'gem-input-row single';
    row3.appendChild(addGemBtn);

    gemInputForm.appendChild(row1);
    gemInputForm.appendChild(row2);
    gemInputForm.appendChild(row3);

    addGemBtn.addEventListener('click', addGem);
    calculateBtn.addEventListener('click', calculate);

    saveBtn.addEventListener('click', openSaveModal);
    loadBtn.addEventListener('click', openLoadModal);

    saveModalCancelBtn.addEventListener('click', closeSaveModal);
    saveModal.addEventListener('click', (e) => {
        if (e.target === saveModal) closeSaveModal();
    });
    saveModalConfirmBtn.addEventListener('click', handleSave);

    loadModalCancelBtn.addEventListener('click', closeLoadModal);
    loadModal.addEventListener('click', (e) => {
        if (e.target === loadModal) closeLoadModal();
    });

    alertModalOkBtn.addEventListener('click', closeCustomAlert);
    alertModal.addEventListener('click', (e) => {
        if (e.target === alertModal) {
            closeCustomAlert();
        }
    });

    gemEditCancelBtn.addEventListener('click', closeGemEditPopup);
    gemEditModal.addEventListener('click', (e) => {
        if (e.target === gemEditModal) {
            closeGemEditPopup();
        }
    });
    gemEditSaveBtn.addEventListener('click', saveGemEdit);

    document.getElementById('clear-order-gems-btn').addEventListener('click', () => clearAllGems('order'));
    document.getElementById('clear-chaos-gems-btn').addEventListener('click', () => clearAllGems('chaos'));

    document.getElementById('ocr-scan-btn').addEventListener('click', openOCRModal);
    document.getElementById('ocr-modal-cancel-btn').addEventListener('click', closeOCRModal);
    document.getElementById('ocr-modal').addEventListener('click', (e) => {
        if (e.target.id === 'ocr-modal') closeOCRModal();
    });

    const ocrUploadArea = document.getElementById('ocr-upload-area');
    const ocrFileInput = document.getElementById('ocr-file-input');

    ocrUploadArea.addEventListener('click', () => ocrFileInput.click());
    ocrFileInput.addEventListener('change', handleOCRFileSelect);

    ocrUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        ocrUploadArea.classList.add('dragover');
    });

    ocrUploadArea.addEventListener('dragleave', () => {
        ocrUploadArea.classList.remove('dragover');
    });

    ocrUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        ocrUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleOCRFile(files[0]);
        }
    });

    document.getElementById('ocr-process-btn').addEventListener('click', processOCRImage);

}

function initializeTabs() {
    const tabSwitcherButtons = document.querySelectorAll('.tab-switcher .tab-button');

    tabSwitcherButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');

            tabSwitcherButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const orderGemListSection = document.getElementById('order-gem-list-section');
            const chaosGemListSection = document.getElementById('chaos-gem-list-section');
            const orderCoreColumn = document.getElementById('order-core-column');
            const chaosCoreColumn = document.getElementById('chaos-core-column');

            if (tab === 'order') {
                orderGemListSection.style.display = 'block';
                chaosGemListSection.style.display = 'none';
                orderCoreColumn.style.display = 'flex';
                chaosCoreColumn.style.display = 'none';
            } else { // chaos
                orderGemListSection.style.display = 'none';
                chaosGemListSection.style.display = 'block';
                orderCoreColumn.style.display = 'none';
                chaosCoreColumn.style.display = 'flex';
            }
        });
    });
}

function createCustomDropdown(id, defaultText, items, onSelect, includeDefault = true) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    wrapper.id = id;
    wrapper.dataset.value = 'none';

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = `<span>${defaultText}</span>`;

    const options = document.createElement('div');
    options.className = 'custom-options';

    if (includeDefault) {
        const defaultOption = document.createElement('div');
        defaultOption.className = 'custom-option';
        defaultOption.dataset.value = 'none';
        defaultOption.innerHTML = `<span>${defaultText}</span>`;
        defaultOption.addEventListener('click', () => {
            onSelect(wrapper, {value: 'none', text: defaultText, icon: null});
        });
        options.appendChild(defaultOption);
    }

    items.forEach(item => {
        const option = document.createElement('div');
        option.className = 'custom-option';
        option.dataset.value = item.id;
        option.innerHTML = item.icon ? `<img src="${item.icon}" alt="${item.name}"><span>${item.name}</span>` : `<span>${item.name}</span>`;
        option.addEventListener('click', () => {
            if (!option.classList.contains('disabled')) {
                onSelect(wrapper, {value: item.id, text: item.name, icon: item.icon});
            }
        });
        options.appendChild(option);
    });

    trigger.addEventListener('click', () => {
        if (wrapper.classList.contains('disabled')) return;
        const isOpen = options.style.display === 'block';

        document.querySelectorAll('.custom-select-wrapper').forEach(w => {
            if (w !== wrapper) {
                w.classList.remove('open');
                w.querySelector('.custom-options').style.display = 'none';
            w.classList.remove('open');
            }
        });

        if (isOpen) {
            wrapper.classList.remove('open');
            options.style.display = 'none';
        } else {
            wrapper.classList.add('open');
            options.style.display = 'block';
        }
    });

    wrapper.append(trigger, options);
    return wrapper;
}

function createGradeDropdown(id, defaultText, items, onSelect) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    wrapper.id = id;
    wrapper.dataset.value = 'none';

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = `<span>${defaultText}</span>`;

    const options = document.createElement('div');
    options.className = 'custom-options';

    items.forEach(item => {
        const option = document.createElement('div');
        option.className = 'custom-option';
        option.dataset.value = item.id;
        option.innerHTML = `<span>${item.name}</span>`;
        option.addEventListener('click', () => {
            onSelect(wrapper, {value: item.id, text: item.name, icon: null});
        });
        options.appendChild(option);
    });

    trigger.addEventListener('click', () => {
        if (wrapper.classList.contains('disabled')) return;
        const isOpen = options.style.display === 'block';

        document.querySelectorAll('.custom-select-wrapper').forEach(w => {
            if (w !== wrapper) {
                w.classList.remove('open');
                w.querySelector('.custom-options').style.display = 'none';
            w.classList.remove('open');
            }
        });

        if (isOpen) {
            wrapper.classList.remove('open');
            options.style.display = 'none';
        } else {
            wrapper.classList.add('open');
            options.style.display = 'block';
        }
    });

    wrapper.append(trigger, options);
    return wrapper;
}

/**
 * Очистка результатов слота
 */
function clearSlotResults(slotId) {
    const socketContainer = document.getElementById(`sockets-${slotId}`);
    socketContainer.innerHTML = '';
    for (let j = 0; j < MAX_GEMS_PER_CORE; j++) {
        const socket = document.createElement('div');
        socket.className = 'gem-socket';
        socketContainer.appendChild(socket);
    }
    document.getElementById(`summary-${slotId}`).innerHTML = '';
}

/**
 * Создание слота коры
 */
function createCoreSlot(type, id) {
    const slotId = `${type}-${id}`;
    const slot = document.createElement('div');
    slot.className = 'core-slot';
    slot.id = `slot-${slotId}`;

    const controls = document.createElement('div');
    controls.className = 'core-controls';

    const ARKGRID_GRADE_DATA = getArkgridGradeData();
    const ARKGRID_CORE_TYPES = getArkgridCoreTypes();

    const gradeDataForDropdown = Object.keys(ARKGRID_GRADE_DATA).map(key => ({
        id: key,
        name: ARKGRID_GRADE_DATA[key].name
    }));

    const targetSelectWrapper = createCustomDropdown(`target-${slotId}`, t('ui.targetPoints'), [], (tWrapper, tSelected) => {
        tWrapper.dataset.value = tSelected.value;
        tWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${tSelected.text}</span>`;
        tWrapper.querySelector('.custom-options').style.display = 'none';
        tWrapper.classList.remove('open');
    });
    targetSelectWrapper.classList.add('disabled');


    const gradeSelectWrapper = createGradeDropdown(`grade-${slotId}`, t('ui.grade'), gradeDataForDropdown, (gWrapper, gSelected) => {
        gWrapper.dataset.value = gSelected.value;
        gWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${gSelected.text}</span>`;
        gWrapper.querySelector('.custom-options').style.display = 'none';
        gWrapper.classList.remove('open');

        const gradeId = gSelected.value;
        const gradeData = ARKGRID_GRADE_DATA[gradeId];
        let willpower = gradeData.willpower;
        const activationPoints = gradeData.activationPoints;

        document.getElementById(`info-${slotId}`).textContent = `${t('ui.supplyWillpower')}: ${willpower}`;
        slot.style.borderColor = GRADE_COLORS[gradeId];

        const slotElement = document.getElementById(`slot-${slotId}`);
        slotElement.classList.remove('target-failed');
        clearSlotResults(slotId);

        const targetOptions = activationPoints.map(p => ({id: p, name: p}));

        const oldTargetDropdown = document.getElementById(`target-${slotId}`);
        const newTargetDropdown = createCustomDropdown(`target-${slotId}`, t('ui.targetPoints'), targetOptions, (tWrapper, tSelected) => {
            tWrapper.dataset.value = tSelected.value;
            tWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${tSelected.text}</span>`;
            tWrapper.querySelector('.custom-options').style.display = 'none';
        tWrapper.classList.remove('open');
        });

        oldTargetDropdown.replaceWith(newTargetDropdown);

        if (activationPoints.length === 0) {
            newTargetDropdown.classList.add('disabled');
        } else {
            newTargetDropdown.classList.remove('disabled');
        }
    });
    gradeSelectWrapper.classList.add('disabled');


    const coreTypeSelectWrapper = createCustomDropdown(`type-${slotId}`, t('ui.coreType'), ARKGRID_CORE_TYPES[type], (cWrapper, cSelected) => {
        cWrapper.dataset.value = cSelected.value;
        cWrapper.querySelector('.custom-select-trigger').innerHTML = cSelected.icon ? `<img src="${cSelected.icon}" alt="${cSelected.text}"><span>${cSelected.text}</span>` : `<span>${cSelected.text}</span>`;
        cWrapper.querySelector('.custom-options').style.display = 'none';
        cWrapper.classList.remove('open');

        updateCoreTypeOptions(type);

        if (cSelected.value === 'none') {
            gradeSelectWrapper.classList.add('disabled');
            gradeSelectWrapper.dataset.value = 'none';
            gradeSelectWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${t('ui.grade')}</span>`;
            clearSlotResults(slotId);
        } else {
            gradeSelectWrapper.classList.remove('disabled');
            gradeSelectWrapper.dataset.value = 'none';
            gradeSelectWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${t('ui.grade')}</span>`;
        }

        const currentTargetDropdown = document.getElementById(`target-${slotId}`);
        const resetTargetDropdown = createCustomDropdown(`target-${slotId}`, t('ui.targetPoints'), [], (tWrapper, tSelected) => {
            tWrapper.dataset.value = tSelected.value;
            tWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${tSelected.text}</span>`;
            tWrapper.querySelector('.custom-options').style.display = 'none';
        tWrapper.classList.remove('open');
        });
        resetTargetDropdown.classList.add('disabled');
        currentTargetDropdown.replaceWith(resetTargetDropdown);

        document.getElementById(`info-${slotId}`).textContent = '';
        slot.style.borderColor = '#333333';
        clearSlotResults(slotId);
    }, false); 

    controls.append(coreTypeSelectWrapper, gradeSelectWrapper, targetSelectWrapper);

    const infoDisplay = document.createElement('div');
    infoDisplay.className = 'core-info';
    infoDisplay.id = `info-${slotId}`;

    const sockets = document.createElement('div');
    sockets.className = 'gem-sockets';
    sockets.id = `sockets-${slotId}`;
    for (let i = 0; i < MAX_GEMS_PER_CORE; i++) {
        const socket = document.createElement('div');
        socket.className = 'gem-socket';
        sockets.appendChild(socket);
    }

    const summaryDisplay = document.createElement('div');
    summaryDisplay.className = 'result-summary';
    summaryDisplay.id = `summary-${slotId}`;

    slot.append(controls, infoDisplay, sockets, summaryDisplay);
    return slot;
}

function addGem() {
    const type = document.getElementById('gem-type').dataset.value;
    const willpowerStr = document.getElementById('gem-willpower').dataset.value;
    const pointStr = document.getElementById('gem-point').dataset.value;

    if (type === 'none' || willpowerStr === 'none' || pointStr === 'none') {
        showCustomAlert(t('messages.enterAllGemInfo'));
        return;
    }

    const willpower = parseInt(willpowerStr, 10);
    const point = parseInt(pointStr, 10);

    if (isNaN(willpower) || isNaN(point) || willpower < 3 || willpower > 7 || point < 1 || point > 5) {
        showCustomAlert(t('messages.enterAllGemInfo'));
        return;
    }

    const gem = {id: nextGemId++, type, willpower, point};

    if (type === 'order') {
        orderGems.push(gem);
    } else {
        chaosGems.push(gem);
    }

    renderGemLists();
}

function clearAllGems(type) {
    const gemsCount = type === 'order' ? orderGems.length : chaosGems.length;

    if (gemsCount === 0) {
        showCustomAlert(`Нет рунитов ${type === 'order' ? 'Порядка' : 'Хаоса'} для удаления`);
        return;
    }

    const confirmMessage = `Вы уверены, что хотите удалить все руниты ${type === 'order' ? 'Порядка' : 'Хаоса'}? (${gemsCount} ${gemsCount === 1 ? 'рунит' : gemsCount < 5 ? 'рунита' : 'рунитов'})`;

    if (confirm(confirmMessage)) {
        if (type === 'order') {
            orderGems = [];
        } else {
            chaosGems = [];
        }

        assignedGemIds.clear();

        renderGemLists();

        calculate();

        showCustomAlert(`Удалено ${gemsCount} ${gemsCount === 1 ? 'рунит' : gemsCount < 5 ? 'рунита' : 'рунитов'} ${type === 'order' ? 'Порядка' : 'Хаоса'}`);
    }
}

function renderGemLists() {
    orderGemList.innerHTML = '';
    chaosGemList.innerHTML = '';

    const createGemElement = (gem) => {
        const gemEl = document.createElement('div');
        gemEl.className = `gem-item ${gem.type}`;
        gemEl.style.cursor = 'pointer';
        gemEl.dataset.gemId = gem.id;

        const coreInfo = assignedGemIds.get(gem.id);
        const isAssigned = !!coreInfo;

        if (isAssigned) {
            gemEl.classList.add('assigned');
            const coreColor = CORE_TYPE_COLORS[coreInfo.coreType];
            gemEl.style.borderColor = coreColor;
            gemEl.style.backgroundColor = `${coreColor}15`;
        }

        const gemImage = GEM_IMAGES[gem.type];

        let assignedIndicator = '';
        if (isAssigned) {
            const coreIcon = CORE_TYPE_ICONS[coreInfo.coreType];
            const coreColor = CORE_TYPE_COLORS[coreInfo.coreType];
            const coreName = t(`cores.${coreInfo.coreType}`);
            assignedIndicator = `<span class="assigned-indicator" style="color: ${coreColor};" title="${t('ui.assignedToCore')}: ${coreName}">${coreIcon}</span>`;
        }

        gemEl.innerHTML = `
            <div class="gem-item-content">
                <img src="${gemImage}" alt="${gem.type}" class="gem-item-image">
                <div class="gem-item-stats">
                    <div>${t('ui.willpower')}: ${gem.willpower}</div>
                    <div>${t('ui.points')}: ${gem.point}</div>
                </div>
            </div>
            ${assignedIndicator}
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'gem-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = t('ui.delete');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (gem.type === 'order') {
                orderGems = orderGems.filter(g => g.id !== gem.id);
            } else {
                chaosGems = chaosGems.filter(g => g.id !== gem.id);
            }
            renderGemLists();
            if (isAssigned) {
                calculate();
            }
        };

        gemEl.appendChild(deleteBtn);

        gemEl.addEventListener('click', () => {
            openGemEditPopup(gem);
        });

        return gemEl;
    };

    orderGems.forEach(gem => orderGemList.appendChild(createGemElement(gem)));
    chaosGems.forEach(gem => chaosGemList.appendChild(createGemElement(gem)));
}


function updateCoreTypeOptions(type) {
    const selectedValues = [];
    for (let i = 1; i <= 3; i++) {
        const wrapper = document.getElementById(`type-${type}-${i}`);
        if (wrapper.dataset.value !== 'none') {
            selectedValues.push(wrapper.dataset.value);
        }
    }

    for (let i = 1; i <= 3; i++) {
        const wrapper = document.getElementById(`type-${type}-${i}`);
        const currentValue = wrapper.dataset.value;
        const options = wrapper.querySelectorAll('.custom-option');
        options.forEach(option => {
            const optionValue = option.dataset.value;
            if (optionValue !== 'none' && optionValue !== currentValue) {
                if (selectedValues.includes(optionValue)) {
                    option.classList.add('disabled');
                } else {
                    option.classList.remove('disabled');
                }
            }
        });
    }
}


function calculate() {
    const ARKGRID_CORE_TYPES = getArkgridCoreTypes();
    const ARKGRID_GRADE_DATA = getArkgridGradeData();

    showSpinner(t('ui.calculating'));

    const activeCores = [];
    ['order', 'chaos'].forEach(type => {
        for (let i = 1; i <= 3; i++) {
            const slotId = `${type}-${i}`;
            const slotElement = document.getElementById(`slot-${slotId}`);
            slotElement.classList.remove('target-failed');
            clearSlotResults(slotId);

            const typeId = document.getElementById(`type-${slotId}`).dataset.value;
            const gradeId = document.getElementById(`grade-${slotId}`).dataset.value;
            const targetPointStr = document.getElementById(`target-${slotId}`).dataset.value;

            if (typeId !== 'none' && gradeId !== 'none' && targetPointStr !== 'none') {
                const coreTypeData = ARKGRID_CORE_TYPES[type].find(t => t.id === typeId);
                const coreGradeData = ARKGRID_GRADE_DATA[gradeId];

                let willpower = coreGradeData.willpower;

                activeCores.push({
                    id: slotId,
                    type: type,
                    coreTypeId: typeId,
                    coreData: {
                        name: `${coreTypeData.name} (${coreGradeData.name})`,
                        willpower: willpower,
                    },
                    targetPoint: parseInt(targetPointStr, 10),
                });
            }
        }
    });

    if (activeCores.length === 0) {
        hideSpinner();
        return;
    }

    const worker = new Worker('./arkgrid-worker-simple.js');

    worker.postMessage({
        activeCores,
        orderGems,
        chaosGems,
        ARKGRID_CORE_TYPES,
        ARKGRID_GRADE_DATA,
        CALCULATION_TIMEOUT: 5000 
    });

    worker.onmessage = function(e) {
        const { success, bestAssignment, timedOut, error, stack } = e.data;

        hideSpinner();

        assignedGemIds.clear();

        if (success) {
            if (timedOut) {
                showCustomAlert(t('messages.calculationTimeout'));
            }

            if (bestAssignment && bestAssignment.score >= 0) {
                activeCores.forEach(core => {
                    const result = bestAssignment.assignment[core.id];
                    if (result) {
                        result.gems.forEach(gem => {
                            assignedGemIds.set(gem.id, {
                                coreType: core.coreTypeId,
                                slotId: core.id,
                                gemType: core.type
                            });
                        });
                        renderResult(core.id, core.coreData, { ...result, achieved: result.achieved !== false });
                    } else {
                        renderResult(core.id, core.coreData, { achieved: false });
                    }
                });
            } else {
                 activeCores.forEach(core => {
                    renderResult(core.id, core.coreData, { achieved: false });
                });
            }

            renderGemLists();
        } else {
            console.error(t('messages.workerError') + ':', error, stack);
            showCustomAlert(`${t('messages.calculationError')}: ${error}`);
        }

        worker.terminate();
    };

    worker.onerror = function(e) {
        hideSpinner();
        console.error(`Worker error: ${e.message}`, e);
        showCustomAlert(`${t('messages.fatalWorkerError')}: ${e.message}`);
        worker.terminate();
    };
}

function showSpinner(text) {
    spinnerText.textContent = text;
    spinnerModal.style.display = 'flex';
}

function hideSpinner() {
    spinnerModal.style.display = 'none';
}

function renderResult(slotId, core, result) {
    const socketContainer = document.getElementById(`sockets-${slotId}`);
    const summaryEl = document.getElementById(`summary-${slotId}`);
    const slotElement = document.getElementById(`slot-${slotId}`);

    slotElement.classList.remove('target-failed');

    if (!result || (!result.achieved && (!result.gems || result.gems.length === 0))) {
        slotElement.classList.add('target-failed');
        summaryEl.textContent = t('messages.noOptimalFound');
        return;
    }

    if (!result.achieved) {
        slotElement.classList.add('target-failed');
    }

    result.gems.forEach((gem, index) => {
        if (socketContainer.children[index]) {
            const socket = socketContainer.children[index];
            const gemImage = GEM_IMAGES[gem.type];
            socket.innerHTML = `
                <div class="gem-socket-content">
                    <img src="${gemImage}" alt="${gem.type}" class="gem-socket-image">
                    <div class="gem-socket-stats">
                        <div>${t('ui.willpower')}: ${gem.willpower}</div>
                        <div>${t('ui.points')}: ${gem.point}</div>
                    </div>
                </div>
            `;
            socket.classList.add('gem-equipped');
        }
    });

    const achievedText = result.achieved === false ? ` ⚠ ${t('messages.showBestCase')}` : ` ✔ ${t('messages.fineCalculate')}`;
    summaryEl.innerHTML = `[${t('ui.willpower')}: ${result.willpower} / ${core.willpower}] [${t('ui.points')}: ${result.points}]${achievedText}`;
}



function getAllSaves() {
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_PREFIX)) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                saves.push({
                    key: key,
                    name: key.replace(STORAGE_PREFIX, ''),
                    savedAt: data.savedAt || null,
                    data: data
                });
            } catch (e) {
                console.error('Error parsing save:', key, e);
            }
        }
    }
    saves.sort((a, b) => {
        if (!a.savedAt) return 1;
        if (!b.savedAt) return -1;
        return new Date(b.savedAt) - new Date(a.savedAt);
    });
    return saves;
}

function openSaveModal() {
    saveNameInput.value = '';
    saveModal.style.display = 'flex';
    saveNameInput.focus();
}

function closeSaveModal() {
    saveModal.style.display = 'none';
}

function handleSave() {
    const saveName = saveNameInput.value.trim();
    if (!saveName) {
        showCustomAlert(t('messages.enterSaveName'));
        return;
    }

    const coreSlots = {};
    let isCoreDataEntered = false;
    ['order', 'chaos'].forEach(type => {
        for (let i = 1; i <= 3; i++) {
            const slotId = `${type}-${i}`;
            const typeId = document.getElementById(`type-${slotId}`).dataset.value || 'none';
            const gradeId = document.getElementById(`grade-${slotId}`).dataset.value || 'none';
            const targetPoint = document.getElementById(`target-${slotId}`).dataset.value || 'none';
            if (typeId !== 'none' || gradeId !== 'none' || targetPoint !== 'none') {
                isCoreDataEntered = true;
            }
            coreSlots[slotId] = { type: typeId, grade: gradeId, target: targetPoint };
        }
    });

    const isGemDataEntered = orderGems.length > 0 || chaosGems.length > 0;

    if (!isCoreDataEntered && !isGemDataEntered) {
        showCustomAlert(t('messages.noDataToSave'));
        return;
    }

    const arkgridConfig = {
        orderGems: orderGems,
        chaosGems: chaosGems,
        coreSlots: coreSlots,
        savedAt: new Date().toISOString(),
        version: '1.0'
    };

    try {
        const storageKey = STORAGE_PREFIX + saveName;
        const existingData = localStorage.getItem(storageKey);

        localStorage.setItem(storageKey, JSON.stringify(arkgridConfig));
        closeSaveModal();

        if (existingData) {
            showCustomAlert(t('messages.saveOverwrite'));
        } else {
            showCustomAlert(t('messages.saveSuccess'));
        }
    } catch (error) {
        console.error('Save error:', error);
        showCustomAlert(`${t('messages.saveFailed')}: ${error.message}`);
    }
}

function openLoadModal() {
    const saves = getAllSaves();
    savesList.innerHTML = '';

    if (saves.length === 0) {
        noSavesMessage.style.display = 'block';
    } else {
        noSavesMessage.style.display = 'none';
        saves.forEach(save => {
            const saveItem = document.createElement('div');
            saveItem.className = 'save-item';

            const dateStr = save.savedAt
                ? new Date(save.savedAt).toLocaleString()
                : t('messages.unknownDate');

            saveItem.innerHTML = `
                <div class="save-item-info">
                    <span class="save-item-name">${save.name}</span>
                    <span class="save-item-date">${dateStr}</span>
                </div>
            `;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'save-item-delete';
            deleteBtn.innerHTML = '×';
            deleteBtn.title = t('ui.delete');
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteSave(save.key);
            };

            saveItem.appendChild(deleteBtn);

            saveItem.addEventListener('click', () => {
                loadSave(save.key);
            });

            savesList.appendChild(saveItem);
        });
    }

    loadModal.style.display = 'flex';
}

function closeLoadModal() {
    loadModal.style.display = 'none';
}

function loadSave(storageKey) {
    try {
        const dataStr = localStorage.getItem(storageKey);
        if (!dataStr) {
            showCustomAlert(t('messages.saveNotFound'));
            return;
        }

        const config = JSON.parse(dataStr);
        closeLoadModal();
        showSpinner(t('ui.loading'));
        setTimeout(() => {
            restoreState(config);
        }, 50);

    } catch (error) {
        console.error('Load error:', error);
        showCustomAlert(`${t('messages.loadFailed')}: ${error.message}`);
    }
}

function deleteSave(storageKey) {
    try {
        localStorage.removeItem(storageKey);
        openLoadModal(); 
    } catch (error) {
        console.error('Delete error:', error);
        showCustomAlert(`${t('messages.deleteFailed')}: ${error.message}`);
    }
}

function restoreState(config) {
    orderGems = config.orderGems || [];
    chaosGems = config.chaosGems || [];

    const maxOrderId = orderGems.reduce((max, gem) => Math.max(max, gem.id), -1);
    const maxChaosId = chaosGems.reduce((max, gem) => Math.max(max, gem.id), -1);
    nextGemId = Math.max(maxOrderId, maxChaosId) + 1;

    renderGemLists();

    if (config.coreSlots) {
        Object.keys(config.coreSlots).forEach(slotId => {
            const slotConfig = config.coreSlots[slotId];

            const selectDropdownOption = (dropdownId, valueToSelect) => {
                if (!valueToSelect || valueToSelect === 'none') {
                    const wrapper = document.getElementById(dropdownId);
                    if (!wrapper) return;
                    const defaultOption = wrapper.querySelector('.custom-option[data-value="none"]');
                    if(defaultOption) {
                        defaultOption.click();
                    }
                    return;
                };
                const wrapper = document.getElementById(dropdownId);
                if (!wrapper) return;
                const option = wrapper.querySelector(`.custom-option[data-value="${valueToSelect}"]`);
                if (option) {
                    option.click();
                }
            };

            selectDropdownOption(`type-${slotId}`, slotConfig.type);
            selectDropdownOption(`grade-${slotId}`, slotConfig.grade);
            selectDropdownOption(`target-${slotId}`, slotConfig.target);
        });
    }

    calculate();
}


let currentOCRImage = null;

// Нарезает бинаризованное изображение на горизонтальные строки
// Возвращает массив data URL, каждый - одна строка текста
function sliceIntoRows(imageDataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imgData.data;
            const width = canvas.width;
            const height = canvas.height;

            const rowWhiteCount = [];
            for (let y = 0; y < height; y++) {
                let count = 0;
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    if (pixels[idx] > 200) count++;
                }
                rowWhiteCount.push(count);
            }

            const minWhite = 2;
            const rowImages = [];
            let inRow = false;
            let rowStart = 0;

            for (let y = 0; y < height; y++) {
                const hasContent = rowWhiteCount[y] >= minWhite;

                if (!inRow && hasContent) {
                    inRow = true;
                    rowStart = y;
                } else if (inRow && !hasContent) {
                    inRow = false;
                    const rowHeight = y - rowStart;

                    if (rowHeight > 10) {
                        const rowCanvas = document.createElement('canvas');
                        const padding = 4;
                        rowCanvas.width = width;
                        rowCanvas.height = rowHeight + padding * 2;
                        const rowCtx = rowCanvas.getContext('2d');
                        rowCtx.fillStyle = 'black';
                        rowCtx.fillRect(0, 0, rowCanvas.width, rowCanvas.height);
                        rowCtx.drawImage(canvas, 0, rowStart, width, rowHeight, 0, padding, width, rowHeight);
                        rowImages.push(rowCanvas.toDataURL());
                    }
                }
            }

            if (inRow) {
                const rowHeight = height - rowStart;
                if (rowHeight > 10) {
                    const rowCanvas = document.createElement('canvas');
                    const padding = 4;
                    rowCanvas.width = width;
                    rowCanvas.height = rowHeight + padding * 2;
                    const rowCtx = rowCanvas.getContext('2d');
                    rowCtx.fillStyle = 'black';
                    rowCtx.fillRect(0, 0, rowCanvas.width, rowCanvas.height);
                    rowCtx.drawImage(canvas, 0, rowStart, width, rowHeight, 0, padding, width, rowHeight);
                    rowImages.push(rowCanvas.toDataURL());
                }
            }

            console.log(`sliceIntoRows: найдено ${rowImages.length} строк`);
            resolve(rowImages);
        };
        img.src = imageDataUrl;
    });
}

// Препроцессинг изображения для улучшения OCR
function preprocessImage(imageData) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            // Создаём canvas с увеличенным размером (upscaling в 3 раза для лучшего качества)
            const canvas = document.createElement('canvas');
            const scale = 3;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');

            // Отрисовываем увеличенное изображение с сглаживанием
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Получаем пиксели
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Конвертируем в градации серого 
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const gray = 0.299 * r + 0.587 * g + 0.114 * b;

                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }

            ctx.putImageData(imgData, 0, 0);

            const finalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const finalPixels = finalData.data;

            // Подбираем порог - для жёлтого текста на тёмном фоне нужен низкий порог
            const threshold = 100;

            for (let i = 0; i < finalPixels.length; i += 4) {
                const brightness = finalPixels[i];
                const value = brightness > threshold ? 255 : 0;

                finalPixels[i] = value;
                finalPixels[i + 1] = value;
                finalPixels[i + 2] = value;
            }

            ctx.putImageData(finalData, 0, 0);

            resolve(canvas.toDataURL());
        };
        img.src = imageData;
    });
}


function openOCRModal() {
    document.getElementById('ocr-modal').style.display = 'flex';
    resetOCRModal();

    enableClipboardPaste();
}

function enableClipboardPaste() {
    const pasteHandler = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = items[i].getAsFile();
                if (blob) {
                    handleOCRFile(blob);
                }
                break;
            }
        }
    };

    document.addEventListener('paste', pasteHandler);

    if (!window.ocrPasteHandler) {
        window.ocrPasteHandler = pasteHandler;
    }
}

function closeOCRModal() {
    document.getElementById('ocr-modal').style.display = 'none';
    resetOCRModal();

    if (window.ocrPasteHandler) {
        document.removeEventListener('paste', window.ocrPasteHandler);
        window.ocrPasteHandler = null;
    }
}

function resetOCRModal() {
    currentOCRImage = null;
    document.getElementById('ocr-file-input').value = '';
    document.getElementById('ocr-preview').style.display = 'none';
    document.getElementById('ocr-progress').style.display = 'none';
    document.getElementById('ocr-process-btn').style.display = 'none';
    document.querySelector('.ocr-upload-placeholder').style.display = 'block';
    document.getElementById('ocr-progress-fill').style.width = '0%';
}

function handleOCRFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleOCRFile(file);
    }
}

function handleOCRFile(file) {
    if (!file.type.startsWith('image/')) {
        showCustomAlert('Пожалуйста, выберите файл изображения (PNG, JPG, JPEG)');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        currentOCRImage = e.target.result;
        const preview = document.getElementById('ocr-preview');
        preview.src = currentOCRImage;
        preview.style.display = 'block';
        document.querySelector('.ocr-upload-placeholder').style.display = 'none';
        document.getElementById('ocr-process-btn').style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
}

async function processOCRImage() {
    if (!currentOCRImage) {
        showCustomAlert('Пожалуйста, сначала загрузите изображение');
        return;
    }

    document.getElementById('ocr-process-btn').style.display = 'none';
    document.getElementById('ocr-progress').style.display = 'block';

    try {
        const statusText = document.getElementById('ocr-status-text');
        const progressFill = document.getElementById('ocr-progress-fill');

        statusText.textContent = 'Инициализация OCR...';
        progressFill.style.width = '10%';

        const worker = await Tesseract.createWorker('rus', 1, {
            workerPath: '../js/tesseract/worker.min.js',
            langPath: '../js/tesseract/lang-data',
            corePath: '../js/tesseract/tesseract-core.wasm.js',
            gzip: false,
            logger: m => {
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 70) + 20;
                    progressFill.style.width = `${progress}%`;
                    statusText.textContent = `Распознавание текста: ${Math.round(m.progress * 100)}%`;
                }
            }
        });

        // Настраиваем параметры Tesseract для построчного распознавания
        await worker.setParameters({
            tessedit_char_whitelist: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789.| ',
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
        });

        statusText.textContent = 'Обработка изображения...';
        progressFill.style.width = '20%';

        // Применяем препроцессинг к изображению
        const preprocessedImage = await preprocessImage(currentOCRImage);

        // Нарезаем изображение на строки и распознаём каждую отдельно
        const rowImages = await sliceIntoRows(preprocessedImage);
        console.log(`=== Найдено строк: ${rowImages.length} ===`);

        const lines = [];
        for (let i = 0; i < rowImages.length; i++) {
            const progress = Math.round((i / rowImages.length) * 70) + 20;
            progressFill.style.width = `${progress}%`;
            statusText.textContent = `Распознавание строки ${i + 1} из ${rowImages.length}...`;

            const { data: { text: lineText } } = await worker.recognize(rowImages[i]);
            const cleaned = lineText.trim().replace(/\n/g, ' ').trim();
            if (cleaned.length > 0) {
                lines.push(cleaned);
                console.log(`Строка ${i}: "${cleaned}"`);
            }
        }

        const text = lines.join('\n');

        statusText.textContent = 'Анализ результатов...';
        progressFill.style.width = '90%';

        const currentTabType = document.querySelector('.tab-switcher .tab-button.active').getAttribute('data-tab');
        console.log('OCR recognized text:', text);
        console.log('Current tab type:', currentTabType);

        const parsedGems = parseOCRTextSimple(text, currentTabType);

        statusText.textContent = 'Добавление рунитов...';
        progressFill.style.width = '95%';

        if (parsedGems.length > 0) {
            parsedGems.forEach(gem => {
                if (gem.type === 'order') {
                    orderGems.push(gem);
                } else {
                    chaosGems.push(gem);
                }
            });

            renderGemLists();

            statusText.textContent = 'Готово!';
            progressFill.style.width = '100%';

            await worker.terminate();

            setTimeout(() => {
                closeOCRModal();
                showCustomAlert(`Успешно распознано и добавлено: ${parsedGems.length} ${parsedGems.length === 1 ? 'рунит' : parsedGems.length < 5 ? 'рунита' : 'рунитов'}`);
            }, 500);
        } else {
            await worker.terminate();
            statusText.textContent = 'Не удалось распознать руниты';
            progressFill.style.width = '100%';

            setTimeout(() => {
                showCustomAlert('Не удалось распознать руниты на изображении. Попробуйте другой скриншот или проверьте качество изображения.');
                closeOCRModal();
            }, 1000);
        }

    } catch (error) {
        console.error('OCR Error:', error);
        showCustomAlert('Произошла ошибка при распознавании изображения. Попробуйте снова.');
        closeOCRModal();
    }
}

function parseOCRTextSimple(text, defaultType = 'order') {
    const gems = [];

    // Предобработка текста: заменяем | на 1 в конце строк (частая ошибка OCR)
    text = text.replace(/\|\s*$/gm, '1');
    text = text.replace(/\s+\|\s*(\d)/g, ' 1');

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log('=== PARSING OCR TEXT (SIMPLE) ===');
    console.log('Default type:', defaultType);
    console.log('Total lines:', lines.length);

    const numbers = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        console.log(`Line ${i}: "${line}"`);

        if (/порядок|order|хаос|chaos/i.test(line)) {
            console.log('  -> Skipping type line');
            continue;
        }

        const lineNoSpaces = line.replace(/\s+/g, '');
        console.log(`  -> Line without spaces: "${lineNoSpaces}"`);

        let firstChar = lineNoSpaces[0];

        // Маппинг частых ошибок OCR для первого символа (цифры)
        const digitMapping = {
            'Е': '3',
            'E': '3',
            'Э': '5',
            'з': '3',  // маленькая з похожа на 3
            'З': '3',  // большая З похожа на 3
            'В': '5',  // В похоже на 5
            'Б': '6',  // Б похоже на 6
            'О': '0',  // О - это ноль
            'о': '0',  // маленькая о - это ноль
            'I': '1',  // I похоже на 1
            'l': '1',  // l похоже на 1
            'А': '4',  // А похоже на 4
            'а': '4',  // маленькая а похожа на 4
            'К': '3',  // К иногда распознаётся вместо 3
            'М': '3',  // М иногда вместо 3
            'Г': '6',  // Иногда и такое бывает да
            'Ь': '3',  // бред какой-то
        };

        if (digitMapping[firstChar]) {
            console.log(`  -> Fixed: Replaced "${firstChar}" with "${digitMapping[firstChar]}"`);
            firstChar = digitMapping[firstChar];
        }

        if (firstChar && /\d/.test(firstChar)) {
            const number = parseInt(firstChar);
            numbers.push(number);
            console.log(`  -> Extracted digit: ${number}`);
        } else {
            console.log(`  -> No digit found (char: "${firstChar}"), skipping`);
        }
    }

    console.log('Extracted numbers:', numbers);

    for (let i = 0; i < numbers.length - 1; i += 2) {
        const willpower = numbers[i];
        const points = numbers[i + 1];

        const gem = {
            id: nextGemId++,
            type: defaultType,
            willpower: willpower,
            point: points
        };

        gems.push(gem);
        console.log(`Created gem: W=${willpower}, P=${points}`);
    }

    console.log('=== PARSING COMPLETE ===');
    console.log('Total gems parsed:', gems.length);

    return gems;
}

function showCustomAlert(message) {
    alertModalMessage.textContent = message;
    alertModal.style.display = 'flex';
}

function closeCustomAlert() {
    alertModal.style.display = 'none';
}

function openGemEditPopup(gem) {
    currentlyEditingGem = gem;
    gemEditForm.innerHTML = `
        <div class="gem-edit-row">
            <label for="edit-willpower">${t('ui.willpower')}:</label>
            <input type="number" id="edit-willpower" value="${gem.willpower}" min="3" max="7">
        </div>
        <div class="gem-edit-row">
            <label for="edit-point">${t('ui.points')}:</label>
            <input type="number" id="edit-point" value="${gem.point}" min="1" max="5">
        </div>
    `;
    gemEditModal.style.display = 'flex';
}

function closeGemEditPopup() {
    gemEditModal.style.display = 'none';
    currentlyEditingGem = null;
    gemEditForm.innerHTML = '';
}

function saveGemEdit() {
    if (!currentlyEditingGem) return;

    const newWillpower = parseInt(document.getElementById('edit-willpower').value, 10);
    const newPoint = parseInt(document.getElementById('edit-point').value, 10);

    if (isNaN(newWillpower) || isNaN(newPoint) || newWillpower < 3 || newWillpower > 7 || newPoint < 1 || newPoint > 5) {
        showCustomAlert(t('messages.enterAllGemInfo'));
        return;
    }

    const gemToUpdate = orderGems.find(g => g.id === currentlyEditingGem.id) || chaosGems.find(g => g.id === currentlyEditingGem.id);

    if (gemToUpdate) {
        const wasAssigned = assignedGemIds.has(gemToUpdate.id);

        gemToUpdate.willpower = newWillpower;
        gemToUpdate.point = newPoint;

        closeGemEditPopup();
        renderGemLists();

        if (wasAssigned) {
            calculate();
        }
    } else {
        closeGemEditPopup();
        renderGemLists();
    }
}

function openExportModal() {
    const saves = getAllSaves();
    const exportSavesList = document.getElementById('export-saves-list');
    const exportNoSavesMessage = document.getElementById('export-no-saves-message');
    const exportModal = document.getElementById('export-modal');

    exportSavesList.innerHTML = '';

    if (saves.length === 0) {
        exportNoSavesMessage.style.display = 'block';
    } else {
        exportNoSavesMessage.style.display = 'none';
        saves.forEach(save => {
            const saveItem = document.createElement('div');
            saveItem.className = 'save-item export-save-item';

            const dateStr = save.savedAt
                ? new Date(save.savedAt).toLocaleString('ru-RU')
                : 'Дата неизвестна';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'export-checkbox';
            checkbox.dataset.saveKey = save.key;
            checkbox.id = `export-${save.key}`;

            const label = document.createElement('label');
            label.htmlFor = `export-${save.key}`;
            label.className = 'save-item-info';
            label.innerHTML = `
                <span class="save-item-name">${save.name}</span>
                <span class="save-item-date">${dateStr}</span>
            `;

            saveItem.appendChild(checkbox);
            saveItem.appendChild(label);
            exportSavesList.appendChild(saveItem);
        });
    }

    exportModal.style.display = 'flex';
}

function closeExportModal() {
    document.getElementById('export-modal').style.display = 'none';
}

function exportSelectedSavesToFile() {
    const checkboxes = document.querySelectorAll('.export-checkbox:checked');

    if (checkboxes.length === 0) {
        showCustomAlert('Выберите хотя бы одну конфигурацию для экспорта');
        return;
    }

    const selectedSaves = {};
    checkboxes.forEach(checkbox => {
        const key = checkbox.dataset.saveKey;
        try {
            const data = JSON.parse(localStorage.getItem(key));
            selectedSaves[key] = data;
        } catch (e) {
            console.error('Error parsing save:', key, e);
        }
    });

    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        saves: selectedSaves
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arkgrid-saves-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    closeExportModal();
    showCustomAlert(`Успешно экспортировано: ${checkboxes.length} ${checkboxes.length === 1 ? 'конфигурация' : checkboxes.length < 5 ? 'конфигурации' : 'конфигураций'}`);
}

function importSavesFromFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);

            if (!importData.saves || typeof importData.saves !== 'object') {
                showCustomAlert('Неверный формат файла. Пожалуйста, выберите корректный файл экспорта.');
                return;
            }

            let importedCount = 0;
            let skippedCount = 0;

            for (const [key, data] of Object.entries(importData.saves)) {
                if (key.startsWith(STORAGE_PREFIX)) {
                    const existing = localStorage.getItem(key);
                    if (existing) {
                        skippedCount++;
                        continue;
                    }

                    localStorage.setItem(key, JSON.stringify(data));
                    importedCount++;
                }
            }

            if (loadModal.style.display === 'flex') {
                openLoadModal();
            }

            let message = `Успешно импортировано: ${importedCount} ${importedCount === 1 ? 'конфигурация' : importedCount < 5 ? 'конфигурации' : 'конфигураций'}`;
            if (skippedCount > 0) {
                message += `\nПропущено (уже существуют): ${skippedCount} ${skippedCount === 1 ? 'конфигурация' : skippedCount < 5 ? 'конфигурации' : 'конфигураций'}`;
            }
            showCustomAlert(message);

        } catch (e) {
            console.error('Import error:', e);
            showCustomAlert('Ошибка при импорте файла. Проверьте формат файла и попробуйте снова.');
        }
    };

    reader.readAsText(file);
}

document.getElementById('export-btn').addEventListener('click', openExportModal);

document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
});

document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        importSavesFromFile(file);
        e.target.value = '';
    }
});

document.getElementById('export-modal-confirm-btn').addEventListener('click', exportSelectedSavesToFile);
document.getElementById('export-modal-cancel-btn').addEventListener('click', closeExportModal);
document.getElementById('export-modal').addEventListener('click', (e) => {
    if (e.target.id === 'export-modal') closeExportModal();
});

document.getElementById('export-select-all-checkbox').addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.export-checkbox');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
});
