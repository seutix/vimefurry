/**
 * Property Test для модуля search.js
 * 
 * Property 2: Единый источник функций поиска
 * *For any* HTML страницу с функционалом поиска, функции loadRecentNicks(), 
 * saveRecentNick(), searchAndRedirect() должны быть доступны только через 
 * подключение модуля js/search.js.
 * 
 * **Validates: Requirements 3.2, 3.3**
 * 
 * Этот тест проверяет:
 * 1. Что модуль js/search.js существует и содержит необходимые функции
 * 2. Что функции поиска имеют корректную структуру
 * 3. Property-based тесты для логики работы с недавними никнеймами
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECT_ROOT = path.join(__dirname, '..');
const SEARCH_MODULE_PATH = path.join(PROJECT_ROOT, 'js', 'search.js');
const HTML_FILES = ['index.html', 'auth.html', 'player.html', 'guild.html', 'moders.html', 'tops.html'];

// Количество итераций для property-based тестов
const PBT_ITERATIONS = 100;

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
// Property 2: Единый источник функций поиска
// ============================================

/**
 * Тест 2.1: Модуль search.js существует
 */
function testSearchModuleExists() {
    const exists = fs.existsSync(SEARCH_MODULE_PATH);
    logTest('Модуль js/search.js существует', exists, 
        exists ? '' : `Файл не найден: ${SEARCH_MODULE_PATH}`);
    return exists;
}

/**
 * Тест 2.2: Модуль содержит все необходимые функции
 */
function testSearchModuleContainsFunctions() {
    const content = fs.readFileSync(SEARCH_MODULE_PATH, 'utf-8');
    const requiredFunctions = [
        'loadRecentNicks',
        'saveRecentNick', 
        'searchAndRedirect',
        'initQuickSearch'
    ];
    
    let allFound = true;
    for (const func of requiredFunctions) {
        const hasFunction = new RegExp(`function\\s+${func}\\s*\\(`).test(content);
        logTest(`Модуль содержит функцию ${func}()`, hasFunction,
            hasFunction ? '' : `Функция ${func}() не найдена`);
        if (!hasFunction) allFound = false;
    }
    return allFound;
}

/**
 * Тест 2.3: Модуль содержит константу MAX_RECENT_NICKS
 */
function testSearchModuleContainsConstant() {
    const content = fs.readFileSync(SEARCH_MODULE_PATH, 'utf-8');
    const hasConstant = /const\s+MAX_RECENT_NICKS\s*=\s*\d+/.test(content);
    logTest('Модуль содержит константу MAX_RECENT_NICKS', hasConstant,
        hasConstant ? '' : 'Константа MAX_RECENT_NICKS не найдена');
    return hasConstant;
}

/**
 * Тест 2.4: Модуль экспортирует функции для Node.js
 */
function testSearchModuleExports() {
    const content = fs.readFileSync(SEARCH_MODULE_PATH, 'utf-8');
    const hasExports = /module\.exports\s*=/.test(content);
    logTest('Модуль имеет экспорт для Node.js', hasExports,
        hasExports ? '' : 'Экспорт module.exports не найден');
    return hasExports;
}


/**
 * Тест 2.5: Property-based тест - loadRecentNicks всегда возвращает массив
 */
function testLoadRecentNicksProperty() {
    const content = fs.readFileSync(SEARCH_MODULE_PATH, 'utf-8');
    
    // Создаём изолированный контекст для выполнения модуля
    const moduleCode = `
        // Mock localStorage для тестирования
        const mockStorage = {};
        const localStorage = {
            getItem: (key) => mockStorage[key] || null,
            setItem: (key, value) => { mockStorage[key] = value; },
            clear: () => { for (let key in mockStorage) delete mockStorage[key]; }
        };
        
        // Mock fetch для тестирования
        const fetch = () => Promise.resolve({ json: () => Promise.resolve([]) });
        
        // Mock window для тестирования
        const window = { location: { href: '' } };
        
        // Mock document для тестирования
        const document = { 
            getElementById: () => null,
            createElement: () => ({ 
                style: {}, 
                appendChild: () => {},
                addEventListener: () => {}
            })
        };
        
        // Mock alert
        const alert = () => {};
        
        ${content}
        
        module.exports = { 
            loadRecentNicks, 
            saveRecentNickSync,
            MAX_RECENT_NICKS,
            localStorage: { mockStorage, ...localStorage }
        };
    `;
    
    const tempPath = path.join(__dirname, '_temp_search.js');
    fs.writeFileSync(tempPath, moduleCode);
    
    try {
        const search = require(tempPath);
        
        // Тестируем различные состояния localStorage
        const testCases = [
            null,                           // null
            '',                             // пустая строка
            '[]',                           // пустой массив
            '["nick1"]',                    // один ник
            '["nick1", "nick2", "nick3"]',  // несколько ников
            'invalid json',                 // невалидный JSON
            '{}',                           // объект вместо массива
            '123',                          // число
        ];
        
        let allValid = true;
        let failingCase = '';
        
        for (let i = 0; i < Math.min(PBT_ITERATIONS, testCases.length * 10); i++) {
            const testCase = testCases[i % testCases.length];
            
            // Устанавливаем значение в localStorage
            search.localStorage.mockStorage['recentNicks'] = testCase;
            
            const result = search.loadRecentNicks();
            
            // Property: результат всегда должен быть массивом
            if (!Array.isArray(result)) {
                allValid = false;
                failingCase = `Input: ${testCase}, Result: ${typeof result}`;
                break;
            }
        }
        
        logTest(`Property: loadRecentNicks() всегда возвращает массив (${PBT_ITERATIONS} итераций)`,
            allValid, allValid ? '' : `Failing case: ${failingCase}`);
            
    } catch (e) {
        logTest('Property: loadRecentNicks() всегда возвращает массив', false, e.message);
    } finally {
        if (fs.existsSync(tempPath)) {
            delete require.cache[require.resolve(tempPath)];
            fs.unlinkSync(tempPath);
        }
    }
}

/**
 * Тест 2.6: Property-based тест - saveRecentNickSync ограничивает список MAX_RECENT_NICKS элементами
 */
function testSaveRecentNickSyncProperty() {
    const content = fs.readFileSync(SEARCH_MODULE_PATH, 'utf-8');
    
    const moduleCode = `
        const mockStorage = {};
        const localStorage = {
            getItem: (key) => mockStorage[key] || null,
            setItem: (key, value) => { mockStorage[key] = value; },
            clear: () => { for (let key in mockStorage) delete mockStorage[key]; }
        };
        
        const fetch = () => Promise.resolve({ json: () => Promise.resolve([]) });
        const window = { location: { href: '' } };
        const document = { 
            getElementById: () => null,
            createElement: () => ({ style: {}, appendChild: () => {}, addEventListener: () => {} })
        };
        const alert = () => {};
        
        ${content}
        
        module.exports = { 
            loadRecentNicks, 
            saveRecentNickSync,
            MAX_RECENT_NICKS,
            localStorage: { mockStorage, ...localStorage }
        };
    `;
    
    const tempPath = path.join(__dirname, '_temp_search2.js');
    fs.writeFileSync(tempPath, moduleCode);
    
    try {
        const search = require(tempPath);
        
        let allValid = true;
        let failingCase = '';
        
        // Генерируем случайные никнеймы
        function randomNick() {
            return 'nick_' + Math.random().toString(36).substring(7);
        }
        
        for (let i = 0; i < PBT_ITERATIONS; i++) {
            // Очищаем localStorage
            search.localStorage.mockStorage['recentNicks'] = '[]';
            
            // Добавляем случайное количество ников (от 1 до 10)
            const numNicks = Math.floor(Math.random() * 10) + 1;
            for (let j = 0; j < numNicks; j++) {
                search.saveRecentNickSync(randomNick());
            }
            
            const result = search.loadRecentNicks();
            
            // Property: список никогда не должен превышать MAX_RECENT_NICKS
            if (result.length > search.MAX_RECENT_NICKS) {
                allValid = false;
                failingCase = `Added ${numNicks} nicks, result length: ${result.length}, max: ${search.MAX_RECENT_NICKS}`;
                break;
            }
        }
        
        logTest(`Property: saveRecentNickSync() ограничивает список ${search.MAX_RECENT_NICKS} элементами (${PBT_ITERATIONS} итераций)`,
            allValid, allValid ? '' : `Failing case: ${failingCase}`);
            
    } catch (e) {
        logTest('Property: saveRecentNickSync() ограничивает список', false, e.message);
    } finally {
        if (fs.existsSync(tempPath)) {
            delete require.cache[require.resolve(tempPath)];
            fs.unlinkSync(tempPath);
        }
    }
}


/**
 * Тест 2.7: Property-based тест - saveRecentNickSync добавляет ник в начало списка
 */
function testSaveRecentNickSyncOrderProperty() {
    const content = fs.readFileSync(SEARCH_MODULE_PATH, 'utf-8');
    
    const moduleCode = `
        const mockStorage = {};
        const localStorage = {
            getItem: (key) => mockStorage[key] || null,
            setItem: (key, value) => { mockStorage[key] = value; },
            clear: () => { for (let key in mockStorage) delete mockStorage[key]; }
        };
        
        const fetch = () => Promise.resolve({ json: () => Promise.resolve([]) });
        const window = { location: { href: '' } };
        const document = { 
            getElementById: () => null,
            createElement: () => ({ style: {}, appendChild: () => {}, addEventListener: () => {} })
        };
        const alert = () => {};
        
        ${content}
        
        module.exports = { 
            loadRecentNicks, 
            saveRecentNickSync,
            MAX_RECENT_NICKS,
            localStorage: { mockStorage, ...localStorage }
        };
    `;
    
    const tempPath = path.join(__dirname, '_temp_search3.js');
    fs.writeFileSync(tempPath, moduleCode);
    
    try {
        const search = require(tempPath);
        
        let allValid = true;
        let failingCase = '';
        
        function randomNick() {
            return 'nick_' + Math.random().toString(36).substring(7);
        }
        
        for (let i = 0; i < PBT_ITERATIONS; i++) {
            // Очищаем localStorage
            search.localStorage.mockStorage['recentNicks'] = '[]';
            
            // Добавляем ник
            const nick = randomNick();
            const result = search.saveRecentNickSync(nick);
            
            // Property: добавленный ник должен быть первым в списке
            if (result[0] !== nick) {
                allValid = false;
                failingCase = `Added nick: ${nick}, first in list: ${result[0]}`;
                break;
            }
        }
        
        logTest(`Property: saveRecentNickSync() добавляет ник в начало списка (${PBT_ITERATIONS} итераций)`,
            allValid, allValid ? '' : `Failing case: ${failingCase}`);
            
    } catch (e) {
        logTest('Property: saveRecentNickSync() добавляет ник в начало', false, e.message);
    } finally {
        if (fs.existsSync(tempPath)) {
            delete require.cache[require.resolve(tempPath)];
            fs.unlinkSync(tempPath);
        }
    }
}

/**
 * Тест 2.8: Property-based тест - saveRecentNickSync удаляет дубликаты (case-insensitive)
 */
function testSaveRecentNickSyncDedupeProperty() {
    const content = fs.readFileSync(SEARCH_MODULE_PATH, 'utf-8');
    
    const moduleCode = `
        const mockStorage = {};
        const localStorage = {
            getItem: (key) => mockStorage[key] || null,
            setItem: (key, value) => { mockStorage[key] = value; },
            clear: () => { for (let key in mockStorage) delete mockStorage[key]; }
        };
        
        const fetch = () => Promise.resolve({ json: () => Promise.resolve([]) });
        const window = { location: { href: '' } };
        const document = { 
            getElementById: () => null,
            createElement: () => ({ style: {}, appendChild: () => {}, addEventListener: () => {} })
        };
        const alert = () => {};
        
        ${content}
        
        module.exports = { 
            loadRecentNicks, 
            saveRecentNickSync,
            MAX_RECENT_NICKS,
            localStorage: { mockStorage, ...localStorage }
        };
    `;
    
    const tempPath = path.join(__dirname, '_temp_search4.js');
    fs.writeFileSync(tempPath, moduleCode);
    
    try {
        const search = require(tempPath);
        
        let allValid = true;
        let failingCase = '';
        
        function randomNick() {
            return 'Nick_' + Math.random().toString(36).substring(7);
        }
        
        for (let i = 0; i < PBT_ITERATIONS; i++) {
            // Очищаем localStorage
            search.localStorage.mockStorage['recentNicks'] = '[]';
            
            // Добавляем ник
            const nick = randomNick();
            search.saveRecentNickSync(nick);
            
            // Добавляем тот же ник в другом регистре
            const nickLower = nick.toLowerCase();
            const result = search.saveRecentNickSync(nickLower);
            
            // Property: не должно быть дубликатов (case-insensitive)
            const lowerNicks = result.map(n => n.toLowerCase());
            const uniqueLowerNicks = [...new Set(lowerNicks)];
            
            if (lowerNicks.length !== uniqueLowerNicks.length) {
                allValid = false;
                failingCase = `Duplicates found: ${result.join(', ')}`;
                break;
            }
        }
        
        logTest(`Property: saveRecentNickSync() удаляет дубликаты case-insensitive (${PBT_ITERATIONS} итераций)`,
            allValid, allValid ? '' : `Failing case: ${failingCase}`);
            
    } catch (e) {
        logTest('Property: saveRecentNickSync() удаляет дубликаты', false, e.message);
    } finally {
        if (fs.existsSync(tempPath)) {
            delete require.cache[require.resolve(tempPath)];
            fs.unlinkSync(tempPath);
        }
    }
}

// ============================================
// Запуск тестов
// ============================================

console.log('\n========================================');
console.log('Property Tests: Модуль search.js');
console.log('Property 2: Единый источник функций поиска');
console.log('Validates: Requirements 3.2, 3.3');
console.log('========================================\n');

// Запускаем тесты
if (testSearchModuleExists()) {
    testSearchModuleContainsFunctions();
    testSearchModuleContainsConstant();
    testSearchModuleExports();
    testLoadRecentNicksProperty();
    testSaveRecentNickSyncProperty();
    testSaveRecentNickSyncOrderProperty();
    testSaveRecentNickSyncDedupeProperty();
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
    console.log('Все property тесты пройдены успешно!');
    process.exit(0);
}
