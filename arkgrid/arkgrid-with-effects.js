// ============================================
// локализация
// ============================================
const L = window.LOCALE || {};

function t(path) {
    const keys = path.split('.');
    let value = L;
    for (const key of keys) {
        value = value?.[key];
        if (!value) return path;
    }
    return value;
}

const GEM_NAME_KEYS = {
    order: ['stable', 'solid', 'immutable'],
    chaos: ['erosion', 'distortion', 'collapse']
};

const SUB_OPTION_KEYS = ['attack', 'additionalDamage', 'bossDamage', 'brandPower', 'allyDamageBoost', 'allyAttackBoost'];

const CLASS_KEYS = ['dealer', 'support'];

function getLocalizedGemName(internalKey) {
    return t(`gems.${internalKey}`);
}

function getLocalizedSubOption(internalKey) {
    return t(`subOptions.${internalKey}`);
}

function getLocalizedClass(internalKey) {
    return t(`classes.${internalKey}`);
}

function getInternalGemNameKey(localizedName, gemType) {
    const keys = GEM_NAME_KEYS[gemType] || [];
    for (const key of keys) {
        if (t(`gems.${key}`) === localizedName) {
            return key;
        }
    }
    if (keys.includes(localizedName)) {
        return localizedName;
    }
    return localizedName;
}

function getInternalSubOptionKey(localizedName) {
    for (const key of SUB_OPTION_KEYS) {
        if (t(`subOptions.${key}`) === localizedName) {
            return key;
        }
    }
    if (SUB_OPTION_KEYS.includes(localizedName)) {
        return localizedName;
    }
    return localizedName;
}

function getInternalClassKey(localizedName) {
    for (const key of CLASS_KEYS) {
        if (t(`classes.${key}`) === localizedName) {
            return key;
        }
    }
    if (CLASS_KEYS.includes(localizedName)) {
        return localizedName;
    }
    return localizedName;
}

function gemToStorageFormat(gem) {
    return {
        ...gem,
        name: getInternalGemNameKey(gem.name, gem.type),
        subOption1: getInternalSubOptionKey(gem.subOption1),
        subOption2: getInternalSubOptionKey(gem.subOption2)
    };
}

function gemFromStorageFormat(gem) {
    const isWithoutEffects = !gem.name && !gem.subOption1 && !gem.subOption2;

    return {
        ...gem,
        name: gem.name ? getLocalizedGemName(gem.name) : '',
        subOption1: gem.subOption1 ? getLocalizedSubOption(gem.subOption1) : '',
        subOption1Level: gem.subOption1Level || 0,
        subOption2: gem.subOption2 ? getLocalizedSubOption(gem.subOption2) : '',
        subOption2Level: gem.subOption2Level || 0,
        isWithoutEffects: isWithoutEffects
    };
}

function configToStorageFormat(config) {
    return {
        ...config,
        orderGems: config.orderGems.map(gemToStorageFormat),
        chaosGems: config.chaosGems.map(gemToStorageFormat),
        characterClass: getInternalClassKey(config.characterClass)
    };
}

function configFromStorageFormat(config) {
    return {
        ...config,
        orderGems: (config.orderGems || []).map(gemFromStorageFormat),
        chaosGems: (config.chaosGems || []).map(gemFromStorageFormat),
        characterClass: config.characterClass ? getLocalizedClass(config.characterClass) : t('classes.dealer')
    };
}


function initializeTabs() {
    const tabSwitcherButtons = document.querySelectorAll('.tab-switcher .tab-button');

    tabSwitcherButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');

            tabSwitcherButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Переключить секции списка рунитов
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

/**
 * Переменная `GEM_IMAGES` хранит URL изображений рунитов (Порядка и Хаоса), используемых в игре.
 */
const GEM_IMAGES = {
    order: {
        'Обет': 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_202.png',
        'Закон': 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_203.png',
        'Истина': 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_204.png',
        // Запасной вариант для общего типа (используется в выпадающих списках)
        default: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_202.png'
    },
    chaos: {
        'Ропот': 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_205.png',
        'Раздор': 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_206.png',
        'Крах': 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_207.png',
        // Запасной вариант для общего типа (используется в выпадающих списках)
        default: 'https://static.monopoly.la.gmru.net/efui_iconatlas/use/use_13_205.png'
    }
};

function getGemImage(type, name = null) {
    if (!name) {
        return GEM_IMAGES[type]?.default || '';
    }

    const internalKeyMap = {
        order: {
            'stable': t('gems.stable'),
            'solid': t('gems.solid'),
            'immutable': t('gems.immutable')
        },
        chaos: {
            'erosion': t('gems.erosion'),
            'distortion': t('gems.distortion'),
            'collapse': t('gems.collapse')
        }
    };

    let localizedName = name;
    if (internalKeyMap[type]?.[name]) {
        localizedName = internalKeyMap[type][name];
    }

    return GEM_IMAGES[type]?.[localizedName] || GEM_IMAGES[type]?.default || '';
}

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

function getArkgridGradeData() {
    return {
        heroic: {name: t('grades.heroic'), willpower: 9, activationPoints: [10]},
        legendary: {name: t('grades.legendary'), willpower: 12, activationPoints: [10, 14]},
        relic: {name: t('grades.relic'), willpower: 15, activationPoints: [10, 14, 17, 18, 19, 20]},
        ancient: {name: t('grades.ancient'), willpower: 17, activationPoints: [10, 14, 17, 18, 19, 20]}
    };
}

const GRADE_COLORS = {
    "heroic": "#ba00f9",
    "legendary": "#f99200",
    "relic": "#fa5d00",
    "ancient": "#B3956C",
};

function getGemData() {
    return {
        order: {
            [t('gems.stable')]: { name: t('gems.stable'), willpower: [3, 4, 5, 6, 7], gemPoints: [1, 2, 3, 4, 5], subOptions: [t('subOptions.attack'), t('subOptions.additionalDamage'), t('subOptions.brandPower'), t('subOptions.allyDamageBoost')] },
            [t('gems.solid')]: { name: t('gems.solid'), willpower: [4, 5, 6, 7, 8], gemPoints: [1, 2, 3, 4, 5], subOptions: [t('subOptions.attack'), t('subOptions.bossDamage'), t('subOptions.allyDamageBoost'), t('subOptions.allyAttackBoost')] },
            [t('gems.immutable')]: { name: t('gems.immutable'), willpower: [5, 6, 7, 8, 9], gemPoints: [1, 2, 3, 4, 5], subOptions: [t('subOptions.additionalDamage'), t('subOptions.bossDamage'), t('subOptions.allyAttackBoost'), t('subOptions.brandPower')] }
        },
        chaos: {
            [t('gems.erosion')]: { name: t('gems.erosion'), willpower: [3, 4, 5, 6, 7], gemPoints: [1, 2, 3, 4, 5], subOptions: [t('subOptions.attack'), t('subOptions.additionalDamage'), t('subOptions.brandPower'), t('subOptions.allyDamageBoost')] },
            [t('gems.distortion')]: { name: t('gems.distortion'), willpower: [4, 5, 6, 7, 8], gemPoints: [1, 2, 3, 4, 5], subOptions: [t('subOptions.attack'), t('subOptions.bossDamage'), t('subOptions.allyDamageBoost'), t('subOptions.allyAttackBoost')] },
            [t('gems.collapse')]: { name: t('gems.collapse'), willpower: [5, 6, 7, 8, 9], gemPoints: [1, 2, 3, 4, 5], subOptions: [t('subOptions.additionalDamage'), t('subOptions.bossDamage'), t('subOptions.allyAttackBoost'), t('subOptions.brandPower')] }
        }
    };
}

function detectGemNameByWillpowerAndEffects(type, willpower, effect1, effect2) {
    const normalizeEffect = (effect) => {
        if (!effect) return '';
        return effect.replace('subOptions.', '');
    };

    const eff1 = normalizeEffect(effect1);
    const eff2 = normalizeEffect(effect2);
    const effects = [eff1, eff2].filter(e => e).sort(); 

    console.log(`[detectGemName] Type: ${type}, Willpower: ${willpower}, Effects: [${effects.join(', ')}]`);

    // Уникальные значения заряда для каждого типа рунита
    // Обет/Ропот: 3 (уникальный минимум)
    // Закон/Раздор: 4-8
    // Истина/Крах: 9 (уникальный максимум)

    // Определение по уникальному заряду
    if (willpower === 3) {
        // Это Обет (order) или Ропот (chaos)
        return type === 'order' ? t('gems.stable') : t('gems.erosion');
    }
    if (willpower === 9) {
        // Это Истина (order) или Крах (chaos)
        return type === 'order' ? t('gems.immutable') : t('gems.collapse');
    }

    // Заряд 4-8: определяем по комбинации эффектов
    // Возможные эффекты (внутренние ключи):
    // Обет/Ропот: ['attack', 'additionalDamage', 'brandPower', 'allyDamageBoost']
    // Закон/Раздор: ['attack', 'bossDamage', 'allyDamageBoost', 'allyAttackBoost']
    // Истина/Крах: ['additionalDamage', 'bossDamage', 'allyAttackBoost', 'brandPower']

    const gemTypeEffects = {
        order: {
            stable: ['attack', 'additionalDamage', 'brandPower', 'allyDamageBoost'],
            solid: ['attack', 'bossDamage', 'allyDamageBoost', 'allyAttackBoost'],
            immutable: ['additionalDamage', 'bossDamage', 'allyAttackBoost', 'brandPower']
        },
        chaos: {
            erosion: ['attack', 'additionalDamage', 'brandPower', 'allyDamageBoost'],
            distortion: ['attack', 'bossDamage', 'allyDamageBoost', 'allyAttackBoost'],
            collapse: ['additionalDamage', 'bossDamage', 'allyAttackBoost', 'brandPower']
        }
    };

    // Проверка возможных комбинаций эффектов для каждого типа
    const typeData = gemTypeEffects[type];
    if (!typeData) return null;

    // Проверка доступности обоих эффектов для данного типа рунита
    const bothEffectsAvailable = (gemType, effects) => {
        const availableEffects = typeData[gemType];
        if (!availableEffects) return false;
        return effects.every(eff => availableEffects.includes(eff));
    };

    // Уникальные комбинации эффектов:
    // Обет/Ропот (stable/erosion): attack, additionalDamage, brandPower, allyDamageBoost
    //   Уникальные пары: attack+additionalDamage, attack+brandPower, additionalDamage+allyDamageBoost, brandPower+allyDamageBoost
    // Закон/Раздор (solid/distortion): attack, bossDamage, allyDamageBoost, allyAttackBoost
    //   Уникальные пары: attack+bossDamage, attack+allyAttackBoost, bossDamage+allyDamageBoost, bossDamage+allyAttackBoost, allyDamageBoost+allyAttackBoost
    // Истина/Крах (immutable/collapse): additionalDamage, bossDamage, allyAttackBoost, brandPower
    //   Уникальные пары: additionalDamage+bossDamage, additionalDamage+allyAttackBoost, bossDamage+brandPower, allyAttackBoost+brandPower

    const hasEffect = (eff) => effects.includes(eff);

    // Уникальные комбинации для Обет/Ропот
    if (hasEffect('attack') && hasEffect('additionalDamage')) {
        return type === 'order' ? t('gems.stable') : t('gems.erosion');
    }
    if (hasEffect('attack') && hasEffect('brandPower')) {
        return type === 'order' ? t('gems.stable') : t('gems.erosion');
    }
    if (hasEffect('additionalDamage') && hasEffect('allyDamageBoost')) {
        return type === 'order' ? t('gems.stable') : t('gems.erosion');
    }
    if (hasEffect('brandPower') && hasEffect('allyDamageBoost')) {
        return type === 'order' ? t('gems.stable') : t('gems.erosion');
    }

    // Уникальные комбинации для Закон/Раздор
    if (hasEffect('attack') && hasEffect('bossDamage')) {
        return type === 'order' ? t('gems.solid') : t('gems.distortion');
    }
    if (hasEffect('attack') && hasEffect('allyAttackBoost')) {
        return type === 'order' ? t('gems.solid') : t('gems.distortion');
    }
    if (hasEffect('bossDamage') && hasEffect('allyDamageBoost')) {
        return type === 'order' ? t('gems.solid') : t('gems.distortion');
    }
    if (hasEffect('bossDamage') && hasEffect('allyAttackBoost')) {
        return type === 'order' ? t('gems.solid') : t('gems.distortion');
    }
    if (hasEffect('allyDamageBoost') && hasEffect('allyAttackBoost')) {
        return type === 'order' ? t('gems.solid') : t('gems.distortion');
    }

    // Уникальные комбинации для Истина/Крах
    if (hasEffect('additionalDamage') && hasEffect('bossDamage')) {
        return type === 'order' ? t('gems.immutable') : t('gems.collapse');
    }
    if (hasEffect('additionalDamage') && hasEffect('allyAttackBoost')) {
        return type === 'order' ? t('gems.immutable') : t('gems.collapse');
    }
    if (hasEffect('bossDamage') && hasEffect('brandPower')) {
        return type === 'order' ? t('gems.immutable') : t('gems.collapse');
    }
    if (hasEffect('allyAttackBoost') && hasEffect('brandPower')) {
        return type === 'order' ? t('gems.immutable') : t('gems.collapse');
    }

    // Если не удалось определить, пробуем по диапазону заряда
    // Обет/Ропот: 3-7, Закон/Раздор: 4-8, Истина/Крах: 5-9
    if (willpower >= 3 && willpower <= 7) {
        // Может быть Обет/Ропот или Закон/Раздор
        if (willpower === 3) return type === 'order' ? t('gems.stable') : t('gems.erosion');
        // Проверка по эффектам (используем только ключи соответствующего типа)
        const firstKey = type === 'order' ? 'stable' : 'erosion';
        const secondKey = type === 'order' ? 'solid' : 'distortion';

        if (bothEffectsAvailable(firstKey, effects)) {
            return type === 'order' ? t('gems.stable') : t('gems.erosion');
        }
        if (bothEffectsAvailable(secondKey, effects)) {
            return type === 'order' ? t('gems.solid') : t('gems.distortion');
        }
    }

    if (willpower >= 5 && willpower <= 9) {
        // Может быть Закон/Раздор или Истина/Крах
        if (willpower === 9) return type === 'order' ? t('gems.immutable') : t('gems.collapse');
        // Проверка по эффектам (используем только ключи соответствующего типа)
        const firstKey = type === 'order' ? 'immutable' : 'collapse';
        const secondKey = type === 'order' ? 'solid' : 'distortion';

        if (bothEffectsAvailable(firstKey, effects)) {
            return type === 'order' ? t('gems.immutable') : t('gems.collapse');
        }
        if (bothEffectsAvailable(secondKey, effects)) {
            return type === 'order' ? t('gems.solid') : t('gems.distortion');
        }
    }

    // По умолчанию: возвращаем первый вариант по типу
    console.log(`[detectGemName] Could not determine specific gem name, using default`);
    return type === 'order' ? t('gems.stable') : t('gems.erosion');
}

function getSubOptionData() {
    return {
        [t('subOptions.attack')]: [0.00029, 0.00067, 0.00105, 0.00134, 0.00172],
        [t('subOptions.additionalDamage')]: [0.00060, 0.00119, 0.00187, 0.00239, 0.00299],
        [t('subOptions.bossDamage')]: [0.00078, 0.00156, 0.00244, 0.00313, 0.00391],
        [t('subOptions.allyDamageBoost')]: [0.00029, 0.00067, 0.00105, 0.00134, 0.00172],
        [t('subOptions.brandPower')]: [0.00060, 0.00119, 0.00187, 0.00239, 0.00299],
        [t('subOptions.allyAttackBoost')]: [0.00078, 0.00156, 0.00244, 0.00313, 0.00391]
    };
}

function getClassEffectiveOptions() {
    return {
        [t('classes.dealer')]: [t('subOptions.attack'), t('subOptions.additionalDamage'), t('subOptions.bossDamage')],
        [t('classes.support')]: [t('subOptions.brandPower'), t('subOptions.allyDamageBoost'), t('subOptions.allyAttackBoost')]
    };
}


function getSubOptionDataInternal() {
    return {
        'attack': [0.00029, 0.00067, 0.00105, 0.00134, 0.00172],
        'additionalDamage': [0.00060, 0.00119, 0.00187, 0.00239, 0.00299],
        'bossDamage': [0.00078, 0.00156, 0.00244, 0.00313, 0.00391],
        'allyDamageBoost': [0.00029, 0.00067, 0.00105, 0.00134, 0.00172],
        'brandPower': [0.00060, 0.00119, 0.00187, 0.00239, 0.00299],
        'allyAttackBoost': [0.00078, 0.00156, 0.00244, 0.00313, 0.00391]
    };
}

function getClassEffectiveOptionsInternal() {
    return {
        'dealer': ['attack', 'additionalDamage', 'bossDamage'],
        'support': ['brandPower', 'allyDamageBoost', 'allyAttackBoost']
    };
}

function gemsToWorkerFormat(gems) {
    return gems.map(gem => ({
        ...gem,
        subOption1: getInternalSubOptionKey(gem.subOption1),
        subOption2: getInternalSubOptionKey(gem.subOption2)
    }));
}

function gemsFromWorkerFormat(gems) {
    return gems.map(gem => ({
        ...gem,
        subOption1: getLocalizedSubOption(gem.subOption1),
        subOption2: getLocalizedSubOption(gem.subOption2)
    }));
}

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
let selectedCharacterClass = null; 
let selectedCores = {};
let currentlyEditingGem = null;

let assignedGemIds = new Map();

// Цвета для типов ядер
const CORE_TYPE_COLORS = {
    sun: '#FF8C00',   // Оранжевый для Солнца
    moon: '#4A90D9',  // Голубой для Луны
    star: '#9B59B6'   // Фиолетовый для Звезды
};

// Иконки для типов ядер
const CORE_TYPE_ICONS = {
    sun: '☀',
    moon: '☽',
    star: '★'
};

const STORAGE_PREFIX = 'lostark_arkgrid_';


document.addEventListener('DOMContentLoaded', init);

function init() {
    selectedCharacterClass = t('classes.dealer');

    applyLocalization();

    initializeTabs();

    const chaosGemListSection = document.getElementById('chaos-gem-list-section');
    const orderGemListSection = document.getElementById('order-gem-list-section');
    if (chaosGemListSection) chaosGemListSection.style.display = 'none';
    if (orderGemListSection) orderGemListSection.style.display = 'block';

    orderGemList.dataset.emptyText = t('messages.noGemsRegistered');
    chaosGemList.dataset.emptyText = t('messages.noGemsRegistered');

    const ARKGRID_CORE_TYPES = getArkgridCoreTypes();
    for (let i = 1; i <= 3; i++) {
        orderCoreColumn.appendChild(createCoreSlot('order', i, ARKGRID_CORE_TYPES));
        chaosCoreColumn.appendChild(createCoreSlot('chaos', i, ARKGRID_CORE_TYPES));
    }

    const characterClassSelector = document.getElementById('character-class-selector');
    const classDropdown = createCustomDropdown('character-class', t('ui.characterClass'),
        [{id: t('classes.dealer'), name: t('classes.dealer')}, {id: t('classes.support'), name: t('classes.support')}],
        (w, s) => {
            w.dataset.value = s.value;
            w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
            w.querySelector('.custom-options').style.display = 'none';
            w.classList.remove('open');
            selectedCharacterClass = s.value;
        }
    );
    characterClassSelector.appendChild(classDropdown);


    setupNewGemInputForm();


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

    // Обработчики кнопок OCR
    document.getElementById('ocr-scan-btn').addEventListener('click', openOCRModal);
    document.getElementById('ocr-modal-cancel-btn').addEventListener('click', closeOCRModal);
    document.getElementById('ocr-modal').addEventListener('click', (e) => {
        if (e.target.id === 'ocr-modal') closeOCRModal();
    });

    // Загрузка файла для OCR
    const ocrUploadArea = document.getElementById('ocr-upload-area');
    const ocrFileInput = document.getElementById('ocr-file-input');

    ocrUploadArea.addEventListener('click', () => ocrFileInput.click());
    ocrFileInput.addEventListener('change', handleOCRFileSelect);

    // Drag and drop для OCR
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

function applyLocalization() {
    const title = document.querySelector('h1');
    if (title) title.textContent = t('ui.arkgridTitle');

    const navButton = document.querySelector('.nav-button');
    if (navButton) navButton.textContent = t('ui.mainPage');

    if (saveBtn) saveBtn.textContent = t('ui.save');
    if (loadBtn) loadBtn.textContent = t('ui.load');

    const orderCoresTab = document.querySelector('[data-tab="order-cores"]');
    const chaosCoresTab = document.querySelector('[data-tab="chaos-cores"]');
    if (orderCoresTab) orderCoresTab.textContent = t('ui.orderCores');
    if (chaosCoresTab) chaosCoresTab.textContent = t('ui.chaosCores');

    const characterClassTitle = document.querySelector('.character-class-section h3');
    if (characterClassTitle) characterClassTitle.textContent = t('ui.characterClass');

    const gemInputTitle = document.querySelector('.gem-input-section h3');
    if (gemInputTitle) gemInputTitle.textContent = t('ui.gemInput');

    if (addGemBtn) addGemBtn.textContent = t('ui.addGem');

    if (calculateBtn) calculateBtn.textContent = t('ui.calculate');

    const orderGemsTitle = document.querySelector('#order-gem-list-container h4');
    const chaosGemsTitle = document.querySelector('#chaos-gem-list-container h4');
    if (orderGemsTitle) orderGemsTitle.textContent = t('ui.orderGems');
    if (chaosGemsTitle) chaosGemsTitle.textContent = t('ui.chaosGems');

    if (saveModalConfirmBtn) saveModalConfirmBtn.textContent = t('ui.save');
    if (saveModalCancelBtn) saveModalCancelBtn.textContent = t('ui.cancel');
    if (loadModalCancelBtn) loadModalCancelBtn.textContent = t('ui.cancel');
    if (alertModalOkBtn) alertModalOkBtn.textContent = t('ui.ok');
    if (gemEditCancelBtn) gemEditCancelBtn.textContent = t('ui.cancel');

    const gemEditModalTitle = document.getElementById('gem-edit-modal-title');
    if (gemEditModalTitle) gemEditModalTitle.textContent = t('ui.gemEdit');

    if (gemEditSaveBtn) gemEditSaveBtn.textContent = t('ui.save');
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

    const handleSelection = (optionEl, value, text, icon) => {
        options.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        if (optionEl) {
            optionEl.classList.add('selected');
        }
        onSelect(wrapper, { value, text, icon });
    };

    if (includeDefault) {
        const defaultOption = document.createElement('div');
        defaultOption.className = 'custom-option';
        defaultOption.dataset.value = 'none';
        defaultOption.innerHTML = `<span>${defaultText}</span>`;
        defaultOption.addEventListener('click', () => {
            handleSelection(defaultOption, 'none', defaultText, null);
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
                handleSelection(option, item.id, item.name, item.icon);
            }
        });
        options.appendChild(option);
    });

    trigger.addEventListener('click', () => {
        if (wrapper.classList.contains('disabled')) return;
        const currentValue = wrapper.dataset.value;
        const isOpen = options.style.display === 'block';

        options.querySelectorAll('.custom-option').forEach(opt => {
            if (opt.dataset.value === String(currentValue)) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });

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

function setupNewGemInputForm() {
    const gemInputForm = document.getElementById('gem-input-form');
    gemInputForm.innerHTML = '';

    const GEM_DATA = getGemData();

    const row1 = document.createElement('div');
    row1.className = 'gem-input-row';

    const gemTypeDropdown = createCustomDropdown('gem-type', t('ui.gemType'),
        [{ id: 'order', name: t('gems.order'), icon: getGemImage('order') }, { id: 'chaos', name: t('gems.chaos'), icon: getGemImage('chaos') }],
        (wrapper, selected) => {
            wrapper.dataset.value = selected.value;
            wrapper.querySelector('.custom-select-trigger').innerHTML = selected.icon ? `<img src="${selected.icon}" alt="${selected.text}"><span>${selected.text}</span>` : `<span>${selected.text}</span>`;
            wrapper.querySelector('.custom-options').style.display = 'none';
        wrapper.classList.remove('open');
            updateGemNameDropdown(selected.value);
        }
    );

    const gemNameDropdown = createCustomDropdown('gem-name', t('ui.gemName'), [], (wrapper, selected) => {
        wrapper.dataset.value = selected.value;
        wrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${selected.text}</span>`;
        wrapper.querySelector('.custom-options').style.display = 'none';
        wrapper.classList.remove('open');
        updateDynamicDropdowns(selected.value);
    });
    gemNameDropdown.classList.add('disabled');


    row1.appendChild(gemTypeDropdown);
    row1.appendChild(gemNameDropdown);
    gemInputForm.appendChild(row1);

    const row2 = document.createElement('div');
    row2.className = 'gem-input-row';
    const willpowerDropdown = createCustomDropdown('gem-willpower', t('ui.willpower'), [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    willpowerDropdown.classList.add('disabled');
    const pointDropdown = createCustomDropdown('gem-point', t('ui.points'), [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    pointDropdown.classList.add('disabled');
    row2.appendChild(willpowerDropdown);
    row2.appendChild(pointDropdown);
    gemInputForm.appendChild(row2);

    const row3 = document.createElement('div');
    row3.className = 'gem-input-row';
    const subOption1Dropdown = createCustomDropdown('gem-sub-option-1', t('ui.subOption1'), [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    subOption1Dropdown.classList.add('disabled');
    const subOption1LevelDropdown = createCustomDropdown('gem-sub-option-1-level', t('ui.level'), [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    subOption1LevelDropdown.classList.add('disabled');
    row3.appendChild(subOption1Dropdown);
    row3.appendChild(subOption1LevelDropdown);
    gemInputForm.appendChild(row3);

    const row4 = document.createElement('div');
    row4.className = 'gem-input-row';
    const subOption2Dropdown = createCustomDropdown('gem-sub-option-2', t('ui.subOption2'), [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    subOption2Dropdown.classList.add('disabled');
    const subOption2LevelDropdown = createCustomDropdown('gem-sub-option-2-level', t('ui.level'), [], (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    });
    subOption2LevelDropdown.classList.add('disabled');
    row4.appendChild(subOption2Dropdown);
    row4.appendChild(subOption2LevelDropdown);
    gemInputForm.appendChild(row4);
}

function updateGemNameDropdown(gemType) {
    const GEM_DATA = getGemData();
    const gemNameDropdown = document.getElementById('gem-name');
    const nameTrigger = gemNameDropdown.querySelector('.custom-select-trigger');
    const nameOptions = gemNameDropdown.querySelector('.custom-options');
    nameOptions.innerHTML = '';
    nameTrigger.innerHTML = `<span>${t('ui.gemName')}</span>`;
    gemNameDropdown.dataset.value = 'none';

    const subsequentDropdowns = ['gem-willpower', 'gem-point', 'gem-sub-option-1', 'gem-sub-option-1-level', 'gem-sub-option-2', 'gem-sub-option-2-level'];
    subsequentDropdowns.forEach(id => {
        const dd = document.getElementById(id);
        if (dd) {
            dd.classList.add('disabled');
            const labelMap = {
                'gem-willpower': t('ui.willpower'),
                'gem-point': t('ui.points'),
                'gem-sub-option-1': t('ui.subOption1'),
                'gem-sub-option-1-level': t('ui.level'),
                'gem-sub-option-2': t('ui.subOption2'),
                'gem-sub-option-2-level': t('ui.level')
            };
            dd.querySelector('.custom-select-trigger').innerHTML = `<span>${labelMap[id] || ''}</span>`;
            dd.dataset.value = 'none';
        }
    });

    if (gemType === 'none') {
        gemNameDropdown.classList.add('disabled');
        return;
    }

    gemNameDropdown.classList.remove('disabled');
    const names = Object.keys(GEM_DATA[gemType]);
    names.forEach(name => {
        const option = document.createElement('div');
        option.className = 'custom-option';
        option.dataset.value = name;
        option.innerHTML = `<span>${name}</span>`;
        option.addEventListener('click', () => {
            gemNameDropdown.dataset.value = name;
            nameTrigger.innerHTML = `<span>${name}</span>`;
            nameOptions.style.display = 'none';
            gemNameDropdown.classList.remove('open');
            const type = document.getElementById('gem-type').dataset.value;
            updateDynamicDropdowns(name, type);
        });
        nameOptions.appendChild(option);
    });
}

function updateDynamicDropdowns(gemName, gemType) {
    const GEM_DATA = getGemData();
    if (!gemName || !gemType || gemName === 'none' || gemType === 'none') {
        return;
    }
    const gemInfo = GEM_DATA[gemType][gemName];
    if (!gemInfo) return;

    const willpowerDropdown = document.getElementById('gem-willpower');
    const pointDropdown = document.getElementById('gem-point');
    const subOption1Dropdown = document.getElementById('gem-sub-option-1');
    const subOption1LevelDropdown = document.getElementById('gem-sub-option-1-level');
    const subOption2Dropdown = document.getElementById('gem-sub-option-2');
    const subOption2LevelDropdown = document.getElementById('gem-sub-option-2-level');

    const dropdowns = [willpowerDropdown, pointDropdown, subOption1Dropdown, subOption1LevelDropdown, subOption2Dropdown, subOption2LevelDropdown];
    const labelMap = {
        'gem-willpower': t('ui.willpower'),
        'gem-point': t('ui.points'),
        'gem-sub-option-1': t('ui.subOption1'),
        'gem-sub-option-1-level': t('ui.level'),
        'gem-sub-option-2': t('ui.subOption2'),
        'gem-sub-option-2-level': t('ui.level')
    };

    dropdowns.forEach(dd => {
        dd.classList.remove('disabled');
        const trigger = dd.querySelector('.custom-select-trigger');
        const options = dd.querySelector('.custom-options');
        options.innerHTML = '';
        trigger.innerHTML = `<span>${labelMap[dd.id] || ''}</span>`;
        dd.dataset.value = 'none';
    });

    const populateDropdown = (dropdown, values) => {
        const trigger = dropdown.querySelector('.custom-select-trigger');
        const options = dropdown.querySelector('.custom-options');
        values.forEach(val => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            option.dataset.value = val;
            option.innerHTML = `<span>${val}</span>`;
            option.addEventListener('click', () => {
                dropdown.dataset.value = val;
                trigger.innerHTML = `<span>${val}</span>`;
                options.style.display = 'none';
                dropdown.classList.remove('open');
            });
            options.appendChild(option);
        });
    };

    populateDropdown(willpowerDropdown, gemInfo.willpower);
    populateDropdown(pointDropdown, gemInfo.gemPoints);
    populateDropdown(subOption1Dropdown, gemInfo.subOptions);
    populateDropdown(subOption2Dropdown, gemInfo.subOptions);
    populateDropdown(subOption1LevelDropdown, [1, 2, 3, 4, 5]);
    populateDropdown(subOption2LevelDropdown, [1, 2, 3, 4, 5]);
}


function createCoreSlot(type, id, ARKGRID_CORE_TYPES) {
    const ARKGRID_GRADE_DATA = getArkgridGradeData();
    const slotId = `${type}-${id}`;
    const slot = document.createElement('div');
    slot.className = 'core-slot';
    slot.id = `slot-${slotId}`;

    const controls = document.createElement('div');
    controls.className = 'core-controls';

    const gradeDataForDropdown = Object.keys(ARKGRID_GRADE_DATA).map(key => ({
        id: key,
        name: ARKGRID_GRADE_DATA[key].name
    }));

    const targetSelectWrapper = createCustomDropdown(`target-${slotId}`, t('ui.targetPoints'), [], (tWrapper, tSelected) => {
        tWrapper.dataset.value = tSelected.value;
        tWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${tSelected.text}</span>`;
        tWrapper.querySelector('.custom-options').style.display = 'none';
    });
    targetSelectWrapper.classList.add('disabled');


    const gradeSelectWrapper = createGradeDropdown(`grade-${slotId}`, t('ui.grade'), gradeDataForDropdown, (gWrapper, gSelected) => {
        gWrapper.dataset.value = gSelected.value;
        gWrapper.querySelector('.custom-select-trigger').innerHTML = `<span>${gSelected.text}</span>`;
        gWrapper.querySelector('.custom-options').style.display = 'none';

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
    const GEM_DATA = getGemData();
    const type = document.getElementById('gem-type').dataset.value;
    const name = document.getElementById('gem-name').dataset.value;
    const willpower = parseInt(document.getElementById('gem-willpower').dataset.value, 10);
    const point = parseInt(document.getElementById('gem-point').dataset.value, 10);
    const subOption1 = document.getElementById('gem-sub-option-1').dataset.value;
    let subOption1Level = parseInt(document.getElementById('gem-sub-option-1-level').dataset.value, 10);
    const subOption2 = document.getElementById('gem-sub-option-2').dataset.value;
    let subOption2Level = parseInt(document.getElementById('gem-sub-option-2-level').dataset.value, 10);

    if (isNaN(subOption1Level)) subOption1Level = 1;
    if (isNaN(subOption2Level)) subOption2Level = 1;

    if (type === 'none' || name === 'none' || isNaN(willpower) || isNaN(point) || subOption1 === 'none' || subOption2 === 'none') {
        showCustomAlert(t('messages.enterAllGemInfo'));
        return;
    }

    if (subOption1 === subOption2) {
        showCustomAlert(t('messages.subOptionsDifferent'));
        return;
    }

    const gem = {
        id: nextGemId++,
        type,
        name,
        willpower,
        point,
        subOption1,
        subOption1Level,
        subOption2,
        subOption2Level
    };

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

        const gemImage = getGemImage(gem.type, gem.name);
        let detailsHtml;

        if (gem.name === '' || gem.isWithoutEffects) {
            detailsHtml = `
                <div class="gem-item-details">
                    <div class="gem-item-title" style="color: #888;">${t('messages.gemWithoutEffects')}</div>
                    <div class="gem-item-sub-options">
                        <span>${t('ui.willpower')}: ${gem.willpower} / ${t('ui.points')}: ${gem.point}</span>
                    </div>
                </div>
            `;
        } else {
            const getSubOptionDisplay = (subOptionKey) => {
                if (!subOptionKey) return '';

                const testLocalization = t(`subOptions.${subOptionKey}`);
                if (testLocalization !== `subOptions.${subOptionKey}`) {
                    return testLocalization;
                }

                if (subOptionKey.startsWith('subOptions.')) {
                    const extractedKey = subOptionKey.replace('subOptions.', '');
                    const retryLocalization = t(`subOptions.${extractedKey}`);
                    if (retryLocalization !== `subOptions.${extractedKey}`) {
                        return retryLocalization;
                    }
                    return extractedKey;
                }

                return subOptionKey;
            };

            const subOption1Text = gem.subOption1 && gem.subOption1Level
                ? `${getSubOptionDisplay(gem.subOption1)} ур.${gem.subOption1Level}`
                : t('messages.gemWithoutEffects');
            const subOption2Text = gem.subOption2 && gem.subOption2Level
                ? `${getSubOptionDisplay(gem.subOption2)} ур.${gem.subOption2Level}`
                : t('messages.gemWithoutEffects');
            detailsHtml = `
                <div class="gem-item-details">
                    <div class="gem-item-title">${gem.name} (W:${gem.willpower} / P:${gem.point})</div>
                    <div class="gem-item-sub-options">
                        <span>${subOption1Text}</span>
                        <span>${subOption2Text}</span>
                    </div>
                </div>
            `;
        }

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
                ${detailsHtml}
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


function showSpinner(text) {
    spinnerText.textContent = text;
    spinnerModal.style.display = 'flex';
}

function hideSpinner() {
    spinnerModal.style.display = 'none';
}

function calculate() {
    const ARKGRID_CORE_TYPES = getArkgridCoreTypes();
    const ARKGRID_GRADE_DATA = getArkgridGradeData();
    const GEM_DATA = getGemData();
    const SUB_OPTION_DATA = getSubOptionData();
    const CLASS_EFFECTIVE_OPTIONS = getClassEffectiveOptions();

    showSpinner(t('ui.calculating'));

    let activeCores = [];
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
                    coreTypeId: typeId, // 'sun', 'moon', or 'star'
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

    const worker = new Worker('./arkgrid-worker.js');

    const characterClassInternal = getInternalClassKey(selectedCharacterClass);

    worker.postMessage({
        activeCores,
        orderGems: gemsToWorkerFormat(orderGems),
        chaosGems: gemsToWorkerFormat(chaosGems),
        selectedCharacterClass: characterClassInternal,
        ARKGRID_CORE_TYPES,
        ARKGRID_GRADE_DATA,
        GEM_DATA: {
            order: GEM_DATA.order,
            chaos: GEM_DATA.chaos
        },
        SUB_OPTION_DATA: getSubOptionDataInternal(),
        CLASS_EFFECTIVE_OPTIONS: getClassEffectiveOptionsInternal(),
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
                                coreType: core.coreTypeId,  // 'sun', 'moon', or 'star'
                                slotId: core.id,            // 'order-1', 'chaos-2'
                                gemType: core.type          // 'order' or 'chaos'
                            });
                        });

                        const localizedResult = {
                            ...result,
                            gems: gemsFromWorkerFormat(result.gems),
                            achieved: result.achieved !== false
                        };
                        renderResult(core.id, core.coreData, localizedResult);
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
        console.error(`${t('messages.fatalWorkerError')}: ${e.message}`, e);
        showCustomAlert(`${t('messages.fatalWorkerError')}: ${e.message}`);
        worker.terminate();
    };
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
            const gemImage = getGemImage(gem.type, gem.name);

            let titleText, subOptionsHtml;
            if (gem.name === '' || gem.isWithoutEffects) {
                titleText = `${t('messages.gemWithoutEffects')} (W:${gem.willpower}/P:${gem.point})`;
                subOptionsHtml = '';
            } else {
                titleText = `${gem.name} (W:${gem.willpower}/P:${gem.point})`;
                const subOption1Text = gem.subOption1 && gem.subOption1Level ? `${gem.subOption1} ур.${gem.subOption1Level}` : '';
                const subOption2Text = gem.subOption2 && gem.subOption2Level ? `${gem.subOption2} ур.${gem.subOption2Level}` : '';
                subOptionsHtml = `
                    <div class="gem-item-sub-options">
                        ${subOption1Text ? `<span>${subOption1Text}</span>` : ''}
                        ${subOption2Text ? `<span>${subOption2Text}</span>` : ''}
                    </div>
                `;
            }

            socket.innerHTML = `
                <div class="gem-socket-content">
                    <img src="${gemImage}" alt="${gem.type}" class="gem-socket-image">
                    <div class="gem-item-details">
                        <div class="gem-item-title">${titleText}</div>
                        ${subOptionsHtml}
                    </div>
                </div>
            `;
            socket.classList.add('gem-equipped');
        }
    });
    const scoreText = result.effectivenessScore !== undefined ? ` [${t('ui.effectiveness')}: ${(result.effectivenessScore * 100).toFixed(4)}%]` : '';
    const achievedText = result.achieved === false ? ` ⚠ ${t('messages.showBestCase')}` : ` ✔ ${t('messages.fineCalculate')}`;
    summaryEl.innerHTML = `[${t('ui.willpower')}: ${result.willpower} / ${core.willpower}] [${t('ui.points')}: ${result.points}] ${scoreText} ${achievedText}`;
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
        characterClass: selectedCharacterClass,
        savedAt: new Date().toISOString()
    };

    const storageConfig = configToStorageFormat(arkgridConfig);

    try {
        const storageKey = STORAGE_PREFIX + saveName;
        const existingData = localStorage.getItem(storageKey);

        localStorage.setItem(storageKey, JSON.stringify(storageConfig));
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
    const localizedConfig = configFromStorageFormat(config);

    const migrateGem = (gem) => {
        if (gem.hasOwnProperty('name')) {
            return gem;
        }
        return {
            ...gem,
            name: '',
            subOption1: '-',
            subOption1Level: 0,
            subOption2: '-',
            subOption2Level: 0,
        };
    };

    orderGems = (localizedConfig.orderGems || []).map(migrateGem);
    chaosGems = (localizedConfig.chaosGems || []).map(migrateGem);

    selectedCharacterClass = localizedConfig.characterClass || t('classes.dealer');
    const classDropdown = document.getElementById('character-class');
    if (classDropdown) {
        const classOption = classDropdown.querySelector(`.custom-option[data-value="${selectedCharacterClass}"]`);
        if (classOption) {
            classOption.click();
        }
    }

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

function showCustomAlert(message) {
    alertModalMessage.textContent = message;
    alertModal.style.display = 'flex';
}

function closeCustomAlert() {
    alertModal.style.display = 'none';
}

let originalEditingGemId = null;

function openGemEditPopup(gem) {
    const GEM_DATA = getGemData();
    currentlyEditingGem = gem;

    if (originalEditingGemId === null) {
        originalEditingGemId = gem.id;
    }

    gemEditForm.innerHTML = '';

    if (!gem.name) {
        const title = document.getElementById('gem-edit-modal-title');
        title.textContent = t('ui.gemTypeSelect');

        const possibleNames = Object.keys(GEM_DATA[gem.type]);
        const nameDropdown = createCustomDropdown(
            'edit-gem-name',
            t('ui.gemType'),
            possibleNames.map(name => ({ id: name, name: name })),
            (w, s) => {
                if (s.value !== 'none') {
                    const updatedGem = { ...gem, name: s.value, id: originalEditingGemId };
                    openGemEditPopup(updatedGem);
                }
            }
        );
        gemEditForm.appendChild(nameDropdown);
        gemEditModal.style.display = 'flex';
        return;
    }

    document.getElementById('gem-edit-modal-title').textContent = t('ui.gemEdit');

    const gemInfo = GEM_DATA[gem.type][gem.name];
    if (!gemInfo) {
        showCustomAlert(t('messages.enterAllGemInfo'));
        return;
    }

    const createDropdownRow = (labelText, dropdownId, initialValueId, initialValueDisplay, items, onSelectCallback) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'gem-input-row';
        const label = document.createElement('label');
        label.textContent = labelText;

        const dropdown = createCustomDropdown(dropdownId, labelText, items, onSelectCallback);

        dropdown.dataset.value = initialValueId;
        const trigger = dropdown.querySelector('.custom-select-trigger');
        trigger.innerHTML = `<span>${initialValueDisplay}</span>`;

        const options = dropdown.querySelectorAll('.custom-option');
        options.forEach(opt => {
            if (String(opt.dataset.value) === String(initialValueId)) {
                opt.classList.add('selected');
            }
        });

        wrapper.append(label, dropdown);
        return wrapper;
    };

    const onSelect = (w, s) => {
        w.dataset.value = s.value;
        w.querySelector('.custom-select-trigger').innerHTML = `<span>${s.text}</span>`;
        w.querySelector('.custom-options').style.display = 'none';
    };

    gemEditForm.appendChild(createDropdownRow(t('ui.willpower'), 'edit-gem-willpower', gem.willpower, gem.willpower, gemInfo.willpower.map(w => ({ id: w, name: w })), onSelect));
    gemEditForm.appendChild(createDropdownRow(t('ui.points'), 'edit-gem-point', gem.point, gem.point, gemInfo.gemPoints.map(p => ({ id: p, name: p })), onSelect));

    const subOption1Row = createDropdownRow(
        t('ui.subOption1'),
        'edit-gem-sub-option-1',
        gem.subOption1, 
        getLocalizedSubOption(gem.subOption1),
        gemInfo.subOptions.map(opt => ({ id: opt, name: getLocalizedSubOption(opt) })),
        onSelect
    );
    const subOption1LevelDropdown = createCustomDropdown('edit-gem-sub-option-1-level', `ур.${gem.subOption1Level}`, [1, 2, 3, 4, 5].map(l => ({ id: l, name: `ур.${l}` })), onSelect);
    subOption1LevelDropdown.dataset.value = gem.subOption1Level;
    subOption1Row.appendChild(subOption1LevelDropdown);
    gemEditForm.appendChild(subOption1Row);


    const subOption2Row = createDropdownRow(
        t('ui.subOption2'),
        'edit-gem-sub-option-2',
        gem.subOption2, 
        getLocalizedSubOption(gem.subOption2),
        gemInfo.subOptions.map(opt => ({ id: opt, name: getLocalizedSubOption(opt) })),
        onSelect
    );
    const subOption2LevelDropdown = createCustomDropdown('edit-gem-sub-option-2-level', `ур.${gem.subOption2Level}`, [1, 2, 3, 4, 5].map(l => ({ id: l, name: `ур.${l}` })), onSelect);
    subOption2LevelDropdown.dataset.value = gem.subOption2Level;
    subOption2Row.appendChild(subOption2LevelDropdown);
    gemEditForm.appendChild(subOption2Row);


    gemEditModal.style.display = 'flex';
}

function closeGemEditPopup() {
    gemEditModal.style.display = 'none';
    currentlyEditingGem = null;
    originalEditingGemId = null;
    gemEditForm.innerHTML = '';
}

function saveGemEdit() {
    if (!currentlyEditingGem) return;

    const newWillpower = parseInt(document.getElementById('edit-gem-willpower').dataset.value, 10);
    const newPoint = parseInt(document.getElementById('edit-gem-point').dataset.value, 10);
    const newSubOption1 = document.getElementById('edit-gem-sub-option-1').dataset.value;
    const newSubOption1Level = parseInt(document.getElementById('edit-gem-sub-option-1-level').dataset.value, 10);
    const newSubOption2 = document.getElementById('edit-gem-sub-option-2').dataset.value;
    const newSubOption2Level = parseInt(document.getElementById('edit-gem-sub-option-2-level').dataset.value, 10);

    if (newSubOption1 === '-' || newSubOption2 === '-' || newSubOption1 === 'none' || newSubOption2 === 'none' || !newSubOption1Level || !newSubOption2Level) {
        showCustomAlert(t('messages.selectAllSubOptions'));
        return;
    }

    if (isNaN(newWillpower) || isNaN(newPoint) || isNaN(newSubOption1Level) || isNaN(newSubOption2Level)) {
        showCustomAlert(t('messages.enterAllGemInfo'));
        return;
    }

    if (newSubOption1 === newSubOption2) {
        showCustomAlert(t('messages.subOptionsDifferent'));
        return;
    }

    const gemIdToFind = originalEditingGemId !== null ? originalEditingGemId : currentlyEditingGem.id;
    const gemToUpdate = orderGems.find(g => g.id === gemIdToFind) || chaosGems.find(g => g.id === gemIdToFind);

    if (gemToUpdate) {
        const wasAssigned = assignedGemIds.has(gemToUpdate.id);

        gemToUpdate.name = currentlyEditingGem.name;
        gemToUpdate.willpower = newWillpower;
        gemToUpdate.point = newPoint;
        gemToUpdate.subOption1 = newSubOption1;
        gemToUpdate.subOption1Level = newSubOption1Level;
        gemToUpdate.subOption2 = newSubOption2;
        gemToUpdate.subOption2Level = newSubOption2Level;

        gemToUpdate.isWithoutEffects = false;

        closeGemEditPopup();
        renderGemLists();

        if (wasAssigned) {
            calculate();
        }
    } else {
        console.error('Gem to update not found:', gemIdToFind);
        closeGemEditPopup();
        renderGemLists();
    }
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

            const minWhite = 2; // минимум белых пикселей чтобы считать строку непустой
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

        console.log('=== OCR RECOGNIZED TEXT ===');
        console.log(text);
        console.log('=== END OCR TEXT ===');

        statusText.textContent = 'Анализ результатов...';
        progressFill.style.width = '90%';

        const activeTab = document.querySelector('.tab-switcher .tab-button.active');
        const currentTabType = activeTab ? activeTab.getAttribute('data-tab') : 'order';

        const parsedGems = parseOCRText(text, currentTabType);

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

// Вычисляет расстояние Левенштейна между двумя строками
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    if (len1 === 0) return len2;
    if (len2 === 0) return len1;

    for (let i = 0; i <= len2; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
        for (let j = 1; j <= len1; j++) {
            const cost = str1[j - 1] === str2[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[len2][len1];
}

// Находит наилучшее совпадение для строки из списка вариантов
function findBestMatch(text, patterns) {
    let bestScore = Infinity;
    let bestValue = null;

    for (const [pattern, value] of Object.entries(patterns)) {
        if (text.includes(pattern)) {
            return value;
        }

        const distance = levenshteinDistance(text, pattern);
        const maxLen = Math.max(text.length, pattern.length);
        const similarity = 1 - (distance / maxLen);

        if (similarity > 0.7 && distance < bestScore) {
            bestScore = distance;
            bestValue = value;
        }
    }

    return bestValue;
}

function parseOCRText(text, defaultType = 'order') {
    const gems = [];

    text = text.replace(/\|\s*$/gm, '1');
    text = text.replace(/\s+\|\s*(\d)/g, ' 1');

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log('=== PARSING OCR TEXT ===');
    console.log('Default type:', defaultType);
    console.log('Total lines:', lines.length);

    const defaultGemNames = {
        'order': 'Обет',
        'chaos': 'Ропот'
    };

    const effectMapping = {
        // Доп. урон
        'доп': 'additionalDamage',
        'допурон': 'additionalDamage',
        'эрон': 'additionalDamage',
        'дотэрон': 'additionalDamage',
        'доврон': 'additionalDamage',
        'долурюнлт': 'additionalDamage',
        'долугон': 'additionalDamage',
        'делугон': 'additionalDamage',
        'долурон': 'additionalDamage',

        // Эффективность стимы (стигмы)
        'стигм': 'brandPower',
        'стим': 'brandPower',
        'эффективностьстигмы': 'brandPower',
        'эффективностьстимы': 'brandPower',
        'эффектоносъ': 'brandPower',
        'эффектонось': 'brandPower',
        'эффектыюсь': 'brandPower',
        'эффектинось': 'brandPower',
        'эффеэтивность': 'brandPower',
        'стемы': 'brandPower',
        'стоы': 'brandPower',
        'семы': 'brandPower',
        'стилмы': 'brandPower',
        'стима': 'brandPower',

        // Сила атаки соратников
        'силаатакисоратников': 'allyAttackBoost',
        'атакисоратников': 'allyAttackBoost',
        'сиатнор': 'allyAttackBoost',

        // Урон соратников
        'уронсоратников': 'allyDamageBoost',
        'онсоратни': 'allyDamageBoost',
        'соржников': 'allyDamageBoost',
        'соржтоков': 'allyDamageBoost',
        'уренсоратников': 'allyDamageBoost',
        'сератников': 'allyDamageBoost',

        // Сила атаки
        'силаатаки': 'attack',
        'сажтаю': 'attack',
        'снаатан': 'attack',
        'спажтан': 'attack',
        'солагтаки': 'attack',
        'сажтан': 'attack',
        'атаки': 'attack',

        // Урон по боссам
        'уронпобоссам': 'bossDamage',
        'боссам': 'bossDamage',
    };


    let currentType = defaultType;
    let expectingWillpower = true;
    let skipNextLine = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        console.log(`Line ${i}: "${line}"`);

        if (/порядок|order|хаос|chaos/i.test(line)) {
            console.log('  -> Skipping type line');
            continue;
        }

        if (skipNextLine) {
            console.log('  -> Skipping line due to previous error');
            skipNextLine = false;
            expectingWillpower = true;
            continue;
        }

        // STEP 0: Удаляем ВСЕ пробелы из строки для упрощения парсинга
        const lineNoSpaces = line.replace(/\s+/g, '');
        console.log(`  -> Step 0: Line without spaces = "${lineNoSpaces}"`);

        // STEP 1: Берем первый символ строки (это почти всегда цифра) - заряд или очки
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

        if (!firstChar || !/\d/.test(firstChar)) {
            console.log(`  -> First character "${firstChar}" is not a digit, skipping`);
            if (expectingWillpower) {
                skipNextLine = true;
            } else {
                expectingWillpower = true;
            }
            continue;
        }
        const number = parseInt(firstChar);
        console.log(`  -> Step 1: First digit = ${number}`);

        // STEP 2: Ищем первую букву (начало названия эффекта)
        const match = lineNoSpaces.match(/[А-Яа-яЁё]/);
        if (!match) {
            console.log('  -> No russian letters found, skipping');
            if (expectingWillpower) {
                skipNextLine = true;
            } else {
                expectingWillpower = true;
            }
            continue;
        }

        const textPart = lineNoSpaces.substring(match.index);
        console.log(`  -> Step 2: Text part (from first letter) = "${textPart}"`);

        // STEP 3: Ищем "ур" (может быть "ур." или просто "ур"), берем следующий символ как цифру уровня
        const textLower = textPart.toLowerCase();
        let urIndex = textLower.lastIndexOf('ур.');
        let urLength = 3;

        if (urIndex === -1) {
            urIndex = textLower.lastIndexOf('ур');
            urLength = 2;
        }

        if (urIndex === -1) {
            console.log('  -> No "ур" found, skipping');
            if (expectingWillpower) {
                skipNextLine = true;
            } else {
                expectingWillpower = true;
            }
            continue;
        }

        const afterUr = textPart.substring(urIndex + urLength);
        console.log(`  -> Step 3a: Found "ур" at index ${urIndex}, after it: "${afterUr}"`);

        if (!afterUr || afterUr.length === 0) {
            console.log(`  -> No level found after "ур." (line may be cut off), skipping`);
            if (expectingWillpower) {
                skipNextLine = true;
            } else {
                expectingWillpower = true;
            }
            continue;
        }

        const levelChar = afterUr[0];
        let level;
        if (levelChar === '|') {
            level = 1;
        } else if (/\d/.test(levelChar)) {
            level = parseInt(levelChar);
        } else {
            console.log(`  -> Level character "${levelChar}" is not valid, skipping`);
            if (expectingWillpower) {
                skipNextLine = true;
            } else {
                expectingWillpower = true;
            }
            continue;
        }
        console.log(`  -> Step 3b: Level = ${level}`);

        // STEP 4: Берём текст до "ур"
        const effectText = textPart.substring(0, urIndex);
        console.log(`  -> Step 4: Effect text = "${effectText}"`);

        // STEP 5: Переводим в нижний регистр и удаляем точки (пробелы уже удалены в Step 0)
        const effectNormalized = effectText.toLowerCase().replace(/\./g, '');
        console.log(`  -> Step 5: Effect text (normalized) = "${effectNormalized}"`);

        // Используем умное сопоставление с учетом расстояния Левенштейна
        const effectName = findBestMatch(effectNormalized, effectMapping);

        if (!effectName) {
            console.log(`  -> No matching effect found for: "${effectNormalized}"`);
            if (expectingWillpower) {
                skipNextLine = true;
            } else {
                expectingWillpower = true;
            }
            continue;
        } else {
            console.log(`  -> Matched effect: "${effectNormalized}" -> ${effectName}`);
        }

        if (expectingWillpower) {
            const newGem = {
                id: nextGemId++,
                type: currentType,
                name: defaultGemNames[currentType],
                willpower: number,
                point: 0,
                subOption1: effectName,
                subOption1Level: level,
                subOption2: '',
                subOption2Level: 0
            };
            gems.push(newGem);
            console.log(`  -> Created new gem (willpower=${number}):`, newGem);
            expectingWillpower = false;
        } else {
            const lastGem = gems[gems.length - 1];
            if (lastGem) {
                lastGem.point = number;
                lastGem.subOption2 = effectName;
                lastGem.subOption2Level = level;

                const detectedName = detectGemNameByWillpowerAndEffects(
                    lastGem.type,
                    lastGem.willpower,
                    lastGem.subOption1,
                    lastGem.subOption2
                );

                if (detectedName) {
                    lastGem.name = detectedName;
                    console.log(`  -> Auto-detected gem name: ${detectedName}`);
                } else {
                    console.log(`  -> Could not detect gem name, using default: ${lastGem.name}`);
                }

                console.log(`  -> Updated last gem (points=${number}):`, lastGem);
            }
            expectingWillpower = true;
        }
    }

    console.log('=== PARSING COMPLETE ===');
    console.log('Total gems parsed:', gems.length);
    console.log('Gems:', gems);

    return gems;
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
