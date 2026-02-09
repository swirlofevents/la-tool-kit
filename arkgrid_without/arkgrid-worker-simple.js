// --- ArkGrid Calculation Worker ---

const MAX_GEMS_PER_CORE = 4;

self.onmessage = function(e) {
    const { activeCores, orderGems, chaosGems, ARKGRID_CORE_TYPES, ARKGRID_GRADE_DATA, CALCULATION_TIMEOUT } = e.data;


    function findAllPossibleCombinations(core, availableGems) {
        let allCombinations = [];

        function find(startIndex, currentGems, currentWillpower, currentPoints) {
            // Текущая комбинация валидна (не превышает willpower) - добавляем
            if (currentWillpower <= core.willpower) {
                allCombinations.push({
                    gems: [...currentGems],
                    points: currentPoints,
                    willpower: currentWillpower
                });
            }

            // Достигли максимума рунитов или закончились доступные
            if (currentGems.length >= MAX_GEMS_PER_CORE || startIndex >= availableGems.length) {
                return;
            }

            // Рекурсивно добавляем следующий рунит
            for (let i = startIndex; i < availableGems.length; i++) {
                const newGem = availableGems[i];
                if (currentWillpower + newGem.willpower <= core.willpower) {
                    currentGems.push(newGem);
                    find(i + 1, currentGems, currentWillpower + newGem.willpower, currentPoints + newGem.point);
                    currentGems.pop(); // Backtracking
                }
            }
        }

        find(0, [], 0, 0);
        return allCombinations;
    }

    try {
        // Для каждой активной коры найти все валидные комбинации, достигающие целевых очков
        const coreValidCombinations = new Map();
        for (const core of activeCores) {
            const availableGems = core.type === 'order' ? orderGems : chaosGems;
            let combinations = findAllPossibleCombinations(core.coreData, availableGems);
            combinations = combinations.filter(c => c.points >= core.targetPoint);
            combinations.sort((a, b) => b.points - a.points); // Сортировка по убыванию очков
            coreValidCombinations.set(core.id, combinations);
        }

        // Оптимизация: предварительный расчет максимальных очков для "отсечения будущего"
        const maxPointsPerCore = {};
        activeCores.forEach(core => {
            const combinations = coreValidCombinations.get(core.id);
            maxPointsPerCore[core.id] = (combinations && combinations.length > 0) ? combinations[0].points : 0;
        });
        const totalMaxPossibleScore = activeCores.reduce((sum, core) => sum + maxPointsPerCore[core.id], 0);

        // Поиск оптимального распределения с помощью backtracking
        let bestAssignment = { score: -1, assignment: {} };
        const startTime = Date.now();
        let timedOut = false;

        function solve(coreIndex, currentAssignment, currentScore, usedGemIds, maxPossibleFutureScore) {
            // Проверка таймаута
            if (Date.now() - startTime > CALCULATION_TIMEOUT) {
                timedOut = true;
                return;
            }
            if (timedOut) return;

            // "Отсечение будущего"
            // Если текущий + максимально возможный будущий счет меньше лучшего, прекращаем
            if (currentScore + maxPossibleFutureScore <= bestAssignment.score) {
                return;
            }

            // Все коры обработаны
            if (coreIndex === activeCores.length) {
                if (currentScore > bestAssignment.score) {
                    bestAssignment = { score: currentScore, assignment: JSON.parse(JSON.stringify(currentAssignment)) };
                }
                return;
            }

            const core = activeCores[coreIndex];
            const combinations = coreValidCombinations.get(core.id);
            const remainingMaxScore = maxPossibleFutureScore - maxPointsPerCore[core.id];

            // Путь 1: Назначить комбинацию текущей коре
            if (combinations && combinations.length > 0) {
                for (const combination of combinations) {
                    const combinationGemIds = combination.gems.map(g => g.id);
                    const hasConflict = combinationGemIds.some(id => usedGemIds.has(id));

                    if (!hasConflict) {
                        const newUsedGemIds = new Set([...usedGemIds, ...combinationGemIds]);
                        currentAssignment[core.id] = combination;
                        solve(coreIndex + 1, currentAssignment, currentScore + combination.points, newUsedGemIds, remainingMaxScore);
                        delete currentAssignment[core.id]; // Backtracking
                        if (timedOut) return;
                    }
                }
            }

            // Пропустить текущую кору (не назначать комбинацию)
            solve(coreIndex + 1, currentAssignment, currentScore, usedGemIds, remainingMaxScore);
        }

        solve(0, {}, 0, new Set(), totalMaxPossibleScore);

        // Отправка результата в основной поток
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
