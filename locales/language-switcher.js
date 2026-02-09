// Переключатель языка для Lost Ark Tools

(function() {
    // Получение сохранённой языковой настройки или русский по умолчанию
    const savedLang = localStorage.getItem('lostark_lang') || 'ru';


    function applyLocalization() {
        const L = window.LOCALE || {};

        // Применение локализации к элементам с атрибутом data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = getNestedValue(L, key);
            if (value) {
                el.textContent = value;
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const value = getNestedValue(L, key);
            if (value) {
                el.placeholder = value;
            }
        });
    }

    function getNestedValue(obj, path) {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
            value = value[key];
            if (!value) return null;
        }
        return value;
    }

    window.switchLanguage = function(lang) {
        localStorage.setItem('lostark_lang', lang);
        location.reload();
    };

    function createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.id = 'language-switcher';
        switcher.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            gap: 8px;
            background: rgba(20, 20, 20, 0.9);
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid #C89B3C;
        `;

        const langs = [
            { code: 'ru', label: 'RU' },
        ];

        langs.forEach(lang => {
            const btn = document.createElement('button');
            btn.textContent = lang.label;
            btn.className = 'lang-btn';
            btn.style.cssText = `
                background: ${savedLang === lang.code ? '#C89B3C' : 'transparent'};
                color: ${savedLang === lang.code ? '#1a1a1a' : '#C89B3C'};
                border: 1px solid #C89B3C;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-family: 'Roboto', sans-serif;
                font-weight: 500;
                font-size: 0.9rem;
                transition: all 0.2s;
            `;

            btn.onmouseover = function() {
                if (savedLang !== lang.code) {
                    this.style.background = 'rgba(200, 155, 60, 0.2)';
                }
            };

            btn.onmouseout = function() {
                if (savedLang !== lang.code) {
                    this.style.background = 'transparent';
                }
            };

            btn.onclick = function() {
                if (savedLang !== lang.code) {
                    window.switchLanguage(lang.code);
                }
            };

            switcher.appendChild(btn);
        });

        document.body.appendChild(switcher);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            applyLocalization();
            createLanguageSwitcher();
        });
    } else {
        applyLocalization();
        createLanguageSwitcher();
    }
})();
