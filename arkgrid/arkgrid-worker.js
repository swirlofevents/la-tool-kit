// --- Worker расчета ArkGrid ---

// --- Константы (из arkgrid.js) ---
const MAX_GEMS_PER_CORE = 4;

self.onmessage = function(e) {
    const {
        activeCores,
        orderGems,
        chaosGems,
        selectedCharacterClass,
        ARKGRID_CORE_TYPES,
        ARKGRID_GRADE_DATA,
        GEM_DATA,
        SUB_OPTION_DATA,
        CLASS_EFFECTIVE_OPTIONS,
        CALCULATION_TIMEOUT
    } = e.data;

    function calculateEffectiveness(gem, characterClass) {
        const effectiveOptions = CLASS_EFFECTIVE_OPTIONS[characterClass];
        let score = 0;
        if (!gem.subOption1 || !gem.subOption2) return 0;

        if (effectiveOptions.includes(gem.subOption1)) {
            score += SUB_OPTION_DATA[gem.subOption1][gem.subOption1Level - 1];
        }
        if (effectiveOptions.includes(gem.subOption2)) {
            score += SUB_OPTION_DATA[gem.subOption2][gem.subOption2Level - 1];
        }
        return score;
    }

    function findAllPossibleCombinations(core, availableGems, characterClass) {
        let allCombinations = [];

        function find(startIndex, currentGems, currentWillpower, currentPoints) {
            if (currentWillpower <= core.willpower) {
                allCombinations.push({
                    gems: [...currentGems],
                    points: currentPoints,
                    willpower: currentWillpower,
                    effectivenessScore: currentGems.reduce((acc, gem) => acc + calculateEffectiveness(gem, characterClass), 0)
                });
            }

            if (currentGems.length >= MAX_GEMS_PER_CORE || startIndex >= availableGems.length) {
                return;
            }

            for (let i = startIndex; i < availableGems.length; i++) {
                const newGem = availableGems[i];
                if (currentWillpower + newGem.willpower <= core.willpower) {
                    currentGems.push(newGem);
                    find(i + 1, currentGems, currentWillpower + newGem.willpower, currentPoints + newGem.point);
                    currentGems.pop();
                }
            }
        }
        find(0, [], 0, 0);
        return allCombinations;
    }

    // Ограничение числа комбинаций на ядро для производительности
    const TOP_N = 500;

    try {
        // Для каждого активного ядра найти все валидные комбинации, достигающие целевых очков
        const coreValidCombinations = new Map();
        for (const core of activeCores) {
            const availableGems = core.type === 'order' ? orderGems : chaosGems;
            let combinations = findAllPossibleCombinations(core.coreData, availableGems, selectedCharacterClass);

            // Сортировка: максимум очков, максимум эффективности, минимум зарядов
            combinations.sort((a, b) => {
                if (a.points !== b.points) return b.points - a.points;
                if (a.effectivenessScore !== b.effectivenessScore) return b.effectivenessScore - a.effectivenessScore;
                return a.willpower - b.willpower;
            });

            // Оставляем только комбинации достигающие цели, ограничиваем top-N
            combinations = combinations.filter(c => c.points >= core.targetPoint).slice(0, TOP_N);
            coreValidCombinations.set(core.id, combinations);
        }

        // Логика отсечения ветвей (pruning) по effectivenessScore
        const maxScoresPerCore = {};
        activeCores.forEach(core => {
            const combinations = coreValidCombinations.get(core.id);
            if (combinations && combinations.length > 0) {
                maxScoresPerCore[core.id] = Math.max(...combinations.map(c => c.effectivenessScore));
            } else {
                maxScoresPerCore[core.id] = 0;
            }
        });
        const totalMaxPossibleScore = activeCores.reduce((sum, core) => sum + maxScoresPerCore[core.id], 0);

        // Поиск оптимального распределения с помощью backtracking-алгоритма
        let bestAssignment = { score: -1, assignment: {} };
        const startTime = Date.now();
        let timedOut = false;

        function solve(coreIndex, currentAssignment, currentScore, usedGemIds, maxPossibleFutureScore) {
            if (Date.now() - startTime > CALCULATION_TIMEOUT) {
                timedOut = true;
                return;
            }
            if (timedOut) return;

            if (currentScore + maxPossibleFutureScore <= bestAssignment.score) {
                return;
            }

            if (coreIndex === activeCores.length) {
                if (currentScore > bestAssignment.score) {
                    bestAssignment = { score: currentScore, assignment: JSON.parse(JSON.stringify(currentAssignment)) };
                }
                return;
            }

            const core = activeCores[coreIndex];
            const combinations = coreValidCombinations.get(core.id);
            const remainingMaxScore = maxPossibleFutureScore - maxScoresPerCore[core.id];

            if (combinations && combinations.length > 0) {
                let anyNonConflict = false;
                for (const combination of combinations) {
                    const combinationGemIds = combination.gems.map(g => g.id);
                    const hasConflict = combinationGemIds.some(id => usedGemIds.has(id));

                    if (!hasConflict) {
                        anyNonConflict = true;
                        const newUsedGemIds = new Set([...usedGemIds, ...combinationGemIds]);
                        currentAssignment[core.id] = combination;
                        solve(coreIndex + 1, currentAssignment, currentScore + combination.effectivenessScore, newUsedGemIds, remainingMaxScore);
                        delete currentAssignment[core.id];
                        if (timedOut) return;
                    }
                }
                // Все валидные комбинации конфликтуют — ищем лучшее из оставшихся рунитов
                if (!anyNonConflict) {
                    const availableGems = core.type === 'order' ? orderGems : chaosGems;
                    const freeGems = availableGems.filter(g => !usedGemIds.has(g.id));
                    const freeCombos = findAllPossibleCombinations(core.coreData, freeGems, selectedCharacterClass);
                    if (freeCombos.length > 0) {
                        freeCombos.sort((a, b) => {
                            if (a.points !== b.points) return b.points - a.points;
                            if (a.effectivenessScore !== b.effectivenessScore) return b.effectivenessScore - a.effectivenessScore;
                            return a.willpower - b.willpower;
                        });
                        const bestFree = freeCombos[0];
                        const newUsedGemIds = new Set([...usedGemIds, ...bestFree.gems.map(g => g.id)]);
                        currentAssignment[core.id] = { ...bestFree, achieved: false };
                        solve(coreIndex + 1, currentAssignment, currentScore + bestFree.effectivenessScore, newUsedGemIds, remainingMaxScore);
                        delete currentAssignment[core.id];
                    } else {
                        currentAssignment[core.id] = { gems: [], points: 0, willpower: 0, effectivenessScore: 0, achieved: false };
                        solve(coreIndex + 1, currentAssignment, currentScore, usedGemIds, remainingMaxScore);
                        delete currentAssignment[core.id];
                    }
                }
            } else {
                // Цель не достигнута — ищем лучшую достижимую комбинацию из свободных рунитов
                const availableGems = core.type === 'order' ? orderGems : chaosGems;
                const freeGems = availableGems.filter(g => !usedGemIds.has(g.id));
                const freeCombos = findAllPossibleCombinations(core.coreData, freeGems, selectedCharacterClass);
                if (freeCombos.length > 0) {
                    freeCombos.sort((a, b) => {
                        if (a.points !== b.points) return b.points - a.points;
                        if (a.effectivenessScore !== b.effectivenessScore) return b.effectivenessScore - a.effectivenessScore;
                        return a.willpower - b.willpower;
                    });
                    const bestFree = freeCombos[0];
                    const newUsedGemIds = new Set([...usedGemIds, ...bestFree.gems.map(g => g.id)]);
                    currentAssignment[core.id] = { ...bestFree, achieved: false };
                    solve(coreIndex + 1, currentAssignment, currentScore + bestFree.effectivenessScore, newUsedGemIds, remainingMaxScore);
                    delete currentAssignment[core.id];
                } else {
                    currentAssignment[core.id] = { gems: [], points: 0, willpower: 0, effectivenessScore: 0, achieved: false };
                    solve(coreIndex + 1, currentAssignment, currentScore, usedGemIds, remainingMaxScore);
                    delete currentAssignment[core.id];
                }
            }
        }

        solve(0, {}, 0, new Set(), totalMaxPossibleScore);

        self.postMessage({
            success: true,
            bestAssignment: bestAssignment,
            timedOut: timedOut
        });

    } catch (error) {
        console.error("Worker Error: ", error);
        self.postMessage({ success: false, error: error.message, stack: error.stack });
    }
};
