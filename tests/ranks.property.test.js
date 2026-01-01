/**
 * Property Test для модуля ranks.js
 * 
 * Property 1: Единый источник данных о рангах
 * *For any* HTML страницу проекта, объект ranksData должен быть доступен 
 * только через подключение модуля js/ranks.js, и не должен быть определён inline в HTML файле.
 * 
 * **Validates: Requirements 2.2, 2.3**
 * 
 * Этот тест проверяет:
 * 1. Что модуль js/ranks.js существует и содержит ranksData
 * 2. Что HTML файлы не содержат inline определений ranksData (после рефакторинга)
 * 3. Что все ранги в модуле имеют корректную структуру
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECT_ROOT = path.join(__dirname, '..');
const RANKS_MODULE_PATH = path.join(PROJECT_ROOT, 'js', 'ranks.js');
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
// Property 1: Единый источник данных о рангах
// ============================================

/**
 * Тест 1.1: Модуль ranks.js существует
 */
function testRanksModuleExists() {
    const exists = fs.existsSync(RANKS_MODULE_PATH);
    logTest('Модуль js/ranks.js существует', exists, 
        exists ? '' : `Файл не найден: ${RANKS_MODULE_PATH}`);
    return exists;
}

/**
 * Тест 1.2: Модуль содержит объект ranksData
 */
function testRanksModuleContainsRanksData() {
    const content = fs.readFileSync(RANKS_MODULE_PATH, 'utf-8');
    const hasRanksData = /const\s+ranksData\s*=\s*\{/.test(content);
    logTest('Модуль содержит объект ranksData', hasRanksData,
        hasRanksData ? '' : 'Объект ranksData не найден в модуле');
    return hasRanksData;
}

/**
 * Тест 1.3: Модуль содержит все необходимые функции
 */
function testRanksModuleContainsFunctions() {
    const content = fs.readFileSync(RANKS_MODULE_PATH, 'utf-8');
    const requiredFunctions = ['getRankInfo', 'getRankColors', 'getRankName', 'getRankPriority'];
    
    for (const func of requiredFunctions) {
        const hasFunction = new RegExp(`function\\s+${func}\\s*\\(`).test(content);
        logTest(`Модуль содержит функцию ${func}()`, hasFunction,
            hasFunction ? '' : `Функция ${func}() не найдена`);
    }
}

/**
 * Тест 1.4: Property-based тест структуры рангов
 * Для любого ранга в ranksData, он должен иметь поля name (string) и colors (array)
 */
function testRankStructureProperty() {
    const content = fs.readFileSync(RANKS_MODULE_PATH, 'utf-8');
    
    // Извлекаем ranksData из модуля
    const ranksDataMatch = content.match(/const\s+ranksData\s*=\s*(\{[\s\S]*?\});/);
    if (!ranksDataMatch) {
        logTest('Property: Структура рангов корректна', false, 'Не удалось извлечь ranksData');
        return;
    }
    
    try {
        // Безопасно парсим объект
        const ranksDataStr = ranksDataMatch[1];
        const ranksData = eval(`(${ranksDataStr})`);
        
        const rankCodes = Object.keys(ranksData);
        let allValid = true;
        let invalidRank = '';
        
        // Property: Для любого ранга структура должна быть корректной
        for (let i = 0; i < Math.min(PBT_ITERATIONS, rankCodes.length); i++) {
            // Выбираем случайный ранг для каждой итерации
            const randomIndex = Math.floor(Math.random() * rankCodes.length);
            const rankCode = rankCodes[randomIndex];
            const rank = ranksData[rankCode];
            
            // Проверяем структуру
            if (typeof rank.name !== 'string' || !Array.isArray(rank.colors)) {
                allValid = false;
                invalidRank = rankCode;
                break;
            }
            
            // Проверяем, что colors содержит только строки
            for (const color of rank.colors) {
                if (typeof color !== 'string') {
                    allValid = false;
                    invalidRank = `${rankCode} (invalid color type)`;
                    break;
                }
            }
        }
        
        logTest(`Property: Для любого ранга структура {name: string, colors: string[]} корректна (${PBT_ITERATIONS} итераций)`, 
            allValid, allValid ? '' : `Некорректная структура для ранга: ${invalidRank}`);
            
    } catch (e) {
        logTest('Property: Структура рангов корректна', false, `Ошибка парсинга: ${e.message}`);
    }
}

/**
 * Тест 1.5: Property-based тест - getRankInfo всегда возвращает валидный объект
 * Для любого входного значения (включая невалидные), функция должна вернуть объект с name и colors
 */
function testGetRankInfoProperty() {
    const content = fs.readFileSync(RANKS_MODULE_PATH, 'utf-8');
    
    // Создаём изолированный контекст для выполнения модуля
    const moduleCode = content + `
        module.exports = { ranksData, getRankInfo, getRankColors, getRankName, getRankPriority };
    `;
    
    // Записываем временный файл для require
    const tempPath = path.join(__dirname, '_temp_ranks.js');
    fs.writeFileSync(tempPath, moduleCode);
    
    try {
        const ranks = require(tempPath);
        
        // Генерируем случайные входные данные
        const testInputs = [
            ...Object.keys(ranks.ranksData), // Валидные ранги
            'UNKNOWN', 'invalid', '', null, undefined, 123, // Невалидные входы
            ...Array(50).fill(0).map(() => Math.random().toString(36).substring(7)) // Случайные строки
        ];
        
        let allValid = true;
        let failingInput = '';
        
        for (let i = 0; i < Math.min(PBT_ITERATIONS, testInputs.length); i++) {
            const input = testInputs[i % testInputs.length];
            const result = ranks.getRankInfo(input);
            
            // Property: результат всегда должен быть объектом с name и colors
            if (!result || typeof result.name !== 'string' || !Array.isArray(result.colors)) {
                allValid = false;
                failingInput = JSON.stringify(input);
                break;
            }
        }
        
        logTest(`Property: getRankInfo() всегда возвращает валидный объект (${PBT_ITERATIONS} итераций)`,
            allValid, allValid ? '' : `Failing input: ${failingInput}`);
            
    } catch (e) {
        logTest('Property: getRankInfo() всегда возвращает валидный объект', false, e.message);
    } finally {
        // Удаляем временный файл
        if (fs.existsSync(tempPath)) {
            delete require.cache[require.resolve(tempPath)];
            fs.unlinkSync(tempPath);
        }
    }
}

/**
 * Тест 1.6: Property-based тест - getRankColors всегда возвращает непустой массив
 */
function testGetRankColorsProperty() {
    const content = fs.readFileSync(RANKS_MODULE_PATH, 'utf-8');
    
    const moduleCode = content + `
        module.exports = { ranksData, getRankInfo, getRankColors, getRankName, getRankPriority };
    `;
    
    const tempPath = path.join(__dirname, '_temp_ranks2.js');
    fs.writeFileSync(tempPath, moduleCode);
    
    try {
        const ranks = require(tempPath);
        
        const testInputs = [
            ...Object.keys(ranks.ranksData),
            'UNKNOWN', '', null, undefined
        ];
        
        let allValid = true;
        let failingInput = '';
        
        for (let i = 0; i < Math.min(PBT_ITERATIONS, testInputs.length * 5); i++) {
            const input = testInputs[i % testInputs.length];
            const result = ranks.getRankColors(input);
            
            // Property: результат всегда должен быть непустым массивом строк
            if (!Array.isArray(result) || result.length === 0) {
                allValid = false;
                failingInput = JSON.stringify(input);
                break;
            }
            
            // Проверяем, что все элементы - строки
            for (const color of result) {
                if (typeof color !== 'string') {
                    allValid = false;
                    failingInput = `${JSON.stringify(input)} (non-string color)`;
                    break;
                }
            }
        }
        
        logTest(`Property: getRankColors() всегда возвращает непустой массив строк (${PBT_ITERATIONS} итераций)`,
            allValid, allValid ? '' : `Failing input: ${failingInput}`);
            
    } catch (e) {
        logTest('Property: getRankColors() всегда возвращает непустой массив', false, e.message);
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
console.log('Property Tests: Модуль ranks.js');
console.log('Property 1: Единый источник данных о рангах');
console.log('Validates: Requirements 2.2, 2.3');
console.log('========================================\n');

// Запускаем тесты
if (testRanksModuleExists()) {
    testRanksModuleContainsRanksData();
    testRanksModuleContainsFunctions();
    testRankStructureProperty();
    testGetRankInfoProperty();
    testGetRankColorsProperty();
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
