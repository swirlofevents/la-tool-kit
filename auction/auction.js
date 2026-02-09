// локализация
const L = window.LOCALE || {};
function t(path) {
    const keys = path.split('.');
    let value = L;
    for (const key of keys) {
        value = value[key];
        if (!value) return path;
    }
    return value;
}

const resultTable = document.getElementById('result-table');
if (resultTable) {
    const marketPriceInput = document.getElementById('market-price');
    const partySizeRadios = document.querySelectorAll('input[name="party-size"]');
    const tableBody = resultTable.querySelector('tbody');
    const toastPopup = document.getElementById('toast-popup');
    let toastTimer;

    function showToast() {
        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        toastPopup.classList.add('show');
        toastTimer = setTimeout(() => {
            toastPopup.classList.remove('show');
        }, 2000);
    }

    function calculateAndDisplay() {
        const marketPrice = parseFloat(marketPriceInput.value);
        const numPeople = parseInt(document.querySelector('input[name="party-size"]:checked').value, 10);

        tableBody.innerHTML = '';

        if (isNaN(marketPrice) || marketPrice <= 0) {
            const row = tableBody.insertRow();
            return;
        }

        if (isNaN(numPeople) || numPeople < 2) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 2;
            cell.textContent = t('auction.selectPartySize');
            cell.style.textAlign = 'center';
            return;
        }

        const optimalBid = (marketPrice / numPeople) * (numPeople - 1);
        const breakEven = Math.floor(optimalBid * 0.95);
        const p25 = Math.floor(breakEven / 1.025);
        const p50 = Math.floor(breakEven / 1.050);
        const p75 = Math.floor(breakEven / 1.075);
        const preemption = Math.floor(breakEven / 1.1);

        const results = [
            { label: t('auction.directUse'), value: optimalBid },
            { label: t('auction.breakEven'), value: breakEven },
            { label: t('auction.margin25'), value: p25 },
            { label: t('auction.margin50'), value: p50 },
            { label: t('auction.margin75'), value: p75 },
            { label: t('auction.preemption'), value: preemption }
        ];

        results.forEach(result => {
            const row = tableBody.insertRow();
            row.style.cursor = 'pointer';

            row.insertCell().textContent = result.label;
            const valueCell = row.insertCell();
            const value = Math.floor(result.value);
            valueCell.textContent = `${value.toLocaleString()} Золота`;

            row.addEventListener('click', () => {
                navigator.clipboard.writeText(value).catch(err => {
                    console.error('Ошибка копирования в буфер обмена:', err);
                });
                showToast();
            });
        });
    }

    marketPriceInput.addEventListener('input', calculateAndDisplay);
    partySizeRadios.forEach(radio => radio.addEventListener('change', calculateAndDisplay));

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', calculateAndDisplay);
    } else {
        calculateAndDisplay();
    }
}
