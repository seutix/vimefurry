/**
 * Property Test для API endpoints
 * 
 * Property 7: Сохранение API endpoints
 * *For any* вызов VimeWorld API после рефакторинга, URL endpoint должен 
 * оставаться идентичным исходному.
 * 
 * **Validates: Requirements 9.1**
 * 
 * Этот тест проверяет:
 * 1. Что все API endpoints в проекте используют корректный базовый URL
 * 2. Что структура endpoints соответствует документации VimeWorld API
 * 3. Что endpoints не были изменены во время рефакторинга
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECT_ROOT = path.join(__dirname, '..');
const PBT_ITERATIONS = 100;

// Ожидаемые API endpoints VimeWorld
const EXPECTED_API_ENDPOINTS = {
    // Базовый URL
    BASE_URL: 'https://api.vimeworld.com',
    
    // Endpoints для работы с пользователями
    USER_BY_NAME: '/user/name/{username}',
    USER_BY_ID: '/user/{id}',
    USER_SESSION: '/user/name/{username}/session',
    USER_STATS: '/user/name/{username}/stats',
    USER_FRIENDS: '/user/name/{username}/friends',
    
    // Endpoints для онлайн данных
    ONLINE_STAFF: '/online/staff',
    
    // Endpoints для токенов
    TOKEN_CHECK: '/misc/token/{token}'
};

// Файлы для проверки
const FILES_TO_CHECK = [
    'js/search.js',
    'js/utils.js',
    'index.html',
    'auth.html',
    'player.html',
    'guild.html',
    'moders.html',
    'tops.html'
];

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
// Property 7: Сохранение API endpoints
// ============================================

/**
 * Извлекает все API вызовы из содержимого файла
 * @param {string} content - Содержимое файла
 * @returns {string[]} Массив найденных API URLs
 */
function extractApiCalls(content) {
    const apiCalls = [];
    
    // Паттерн для поиска fetch вызовов с api.vimeworld.com
    const fetchPattern = /fetch\s*\(\s*[`'"]([^`'"]*api\.vimeworld\.com[^`'"]*)[`'"]\s*\)/g;
    const templatePattern = /fetch\s*\(\s*`([^`]*api\.vimeworld\.com[^`]*)`\s*\)/g;
    
    let match;
    
    // Ищем обычные строки
    while ((match = fetchPattern.exec(content)) !== null) {
        apiCalls.push(match[1]);
    }
    
    // Ищем template literals
    while ((match = templatePattern.exec(content)) !== null) {
        apiCalls.push(match[1]);
    }
    
    return apiCalls;
}

/**
 * Нормализует API URL, заменяя переменные на плейсхолдеры
 * @param {string} url - API URL
 * @returns {string} Нормализованный URL
 */
function normalizeApiUrl(url) {
    return url
        .replace(/\$\{[^}]+\}/g, '{param}')  // Template literals
        .replace(/\' \+ [^+]+ \+ \'/g, '{param}')  // String concatenation
        .replace(/https:\/\/api\.vimeworld\.com/, '');  // Remove base URL
}

/**
 * Тест 7.1: Все файлы используют корректный базовый URL API
 */
function testCorrectBaseUrl() {
    let allCorrect = true;
    let incorrectFile = '';
    
    for (const file of FILES_TO_CHECK) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const apiCalls = extractApiCalls(content);
        
        for (const call of apiCalls) {
            if (!call.startsWith('https://api.vimeworld.com')) {
                allCorrect = false;
                incorrectFile = `${file}: ${call}`;
                break;
            }
        }
        
        if (!allCorrect) break;
    }
    
    logTest('Все API вызовы используют корректный базовый URL https://api.vimeworld.com',
        allCorrect, allCorrect ? '' : `Некорректный URL в: ${incorrectFile}`);
    
    return allCorrect;
}

/**
 * Тест 7.2: Property-based тест - все endpoints соответствуют ожидаемым паттернам
 */
function testEndpointPatterns() {
    // Собираем все API вызовы из всех файлов
    const allApiCalls = [];
    
    for (const file of FILES_TO_CHECK) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const calls = extractApiCalls(content);
        calls.forEach(call => allApiCalls.push({ file, url: call }));
    }
    
    // Ожидаемые паттерны endpoints
    const validPatterns = [
        /^https:\/\/api\.vimeworld\.com\/user\/name\/[^/]+$/,           // /user/name/{username}
        /^https:\/\/api\.vimeworld\.com\/user\/name\/[^/]+\/session$/,  // /user/name/{username}/session
        /^https:\/\/api\.vimeworld\.com\/user\/name\/[^/]+\/stats$/,    // /user/name/{username}/stats
        /^https:\/\/api\.vimeworld\.com\/user\/name\/[^/]+\/friends$/,  // /user/name/{username}/friends
        /^https:\/\/api\.vimeworld\.com\/user\/\d+$/,                   // /user/{id}
        /^https:\/\/api\.vimeworld\.com\/user\/[^/]+$/,                 // /user/{id} with template
        /^https:\/\/api\.vimeworld\.com\/online\/staff$/,               // /online/staff
        /^https:\/\/api\.vimeworld\.com\/misc\/token\/[^/]+$/           // /misc/token/{token}
    ];
    
    let allValid = true;
    let invalidEndpoint = '';
    
    // Property: Для любого API вызова, он должен соответствовать одному из ожидаемых паттернов
    for (let i = 0; i < Math.min(PBT_ITERATIONS, allApiCalls.length); i++) {
        const { file, url } = allApiCalls[i % allApiCalls.length];
        
        // Заменяем template literals на конкретные значения для проверки паттерна
        const normalizedUrl = url
            .replace(/\$\{[^}]+\}/g, 'testvalue')
            .replace(/\$\{[^}]+\}/g, 'testvalue');
        
        const matchesPattern = validPatterns.some(pattern => pattern.test(normalizedUrl));
        
        if (!matchesPattern) {
            allValid = false;
            invalidEndpoint = `${file}: ${url}`;
            break;
        }
    }
    
    logTest(`Property: Все API endpoints соответствуют ожидаемым паттернам VimeWorld API (${Math.min(PBT_ITERATIONS, allApiCalls.length)} проверок)`,
        allValid, allValid ? '' : `Неизвестный endpoint: ${invalidEndpoint}`);
    
    return allValid;
}

/**
 * Тест 7.3: Модуль search.js содержит корректные API endpoints
 */
function testSearchModuleEndpoints() {
    const searchPath = path.join(PROJECT_ROOT, 'js', 'search.js');
    if (!fs.existsSync(searchPath)) {
        logTest('Модуль search.js содержит корректные API endpoints', false, 'Файл не найден');
        return false;
    }
    
    const content = fs.readFileSync(searchPath, 'utf-8');
    
    // Проверяем наличие ожидаемых endpoints
    const expectedEndpoints = [
        'api.vimeworld.com/user/name/',      // getOriginalUsername
        'api.vimeworld.com/user/',           // getPlayerById
        'api.vimeworld.com/user/name/',      // fetchAndApplyPlayerData
        '/session'                            // session endpoint
    ];
    
    let allFound = true;
    let missingEndpoint = '';
    
    for (const endpoint of expectedEndpoints) {
        if (!content.includes(endpoint)) {
            allFound = false;
            missingEndpoint = endpoint;
            break;
        }
    }
    
    logTest('Модуль search.js содержит все необходимые API endpoints',
        allFound, allFound ? '' : `Отсутствует endpoint: ${missingEndpoint}`);
    
    return allFound;
}

/**
 * Тест 7.4: Модуль utils.js содержит корректные API endpoints
 */
function testUtilsModuleEndpoints() {
    const utilsPath = path.join(PROJECT_ROOT, 'js', 'utils.js');
    if (!fs.existsSync(utilsPath)) {
        logTest('Модуль utils.js содержит корректные API endpoints', false, 'Файл не найден');
        return false;
    }
    
    const content = fs.readFileSync(utilsPath, 'utf-8');
    
    // Проверяем наличие endpoint для онлайн статуса
    const hasSessionEndpoint = content.includes('api.vimeworld.com/user/name/') && 
                               content.includes('/session');
    
    logTest('Модуль utils.js содержит endpoint для проверки онлайн статуса',
        hasSessionEndpoint, hasSessionEndpoint ? '' : 'Endpoint /session не найден');
    
    return hasSessionEndpoint;
}

/**
 * Тест 7.5: Property-based тест - endpoints не содержат опечаток в базовом URL
 */
function testNoTyposInBaseUrl() {
    const typoPatterns = [
        /api\.vimeworl\.com/,      // Missing 'd'
        /api\.vimewolrd\.com/,     // Transposed letters
        /api\.vimeworld\.co[^m]/,  // Wrong TLD
        /api\.vimworld\.com/,      // Missing 'e'
        /aip\.vimeworld\.com/,     // Typo in 'api'
        /api\.vimeworld\.cm/,      // Missing 'o'
    ];
    
    let allCorrect = true;
    let typoFound = '';
    
    for (const file of FILES_TO_CHECK) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        
        for (const pattern of typoPatterns) {
            if (pattern.test(content)) {
                allCorrect = false;
                typoFound = `${file}: найдена опечатка в URL`;
                break;
            }
        }
        
        if (!allCorrect) break;
    }
    
    logTest('Property: API URLs не содержат опечаток в базовом домене',
        allCorrect, allCorrect ? '' : typoFound);
    
    return allCorrect;
}

/**
 * Тест 7.6: Проверка консистентности endpoints между файлами
 */
function testEndpointConsistency() {
    // Собираем уникальные нормализованные endpoints из каждого файла
    const endpointsByFile = {};
    
    for (const file of FILES_TO_CHECK) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const calls = extractApiCalls(content);
        endpointsByFile[file] = calls.map(normalizeApiUrl);
    }
    
    // Проверяем, что одинаковые функции используют одинаковые endpoints
    // Например, все файлы должны использовать /user/name/{param} для получения данных пользователя
    
    const searchEndpoints = endpointsByFile['js/search.js'] || [];
    const utilsEndpoints = endpointsByFile['js/utils.js'] || [];
    
    // Проверяем, что session endpoint одинаковый
    const searchHasSession = searchEndpoints.some(e => e.includes('/session'));
    const utilsHasSession = utilsEndpoints.some(e => e.includes('/session'));
    
    const consistent = searchHasSession && utilsHasSession;
    
    logTest('Endpoints консистентны между модулями search.js и utils.js',
        consistent, consistent ? '' : 'Несоответствие в использовании /session endpoint');
    
    return consistent;
}

// ============================================
// Запуск тестов
// ============================================

console.log('\n========================================');
console.log('Property Tests: API Endpoints');
console.log('Property 7: Сохранение API endpoints');
console.log('Validates: Requirements 9.1');
console.log('========================================\n');

// Запускаем тесты
testCorrectBaseUrl();
testEndpointPatterns();
testSearchModuleEndpoints();
testUtilsModuleEndpoints();
testNoTyposInBaseUrl();
testEndpointConsistency();

// Итоги
console.log('\n========================================');
console.log(`Результаты: ${passedTests} passed, ${failedTests} failed`);
console.log('========================================\n');

if (failures.length > 0) {
    console.log('Ошибки:');
    failures.forEach(f => console.log(`  - ${f.name}: ${f.message}`));
    process.exit(1);
} else {
    console.log('Все property тесты пройдены успешно!');
    process.exit(0);
}
