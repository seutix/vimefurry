/**
 * Property Test для путей к ресурсам
 * 
 * Property 6: Корректность путей после реструктуризации
 * *For any* ссылку на CSS, JavaScript или ресурс в HTML файлах, 
 * путь должен указывать на существующий файл в новой структуре папок.
 * 
 * **Validates: Requirements 8.4**
 * 
 * Этот тест проверяет:
 * 1. Что все пути к CSS файлам корректны
 * 2. Что все пути к JavaScript файлам корректны
 * 3. Что все пути к шрифтам корректны
 * 4. Что все пути к изображениям корректны
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECT_ROOT = path.join(__dirname, '..');
const HTML_FILES = ['index.html', 'auth.html', 'player.html', 'guild.html', 'moders.html', 'tops.html'];
const CSS_FILES = ['css/common.css', 'css/responsive.css', 'css/settings.css'];

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

/**
 * Извлекает все локальные пути из HTML файла
 */
function extractLocalPaths(htmlContent, htmlFilePath) {
    const paths = [];
    
    // CSS ссылки: href="..."
    const cssRegex = /href=["']([^"']+\.css)["']/g;
    let match;
    while ((match = cssRegex.exec(htmlContent)) !== null) {
        const href = match[1];
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
            paths.push({ type: 'css', path: href, source: htmlFilePath });
        }
    }
    
    // JavaScript ссылки: src="..."
    const jsRegex = /src=["']([^"']+\.js)["']/g;
    while ((match = jsRegex.exec(htmlContent)) !== null) {
        const src = match[1];
        if (!src.startsWith('http://') && !src.startsWith('https://')) {
            paths.push({ type: 'js', path: src, source: htmlFilePath });
        }
    }
    
    // Изображения: src="..." (jpg, png, gif, svg)
    const imgRegex = /src=["']([^"']+\.(jpg|png|gif|svg))["']/g;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
        const src = match[1];
        if (!src.startsWith('http://') && !src.startsWith('https://') && !src.includes('${')) {
            paths.push({ type: 'image', path: src, source: htmlFilePath });
        }
    }
    
    return paths;
}

/**
 * Извлекает пути к шрифтам из CSS файла
 */
function extractFontPaths(cssContent, cssFilePath) {
    const paths = [];
    
    // url('...') в @font-face
    const fontRegex = /url\(['"]?([^'")\s]+\.ttf)['"]?\)/g;
    let match;
    while ((match = fontRegex.exec(cssContent)) !== null) {
        const url = match[1];
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            paths.push({ type: 'font', path: url, source: cssFilePath });
        }
    }
    
    return paths;
}

/**
 * Проверяет существование файла относительно базового пути
 */
function fileExists(basePath, relativePath) {
    // Обрабатываем относительные пути
    let fullPath;
    if (relativePath.startsWith('../')) {
        // Путь относительно родительской директории
        const baseDir = path.dirname(path.join(PROJECT_ROOT, basePath));
        fullPath = path.resolve(baseDir, relativePath);
    } else {
        // Путь относительно корня проекта
        fullPath = path.join(PROJECT_ROOT, relativePath);
    }
    return fs.existsSync(fullPath);
}

// ============================================
// Property 6: Корректность путей после реструктуризации
// ============================================

/**
 * Тест 6.1: Все HTML файлы существуют
 */
function testHtmlFilesExist() {
    let allExist = true;
    let missingFile = '';
    
    for (const htmlFile of HTML_FILES) {
        const fullPath = path.join(PROJECT_ROOT, htmlFile);
        if (!fs.existsSync(fullPath)) {
            allExist = false;
            missingFile = htmlFile;
            break;
        }
    }
    
    logTest(`Все HTML файлы существуют (${HTML_FILES.length} файлов)`, allExist,
        allExist ? '' : `Файл не найден: ${missingFile}`);
    return allExist;
}

/**
 * Тест 6.2: Все CSS файлы существуют
 */
function testCssFilesExist() {
    let allExist = true;
    let missingFile = '';
    
    for (const cssFile of CSS_FILES) {
        const fullPath = path.join(PROJECT_ROOT, cssFile);
        if (!fs.existsSync(fullPath)) {
            allExist = false;
            missingFile = cssFile;
            break;
        }
    }
    
    logTest(`Все CSS файлы существуют (${CSS_FILES.length} файлов)`, allExist,
        allExist ? '' : `Файл не найден: ${missingFile}`);
    return allExist;
}

/**
 * Тест 6.3: Папка assets/fonts существует и содержит шрифты
 */
function testFontsFolderExists() {
    const fontsPath = path.join(PROJECT_ROOT, 'assets', 'fonts');
    const exists = fs.existsSync(fontsPath);
    
    if (exists) {
        const files = fs.readdirSync(fontsPath);
        const ttfFiles = files.filter(f => f.endsWith('.ttf'));
        const hasFiles = ttfFiles.length > 0;
        logTest(`Папка assets/fonts существует и содержит шрифты (${ttfFiles.length} файлов)`, hasFiles,
            hasFiles ? '' : 'Папка пуста или не содержит .ttf файлов');
        return hasFiles;
    }
    
    logTest('Папка assets/fonts существует', false, 'Папка не найдена');
    return false;
}

/**
 * Тест 6.4: Папка assets/images существует
 */
function testImagesFolderExists() {
    const imagesPath = path.join(PROJECT_ROOT, 'assets', 'images');
    const exists = fs.existsSync(imagesPath);
    logTest('Папка assets/images существует', exists,
        exists ? '' : 'Папка не найдена');
    return exists;
}

/**
 * Тест 6.5: Property-based тест - все CSS ссылки в HTML файлах указывают на существующие файлы
 */
function testCssLinksInHtml() {
    const allPaths = [];
    
    for (const htmlFile of HTML_FILES) {
        const fullPath = path.join(PROJECT_ROOT, htmlFile);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const paths = extractLocalPaths(content, htmlFile);
            allPaths.push(...paths.filter(p => p.type === 'css'));
        }
    }
    
    let allValid = true;
    let invalidPath = '';
    
    for (let i = 0; i < Math.min(PBT_ITERATIONS, allPaths.length); i++) {
        const pathInfo = allPaths[i % allPaths.length];
        if (!fileExists(pathInfo.source, pathInfo.path)) {
            allValid = false;
            invalidPath = `${pathInfo.path} (в ${pathInfo.source})`;
            break;
        }
    }
    
    logTest(`Property: Все CSS ссылки в HTML указывают на существующие файлы (${allPaths.length} ссылок)`,
        allValid, allValid ? '' : `Файл не найден: ${invalidPath}`);
    return allValid;
}

/**
 * Тест 6.6: Property-based тест - все JavaScript ссылки в HTML файлах указывают на существующие файлы
 */
function testJsLinksInHtml() {
    const allPaths = [];
    
    for (const htmlFile of HTML_FILES) {
        const fullPath = path.join(PROJECT_ROOT, htmlFile);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const paths = extractLocalPaths(content, htmlFile);
            allPaths.push(...paths.filter(p => p.type === 'js'));
        }
    }
    
    let allValid = true;
    let invalidPath = '';
    
    for (let i = 0; i < Math.min(PBT_ITERATIONS, allPaths.length); i++) {
        const pathInfo = allPaths[i % allPaths.length];
        if (!fileExists(pathInfo.source, pathInfo.path)) {
            allValid = false;
            invalidPath = `${pathInfo.path} (в ${pathInfo.source})`;
            break;
        }
    }
    
    logTest(`Property: Все JavaScript ссылки в HTML указывают на существующие файлы (${allPaths.length} ссылок)`,
        allValid, allValid ? '' : `Файл не найден: ${invalidPath}`);
    return allValid;
}

/**
 * Тест 6.7: Property-based тест - все пути к изображениям в HTML файлах указывают на существующие файлы
 */
function testImageLinksInHtml() {
    const allPaths = [];
    
    for (const htmlFile of HTML_FILES) {
        const fullPath = path.join(PROJECT_ROOT, htmlFile);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const paths = extractLocalPaths(content, htmlFile);
            allPaths.push(...paths.filter(p => p.type === 'image'));
        }
    }
    
    let allValid = true;
    let invalidPath = '';
    
    for (let i = 0; i < Math.min(PBT_ITERATIONS, allPaths.length); i++) {
        const pathInfo = allPaths[i % allPaths.length];
        if (!fileExists(pathInfo.source, pathInfo.path)) {
            allValid = false;
            invalidPath = `${pathInfo.path} (в ${pathInfo.source})`;
            break;
        }
    }
    
    logTest(`Property: Все пути к изображениям в HTML указывают на существующие файлы (${allPaths.length} ссылок)`,
        allValid, allValid ? '' : `Файл не найден: ${invalidPath}`);
    return allValid;
}

/**
 * Тест 6.8: Property-based тест - все пути к шрифтам в CSS файлах указывают на существующие файлы
 */
function testFontLinksInCss() {
    const allPaths = [];
    
    for (const cssFile of CSS_FILES) {
        const fullPath = path.join(PROJECT_ROOT, cssFile);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const paths = extractFontPaths(content, cssFile);
            allPaths.push(...paths);
        }
    }
    
    let allValid = true;
    let invalidPath = '';
    
    for (let i = 0; i < Math.min(PBT_ITERATIONS, allPaths.length); i++) {
        const pathInfo = allPaths[i % allPaths.length];
        if (!fileExists(pathInfo.source, pathInfo.path)) {
            allValid = false;
            invalidPath = `${pathInfo.path} (в ${pathInfo.source})`;
            break;
        }
    }
    
    logTest(`Property: Все пути к шрифтам в CSS указывают на существующие файлы (${allPaths.length} ссылок)`,
        allValid, allValid ? '' : `Файл не найден: ${invalidPath}`);
    return allValid;
}

/**
 * Тест 6.9: Property-based тест - все пути к шрифтам в HTML файлах (inline @font-face) указывают на существующие файлы
 */
function testFontLinksInHtml() {
    const allPaths = [];
    
    for (const htmlFile of HTML_FILES) {
        const fullPath = path.join(PROJECT_ROOT, htmlFile);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const paths = extractFontPaths(content, htmlFile);
            allPaths.push(...paths);
        }
    }
    
    let allValid = true;
    let invalidPath = '';
    
    for (let i = 0; i < Math.min(PBT_ITERATIONS, allPaths.length); i++) {
        const pathInfo = allPaths[i % allPaths.length];
        if (!fileExists(pathInfo.source, pathInfo.path)) {
            allValid = false;
            invalidPath = `${pathInfo.path} (в ${pathInfo.source})`;
            break;
        }
    }
    
    logTest(`Property: Все пути к шрифтам в HTML указывают на существующие файлы (${allPaths.length} ссылок)`,
        allValid, allValid ? '' : `Файл не найден: ${invalidPath}`);
    return allValid;
}

/**
 * Тест 6.10: Property-based тест - нет ссылок на внешние шрифты vimeworld
 */
function testNoExternalFontLinks() {
    let hasExternalLinks = false;
    let externalLink = '';
    
    const allFiles = [...HTML_FILES, ...CSS_FILES];
    
    for (const file of allFiles) {
        const fullPath = path.join(PROJECT_ROOT, file);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('mc.vimeworld.com/assets/vimestats/vimeart')) {
                hasExternalLinks = true;
                externalLink = file;
                break;
            }
        }
    }
    
    logTest('Property: Нет ссылок на внешние шрифты vimeworld', !hasExternalLinks,
        !hasExternalLinks ? '' : `Найдена внешняя ссылка в ${externalLink}`);
    return !hasExternalLinks;
}

/**
 * Тест 6.11: Структура папок соответствует целевой архитектуре
 */
function testFolderStructure() {
    const requiredFolders = ['css', 'js', 'assets', 'assets/fonts', 'assets/images'];
    let allExist = true;
    let missingFolder = '';
    
    for (const folder of requiredFolders) {
        const fullPath = path.join(PROJECT_ROOT, folder);
        if (!fs.existsSync(fullPath)) {
            allExist = false;
            missingFolder = folder;
            break;
        }
    }
    
    logTest(`Структура папок соответствует целевой архитектуре (${requiredFolders.length} папок)`,
        allExist, allExist ? '' : `Папка не найдена: ${missingFolder}`);
    return allExist;
}

// ============================================
// Запуск тестов
// ============================================

console.log('\n========================================');
console.log('Property Tests: Пути к ресурсам');
console.log('Property 6: Корректность путей после реструктуризации');
console.log('Validates: Requirements 8.4');
console.log('========================================\n');

// Запускаем тесты
testHtmlFilesExist();
testCssFilesExist();
testFontsFolderExists();
testImagesFolderExists();
testFolderStructure();
testCssLinksInHtml();
testJsLinksInHtml();
testImageLinksInHtml();
testFontLinksInCss();
testFontLinksInHtml();
testNoExternalFontLinks();

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
