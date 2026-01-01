# Requirements Document

## Introduction

Данный документ описывает требования к анализу и оптимизации проекта VimeStats — веб-приложения для отображения статистики игроков VimeWorld. Цель — выявить ошибки, дублирующийся код, неиспользуемые фрагменты и реорганизовать структуру проекта для повышения удобства сопровождения.

## Glossary

- **VimeStats**: Веб-приложение для просмотра статистики игроков VimeWorld
- **Analyzer**: Модуль анализа кода для выявления проблем
- **Refactoring_System**: Система рефакторинга для устранения выявленных проблем
- **Code_Deduplicator**: Компонент для устранения дублирующегося кода
- **Structure_Organizer**: Компонент для реорганизации структуры проекта

## Выявленные проблемы

### Критические ошибки в коде

1. **auth.html (строка ~270)**: Незакрытый тег `</div>` в форме авторизации — отсутствует закрывающий `</div>` для `<div class="mb-3">`
2. **player.html (строка ~1760)**: Дублированный тег `</style></head><body></body></style></head><body>` — синтаксическая ошибка HTML
3. **auth.js (строки 82-86)**: Дублированное объявление переменных `skinFullUrl` и `skinFullImg` — переменные объявлены дважды в одной функции

### Дублирующийся код

1. **ranksData объект**: Идентичный объект с данными о рангах дублируется в 6 файлах:
   - index.html
   - auth.html  
   - player.html
   - guild.html
   - moders.html
   - tops.html

2. **Функции работы с недавними никами**: Функции `loadQuickRecentNicks()`, `saveQuickNick()`, `updateQuickRecentNicksList()`, `getOriginalNameAndRedirect()` дублируются в:
   - index.html
   - auth.html
   - guild.html
   - tops.html
   - player.html

3. **Функции кеширования**: `savePlayerData()` и `getPlayerData()` дублируются в нескольких файлах

4. **CSS стили навигации**: Стили для `.navbar-brand`, `.recent-nicks`, `.mini-head`, `.online-status`, анимация `blink` дублируются во всех HTML файлах

5. **HTML навигации**: Идентичная структура навигационной панели копируется во все страницы

### Неиспользуемый код

1. **authUI.js**: Файл содержит упрощённую версию функций `checkAuth()` и `updateAuthUI()`, которые уже реализованы в auth.js. Файл не подключается ни к одной странице
2. **auth_include.txt**: Текстовый файл с HTML-кодом для подключения скрипта — не используется
3. **CSS класс `.experience-percent`**: Закомментирован в player.html, но не удалён
4. **Закомментированные стили scrollbar в player.html**: Неиспользуемые стили для кнопок прокрутки

### Проблемы структуры проекта

1. Все HTML файлы содержат встроенные стили вместо внешних CSS файлов
2. JavaScript код встроен в HTML вместо отдельных файлов
3. Отсутствует общий файл с утилитами и константами
4. Нет разделения на компоненты

## Requirements

### Requirement 1: Исправление критических ошибок

**User Story:** Как разработчик, я хочу исправить критические ошибки в коде, чтобы обеспечить корректную работу приложения.

#### Acceptance Criteria

1. WHEN auth.html загружается в браузер, THE Analyzer SHALL обнаружить и исправить незакрытый тег `</div>` в форме авторизации
2. WHEN player.html загружается в браузер, THE Analyzer SHALL обнаружить и удалить дублированные теги `</style></head><body>`
3. WHEN auth.js выполняется, THE Analyzer SHALL обнаружить и устранить дублированное объявление переменных `skinFullUrl` и `skinFullImg`

### Requirement 2: Устранение дублирования данных о рангах

**User Story:** Как разработчик, я хочу вынести данные о рангах в отдельный файл, чтобы избежать дублирования и упростить поддержку.

#### Acceptance Criteria

1. THE Code_Deduplicator SHALL создать файл `ranks.js` с объектом `ranksData` и вспомогательными функциями
2. WHEN любая страница загружается, THE Code_Deduplicator SHALL обеспечить доступ к данным о рангах через единый модуль
3. THE Code_Deduplicator SHALL удалить все дублирующиеся определения `ranksData` из HTML файлов

### Requirement 3: Устранение дублирования функций поиска

**User Story:** Как разработчик, я хочу вынести функции работы с недавними никами в отдельный модуль, чтобы избежать дублирования кода.

#### Acceptance Criteria

1. THE Code_Deduplicator SHALL создать файл `search.js` с функциями поиска и работы с недавними никами
2. WHEN пользователь использует поиск на любой странице, THE Code_Deduplicator SHALL обеспечить единообразное поведение через общий модуль
3. THE Code_Deduplicator SHALL удалить все дублирующиеся функции поиска из HTML файлов

### Requirement 4: Устранение дублирования CSS стилей

**User Story:** Как разработчик, я хочу вынести общие CSS стили в отдельный файл, чтобы избежать дублирования и упростить поддержку.

#### Acceptance Criteria

1. THE Code_Deduplicator SHALL создать файл `common.css` с общими стилями навигации, поиска и компонентов
2. WHEN любая страница загружается, THE Code_Deduplicator SHALL применить общие стили из единого файла
3. THE Code_Deduplicator SHALL удалить дублирующиеся стили из тегов `<style>` в HTML файлах

### Requirement 5: Удаление неиспользуемого кода

**User Story:** Как разработчик, я хочу удалить неиспользуемый код, чтобы уменьшить размер проекта и улучшить читаемость.

#### Acceptance Criteria

1. THE Analyzer SHALL идентифицировать файл `authUI.js` как неиспользуемый и удалить его или интегрировать с auth.js
2. THE Analyzer SHALL идентифицировать файл `auth_include.txt` как неиспользуемый и удалить его
3. THE Analyzer SHALL удалить закомментированный CSS код из player.html

### Requirement 6: Создание общего модуля утилит

**User Story:** Как разработчик, я хочу иметь общий модуль утилит, чтобы переиспользовать функции кеширования и работы с API.

#### Acceptance Criteria

1. THE Structure_Organizer SHALL создать файл `utils.js` с функциями `savePlayerData()`, `getPlayerData()` и другими утилитами
2. WHEN любая страница использует кеширование, THE Structure_Organizer SHALL обеспечить доступ через единый модуль
3. THE Structure_Organizer SHALL удалить дублирующиеся функции утилит из HTML файлов

### Requirement 7: Создание компонента навигации

**User Story:** Как разработчик, я хочу иметь переиспользуемый компонент навигации, чтобы избежать дублирования HTML кода.

#### Acceptance Criteria

1. THE Structure_Organizer SHALL создать файл `navbar.js` для динамической генерации навигационной панели
2. WHEN любая страница загружается, THE Structure_Organizer SHALL вставить навигацию через JavaScript
3. THE Structure_Organizer SHALL удалить дублирующийся HTML код навигации из всех страниц

### Requirement 8: Реорганизация структуры проекта

**User Story:** Как разработчик, я хочу иметь логичную структуру папок, чтобы легко находить и поддерживать код.

#### Acceptance Criteria

1. THE Structure_Organizer SHALL создать папку `css/` для всех CSS файлов
2. THE Structure_Organizer SHALL создать папку `js/` для всех JavaScript файлов
3. THE Structure_Organizer SHALL создать папку `assets/` для шрифтов и изображений
4. THE Structure_Organizer SHALL обновить все ссылки в HTML файлах на новые пути

### Requirement 9: Обеспечение совместимости с API

**User Story:** Как разработчик, я хочу убедиться, что рефакторинг не нарушит работу с VimeWorld API.

#### Acceptance Criteria

1. WHEN рефакторинг завершён, THE Refactoring_System SHALL сохранить все существующие вызовы API без изменений
2. WHEN пользователь ищет игрока, THE Refactoring_System SHALL корректно обрабатывать ответы API
3. IF API возвращает ошибку, THEN THE Refactoring_System SHALL отображать соответствующее сообщение пользователю
