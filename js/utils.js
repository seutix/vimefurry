/**
 * Модуль утилит для VimeStats
 * 
 * Содержит общие функции для работы с кешированием, API и форматированием данных.
 * 
 * Requirements: 6.1
 */

// ============================================
// Константы
// ============================================

/**
 * Время жизни кеша в миллисекундах (5 минут)
 */
const CACHE_DURATION = 5 * 60 * 1000;

// ============================================
// Функции кеширования данных игроков
// ============================================

/**
 * Сохраняет данные игрока в localStorage кеш
 * @param {string} nick - Никнейм игрока
 * @param {object} data - Данные игрока для сохранения
 */
function savePlayerData(nick, data) {
    const playerCache = JSON.parse(localStorage.getItem('playerCache') || '{}');
    playerCache[nick] = {
        ...data,
        timestamp: Date.now()
    };
    localStorage.setItem('playerCache', JSON.stringify(playerCache));
}

/**
 * Получает данные игрока из кеша
 * Возвращает null если данные устарели или отсутствуют
 * @param {string} nick - Никнейм игрока
 * @returns {object|null} Данные игрока или null
 */
function getPlayerData(nick) {
    const playerCache = JSON.parse(localStorage.getItem('playerCache') || '{}');
    const data = playerCache[nick];
    
    if (data && Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
    }
    
    return null;
}

/**
 * Очищает устаревшие записи из кеша
 */
function cleanExpiredCache() {
    const playerCache = JSON.parse(localStorage.getItem('playerCache') || '{}');
    const now = Date.now();
    let hasChanges = false;
    
    for (const nick in playerCache) {
        if (now - playerCache[nick].timestamp >= CACHE_DURATION) {
            delete playerCache[nick];
            hasChanges = true;
        }
    }
    
    if (hasChanges) {
        localStorage.setItem('playerCache', JSON.stringify(playerCache));
    }
}

// ============================================
// Функции работы с API
// ============================================

/**
 * Получает статус онлайн игрока через VimeWorld API
 * @param {string} username - Никнейм игрока
 * @returns {Promise<boolean|null>} true если онлайн, false если оффлайн, null при ошибке
 */
async function fetchPlayerOnlineStatus(username) {
    try {
        const response = await fetch(`https://api.vimeworld.com/user/name/${username}/session`);
        const data = await response.json();
        return data?.online?.value ?? null;
    } catch {
        return null;
    }
}

// ============================================
// Функции форматирования
// ============================================

/**
 * Возвращает правильное окончание слова в зависимости от числа (русский язык)
 * @param {number} number - Число
 * @param {string[]} endings - Массив окончаний [для 1, для 2-4, для 5-20]
 * @returns {string} Правильное окончание
 */
function getEnding(number, endings) {
    if (number === 0) return endings[2];
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return endings[2];
    }
    
    if (lastDigit === 1) {
        return endings[0];
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return endings[1];
    }
    
    return endings[2];
}

/**
 * Форматирует время игры из секунд в читаемый формат
 * @param {number} seconds - Время в секундах
 * @param {boolean} [full=false] - Если true, возвращает полный формат (дни, часы, минуты, секунды)
 * @returns {string} Отформатированное время
 */
function formatPlaytime(seconds, full = false) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (!full) {
        if (days > 0) return `${days} ${getEnding(days, ['день', 'дня', 'дней'])}`;
        if (hours > 0) return `${hours} ${getEnding(hours, ['час', 'часа', 'часов'])}`;
        if (minutes > 0) return `${minutes} ${getEnding(minutes, ['минута', 'минуты', 'минут'])}`;
        return `${remainingSeconds} ${getEnding(remainingSeconds, ['секунда', 'секунды', 'секунд'])}`;
    }

    let result = '';
    if (days > 0) result += `${days} ${getEnding(days, ['день', 'дня', 'дней'])} `;
    if (hours > 0 || days > 0) result += `${hours} ${getEnding(hours, ['час', 'часа', 'часов'])} `;
    if (minutes > 0 || hours > 0 || days > 0) result += `${minutes} ${getEnding(minutes, ['минута', 'минуты', 'минут'])} `;
    result += `${remainingSeconds} ${getEnding(remainingSeconds, ['секунда', 'секунды', 'секунд'])}`;

    return result.trim();
}

// ============================================
// Функции работы со скинами
// ============================================

/**
 * Создаёт оверлей головы игрока из его скина
 * @param {string} username - Никнейм игрока
 * @param {HTMLElement} container - Контейнер для добавления оверлея
 */
function createHeadOverlay(username, container) {
    const skinUrl = `https://skin.vimeworld.com/raw/skin/${username}.png`;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scale = img.width / 64;
        const size = 8 * scale;
        
        canvas.width = size;
        canvas.height = size;
        // Вырезаем оверлей головы (координаты 40,8 размер 8x8 в стандартном скине)
        ctx.drawImage(img, 40 * scale, 8 * scale, size, size, 0, 0, size, size);
        
        const overlay = document.createElement('img');
        overlay.src = canvas.toDataURL();
        overlay.className = 'mini-head-overlay';
        container.appendChild(overlay);
    };
    
    img.src = skinUrl;
}

// ============================================
// Безопасные функции для работы с localStorage
// ============================================

/**
 * Безопасно получает значение из localStorage
 * @param {string} key - Ключ
 * @param {*} defaultValue - Значение по умолчанию
 * @returns {*} Значение из localStorage или defaultValue
 */
function safeGetItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

/**
 * Безопасно сохраняет значение в localStorage
 * @param {string} key - Ключ
 * @param {*} value - Значение для сохранения
 * @returns {boolean} true если успешно, false при ошибке
 */
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

// ============================================
// Безопасные функции для работы с API
// ============================================

/**
 * Безопасный вызов API с обработкой ошибок
 * @param {string} url - URL для запроса
 * @returns {Promise<object|null>} Данные ответа или null при ошибке
 */
async function safeApiCall(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}
