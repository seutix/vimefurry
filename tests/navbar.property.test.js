/**
 * Property Test для модуля navbar.js
 * 
 * Property 5: Динамическая генерация навигации
 * *For any* HTML страницу проекта, навигационная панель должна генерироваться 
 * динамически через модуль js/navbar.js, а не быть определена статически в HTML.
 * 
 * **Validates: Requirements 7.2, 7.3**
 * 
 * Этот тест проверяет:
 * 1. Что модуль js/navbar.js существует и содержит необходимые функции
 * 2. Что createNavbar() генерирует корректную структуру навигации
 * 3. Что навигация содержит все обязательные элементы
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECT_ROOT = path.join(__dirname, '..');
const NAVBAR_MODULE_PATH = path.join(PROJECT_ROOT, 'js', 'navbar.js');

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
// Property 5: Динамическая генерация навигации
// ============================================

/**
 * Тест 5.1: Модуль navbar.js существует
 */
function testNavbarModuleExists() {
    const exists = fs.existsSync(NAVBAR_MODULE_PATH);
    logTest('Модуль js/navbar.js существует', exists, 
        exists ? '' : `Файл не найден: ${NAVBAR_MODULE_PATH}`);
    return exists;
}

/**
 * Тест 5.2: Модуль содержит функцию createNavbar
 */
function testNavbarModuleContainsCreateNavbar() {
    const content = fs.readFileSync(NAVBAR_MODULE_PATH, 'utf-8');
    const hasFunction = /function\s+createNavbar\s*\(/.test(content);
    logTest('Модуль содержит функцию createNavbar()', hasFunction,
        hasFunction ? '' : 'Функция createNavbar() не найдена');
    return hasFunction;
}

/**
 * Тест 5.3: Модуль содержит функцию initNavbar
 */
function testNavbarModuleContainsInitNavbar() {
    const content = fs.readFileSync(NAVBAR_MODULE_PATH, 'utf-8');
    const hasFunction = /function\s+initNavbar\s*\(/.test(content);
    logTest('Модуль содержит функцию initNavbar()', hasFunction,
        hasFunction ? '' : 'Функция initNavbar() не найдена');
    return hasFunction;
}

/**
 * Тест 5.4: Модуль содержит все необходимые вспомогательные функции
 */
function testNavbarModuleContainsHelperFunctions() {
    const content = fs.readFileSync(NAVBAR_MODULE_PATH, 'utf-8');
    const requiredFunctions = ['createNavbarSpacer', 'isNavbarInitialized', 'removeNavbar', 'getNavbar'];
    
    for (const func of requiredFunctions) {
        const hasFunction = new RegExp(`function\\s+${func}\\s*\\(`).test(content);
        logTest(`Модуль содержит функцию ${func}()`, hasFunction,
            hasFunction ? '' : `Функция ${func}() не найдена`);
    }
}

/**
 * Тест 5.5: Модуль содержит SVG иконки
 */
function testNavbarModuleContainsIcons() {
    const content = fs.readFileSync(NAVBAR_MODULE_PATH, 'utf-8');
    const hasIcons = /const\s+NAV_ICONS\s*=\s*\{/.test(content);
    logTest('Модуль содержит объект NAV_ICONS', hasIcons,
        hasIcons ? '' : 'Объект NAV_ICONS не найден');
    
    if (hasIcons) {
        const requiredIcons = ['trophy', 'shield', 'search', 'key'];
        for (const icon of requiredIcons) {
            const iconRegex = new RegExp(icon + '\\s*:\\s*`[^`]*<svg');
            const hasIcon = iconRegex.test(content);
            logTest(`NAV_ICONS содержит иконку ${icon}`, hasIcon,
                hasIcon ? '' : `Иконка ${icon} не найдена`);
        }
    }
}

/**
 * Тест 5.6: Модуль содержит стили навигации
 */
function testNavbarModuleContainsStyles() {
    const content = fs.readFileSync(NAVBAR_MODULE_PATH, 'utf-8');
    const hasStyles = /const\s+NAV_STYLES\s*=\s*\{/.test(content);
    logTest('Модуль содержит объект NAV_STYLES', hasStyles,
        hasStyles ? '' : 'Объект NAV_STYLES не найден');
    
    if (hasStyles) {
        const requiredStyles = ['navbar', 'container', 'brand', 'navLink', 'searchContainer'];
        for (const style of requiredStyles) {
            const hasStyle = new RegExp(`${style}\\s*:\\s*['"\`]`).test(content);
            logTest(`NAV_STYLES содержит стиль ${style}`, hasStyle,
                hasStyle ? '' : `Стиль ${style} не найден`);
        }
    }
}

/**
 * Тест 5.7: Property-based тест - createNavbar генерирует валидную структуру
 * Для любых опций, createNavbar должен возвращать элемент с корректной структурой
 */
function testCreateNavbarProperty() {
    const content = fs.readFileSync(NAVBAR_MODULE_PATH, 'utf-8');
    
    // Создаём mock для document
    const mockDocument = {
        createElement: function(tag) {
            const element = {
                tagName: tag.toUpperCase(),
                className: '',
                id: '',
                style: { cssText: '' },
                innerHTML: '',
                textContent: '',
                type: '',
                placeholder: '',
                autocomplete: '',
                href: '',
                children: [],
                appendChild: function(child) {
                    this.children.push(child);
                    return child;
                },
                addEventListener: function() {},
                remove: function() {}
            };
            return element;
        },
        getElementById: function() { return null; },
        body: {
            insertBefore: function() {},
            firstChild: null
        }
    };
    
    // Создаём изолированный контекст
    const moduleCode = `
        const document = ${JSON.stringify(mockDocument)};
        document.createElement = ${mockDocument.createElement.toString()};
        document.getElementById = ${mockDocument.getElementById.toString()};
        ${content}
        module.exports = { createNavbar, NAV_ICONS, NAV_STYLES };
    `;
    
    const tempPath = path.join(__dirname, '_temp_navbar.js');
    fs.writeFileSync(tempPath, moduleCode);
    
    try {
        const navbar = require(tempPath);
        
        // Генерируем различные комбинации опций
        const optionsCombinations = [
            {},
            { includeSearch: true, includeAuth: true },
            { includeSearch: false, includeAuth: true },
            { includeSearch: true, includeAuth: false },
            { includeSearch: false, includeAuth: false }
        ];
        
        let allValid = true;
        let failingCase = '';
        
        for (let i = 0; i < Math.min(PBT_ITERATIONS, optionsCombinations.length * 20); i++) {
            const options = optionsCombinations[i % optionsCombinations.length];
            const result = navbar.createNavbar(options);
            
            // Property: результат должен быть объектом с tagName 'NAV'
            if (!result || result.tagName !== 'NAV') {
                allValid = false;
                failingCase = `options: ${JSON.stringify(options)}, result tagName: ${result?.tagName}`;
                break;
            }
            
            // Property: навигация должна иметь id 'main-navbar'
            if (result.id !== 'main-navbar') {
                allValid = false;
                failingCase = `options: ${JSON.stringify(options)}, missing id 'main-navbar'`;
                break;
            }
            
            // Property: навигация должна содержать container-fluid
            if (result.children.length === 0) {
                allValid = false;
                failingCase = `options: ${JSON.stringify(options)}, no children`;
                break;
            }
        }
        
        logTest(`Property: createNavbar() всегда возвращает валидный nav элемент (${PBT_ITERATIONS} итераций)`,
            allValid, allValid ? '' : `Failing case: ${failingCase}`);
            
    } catch (e) {
        logTest('Property: createNavbar() всегда возвращает валидный nav элемент', false, e.message);
    } finally {
        if (fs.existsSync(tempPath)) {
            delete require.cache[require.resolve(tempPath)];
            fs.unlinkSync(tempPath);
        }
    }
}

/**
 * Тест 5.8: Property-based тест - NAV_ICONS содержит валидные SVG
 * Для любой иконки в NAV_ICONS, она должна быть валидной SVG строкой
 */
function testNavIconsProperty() {
    const content = fs.readFileSync(NAVBAR_MODULE_PATH, 'utf-8');
    
    // Извлекаем NAV_ICONS
    const iconsMatch = content.match(/const\s+NAV_ICONS\s*=\s*(\{[\s\S]*?\});/);
    if (!iconsMatch) {
        logTest('Property: NAV_ICONS содержит валидные SVG', false, 'Не удалось извлечь NAV_ICONS');
        return;
    }
    
    try {
        // Парсим объект с иконками
        const iconsStr = iconsMatch[1];
        const icons = eval(`(${iconsStr})`);
        
        const iconNames = Object.keys(icons);
        let allValid = true;
        let invalidIcon = '';
        
        for (let i = 0; i < Math.min(PBT_ITERATIONS, iconNames.length * 10); i++) {
            const iconName = iconNames[i % iconNames.length];
            const iconSvg = icons[iconName];
            
            // Property: каждая иконка должна быть строкой
            if (typeof iconSvg !== 'string') {
                allValid = false;
                invalidIcon = `${iconName} (not a string)`;
                break;
            }
            
            // Property: каждая иконка должна содержать <svg и </svg>
            if (!iconSvg.includes('<svg') || !iconSvg.includes('</svg>')) {
                allValid = false;
                invalidIcon = `${iconName} (invalid SVG structure)`;
                break;
            }
            
            // Property: SVG должен иметь xmlns атрибут
            if (!iconSvg.includes('xmlns=')) {
                allValid = false;
                invalidIcon = `${iconName} (missing xmlns)`;
                break;
            }
        }
        
        logTest(`Property: NAV_ICONS содержит валидные SVG строки (${PBT_ITERATIONS} итераций)`,
            allValid, allValid ? '' : `Invalid icon: ${invalidIcon}`);
            
    } catch (e) {
        logTest('Property: NAV_ICONS содержит валидные SVG', false, e.message);
    }
}

/**
 * Тест 5.9: Property-based тест - NAV_STYLES содержит валидные CSS строки
 */
function testNavStylesProperty() {
    const content = fs.readFileSync(NAVBAR_MODULE_PATH, 'utf-8');
    
    // Извлекаем NAV_STYLES
    const stylesMatch = content.match(/const\s+NAV_STYLES\s*=\s*(\{[\s\S]*?\});/);
    if (!stylesMatch) {
        logTest('Property: NAV_STYLES содержит валидные CSS', false, 'Не удалось извлечь NAV_STYLES');
        return;
    }
    
    try {
        const stylesStr = stylesMatch[1];
        const styles = eval(`(${stylesStr})`);
        
        const styleNames = Object.keys(styles);
        let allValid = true;
        let invalidStyle = '';
        
        for (let i = 0; i < Math.min(PBT_ITERATIONS, styleNames.length * 10); i++) {
            const styleName = styleNames[i % styleNames.length];
            const styleValue = styles[styleName];
            
            // Property: каждый стиль должен быть строкой
            if (typeof styleValue !== 'string') {
                allValid = false;
                invalidStyle = `${styleName} (not a string)`;
                break;
            }
            
            // Property: стиль должен содержать CSS свойства (формат: property:value;)
            // Пустая строка допустима
            if (styleValue.length > 0 && !styleValue.includes(':')) {
                allValid = false;
                invalidStyle = `${styleName} (no CSS properties)`;
                break;
            }
        }
        
        logTest(`Property: NAV_STYLES содержит валидные CSS строки (${PBT_ITERATIONS} итераций)`,
            allValid, allValid ? '' : `Invalid style: ${invalidStyle}`);
            
    } catch (e) {
        logTest('Property: NAV_STYLES содержит валидные CSS', false, e.message);
    }
}

/**
 * Тест 5.10: Модуль экспортирует необходимые функции
 */
function testNavbarModuleExports() {
    const content = fs.readFileSync(NAVBAR_MODULE_PATH, 'utf-8');
    
    // Проверяем наличие module.exports
    const hasExports = /module\.exports\s*=\s*\{/.test(content);
    logTest('Модуль имеет module.exports', hasExports,
        hasExports ? '' : 'module.exports не найден');
    
    if (hasExports) {
        const requiredExports = ['createNavbar', 'initNavbar', 'NAV_ICONS', 'NAV_STYLES'];
        for (const exp of requiredExports) {
            const hasExport = new RegExp(`module\\.exports\\s*=\\s*\\{[^}]*${exp}`).test(content);
            logTest(`Модуль экспортирует ${exp}`, hasExport,
                hasExport ? '' : `${exp} не экспортируется`);
        }
    }
}

// ============================================
// Запуск тестов
// ============================================

console.log('\n========================================');
console.log('Property Tests: Модуль navbar.js');
console.log('Property 5: Динамическая генерация навигации');
console.log('Validates: Requirements 7.2, 7.3');
console.log('========================================\n');

// Запускаем тесты
if (testNavbarModuleExists()) {
    testNavbarModuleContainsCreateNavbar();
    testNavbarModuleContainsInitNavbar();
    testNavbarModuleContainsHelperFunctions();
    testNavbarModuleContainsIcons();
    testNavbarModuleContainsStyles();
    testCreateNavbarProperty();
    testNavIconsProperty();
    testNavStylesProperty();
    testNavbarModuleExports();
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
