/**
 * Модуль управления настройками сайта
 * Обеспечивает функционал кнопки настроек и управления параметрами
 */

(function() {
    'use strict';

    // Инициализация настроек при загрузке DOM
    document.addEventListener('DOMContentLoaded', function() {
        initSettings();
    });

    /**
     * Инициализация модуля настроек
     */
    function initSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsMenu = document.getElementById('settings-menu');
        const fontToggle = document.getElementById('font-toggle');

        if (!settingsBtn || !settingsMenu || !fontToggle) {
            console.warn('Settings elements not found');
            return;
        }

        // Загружаем настройку шрифта из localStorage
        loadFontSetting(fontToggle);

        // Открытие/закрытие меню настроек
        settingsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSettingsMenu(settingsBtn, settingsMenu);
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
                closeSettingsMenu(settingsBtn, settingsMenu);
            }
        });

        // Переключение шрифта
        fontToggle.addEventListener('click', function() {
            toggleFontSetting(fontToggle);
        });
    }

    /**
     * Переключение состояния меню настроек
     * @param {HTMLElement} btn - Кнопка настроек
     * @param {HTMLElement} menu - Меню настроек
     */
    function toggleSettingsMenu(btn, menu) {
        const isOpen = menu.classList.toggle('show');
        if (isOpen) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }

    /**
     * Закрытие меню настроек
     * @param {HTMLElement} btn - Кнопка настроек
     * @param {HTMLElement} menu - Меню настроек
     */
    function closeSettingsMenu(btn, menu) {
        menu.classList.remove('show');
        btn.classList.remove('active');
    }

    /**
     * Загрузка настройки шрифта из localStorage
     * @param {HTMLElement} toggle - Переключатель шрифта
     */
    function loadFontSetting(toggle) {
        const customFontDisabled = localStorage.getItem('customFontDisabled') === 'true';
        if (customFontDisabled) {
            document.body.classList.add('no-custom-font');
            toggle.classList.add('active');
        }
    }

    /**
     * Переключение настройки шрифта
     * @param {HTMLElement} toggle - Переключатель шрифта
     */
    function toggleFontSetting(toggle) {
        const isActive = toggle.classList.contains('active');
        if (isActive) {
            // Включаем кастомный шрифт
            toggle.classList.remove('active');
            document.body.classList.remove('no-custom-font');
            localStorage.setItem('customFontDisabled', 'false');
        } else {
            // Отключаем кастомный шрифт
            toggle.classList.add('active');
            document.body.classList.add('no-custom-font');
            localStorage.setItem('customFontDisabled', 'true');
        }
    }

})();

