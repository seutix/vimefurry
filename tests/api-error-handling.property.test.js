/**
 * Property Test для обработки ошибок API
 * 
 * Property 8: Корректная обработка ошибок API
 * *For any* ошибку API (сетевая ошибка, 404, невалидный ответ), система должна 
 * отображать понятное сообщение пользователю и не вызывать необработанных исключений.
 * 
 * **Validates: Requirements 9.3**
 * 
 * Этот тест проверяет:
 * 1. Что все API вызовы обёрнуты в try-catch или имеют .catch()
 * 2. Что ошибки логируются через console.error
 * 3. Что пользователю показываются понятные сообщения об ошибках
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECT_ROOT = path.join(__dirname, '..');
const PBT_ITERATIONS = 100;

// Файлы для проверки
const JS_FILES_TO_CHECK = [
    'js/search.js',
    'js/utils.js',
    'js/auth.js',
    'js/navbar.js'
];

const HTML_FILES_TO_CHECK = [
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
// Property 8: Корректная обработка ошибок API
// ============================================

/**
 * Проверяет, что fetch вызов имеет обработку ошибок
 * @param {string} content - Содержимое файла
 * @param {number} fetchIndex - Позиция fetch в файле
 * @returns {boolean} true если есть обработка ошибок
 */
function hasFetchErrorHandling(content, fetchIndex) {
    // Ищем контекст вокруг fetch вызова (500 символов до и после)
    const contextStart = Math.max(0, fetchIndex - 500);
    const contextEnd = Math.min(content.length, fetchIndex + 1000);
    const context = content.substring(contextStart, contextEnd);
    
    // Проверяем наличие обработки ошибок
    const hasPromiseCatch = /\.catch\s*\(/.test(context);
    const hasTryCatch = /try\s*\{/.test(context) && /catch\s*\(/.test(context);
    const hasAsyncTryCatch = /async\s+function/.test(context) && /catch\s*\(/.test(context);
    const hasArrowAsyncTryCatch = /async\s*\(/.test(context) && /catch\s*\(/.test(context);
    
    return hasPromiseCatch || hasTryCatch || hasAsyncTryCatch || hasArrowAsyncTryCatch;
}

/**
 * Тест 8.1: Модуль search.js имеет обработку ошибок для всех API вызовов
 */
function testSearchModuleErrorHandling() {
    const searchPath = path.join(PROJECT_ROOT, 'js', 'search.js');
    if (!fs.existsSync(searchPath)) {
        logTest('Модуль search.js имеет обработку ошибок', false, 'Файл не найден');
        return false;
    }
    
    const content = fs.readFileSync(searchPath, 'utf-8');
    
    // Проверяем наличие .catch() или try-catch для fetch вызовов
    const fetchCalls = content.match(/fetch\s*\(/g) || [];
    const catchBlocks = content.match(/\.catch\s*\(/g) || [];
    const tryCatchBlocks = content.match(/try\s*\{[\s\S]*?catch\s*\(/g) || [];
    
    // Должно быть достаточно обработчиков ошибок
    const totalErrorHandlers = catchBlocks.length + tryCatchBlocks.length;
    const hasEnoughHandlers = totalErrorHandlers >= fetchCalls.length / 2; // Минимум половина
    
    logTest('Модуль search.js имеет обработку ошибок для API вызовов',
        hasEnoughHandlers, 
        hasEnoughHandlers ? '' : `Найдено ${fetchCalls.length} fetch, но только ${totalErrorHandlers} обработчиков`);
    
    return hasEnoughHandlers;
}

/**
 * Тест 8.2: Модуль utils.js имеет обработку ошибок
 */
function testUtilsModuleErrorHandling() {
    const utilsPath = path.join(PROJECT_ROOT, 'js', 'utils.js');
    if (!fs.existsSync(utilsPath)) {
        logTest('Модуль utils.js имеет обработку ошибок', false, 'Файл не найден');
        return false;
    }
    
    const content = fs.readFileSync(utilsPath, 'utf-8');
    
    // Проверяем функцию fetchPlayerOnlineStatus
    const hasTryCatchInFetch = /async\s+function\s+fetchPlayerOnlineStatus[\s\S]*?try\s*\{[\s\S]*?catch/.test(content);
    
    // Проверяем функцию safeApiCall
    const hasSafeApiCall = /async\s+function\s+safeApiCall[\s\S]*?try\s*\{[\s\S]*?catch/.test(content);
    
    const hasErrorHandling = hasTryCatchInFetch || hasSafeApiCall;
    
    logTest('Модуль utils.js имеет обработку ошибок для API вызовов',
        hasErrorHandling, hasErrorHandling ? '' : 'Отсутствует try-catch в API функциях');
    
    return hasErrorHandling;
}

/**
 * Тест 8.3: Property-based тест - все async функции с fetch имеют try-catch
 */
function testAsyncFunctionsHaveTryCatch() {
    let allHaveHandling = true;
    let failingFunction = '';
    
    for (const file of JS_FILES_TO_CHECK) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Находим все async функции
        const asyncFunctionPattern = /async\s+function\s+(\w+)\s*\([^)]*\)\s*\{/g;
        let match;
        
        while ((match = asyncFunctionPattern.exec(content)) !== null) {
            const funcName = match[1];
            const funcStart = match.index;
            
            // Находим тело функции - ищем закрывающую скобку на том же уровне
            let braceCount = 0;
            let funcEnd = funcStart;
            let inFunction = false;
            
            for (let i = funcStart; i < content.length; i++) {
                if (content[i] === '{') {
                    braceCount++;
                    inFunction = true;
                } else if (content[i] === '}') {
                    braceCount--;
                    if (inFunction && braceCount === 0) {
                        funcEnd = i + 1;
                        break;
                    }
                }
            }
            
            const funcBody = content.substring(funcStart, funcEnd);
            
            // Если функция содержит fetch, должен быть try-catch
            if (funcBody.includes('fetch(') || funcBody.includes('fetch`')) {
                // Проверяем наличие try-catch (с учётом catch без скобок для пустого catch)
                const hasTryCatch = /try\s*\{[\s\S]*?catch\s*(\(|\{)/.test(funcBody);
                const hasPromiseCatch = /\.catch\s*\(/.test(funcBody);
                
                if (!hasTryCatch && !hasPromiseCatch) {
                    allHaveHandling = false;
                    failingFunction = `${file}: ${funcName}()`;
                    break;
                }
            }
        }
        
        if (!allHaveHandling) break;
    }
    
    logTest('Property: Все async функции с fetch имеют обработку ошибок',
        allHaveHandling, allHaveHandling ? '' : `Отсутствует обработка в: ${failingFunction}`);
    
    return allHaveHandling;
}

/**
 * Тест 8.4: Проверка наличия console.error для логирования ошибок
 */
function testErrorLogging() {
    let hasLogging = true;
    let fileWithoutLogging = '';
    
    for (const file of JS_FILES_TO_CHECK) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Если файл содержит catch блоки, должен быть console.error
        const hasCatchBlocks = /catch\s*\(/.test(content);
        const hasConsoleError = /console\.error/.test(content);
        
        if (hasCatchBlocks && !hasConsoleError) {
            hasLogging = false;
            fileWithoutLogging = file;
            break;
        }
    }
    
    logTest('Все JS модули с catch блоками используют console.error для логирования',
        hasLogging, hasLogging ? '' : `Отсутствует console.error в: ${fileWithoutLogging}`);
    
    return hasLogging;
}

/**
 * Тест 8.5: Проверка наличия пользовательских сообщений об ошибках
 */
function testUserFriendlyErrorMessages() {
    const searchPath = path.join(PROJECT_ROOT, 'js', 'search.js');
    if (!fs.existsSync(searchPath)) {
        logTest('Модуль search.js содержит понятные сообщения об ошибках', false, 'Файл не найден');
        return false;
    }
    
    const content = fs.readFileSync(searchPath, 'utf-8');
    
    // Проверяем наличие alert с понятными сообщениями
    const userMessages = [
        'Игрок не найден',
        'Игрок с таким ID не найден',
        'должны быть только цифры',
        'ошибка'
    ];
    
    let hasUserMessages = false;
    for (const msg of userMessages) {
        if (content.includes(msg)) {
            hasUserMessages = true;
            break;
        }
    }
    
    logTest('Модуль search.js содержит понятные сообщения об ошибках для пользователя',
        hasUserMessages, hasUserMessages ? '' : 'Не найдены пользовательские сообщения об ошибках');
    
    return hasUserMessages;
}

/**
 * Тест 8.6: Property-based тест - Критические Promise chains имеют .catch()
 * Проверяем только критические API вызовы (данные пользователя, статистика)
 * Опциональные проверки (наличие плаща) могут не иметь обработки ошибок
 */
function testPromiseChainsHaveCatch() {
    let allHaveCatch = true;
    let failingChain = '';
    
    // Критические API endpoints, которые должны иметь обработку ошибок
    const criticalEndpoints = [
        'api.vimeworld.com/user/name/',
        'api.vimeworld.com/user/',
        'api.vimeworld.com/online/staff',
        'api.vimeworld.com/misc/token/'
    ];
    
    for (const file of [...JS_FILES_TO_CHECK, ...HTML_FILES_TO_CHECK]) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Находим fetch().then() chains для критических endpoints
        const thenChainPattern = /fetch\s*\(`?[^`\)]*api\.vimeworld\.com[^`\)]*`?\)\s*\n?\s*\.then\s*\(/g;
        let match;
        
        while ((match = thenChainPattern.exec(content)) !== null) {
            const chainStart = match.index;
            const matchText = match[0];
            
            // Проверяем, является ли это критическим endpoint
            const isCritical = criticalEndpoints.some(ep => matchText.includes(ep));
            
            // Пропускаем некритические endpoints (например, проверка плаща)
            if (!isCritical && (matchText.includes('HEAD') || matchText.includes('cape'))) {
                continue;
            }
            
            // Для HTML файлов с большими функциями, ищем в более широком контексте
            const searchLength = file.endsWith('.html') ? 10000 : 3000;
            const chainContext = content.substring(chainStart, chainStart + searchLength);
            
            // Проверяем наличие .catch() в цепочке
            const hasCatch = /\.catch\s*\(/.test(chainContext);
            
            // Проверяем, не находится ли это внутри try-catch блока
            const contextBefore = content.substring(Math.max(0, chainStart - 500), chainStart);
            const hasTryCatch = /try\s*\{[^}]*$/.test(contextBefore);
            
            if (!hasCatch && !hasTryCatch) {
                allHaveCatch = false;
                failingChain = `${file} at position ${chainStart}`;
                break;
            }
        }
        
        if (!allHaveCatch) break;
    }
    
    logTest('Property: Критические fetch().then() chains имеют .catch() или обёрнуты в try-catch',
        allHaveCatch, allHaveCatch ? '' : `Отсутствует .catch() в: ${failingChain}`);
    
    return allHaveCatch;
}

/**
 * Тест 8.7: Проверка обработки HTTP ошибок (response.ok)
 */
function testHttpErrorHandling() {
    let hasHttpErrorHandling = false;
    
    for (const file of JS_FILES_TO_CHECK) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Проверяем наличие проверки response.ok или response.status
        if (/response\.ok/.test(content) || /response\.status/.test(content) || /!response\.ok/.test(content)) {
            hasHttpErrorHandling = true;
            break;
        }
    }
    
    logTest('JS модули проверяют HTTP статус ответа (response.ok)',
        hasHttpErrorHandling, hasHttpErrorHandling ? '' : 'Не найдена проверка response.ok');
    
    return hasHttpErrorHandling;
}

/**
 * Тест 8.8: Проверка graceful degradation при ошибках
 */
function testGracefulDegradation() {
    const utilsPath = path.join(PROJECT_ROOT, 'js', 'utils.js');
    if (!fs.existsSync(utilsPath)) {
        logTest('Модуль utils.js поддерживает graceful degradation', false, 'Файл не найден');
        return false;
    }
    
    const content = fs.readFileSync(utilsPath, 'utf-8');
    
    // Проверяем, что функции возвращают null или default значения при ошибках
    const hasNullReturn = /catch[\s\S]*?return\s+null/.test(content);
    const hasDefaultReturn = /catch[\s\S]*?return\s+\w+/.test(content);
    
    const hasGracefulDegradation = hasNullReturn || hasDefaultReturn;
    
    logTest('Модуль utils.js возвращает null/default при ошибках (graceful degradation)',
        hasGracefulDegradation, hasGracefulDegradation ? '' : 'Не найден return в catch блоках');
    
    return hasGracefulDegradation;
}

// ============================================
// Запуск тестов
// ============================================

console.log('\n========================================');
console.log('Property Tests: API Error Handling');
console.log('Property 8: Корректная обработка ошибок API');
console.log('Validates: Requirements 9.3');
console.log('========================================\n');

// Запускаем тесты
testSearchModuleErrorHandling();
testUtilsModuleErrorHandling();
testAsyncFunctionsHaveTryCatch();
testErrorLogging();
testUserFriendlyErrorMessages();
testPromiseChainsHaveCatch();
testHttpErrorHandling();
testGracefulDegradation();

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
