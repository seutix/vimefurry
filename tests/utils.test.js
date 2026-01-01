/**
 * Unit Tests для модуля utils.js
 * 
 * Тестирует:
 * 1. formatPlaytime с разными значениями
 * 2. Кеширование с истечением срока
 * 
 * Requirements: 6.2
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECT_ROOT = path.join(__dirname, '..');
const UTILS_MODULE_PATH = path.join(PROJECT_ROOT, 'js', 'utils.js');

// Результаты тестов
let passedTests = 0;
let failedTests = 0;
const failures = [];

function logTest(name, passed, message = '') {
    if (passed) {
        passedTests++;
        console.log(`✓ ${name}`);
    } else {
        failedTests++;
        failures.push({ name, message });
        console.log(`✗ ${name}: ${message}`);
    }
}

// ============================================
// Загрузка модуля
// ============================================

function loadUtilsModule() {
    const content = fs.readFileSync(UTILS_MODULE_PATH, 'utf-8');
    
    // Добавляем экспорт для Node.js
    const moduleCode = content + `
        module.exports = { 
            CACHE_DURATION,
            savePlayerData, 
            getPlayerData, 
            cleanExpiredCache,
            fetchPlayerOnlineStatus,
            getEnding,
            formatPlaytime,
            createHeadOverlay,
            safeGetItem,
            safeSetItem,
            safeApiCall
        };
    `;
    
    const tempPath = path.join(__dirname, '_temp_utils.js');
    
    // Мокаем localStorage для Node.js
    const localStorageMock = `
        const localStorageData = {};
        const localStorage = {
            getItem: (key) => localStorageData[key] || null,
            setItem: (key, value) => { localStorageData[key] = value; },
            removeItem: (key) => { delete localStorageData[key]; },
            clear: () => { for (const key in localStorageData) delete localStorageData[key]; }
        };
        global.localStorage = localStorage;
        global._localStorageData = localStorageData;
    `;
    
    fs.writeFileSync(tempPath, localStorageMock + moduleCode);
    
    // Очищаем кеш require
    if (require.cache[require.resolve(tempPath)]) {
        delete require.cache[require.resolve(tempPath)];
    }
    
    return { module: require(tempPath), tempPath };
}

// ============================================
// Тесты formatPlaytime
// ============================================

function testFormatPlaytimeSeconds() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Тест: только секунды
        const result = module.formatPlaytime(45);
        const passed = result === '45 секунд';
        logTest('formatPlaytime(45) возвращает "45 секунд"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testFormatPlaytimeMinutes() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Тест: минуты
        const result = module.formatPlaytime(65);
        const passed = result === '1 минута';
        logTest('formatPlaytime(65) возвращает "1 минута"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testFormatPlaytimeHours() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Тест: часы
        const result = module.formatPlaytime(3700);
        const passed = result === '1 час';
        logTest('formatPlaytime(3700) возвращает "1 час"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testFormatPlaytimeDays() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Тест: дни (1 день = 86400 секунд)
        const result = module.formatPlaytime(90000);
        const passed = result === '1 день';
        logTest('formatPlaytime(90000) возвращает "1 день"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testFormatPlaytimeFullFormat() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Тест: полный формат (1 день 1 час 1 минута 1 секунда = 90061 секунд)
        const result = module.formatPlaytime(90061, true);
        const expected = '1 день 1 час 1 минута 1 секунда';
        const passed = result === expected;
        logTest('formatPlaytime(90061, true) возвращает полный формат', passed,
            passed ? '' : `Ожидалось: "${expected}", получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testFormatPlaytimePluralForms() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Тест: множественные формы (2 дня)
        const result = module.formatPlaytime(172800); // 2 дня
        const passed = result === '2 дня';
        logTest('formatPlaytime(172800) возвращает "2 дня"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testFormatPlaytimeFiveDays() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Тест: 5 дней (форма "дней")
        const result = module.formatPlaytime(432000); // 5 дней
        const passed = result === '5 дней';
        logTest('formatPlaytime(432000) возвращает "5 дней"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

// ============================================
// Тесты getEnding (вспомогательная функция)
// ============================================

function testGetEndingOne() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        const result = module.getEnding(1, ['день', 'дня', 'дней']);
        const passed = result === 'день';
        logTest('getEnding(1, [...]) возвращает "день"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testGetEndingTwo() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        const result = module.getEnding(2, ['день', 'дня', 'дней']);
        const passed = result === 'дня';
        logTest('getEnding(2, [...]) возвращает "дня"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testGetEndingEleven() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Особый случай: 11-19 используют форму "дней"
        const result = module.getEnding(11, ['день', 'дня', 'дней']);
        const passed = result === 'дней';
        logTest('getEnding(11, [...]) возвращает "дней"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testGetEndingTwentyOne() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // 21 использует форму "день"
        const result = module.getEnding(21, ['день', 'дня', 'дней']);
        const passed = result === 'день';
        logTest('getEnding(21, [...]) возвращает "день"', passed,
            passed ? '' : `Получено: "${result}"`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

// ============================================
// Тесты кеширования
// ============================================

function testSaveAndGetPlayerData() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Сохраняем данные
        module.savePlayerData('TestPlayer', { rank: 'VIP', customColors: ['ff0000'] });
        
        // Получаем данные
        const result = module.getPlayerData('TestPlayer');
        
        const passed = result !== null && 
                      result.rank === 'VIP' && 
                      Array.isArray(result.customColors) &&
                      result.customColors[0] === 'ff0000';
        
        logTest('savePlayerData/getPlayerData сохраняет и возвращает данные', passed,
            passed ? '' : `Получено: ${JSON.stringify(result)}`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testGetPlayerDataNonExistent() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Пытаемся получить несуществующие данные
        const result = module.getPlayerData('NonExistentPlayer');
        
        const passed = result === null;
        logTest('getPlayerData возвращает null для несуществующего игрока', passed,
            passed ? '' : `Получено: ${JSON.stringify(result)}`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testCacheExpiration() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Сохраняем данные с устаревшим timestamp
        const oldTimestamp = Date.now() - (6 * 60 * 1000); // 6 минут назад (больше CACHE_DURATION)
        
        // Напрямую записываем в localStorage с устаревшим timestamp
        const playerCache = {
            'OldPlayer': {
                rank: 'PLAYER',
                customColors: [],
                timestamp: oldTimestamp
            }
        };
        global.localStorage.setItem('playerCache', JSON.stringify(playerCache));
        
        // Пытаемся получить устаревшие данные
        const result = module.getPlayerData('OldPlayer');
        
        const passed = result === null;
        logTest('getPlayerData возвращает null для устаревших данных', passed,
            passed ? '' : `Ожидалось null, получено: ${JSON.stringify(result)}`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testCacheNotExpired() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Сохраняем данные с недавним timestamp
        const recentTimestamp = Date.now() - (2 * 60 * 1000); // 2 минуты назад (меньше CACHE_DURATION)
        
        const playerCache = {
            'RecentPlayer': {
                rank: 'VIP',
                customColors: ['00ff00'],
                timestamp: recentTimestamp
            }
        };
        global.localStorage.setItem('playerCache', JSON.stringify(playerCache));
        
        // Получаем данные
        const result = module.getPlayerData('RecentPlayer');
        
        const passed = result !== null && result.rank === 'VIP';
        logTest('getPlayerData возвращает данные если кеш не истёк', passed,
            passed ? '' : `Получено: ${JSON.stringify(result)}`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

function testCacheDurationConstant() {
    const { module, tempPath } = loadUtilsModule();
    
    try {
        // Проверяем, что CACHE_DURATION равен 5 минутам
        const passed = module.CACHE_DURATION === 5 * 60 * 1000;
        logTest('CACHE_DURATION равен 5 минутам (300000 мс)', passed,
            passed ? '' : `Получено: ${module.CACHE_DURATION}`);
    } finally {
        cleanupTempFile(tempPath);
    }
}

// ============================================
// Вспомогательные функции
// ============================================

function cleanupTempFile(tempPath) {
    if (fs.existsSync(tempPath)) {
        delete require.cache[require.resolve(tempPath)];
        fs.unlinkSync(tempPath);
    }
}

// ============================================
// Тест существования модуля
// ============================================

function testUtilsModuleExists() {
    const exists = fs.existsSync(UTILS_MODULE_PATH);
    logTest('Модуль js/utils.js существует', exists,
        exists ? '' : `Файл не найден: ${UTILS_MODULE_PATH}`);
    return exists;
}

function testUtilsModuleContainsFunctions() {
    const content = fs.readFileSync(UTILS_MODULE_PATH, 'utf-8');
    const requiredFunctions = [
        'savePlayerData',
        'getPlayerData',
        'fetchPlayerOnlineStatus',
        'formatPlaytime',
        'createHeadOverlay'
    ];
    
    for (const func of requiredFunctions) {
        const hasFunction = new RegExp(`function\\s+${func}\\s*\\(`).test(content);
        logTest(`Модуль содержит функцию ${func}()`, hasFunction,
            hasFunction ? '' : `Функция ${func}() не найдена`);
    }
}

// ============================================
// Запуск тестов
// ============================================

console.log('\n========================================');
console.log('Unit Tests: Модуль utils.js');
console.log('Requirements: 6.2');
console.log('========================================\n');

// Проверяем существование модуля
if (testUtilsModuleExists()) {
    console.log('\n--- Проверка структуры модуля ---\n');
    testUtilsModuleContainsFunctions();
    
    console.log('\n--- Тесты formatPlaytime ---\n');
    testFormatPlaytimeSeconds();
    testFormatPlaytimeMinutes();
    testFormatPlaytimeHours();
    testFormatPlaytimeDays();
    testFormatPlaytimeFullFormat();
    testFormatPlaytimePluralForms();
    testFormatPlaytimeFiveDays();
    
    console.log('\n--- Тесты getEnding ---\n');
    testGetEndingOne();
    testGetEndingTwo();
    testGetEndingEleven();
    testGetEndingTwentyOne();
    
    console.log('\n--- Тесты кеширования ---\n');
    testCacheDurationConstant();
    testSaveAndGetPlayerData();
    testGetPlayerDataNonExistent();
    testCacheExpiration();
    testCacheNotExpired();
}

// Итоги
console.log('\n========================================');
console.log(`Результаты: ${passedTests} passed, ${failedTests} failed`);
console.log('========================================\n');

if (failures.length > 0) {
    console.log('Ошибки:');
    failures.forEach(f => console.log(`  - ${f.name}: ${f.message}`));
    process.exit(1);
} else {
    console.log('Все unit тесты пройдены успешно!');
    process.exit(0);
}
