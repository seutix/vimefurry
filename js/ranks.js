// js/ranks.js
// Модуль данных о рангах VimeWorld

const ranksData = {
    "PLAYER": { name: "Игрок", colors: [] },
    "VIP": { name: "VIP", colors: ["3dff80"] },
    "PREMIUM": { name: "Premium", colors: ["3decff"] },
    "HOLY": { name: "Holy", colors: ["fff8a9", "ffa317"] },
    "IMMORTAL": { name: "Immortal", colors: ["ff70d1", "ff5d6d"] },
    "DIVINE": { name: "Divine", colors: ["b451ff", "84b5ff"] },
    "THANE": { name: "Thane", colors: ["30ff87", "1cffe4", "3594ff"] },
    "ELITE": { name: "Elite", colors: ["ffa51e", "ff5619", "ff314a"] },
    "ETERNAL": { name: "Eternal", colors: ["2688ed", "8b00d7", "ff4161"] },
    "CELESTIAL": { name: "Celestial", colors: ["e0f3ff", "bfdeff", "96c6ff", "6895d6"] },
    "ABSOLUTE": { name: "Absolute", colors: ["f200ff", "972a6e", "632f59", "dd57bc"] },
    "IMPERIAL": { name: "Imperial", colors: ["fdbd05", "ffa630", "fffabd", "fdbd05"] },
    "ULTIMATE": { name: "Ultimate", colors: ["4f4f4f", "737272", "fbf7ff", "3a3a3a"] },
    "VIME": { name: "Vime", colors: ["2599d4", "1d7cab"] },
    "JRBUILDER": { name: "Мл. Билдер", colors: ["bdecb6", "67ff54"] },
    "BUILDER": { name: "Билдер", colors: ["67ff54", "57c22d"] },
    "SRBUILDER": { name: "Ст. Билдер", colors: ["57c22d", "55961a"] },
    "MAPLEAD": { name: "Гл. Билдер", colors: ["55961a", "3f6e13"] },
    "YOUTUBE": { name: "Media", colors: ["bf2dff", "f33fd7"] },
    "DEV": { name: "Разработчик", colors: ["d61753"] },
    "ORGANIZER": { name: "Организатор", colors: ["0d83ae", "00c0eb"] },
    "HELPER": { name: "Хелпер", colors: ["76a6ff"] },
    "MODER": { name: "Модератор", colors: ["4e62eb"] },
    "WARDEN": { name: "Пр. Модератор", colors: ["3c36de"] },
    "CHIEF": { name: "Админ", colors: ["ff5e43", "db2100"] },
    "ADMIN": { name: "Гл. Админ", colors: ["ff2030", "d40048", "c1006b"] }
};

// Приоритеты рангов для сортировки
const rankPriorities = {
    "ADMIN": 100,
    "CHIEF": 90,
    "WARDEN": 80,
    "MODER": 70,
    "HELPER": 60,
    "ORGANIZER": 55,
    "DEV": 50,
    "MAPLEAD": 45,
    "SRBUILDER": 44,
    "BUILDER": 43,
    "JRBUILDER": 42,
    "YOUTUBE": 40,
    "VIME": 35,
    "ULTIMATE": 34,
    "IMPERIAL": 33,
    "ABSOLUTE": 32,
    "CELESTIAL": 31,
    "ETERNAL": 30,
    "ELITE": 28,
    "THANE": 26,
    "DIVINE": 24,
    "IMMORTAL": 22,
    "HOLY": 20,
    "PREMIUM": 15,
    "VIP": 10,
    "PLAYER": 0
};

/**
 * Получить информацию о ранге по коду
 * @param {string} rankCode - Код ранга (например, "ADMIN", "VIP")
 * @returns {Object} Объект с информацией о ранге {name, colors}
 */
function getRankInfo(rankCode) {
    return ranksData[rankCode] || ranksData["PLAYER"];
}

/**
 * Получить цвета ранга
 * @param {string} rankCode - Код ранга
 * @returns {string[]} Массив цветов в формате hex без #
 */
function getRankColors(rankCode) {
    const rank = getRankInfo(rankCode);
    return rank.colors.length > 0 ? rank.colors : ["cccccc"];
}

/**
 * Получить отображаемое имя ранга
 * @param {string} rankCode - Код ранга
 * @returns {string} Локализованное название ранга
 */
function getRankName(rankCode) {
    return getRankInfo(rankCode).name;
}

/**
 * Получить приоритет ранга для сортировки
 * @param {string} rankCode - Код ранга
 * @returns {number} Числовой приоритет (выше = важнее)
 */
function getRankPriority(rankCode) {
    return rankPriorities[rankCode] || 0;
}

/**
 * Применить градиент ранга к элементу
 * @param {HTMLElement} element - DOM элемент
 * @param {string[]} colors - Массив цветов
 */
function applyRankGradient(element, colors) {
    if (colors.length === 1) {
        element.style.background = `#${colors[0]}`;
    } else {
        element.style.background = `linear-gradient(to right, ${colors.map(c => `#${c}`).join(', ')})`;
    }
    element.style.webkitBackgroundClip = 'text';
    element.style.webkitTextFillColor = 'transparent';
    element.style.backgroundClip = 'text';
}

/**
 * Получить все коды рангов
 * @returns {string[]} Массив всех кодов рангов
 */
function getAllRankCodes() {
    return Object.keys(ranksData);
}

/**
 * Проверить, существует ли ранг
 * @param {string} rankCode - Код ранга
 * @returns {boolean} true если ранг существует
 */
function isValidRank(rankCode) {
    return rankCode in ranksData;
}
