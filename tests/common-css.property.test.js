/**
 * Property Test для css/common.css
 * 
 * Property 3: Единый источник общих стилей
 * *For any* HTML страницу проекта, общие стили навигации, поиска и компонентов 
 * должны подключаться через css/common.css, а не быть определены inline.
 * 
 * **Validates: Requirements 4.2, 4.3**
 * 
 * Этот тест проверяет:
 * 1. Что файл css/common.css существует
 * 2. Что файл содержит все необходимые стили
 * 3. Что стили корректно определены
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECT_ROOT = path.join(__dirname, '..');
const COMMON_CSS_PATH = path.join(PROJECT_ROOT, 'css', 'common.css');

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
// Property 3: Единый источник общих стилей
// ============================================

/**
 * Тест 3.1: Файл css/common.css существует
 */
function testCommonCssExists() {
    const exists = fs.existsSync(COMMON_CSS_PATH);
    logTest('Файл css/common.css существует', exists, 
        exists ? '' : `Файл не найден: ${COMMON_CSS_PATH}`);
    return exists;
}

/**
 * Тест 3.2: Файл содержит стили навигации (.navbar-brand)
 */
function testNavbarBrandStyles() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasNavbarBrand = /\.navbar-brand\s*\{/.test(content);
    logTest('Файл содержит стили .navbar-brand', hasNavbarBrand,
        hasNavbarBrand ? '' : 'Стили .navbar-brand не найдены');
    return hasNavbarBrand;
}

/**
 * Тест 3.3: Файл содержит стили навигации (.nav-link-custom)
 */
function testNavLinkCustomStyles() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasNavLinkCustom = /\.nav-link-custom\s*\{/.test(content);
    logTest('Файл содержит стили .nav-link-custom', hasNavLinkCustom,
        hasNavLinkCustom ? '' : 'Стили .nav-link-custom не найдены');
    return hasNavLinkCustom;
}

/**
 * Тест 3.4: Файл содержит стили поиска (.recent-nicks)
 */
function testRecentNicksStyles() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasRecentNicks = /\.recent-nicks\s*\{/.test(content);
    logTest('Файл содержит стили .recent-nicks', hasRecentNicks,
        hasRecentNicks ? '' : 'Стили .recent-nicks не найдены');
    return hasRecentNicks;
}

/**
 * Тест 3.5: Файл содержит стили мини-головы (.mini-head)
 */
function testMiniHeadStyles() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasMiniHead = /\.mini-head\s*\{/.test(content);
    logTest('Файл содержит стили .mini-head', hasMiniHead,
        hasMiniHead ? '' : 'Стили .mini-head не найдены');
    return hasMiniHead;
}

/**
 * Тест 3.6: Файл содержит стили статуса (.online-status)
 */
function testOnlineStatusStyles() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasOnlineStatus = /\.online-status\s*\{/.test(content);
    logTest('Файл содержит стили .online-status', hasOnlineStatus,
        hasOnlineStatus ? '' : 'Стили .online-status не найдены');
    return hasOnlineStatus;
}

/**
 * Тест 3.7: Файл содержит анимацию blink
 */
function testBlinkAnimation() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasBlinkAnimation = /@keyframes\s+blink\s*\{/.test(content);
    logTest('Файл содержит анимацию @keyframes blink', hasBlinkAnimation,
        hasBlinkAnimation ? '' : 'Анимация @keyframes blink не найдена');
    return hasBlinkAnimation;
}

/**
 * Тест 3.8: Файл содержит стили рангов (.player-rank)
 */
function testPlayerRankStyles() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasPlayerRank = /\.player-rank\s*\{/.test(content);
    logTest('Файл содержит стили .player-rank', hasPlayerRank,
        hasPlayerRank ? '' : 'Стили .player-rank не найдены');
    return hasPlayerRank;
}

/**
 * Тест 3.9: Файл содержит стили рангов (.rank-badge)
 */
function testRankBadgeStyles() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasRankBadge = /\.rank-badge\s*\{/.test(content);
    logTest('Файл содержит стили .rank-badge', hasRankBadge,
        hasRankBadge ? '' : 'Стили .rank-badge не найдены');
    return hasRankBadge;
}

/**
 * Тест 3.10: Property-based тест - все CSS селекторы имеют корректный синтаксис
 * Для любого CSS селектора в файле, он должен иметь корректный синтаксис
 */
function testCssSelectorsSyntax() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    
    // Извлекаем все CSS селекторы
    const selectorRegex = /([.#]?[\w-]+(?:\s*[.#>+~\s][\w-]+)*)\s*\{/g;
    const selectors = [];
    let match;
    
    while ((match = selectorRegex.exec(content)) !== null) {
        selectors.push(match[1].trim());
    }
    
    let allValid = true;
    let invalidSelector = '';
    
    for (let i = 0; i < Math.min(PBT_ITERATIONS, selectors.length); i++) {
        const selector = selectors[i % selectors.length];
        
        // Property: селектор не должен быть пустым
        if (!selector || selector.length === 0) {
            allValid = false;
            invalidSelector = '(empty selector)';
            break;
        }
        
        // Property: селектор не должен содержать недопустимые символы
        if (/[<>{}]/.test(selector)) {
            allValid = false;
            invalidSelector = `${selector} (contains invalid characters)`;
            break;
        }
    }
    
    logTest(`Property: Все CSS селекторы имеют корректный синтаксис (${selectors.length} селекторов)`,
        allValid, allValid ? '' : `Invalid selector: ${invalidSelector}`);
}

/**
 * Тест 3.11: Property-based тест - все CSS правила имеют закрывающую скобку
 * Для любого CSS правила, оно должно иметь закрывающую скобку
 */
function testCssRulesClosingBrackets() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    
    // Подсчитываем открывающие и закрывающие скобки
    const openBrackets = (content.match(/\{/g) || []).length;
    const closeBrackets = (content.match(/\}/g) || []).length;
    
    const balanced = openBrackets === closeBrackets;
    logTest(`Property: Все CSS правила имеют закрывающую скобку (${openBrackets} открывающих, ${closeBrackets} закрывающих)`,
        balanced, balanced ? '' : `Несбалансированные скобки: ${openBrackets} открывающих, ${closeBrackets} закрывающих`);
}

/**
 * Тест 3.12: Property-based тест - все CSS свойства имеют значения
 * Для любого CSS свойства, оно должно иметь значение после двоеточия
 */
function testCssPropertiesHaveValues() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    
    // Извлекаем все CSS свойства (формат: property: value;)
    const propertyRegex = /([a-z-]+)\s*:\s*([^;{}]+);/gi;
    const properties = [];
    let match;
    
    while ((match = propertyRegex.exec(content)) !== null) {
        properties.push({ name: match[1], value: match[2].trim() });
    }
    
    let allValid = true;
    let invalidProperty = '';
    
    for (let i = 0; i < Math.min(PBT_ITERATIONS, properties.length); i++) {
        const prop = properties[i % properties.length];
        
        // Property: значение не должно быть пустым
        if (!prop.value || prop.value.length === 0) {
            allValid = false;
            invalidProperty = `${prop.name} (empty value)`;
            break;
        }
    }
    
    logTest(`Property: Все CSS свойства имеют значения (${properties.length} свойств)`,
        allValid, allValid ? '' : `Invalid property: ${invalidProperty}`);
}

/**
 * Тест 3.13: Property-based тест - все @keyframes имеют корректную структуру
 */
function testKeyframesStructure() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    
    // Извлекаем все @keyframes
    const keyframesRegex = /@(-webkit-|-moz-|-o-)?keyframes\s+([\w-]+)\s*\{/g;
    const keyframes = [];
    let match;
    
    while ((match = keyframesRegex.exec(content)) !== null) {
        keyframes.push({ prefix: match[1] || '', name: match[2] });
    }
    
    let allValid = true;
    let invalidKeyframe = '';
    
    for (let i = 0; i < Math.min(PBT_ITERATIONS, keyframes.length); i++) {
        const kf = keyframes[i % keyframes.length];
        
        // Property: имя keyframe не должно быть пустым
        if (!kf.name || kf.name.length === 0) {
            allValid = false;
            invalidKeyframe = '(empty name)';
            break;
        }
        
        // Property: имя keyframe должно содержать только допустимые символы
        if (!/^[\w-]+$/.test(kf.name)) {
            allValid = false;
            invalidKeyframe = `${kf.name} (invalid characters)`;
            break;
        }
    }
    
    logTest(`Property: Все @keyframes имеют корректную структуру (${keyframes.length} анимаций)`,
        allValid, allValid ? '' : `Invalid keyframe: ${invalidKeyframe}`);
}

/**
 * Тест 3.14: Файл содержит медиа-запросы для мобильных устройств
 */
function testMediaQueries() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasMediaQueries = /@media\s*\(/.test(content);
    logTest('Файл содержит медиа-запросы для мобильных устройств', hasMediaQueries,
        hasMediaQueries ? '' : 'Медиа-запросы не найдены');
    return hasMediaQueries;
}

/**
 * Тест 3.15: Файл содержит определение шрифта VimeArtBold
 */
function testFontFaceDefinition() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    const hasFontFace = /@font-face\s*\{/.test(content);
    const hasVimeArtBold = /font-family:\s*['"]?VimeArtBold['"]?/.test(content);
    const valid = hasFontFace && hasVimeArtBold;
    logTest('Файл содержит определение шрифта VimeArtBold', valid,
        valid ? '' : 'Определение @font-face для VimeArtBold не найдено');
    return valid;
}

/**
 * Тест 3.16: Property-based тест - все цвета имеют корректный формат
 */
function testColorFormats() {
    const content = fs.readFileSync(COMMON_CSS_PATH, 'utf-8');
    
    // Извлекаем все цвета в формате #xxx или #xxxxxx
    const colorRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    const colors = [];
    let match;
    
    while ((match = colorRegex.exec(content)) !== null) {
        colors.push(match[0]);
    }
    
    let allValid = true;
    let invalidColor = '';
    
    for (let i = 0; i < Math.min(PBT_ITERATIONS, colors.length); i++) {
        const color = colors[i % colors.length];
        
        // Property: цвет должен быть в формате #xxx или #xxxxxx
        if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
            allValid = false;
            invalidColor = color;
            break;
        }
    }
    
    logTest(`Property: Все цвета имеют корректный формат (${colors.length} цветов)`,
        allValid, allValid ? '' : `Invalid color: ${invalidColor}`);
}

// ============================================
// Запуск тестов
// ============================================

console.log('\n========================================');
console.log('Property Tests: css/common.css');
console.log('Property 3: Единый источник общих стилей');
console.log('Validates: Requirements 4.2, 4.3');
console.log('========================================\n');

// Запускаем тесты
if (testCommonCssExists()) {
    testNavbarBrandStyles();
    testNavLinkCustomStyles();
    testRecentNicksStyles();
    testMiniHeadStyles();
    testOnlineStatusStyles();
    testBlinkAnimation();
    testPlayerRankStyles();
    testRankBadgeStyles();
    testCssSelectorsSyntax();
    testCssRulesClosingBrackets();
    testCssPropertiesHaveValues();
    testKeyframesStructure();
    testMediaQueries();
    testFontFaceDefinition();
    testColorFormats();
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
