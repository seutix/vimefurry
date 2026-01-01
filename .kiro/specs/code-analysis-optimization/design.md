# Design Document: Code Analysis and Optimization

## Overview

Данный документ описывает архитектуру и план рефакторинга проекта VimeStats. Цель — устранить выявленные проблемы (ошибки, дублирование, неиспользуемый код) и реорганизовать структуру проекта для повышения удобства сопровождения.

## Architecture

### Текущая структура (проблемная)

```
/
├── index.html          # Главная страница (встроенные стили и скрипты)
├── auth.html           # Страница авторизации (встроенные стили и скрипты)
├── player.html         # Профиль игрока (встроенные стили и скрипты)
├── guild.html          # Страница гильдии (встроенные стили и скрипты)
├── moders.html         # Страница модераторов (встроенные стили и скрипты)
├── tops.html           # Страница топов (встроенные стили и скрипты)
├── auth.js             # Логика авторизации
├── authUI.js           # НЕ ИСПОЛЬЗУЕТСЯ
├── settings.js         # Настройки сайта
├── responsive.css      # Адаптивные стили
├── settings.css        # Стили настроек
├── auth_include.txt    # НЕ ИСПОЛЬЗУЕТСЯ
├── vimeart*.ttf        # Шрифты
└── vimefurrybanner.jpg # Изображение
```

### Целевая структура (оптимизированная)

```
/
├── index.html          # Главная страница (минимальные встроенные стили)
├── auth.html           # Страница авторизации
├── player.html         # Профиль игрока
├── guild.html          # Страница гильдии
├── moders.html         # Страница модераторов
├── tops.html           # Страница топов
├── css/
│   ├── common.css      # Общие стили (навигация, компоненты)
│   ├── responsive.css  # Адаптивные стили
│   └── settings.css    # Стили настроек
├── js/
│   ├── ranks.js        # Данные о рангах
│   ├── search.js       # Функции поиска
│   ├── utils.js        # Утилиты (кеширование, API)
│   ├── navbar.js       # Компонент навигации
│   ├── auth.js         # Логика авторизации
│   └── settings.js     # Настройки сайта
└── assets/
    ├── fonts/          # Шрифты
    └── images/         # Изображения
```

## Components and Interfaces

### 1. Модуль ranks.js

```javascript
// js/ranks.js
const ranksData = {
    "PLAYER": { name: "Игрок", colors: [] },
    "VIP": { name: "VIP", colors: ["3dff80"] },
    // ... остальные ранги
};

function getRankInfo(rankCode) {
    return ranksData[rankCode] || ranksData["PLAYER"];
}

function getRankColors(rankCode) {
    const rank = getRankInfo(rankCode);
    return rank.colors.length > 0 ? rank.colors : ["cccccc"];
}

function getRankName(rankCode) {
    return getRankInfo(rankCode).name;
}

function getRankPriority(rankCode) {
    const priorities = {
        "ADMIN": 100, "CHIEF": 90, "WARDEN": 80,
        // ... остальные приоритеты
    };
    return priorities[rankCode] || 0;
}

function applyRankGradient(element, colors) {
    if (colors.length === 1) {
        element.style.background = `#${colors[0]}`;
    } else {
        element.style.background = `linear-gradient(to right, ${colors.map(c => `#${c}`).join(', ')})`;
    }
}
```

### 2. Модуль search.js

```javascript
// js/search.js
const MAX_RECENT_NICKS = 5;

function loadRecentNicks() {
    return JSON.parse(localStorage.getItem('recentNicks') || '[]');
}

function saveRecentNick(nick) {
    let nicks = loadRecentNicks();
    nicks = nicks.filter(n => n.toLowerCase() !== nick.toLowerCase());
    nicks.unshift(nick);
    nicks = nicks.slice(0, MAX_RECENT_NICKS);
    localStorage.setItem('recentNicks', JSON.stringify(nicks));
    return nicks;
}

async function getOriginalUsername(inputName) {
    const response = await fetch(`https://api.vimeworld.com/user/name/${inputName}`);
    const data = await response.json();
    if (data && data.length > 0) {
        return data[0].username;
    }
    return null;
}

async function searchAndRedirect(inputName) {
    if (!inputName.trim()) return;
    
    const lowerInput = inputName.toLowerCase();
    if (lowerInput.startsWith('id:')) {
        const playerId = inputName.slice(3).trim();
        if (!/^\d+$/.test(playerId)) {
            throw new Error('После "id:" должны быть только цифры');
        }
        const response = await fetch(`https://api.vimeworld.com/user/${playerId}`);
        const data = await response.json();
        if (data && data.length > 0) {
            const username = data[0].username;
            saveRecentNick(username);
            window.location.href = `player.html?username=${encodeURIComponent(username)}`;
        } else {
            throw new Error('Игрок с таким ID не найден');
        }
    } else {
        const username = await getOriginalUsername(inputName);
        if (username) {
            saveRecentNick(username);
            window.location.href = `player.html?username=${encodeURIComponent(username)}`;
        } else {
            throw new Error('Игрок не найден');
        }
    }
}

function initQuickSearch(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;
    
    // Инициализация обработчиков событий
    input.addEventListener('focus', () => updateRecentNicksDropdown(dropdown));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchAndRedirect(input.value);
    });
}
```

### 3. Модуль utils.js

```javascript
// js/utils.js
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

function savePlayerData(nick, data) {
    const cache = JSON.parse(localStorage.getItem('playerCache') || '{}');
    cache[nick] = { ...data, timestamp: Date.now() };
    localStorage.setItem('playerCache', JSON.stringify(cache));
}

function getPlayerData(nick) {
    const cache = JSON.parse(localStorage.getItem('playerCache') || '{}');
    const data = cache[nick];
    if (data && Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
    }
    return null;
}

async function fetchPlayerOnlineStatus(username) {
    try {
        const response = await fetch(`https://api.vimeworld.com/user/name/${username}/session`);
        const data = await response.json();
        return data?.online?.value ?? null;
    } catch {
        return null;
    }
}

function formatPlaytime(minutes) {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}д ${hours % 24}ч`;
    }
    return `${hours}ч ${minutes % 60}м`;
}

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
        ctx.drawImage(img, 40 * scale, 8 * scale, size, size, 0, 0, size, size);
        
        const overlay = document.createElement('img');
        overlay.src = canvas.toDataURL();
        overlay.className = 'mini-head-overlay';
        container.appendChild(overlay);
    };
    
    img.src = skinUrl;
}
```

### 4. Модуль navbar.js

```javascript
// js/navbar.js
function createNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg navbar-light bg-white shadow-sm';
    nav.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:1000;';
    
    nav.innerHTML = `
        <div class="container-fluid navbar-container">
            <a class="navbar-brand" href="index.html">VimeStats</a>
            <div class="navbar-center">
                <a href="tops.html" class="nav-link-custom">
                    <svg>...</svg> Топы
                </a>
                <a href="moders.html" class="nav-link-custom">
                    <svg>...</svg> Модеры
                </a>
            </div>
            <div class="navbar-search">
                <input type="text" id="quick-search" placeholder="Поиск" autocomplete="off">
                <div id="quick-search-btn">...</div>
                <div class="recent-nicks" id="quickRecentNicks">
                    <ul class="recent-nicks-list"></ul>
                </div>
            </div>
            <div id="auth-key-btn">...</div>
        </div>
    `;
    
    return nav;
}

function initNavbar() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        placeholder.replaceWith(createNavbar());
    } else {
        document.body.insertBefore(createNavbar(), document.body.firstChild);
    }
    
    // Инициализация поиска
    initQuickSearch('quick-search', 'quickRecentNicks');
}

document.addEventListener('DOMContentLoaded', initNavbar);
```

## Data Models

### PlayerCache

```typescript
interface PlayerCache {
    [username: string]: {
        rank: string;
        customColors: string[];
        username: string;
        timestamp: number;
    };
}
```

### OnlineStatus

```typescript
interface OnlineStatus {
    [username: string]: {
        status: boolean | 'unknown';
        timestamp: number;
    };
}
```

### RecentNicks

```typescript
type RecentNicks = string[]; // Массив никнеймов, максимум 5
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Единый источник данных о рангах

*For any* HTML страницу проекта, объект `ranksData` должен быть доступен только через подключение модуля `js/ranks.js`, и не должен быть определён inline в HTML файле.

**Validates: Requirements 2.2, 2.3**

### Property 2: Единый источник функций поиска

*For any* HTML страницу с функционалом поиска, функции `loadRecentNicks()`, `saveRecentNick()`, `searchAndRedirect()` должны быть доступны только через подключение модуля `js/search.js`.

**Validates: Requirements 3.2, 3.3**

### Property 3: Единый источник общих стилей

*For any* HTML страницу проекта, общие стили навигации, поиска и компонентов должны подключаться через `css/common.css`, а не быть определены inline.

**Validates: Requirements 4.2, 4.3**

### Property 4: Единый источник утилит

*For any* HTML страницу, использующую кеширование или работу с API, функции `savePlayerData()`, `getPlayerData()`, `fetchPlayerOnlineStatus()` должны быть доступны только через модуль `js/utils.js`.

**Validates: Requirements 6.2, 6.3**

### Property 5: Динамическая генерация навигации

*For any* HTML страницу проекта, навигационная панель должна генерироваться динамически через модуль `js/navbar.js`, а не быть определена статически в HTML.

**Validates: Requirements 7.2, 7.3**

### Property 6: Корректность путей после реструктуризации

*For any* ссылку на CSS, JavaScript или ресурс в HTML файлах, путь должен указывать на существующий файл в новой структуре папок.

**Validates: Requirements 8.4**

### Property 7: Сохранение API endpoints

*For any* вызов VimeWorld API после рефакторинга, URL endpoint должен оставаться идентичным исходному.

**Validates: Requirements 9.1**

### Property 8: Корректная обработка ошибок API

*For any* ошибку API (сетевая ошибка, 404, невалидный ответ), система должна отображать понятное сообщение пользователю и не вызывать необработанных исключений.

**Validates: Requirements 9.3**

## Error Handling

### Ошибки загрузки модулей

```javascript
// Проверка загрузки зависимостей
if (typeof ranksData === 'undefined') {
    console.error('ranks.js не загружен');
}
```

### Ошибки API

```javascript
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
```

### Ошибки localStorage

```javascript
function safeGetItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}
```

## Testing Strategy

### Unit Tests

Юнит-тесты для проверки конкретных примеров и граничных случаев:

1. **ranks.js**
   - `getRankInfo('ADMIN')` возвращает корректные данные
   - `getRankInfo('UNKNOWN')` возвращает данные PLAYER
   - `getRankColors()` возвращает массив цветов

2. **search.js**
   - `saveRecentNick()` добавляет ник в начало списка
   - `saveRecentNick()` удаляет дубликаты
   - `saveRecentNick()` ограничивает список 5 элементами

3. **utils.js**
   - `formatPlaytime(65)` возвращает "1ч 5м"
   - `formatPlaytime(1500)` возвращает "1д 1ч"
   - `getPlayerData()` возвращает null для устаревших данных

### Property-Based Tests

Свойственные тесты для проверки универсальных свойств:

1. **Property 1**: Проверка отсутствия inline определений ranksData
2. **Property 2**: Проверка отсутствия inline функций поиска
3. **Property 6**: Проверка валидности всех путей в HTML
4. **Property 7**: Проверка неизменности API endpoints

### Integration Tests

1. Загрузка каждой страницы без ошибок в консоли
2. Работа поиска на всех страницах
3. Корректное отображение рангов
4. Работа авторизации
