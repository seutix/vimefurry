/**
 * Модуль navbar.js - Динамическая генерация навигационной панели
 * 
 * Этот модуль предоставляет единый источник для:
 * - Генерации HTML навигационной панели
 * - Инициализации навигации на всех страницах
 * - Интеграции с модулями search.js и ranks.js
 * 
 * Requirements: 7.1, 7.2, 7.3
 */

/**
 * SVG иконки для навигации
 */
const NAV_ICONS = {
    trophy: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align:middle;display:inline-block;margin-bottom:-3px;"><path d="M8 21h8M12 17v4M19 5V3H5v2M19 5v2a7 7 0 0 1-14 0V5m14 0h2a2 2 0 0 1 2 2v1a7 7 0 0 1-6 6.93M5 5H3a2 2 0 0 0-2 2v1a7 7 0 0 0 6 6.93" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align:middle;display:inline-block;margin-bottom:-3px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    key: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 5.5C16 8.53757 13.5376 11 10.5 11H7V13H5V15L4 16H0V12L5.16351 6.83649C5.0567 6.40863 5 5.96094 5 5.5C5 2.46243 7.46243 0 10.5 0C13.5376 0 16 2.46243 16 5.5ZM13 4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4Z" fill="#3498db"/></svg>`
};

/**
 * Стили для навигации (inline для независимости от CSS файлов)
 */
const NAV_STYLES = {
    navbar: 'position:fixed;top:0;left:0;width:100%;z-index:1000;',
    container: 'padding-left:0;padding-right:0;position:relative;min-height:56px;display:flex;align-items:center;',
    brand: "font-family:'VimeArtBold',sans-serif;font-size:1.2rem;color:#3498db;letter-spacing:1px;padding-left:24px;z-index:2;",
    centerLinks: 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:24px;z-index:1;',
    navLink: "font-family:'VimeArtBold',sans-serif;font-size:1.1rem;color:#3498db;text-decoration:none;transition:color 0.2s;display:flex;align-items:center;gap:6px;",
    searchContainer: 'position:absolute;right:80px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:8px;background:#e6f3ff;border-radius:10px;padding:0 12px;height:40px;box-shadow:0 2px 8px rgba(52,152,219,0.08);',
    searchInput: "border:none;background:none;outline:none;width:260px;font-family:'VimeArtBold',sans-serif;font-size:0.9rem;color:#3498db;",
    searchBtn: 'display:flex;align-items:center;justify-content:center;cursor:pointer;',
    authBtn: 'position:absolute;right:24px;top:50%;transform:translateY(-50%);width:35px;height:35px;display:flex;align-items:center;justify-content:center;background:#e6f3ff;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(52,152,219,0.08);'
};

/**
 * Создает HTML навигационной панели
 * @param {object} [options] - Опции для настройки навигации
 * @param {boolean} [options.includeSearch=true] - Включить поле поиска
 * @param {boolean} [options.includeAuth=true] - Включить кнопку авторизации
 * @returns {HTMLElement} DOM элемент навигации
 */
function createNavbar(options = {}) {
    const { includeSearch = true, includeAuth = true } = options;
    
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg navbar-light bg-white shadow-sm';
    nav.style.cssText = NAV_STYLES.navbar;
    nav.id = 'main-navbar';
    
    // Создаем контейнер
    const container = document.createElement('div');
    container.className = 'container-fluid';
    container.style.cssText = NAV_STYLES.container;
    
    // Логотип/бренд
    const brand = document.createElement('a');
    brand.className = 'navbar-brand';
    brand.href = 'index.html';
    brand.style.cssText = NAV_STYLES.brand;
    brand.textContent = 'VimeStats';
    container.appendChild(brand);
    
    // Центральные ссылки
    const centerLinks = document.createElement('div');
    centerLinks.style.cssText = NAV_STYLES.centerLinks;
    
    // Ссылка на Топы
    const topsLink = document.createElement('a');
    topsLink.href = 'tops.html';
    topsLink.style.cssText = NAV_STYLES.navLink;
    topsLink.innerHTML = NAV_ICONS.trophy + ' Топы';
    centerLinks.appendChild(topsLink);
    
    // Ссылка на Модеров
    const modersLink = document.createElement('a');
    modersLink.href = 'moders.html';
    modersLink.style.cssText = NAV_STYLES.navLink;
    modersLink.innerHTML = NAV_ICONS.shield + ' Модеры';
    centerLinks.appendChild(modersLink);
    
    container.appendChild(centerLinks);
    
    // Поле поиска
    if (includeSearch) {
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = NAV_STYLES.searchContainer;
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'quick-search';
        searchInput.placeholder = 'Поиск';
        searchInput.style.cssText = NAV_STYLES.searchInput;
        searchInput.autocomplete = 'off';
        searchContainer.appendChild(searchInput);
        
        const searchBtn = document.createElement('div');
        searchBtn.id = 'quick-search-btn';
        searchBtn.style.cssText = NAV_STYLES.searchBtn;
        searchBtn.innerHTML = NAV_ICONS.search;
        searchContainer.appendChild(searchBtn);
        
        // Выпадающий список недавних ников
        const recentNicks = document.createElement('div');
        recentNicks.className = 'recent-nicks';
        recentNicks.id = 'quickRecentNicks';
        
        const recentNicksList = document.createElement('ul');
        recentNicksList.className = 'recent-nicks-list';
        recentNicks.appendChild(recentNicksList);
        
        searchContainer.appendChild(recentNicks);
        container.appendChild(searchContainer);
    }
    
    // Кнопка авторизации
    if (includeAuth) {
        const authBtn = document.createElement('div');
        authBtn.id = 'auth-key-btn';
        authBtn.style.cssText = NAV_STYLES.authBtn;
        authBtn.innerHTML = NAV_ICONS.key;
        container.appendChild(authBtn);
    }
    
    nav.appendChild(container);
    return nav;
}

/**
 * Создает отступ для фиксированной навигации
 * @returns {HTMLElement} DOM элемент отступа
 */
function createNavbarSpacer() {
    const spacer = document.createElement('div');
    spacer.style.height = '70px';
    spacer.id = 'navbar-spacer';
    return spacer;
}

/**
 * Инициализирует навигационную панель на странице
 * @param {object} [options] - Опции инициализации
 * @param {string} [options.placeholderId='navbar-placeholder'] - ID элемента-плейсхолдера
 * @param {boolean} [options.includeSearch=true] - Включить поле поиска
 * @param {boolean} [options.includeAuth=true] - Включить кнопку авторизации
 * @param {object} [options.searchOptions] - Опции для initQuickSearch
 * @returns {object} Объект с элементами навигации
 */
function initNavbar(options = {}) {
    const { 
        placeholderId = 'navbar-placeholder',
        includeSearch = true,
        includeAuth = true,
        searchOptions = {}
    } = options;
    
    // Создаем навигацию
    const navbar = createNavbar({ includeSearch, includeAuth });
    const spacer = createNavbarSpacer();
    
    // Ищем плейсхолдер или вставляем в начало body
    const placeholder = document.getElementById(placeholderId);
    
    if (placeholder) {
        placeholder.replaceWith(navbar, spacer);
    } else {
        // Вставляем в начало body
        const body = document.body;
        body.insertBefore(spacer, body.firstChild);
        body.insertBefore(navbar, body.firstChild);
    }
    
    // Инициализируем поиск если включен и функция доступна
    let searchInstance = null;
    if (includeSearch && typeof initQuickSearch === 'function') {
        // Подготавливаем опции для поиска
        const finalSearchOptions = {
            ...searchOptions
        };
        
        // Добавляем ranksData если доступен
        if (typeof ranksData !== 'undefined') {
            finalSearchOptions.ranksData = ranksData;
        }
        
        // Добавляем функции кеширования если доступны
        if (typeof getPlayerData === 'function') {
            finalSearchOptions.getPlayerData = getPlayerData;
        }
        if (typeof savePlayerData === 'function') {
            finalSearchOptions.savePlayerData = savePlayerData;
        }
        
        searchInstance = initQuickSearch('quick-search', 'quickRecentNicks', finalSearchOptions);
    }
    
    // Инициализируем кнопку авторизации
    if (includeAuth) {
        const authBtn = document.getElementById('auth-key-btn');
        if (authBtn) {
            authBtn.addEventListener('click', function() {
                window.location.href = 'auth.html';
            });
        }
    }
    
    return {
        navbar,
        spacer,
        searchInstance
    };
}

/**
 * Проверяет, инициализирована ли навигация
 * @returns {boolean} true если навигация уже существует
 */
function isNavbarInitialized() {
    return document.getElementById('main-navbar') !== null;
}

/**
 * Удаляет навигацию со страницы
 */
function removeNavbar() {
    const navbar = document.getElementById('main-navbar');
    const spacer = document.getElementById('navbar-spacer');
    
    if (navbar) navbar.remove();
    if (spacer) spacer.remove();
}

/**
 * Получает элемент навигации
 * @returns {HTMLElement|null} Элемент навигации или null
 */
function getNavbar() {
    return document.getElementById('main-navbar');
}

// Автоматическая инициализация при загрузке DOM (только в браузере)
if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', function() {
        // Проверяем, не инициализирована ли уже навигация
        if (!isNavbarInitialized()) {
            // Проверяем data-атрибуты на placeholder для настройки
            const placeholder = document.getElementById('navbar-placeholder');
            const options = {};
            
            if (placeholder) {
                // Читаем опции из data-атрибутов
                if (placeholder.dataset.includeSearch === 'false') {
                    options.includeSearch = false;
                }
                if (placeholder.dataset.includeAuth === 'false') {
                    options.includeAuth = false;
                }
            }
            
            initNavbar(options);
        }
    });
}

// Экспорт для использования в других модулях (если используется module system)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NAV_ICONS,
        NAV_STYLES,
        createNavbar,
        createNavbarSpacer,
        initNavbar,
        isNavbarInitialized,
        removeNavbar,
        getNavbar
    };
}
