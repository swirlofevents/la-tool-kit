// ============================================
// Система локализации
// ============================================
const L = window.LOCALE || {};

function t(key) {
    const keys = key.split('.');
    let value = L;
    for (const k of keys) {
        value = value?.[k];
        if (!value) return key;
    }
    return value;
}

document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsDisplay = document.getElementById('results-display');
    const loadingIndicator = document.getElementById('loading-indicator');

    // --- Константы и данные (локализованные) ---
    const GEM_SETTINGS = {
        order: {
            name: t('gems.order'),
            subTypes: {
                stable: { name: t('gems.stable'), effects: [t('subOptions.attack'), t('subOptions.additionalDamage'), t('subOptions.brandPower'), t('subOptions.allyDamageBoost')] },
                solid: { name: t('gems.solid'), effects: [t('subOptions.attack'), t('subOptions.bossDamage'), t('subOptions.allyDamageBoost'), t('subOptions.allyAttackBoost')] },
                immutable: { name: t('gems.immutable'), effects: [t('subOptions.additionalDamage'), t('subOptions.bossDamage'), t('subOptions.allyAttackBoost'), t('subOptions.brandPower')] },
            }
        },
        chaos: {
            name: t('gems.chaos'),
            subTypes: {
                erosion: { name: t('gems.erosion'), effects: [t('subOptions.attack'), t('subOptions.additionalDamage'), t('subOptions.brandPower'), t('subOptions.allyDamageBoost')] },
                distortion: { name: t('gems.distortion'), effects: [t('subOptions.attack'), t('subOptions.bossDamage'), t('subOptions.allyDamageBoost'), t('subOptions.allyAttackBoost')] },
                collapse: { name: t('gems.collapse'), effects: [t('subOptions.additionalDamage'), t('subOptions.bossDamage'), t('subOptions.allyAttackBoost'), t('subOptions.brandPower')] },
            }
        }
    };

    const GRADE_SETTINGS = {
        advanced: { name: t('grades.advanced'), attempts: 5, rerolls: 0 },
        rare: { name: t('grades.rare'), attempts: 7, rerolls: 1 },
        heroic: { name: t('grades.heroic'), attempts: 9, rerolls: 2 },
    };

    // Опции обработки - только внутреннее использование
    const PROCESSING_OPTIONS = [
        { name: 'willpower+1', prob: 11.65, effect: { willpower: 1 }, condition: s => s.willpower >= 5 },
        { name: 'willpower+2', prob: 4.40, effect: { willpower: 2 }, condition: s => s.willpower >= 4 },
        { name: 'willpower+3', prob: 1.75, effect: { willpower: 3 }, condition: s => s.willpower >= 3 },
        { name: 'willpower+4', prob: 0.45, effect: { willpower: 4 }, condition: s => s.willpower >= 2 },
        { name: 'willpower-1', prob: 3.00, effect: { willpower: -1 }, condition: s => s.willpower <= 1 },
        { name: 'points+1', prob: 11.65, effect: { points: 1 }, condition: s => s.points >= 5 },
        { name: 'points+2', prob: 4.40, effect: { points: 2 }, condition: s => s.points >= 4 },
        { name: 'points+3', prob: 1.75, effect: { points: 3 }, condition: s => s.points >= 3 },
        { name: 'points+4', prob: 0.45, effect: { points: 4 }, condition: s => s.points >= 2 },
        { name: 'points-1', prob: 3.00, effect: { points: -1 }, condition: s => s.points <= 1 },
        { name: 'effect1+1', prob: 11.65, effect: { effect1_level: 1 }, condition: s => s.effect1_level >= 5 },
        { name: 'effect1+2', prob: 4.40, effect: { effect1_level: 2 }, condition: s => s.effect1_level >= 4 },
        { name: 'effect1+3', prob: 1.75, effect: { effect1_level: 3 }, condition: s => s.effect1_level >= 3 },
        { name: 'effect1+4', prob: 0.45, effect: { effect1_level: 4 }, condition: s => s.effect1_level >= 2 },
        { name: 'effect1-1', prob: 3.00, effect: { effect1_level: -1 }, condition: s => s.effect1_level <= 1 },
        { name: 'effect2+1', prob: 11.65, effect: { effect2_level: 1 }, condition: s => s.effect2_level >= 5 },
        { name: 'effect2+2', prob: 4.40, effect: { effect2_level: 2 }, condition: s => s.effect2_level >= 4 },
        { name: 'effect2+3', prob: 1.75, effect: { effect2_level: 3 }, condition: s => s.effect2_level >= 3 },
        { name: 'effect2+4', prob: 0.45, effect: { effect2_level: 4 }, condition: s => s.effect2_level >= 2 },
        { name: 'effect2-1', prob: 3.00, effect: { effect2_level: -1 }, condition: s => s.effect2_level <= 1 },
        { name: 'effect1change', prob: 3.25, effect: {}, condition: () => false },
        { name: 'effect2change', prob: 3.25, effect: {}, condition: () => false },
        { name: 'cost+100', prob: 1.75, effect: {}, condition: s => s.attemptsLeft <= 1 },
        { name: 'cost-100', prob: 1.75, effect: {}, condition: s => s.attemptsLeft <= 1 },
        { name: 'maintain', prob: 1.75, effect: {}, condition: () => false },
        { name: 'reroll+1', prob: 2.50, effect: { rerolls: 1 }, condition: s => s.attemptsLeft <= 1 },
        { name: 'reroll+2', prob: 0.75, effect: { rerolls: 2 }, condition: s => s.attemptsLeft <= 1 },
    ];

    function setupCustomDropdowns() {
        const dropdowns = document.querySelectorAll('.custom-dropdown');
        dropdowns.forEach(dropdown => {
            const selected = dropdown.querySelector('.dropdown-selected');
            const optionsContainer = dropdown.querySelector('.dropdown-options');
            if (!selected || !optionsContainer) return;

            selected.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllDropdowns(dropdown);
                dropdown.classList.toggle('open');
            });

            optionsContainer.addEventListener('click', e => {
                e.stopPropagation();
                if (e.target.classList.contains('dropdown-option') && !e.target.classList.contains('disabled')) {
                    const hiddenInput = document.getElementById(dropdown.dataset.inputId);
                    const newValue = e.target.dataset.value;
                    let newText = e.target.textContent;

                    if (dropdown.classList.contains('level-dropdown')) {
                        newText = newValue;
                    }

                    if (hiddenInput.value !== newValue) {
                        selected.querySelector('.selected-value').textContent = newText;
                        optionsContainer.querySelector('.selected')?.classList.remove('selected');
                        e.target.classList.add('selected');
                        hiddenInput.value = newValue;
                        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    dropdown.classList.remove('open');
                }
            });
        });
        window.addEventListener('click', () => closeAllDropdowns());
    }

    function closeAllDropdowns(exceptThisOne = null) {
        document.querySelectorAll('.custom-dropdown.open').forEach(d => {
            if (d !== exceptThisOne) d.classList.remove('open');
        });
    }

    function updateDropdownValue(inputId, value, text, isLevel = false) {
        const hiddenInput = document.getElementById(inputId);
        const dropdown = document.querySelector(`.custom-dropdown[data-input-id="${inputId}"]`);
        if (hiddenInput && dropdown) {
            hiddenInput.value = value;
            const textToSet = isLevel ? value : text;
            dropdown.querySelector('.selected-value').textContent = textToSet;
            const optionsContainer = dropdown.querySelector('.dropdown-options');
            optionsContainer.querySelector('.selected')?.classList.remove('selected');
            optionsContainer.querySelector(`[data-value="${value}"]`)?.classList.add('selected');
        }
    }

    function updateUIGlobally() {
        const gemType = document.getElementById('gem-type').value;
        const subTypeValue = document.getElementById('gem-sub-type').value;
        const gemGradeValue = document.getElementById('gem-grade').value;

        const gemNameDisplay = document.getElementById('gem-name-display');
        const gradeName = GRADE_SETTINGS[gemGradeValue].name;
        const gemTypeName = GEM_SETTINGS[gemType].name;
        const subTypeName = GEM_SETTINGS[gemType].subTypes[subTypeValue].name;
        gemNameDisplay.textContent = `[${gradeName}] ${gemTypeName}: ${subTypeName}`;

        const pointsNameDisplay = document.getElementById('points-name-display');
        pointsNameDisplay.textContent = gemType === 'order' ? t('gemSimulator.orderPoints') : t('gemSimulator.chaosPoints');

        updateAdditionalOptions();

        updateTotalPoints();
    }

    function updateSubTypeOptions() {
        const gemType = document.getElementById('gem-type').value;
        const subTypes = GEM_SETTINGS[gemType].subTypes;
        const container = document.getElementById('gem-sub-type-options');
        container.innerHTML = '';
        Object.entries(subTypes).forEach(([key, value], index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dropdown-option';
            optionDiv.dataset.value = key;
            optionDiv.textContent = value.name;
            if (index === 0) {
                updateDropdownValue('gem-sub-type', key, value.name);
                optionDiv.classList.add('selected');
            }
            container.appendChild(optionDiv);
        });
    }

    function updateAdditionalOptions() {
        const gemType = document.getElementById('gem-type').value;
        const subType = document.getElementById('gem-sub-type').value;
        if (!gemType || !subType) return;
        const effects = GEM_SETTINGS[gemType].subTypes[subType].effects;
        const effect1Type = document.getElementById('effect1-type').value;
        const effect2Type = document.getElementById('effect2-type').value;

        const container1 = document.getElementById('effect1-type-options');
        container1.innerHTML = '';
        let currentEffect1IsValid = effects.includes(effect1Type);
        effects.forEach((effect, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dropdown-option';
            optionDiv.dataset.value = effect;
            optionDiv.textContent = effect;
            if (effect === effect2Type) optionDiv.classList.add('disabled');
            container1.appendChild(optionDiv);
        });
        if (!currentEffect1IsValid) {
            updateDropdownValue('effect1-type', effects[0], effects[0]);
        }

        const container2 = document.getElementById('effect2-type-options');
        container2.innerHTML = '';
        const selectedEffect1 = document.getElementById('effect1-type').value;
        let currentEffect2IsValid = effects.includes(effect2Type) && effect2Type !== selectedEffect1;
        effects.forEach((effect, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dropdown-option';
            optionDiv.dataset.value = effect;
            optionDiv.textContent = effect;
            if (effect === selectedEffect1) optionDiv.classList.add('disabled');
            container2.appendChild(optionDiv);
        });
        if (!currentEffect2IsValid) {
            const newEffect2 = effects.find(e => e !== selectedEffect1) || '';
            updateDropdownValue('effect2-type', newEffect2, newEffect2);
        }

        document.querySelectorAll('.effect-type-dropdown').forEach(d => {
            const id = d.dataset.inputId;
            const val = document.getElementById(id).value;
            d.querySelector('.selected')?.classList.remove('selected');
            d.querySelector(`[data-value="${val}"]`)?.classList.add('selected');
        });
    }

    function updateDefaultsByGrade() {
        const grade = document.getElementById('gem-grade').value;
        const settings = GRADE_SETTINGS[grade];
        if (settings) {
            updateDropdownValue('attempts-left', settings.attempts, settings.attempts, true);
            updateDropdownValue('rerolls-left', settings.rerolls, settings.rerolls, true);
        }
    }

    function updateTotalPoints() {
        const willpower = parseInt(document.getElementById('current-willpower').value) || 0;
        const points = parseInt(document.getElementById('current-points').value) || 0;
        const effect1 = parseInt(document.getElementById('effect1-level').value) || 0;
        const effect2 = parseInt(document.getElementById('effect2-level').value) || 0;
        document.getElementById('total-points-display').textContent = willpower + points + effect1 + effect2;
    }

    function getProcessingOptions(currentState) {
        const availableOptions = PROCESSING_OPTIONS.filter(opt => !opt.condition(currentState));
        let chosenOptions = [];
        let pool = availableOptions.map(o => ({...o}));
        for (let i = 0; i < 4 && pool.length > 0; i++) {
            let totalWeight = pool.reduce((sum, opt) => sum + opt.prob, 0);
            let rand = Math.random() * totalWeight;
            let cumulativeWeight = 0;
            for (let j = 0; j < pool.length; j++) {
                cumulativeWeight += pool[j].prob;
                if (rand <= cumulativeWeight) { chosenOptions.push(pool.splice(j, 1)[0]); break; }
            }
        }
        return chosenOptions;
    }

    function runSingleSimulation(initialState) {
        let state = { ...initialState };
        while (state.attemptsLeft > 0) {
            let options = getProcessingOptions(state);
            const isGoodOption = opt => (opt.effect.willpower && opt.effect.willpower > 0) || (opt.effect.points && opt.effect.points > 0);
            while (state.rerolls > 0 && !options.some(isGoodOption)) {
                state.rerolls--;
                options = getProcessingOptions(state);
            }
            if (options.length > 0) {
                const chosenOption = options[Math.floor(Math.random() * options.length)];
                for (const key in chosenOption.effect) {
                    state[key] += chosenOption.effect[key];
                    if (['willpower', 'points', 'effect1_level', 'effect2_level'].includes(key)) {
                        state[key] = Math.max(1, Math.min(5, state[key]));
                    }
                }
            }
            state.attemptsLeft--;
        }
        return state;
    }

    async function startSimulation() {
        calculateBtn.disabled = true;
        resultsDisplay.innerHTML = '';
        loadingIndicator.classList.remove('hidden');

        await new Promise(resolve => setTimeout(resolve, 0));

        const initialState = {
            willpower: parseInt(document.getElementById('current-willpower').value),
            points: parseInt(document.getElementById('current-points').value),
            effect1_level: parseInt(document.getElementById('effect1-level').value),
            effect2_level: parseInt(document.getElementById('effect2-level').value),
            attemptsLeft: parseInt(document.getElementById('attempts-left').value),
            rerolls: parseInt(document.getElementById('rerolls-left').value),
        };
        const simulationCount = parseInt(document.getElementById('simulation-count').value);
        let outcomes = { count45: 0, count54: 0, count55: 0, legendary: 0, relic: 0, ancient: 0 };

        for (let i = 0; i < simulationCount; i++) {
            const finalState = runSingleSimulation(initialState);
            if (finalState.willpower === 4 && finalState.points === 5) outcomes.count45++;
            if (finalState.willpower === 5 && finalState.points === 4) outcomes.count54++;
            if (finalState.willpower === 5 && finalState.points === 5) outcomes.count55++;
            const totalPoints = finalState.willpower + finalState.points + finalState.effect1_level + finalState.effect2_level;
            if (totalPoints >= 4 && totalPoints <= 15) outcomes.legendary++;
            else if (totalPoints >= 16 && totalPoints <= 18) outcomes.relic++;
            else if (totalPoints >= 19 && totalPoints <= 20) outcomes.ancient++;
        }

        displayResults(outcomes, simulationCount);
        calculateBtn.disabled = false;
    }

    function displayResults(outcomes, simulationCount) {
        loadingIndicator.classList.add('hidden');
        const toPercent = (count) => ((count / simulationCount) * 100).toFixed(2);
        resultsDisplay.innerHTML = `
            <h3>${t('gemSimulator.simulationResults')} (${simulationCount.toLocaleString()})</h3>
            <div class="tooltip-container">
                <p>${t('gemSimulator.launcher45')}: <strong>${toPercent(outcomes.count45)}%</strong></p>
                <p>${t('gemSimulator.launcher54')}: <strong>${toPercent(outcomes.count54)}%</strong></p>
                <p>${t('gemSimulator.launcher55')}: <strong>${toPercent(outcomes.count55)}%</strong></p>
                <div class="tooltip-content">
                    <b>${t('gemSimulator.whatIsLauncher')}</b><br>
                    ${t('gemSimulator.launcherDescription')}
                </div>
            </div>
            <hr>
            <p>${t('gemSimulator.legendaryProb')}: <strong>${toPercent(outcomes.legendary)}%</strong></p>
            <p>${t('gemSimulator.relicProb')}: <strong>${toPercent(outcomes.relic)}%</strong></p>
            <p>${t('gemSimulator.ancientProb')}: <strong>${toPercent(outcomes.ancient)}%</strong></p>
        `;
    }

    function applyLocalization() {
        document.querySelector('h1').textContent = t('ui.gemSimulatorTitle');

        document.querySelector('.nav-button').textContent = t('ui.mainPage');

        const gemPointsDisplay = document.querySelector('.gem-points-display');
        if (gemPointsDisplay) {
            gemPointsDisplay.childNodes[0].textContent = t('gemSimulator.gemPoints') + ' ';
        }

        document.querySelector('.stat-diamond.color-willpower .stat-name').textContent = t('gemSimulator.willpowerEfficiency');

        const labels = document.querySelectorAll('.input-group label');
        if (labels[0]) labels[0].textContent = t('gemSimulator.attemptsLeft');
        if (labels[1]) labels[1].textContent = t('gemSimulator.rerollsLeft');
        if (labels[2]) labels[2].textContent = t('gemSimulator.simulationCount');

        calculateBtn.textContent = t('gemSimulator.calculateProbability');

        resultsDisplay.innerHTML = `<p>${t('gemSimulator.selectSettings')}</p>`;

        loadingIndicator.querySelector('p').textContent = t('gemSimulator.calculatingProbability');

        updateGradeDropdown();
        updateGemTypeDropdown();
    }

    function updateGradeDropdown() {
        const gradeOptions = document.querySelectorAll('[data-input-id="gem-grade"] .dropdown-option');
        gradeOptions.forEach(opt => {
            const key = opt.dataset.value;
            if (GRADE_SETTINGS[key]) {
                opt.textContent = GRADE_SETTINGS[key].name;
            }
        });
        const gradeDropdown = document.querySelector('[data-input-id="gem-grade"]');
        const currentGrade = document.getElementById('gem-grade').value;
        if (GRADE_SETTINGS[currentGrade]) {
            gradeDropdown.querySelector('.selected-value').textContent = GRADE_SETTINGS[currentGrade].name;
        }
    }

    function updateGemTypeDropdown() {
        const typeOptions = document.querySelectorAll('[data-input-id="gem-type"] .dropdown-option');
        typeOptions.forEach(opt => {
            const key = opt.dataset.value;
            if (GEM_SETTINGS[key]) {
                opt.textContent = GEM_SETTINGS[key].name;
            }
        });
        const typeDropdown = document.querySelector('[data-input-id="gem-type"]');
        const currentType = document.getElementById('gem-type').value;
        if (GEM_SETTINGS[currentType]) {
            typeDropdown.querySelector('.selected-value').textContent = GEM_SETTINGS[currentType].name;
        }
    }

    document.getElementById('gem-grade').addEventListener('change', () => {
        updateDefaultsByGrade();
        updateUIGlobally();
    });
    document.getElementById('gem-type').addEventListener('change', () => {
        updateSubTypeOptions();
        updateUIGlobally();
    });
    document.getElementById('gem-sub-type').addEventListener('change', updateUIGlobally);
    document.querySelectorAll('.level-dropdown input').forEach(input => {
        input.addEventListener('change', updateTotalPoints);
    });
    document.querySelectorAll('.effect-type-dropdown input').forEach(input => {
        input.addEventListener('change', updateAdditionalOptions);
    });

    calculateBtn.addEventListener('click', startSimulation);

    applyLocalization();
    setupCustomDropdowns();
    updateSubTypeOptions();
    updateDefaultsByGrade();
    updateUIGlobally();
});
