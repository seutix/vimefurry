# Implementation Plan: Code Analysis and Optimization

## Overview

План реализации рефакторинга проекта VimeStats. Задачи организованы в логическом порядке: сначала исправление критических ошибок, затем создание общих модулей, и наконец реструктуризация проекта.

## Tasks

- [x] 1. Исправление критических ошибок в коде
  - [x] 1.1 Исправить незакрытый тег `</div>` в auth.html
    - Найти форму авторизации и добавить закрывающий тег
    - _Requirements: 1.1_
  - [x] 1.2 Удалить дублированные теги в player.html
    - Найти и удалить `</style></head><body></body></style></head><body>`
    - _Requirements: 1.2_
  - [x] 1.3 Устранить дублированное объявление переменных в auth.js
    - Удалить повторное объявление `skinFullUrl` и `skinFullImg`
    - _Requirements: 1.3_

- [x] 2. Checkpoint - Проверка исправлений
  - Убедиться, что все страницы загружаются без ошибок в консоли

- [x] 3. Создание структуры папок
  - [x] 3.1 Создать папку `css/` и переместить CSS файлы
    - Переместить responsive.css и settings.css
    - _Requirements: 8.1_
  - [x] 3.2 Создать папку `js/` для JavaScript файлов
    - Переместить auth.js и settings.js
    - _Requirements: 8.2_
  - [x] 3.3 Создать папку `assets/` для ресурсов
    - Создать подпапки fonts/ и images/
    - Переместить шрифты и изображения
    - _Requirements: 8.3_

- [x] 4. Создание модуля ranks.js
  - [x] 4.1 Создать файл js/ranks.js с объектом ranksData
    - Экспортировать ranksData и вспомогательные функции
    - Включить getRankInfo, getRankColors, getRankName, getRankPriority
    - _Requirements: 2.1_
  - [x] 4.2 Написать property test для модуля ranks.js
    - **Property 1: Единый источник данных о рангах**
    - **Validates: Requirements 2.2, 2.3**

- [x] 5. Создание модуля search.js
  - [x] 5.1 Создать файл js/search.js с функциями поиска
    - Включить loadRecentNicks, saveRecentNick, searchAndRedirect
    - Включить initQuickSearch для инициализации поиска
    - _Requirements: 3.1_
  - [x] 5.2 Написать property test для модуля search.js
    - **Property 2: Единый источник функций поиска**
    - **Validates: Requirements 3.2, 3.3**

- [x] 6. Создание модуля utils.js
  - [x] 6.1 Создать файл js/utils.js с утилитами
    - Включить savePlayerData, getPlayerData, fetchPlayerOnlineStatus
    - Включить formatPlaytime, createHeadOverlay
    - _Requirements: 6.1_
  - [x] 6.2 Написать unit тесты для utils.js
    - Тестировать formatPlaytime с разными значениями
    - Тестировать кеширование с истечением срока
    - _Requirements: 6.2_

- [x] 7. Создание модуля navbar.js
  - [x] 7.1 Создать файл js/navbar.js для генерации навигации
    - Создать функцию createNavbar() для генерации HTML
    - Создать функцию initNavbar() для инициализации
    - _Requirements: 7.1_
  - [x] 7.2 Написать property test для navbar.js
    - **Property 5: Динамическая генерация навигации**
    - **Validates: Requirements 7.2, 7.3**

- [x] 8. Создание общего CSS файла
  - [x] 8.1 Создать файл css/common.css
    - Вынести стили навигации (.navbar-brand, .nav-link-custom)
    - Вынести стили поиска (.recent-nicks, .mini-head)
    - Вынести стили статуса (.online-status, анимация blink)
    - Вынести стили рангов (.player-rank, .rank-badge)
    - _Requirements: 4.1_
  - [x] 8.2 Написать property test для CSS
    - **Property 3: Единый источник общих стилей**
    - **Validates: Requirements 4.2, 4.3**

- [x] 9. Checkpoint - Проверка модулей
  - Убедиться, что все модули загружаются корректно
  - Проверить отсутствие конфликтов имён

- [x] 10. Интеграция модулей в index.html
  - [x] 10.1 Обновить подключения скриптов и стилей
    - Подключить css/common.css
    - Подключить js/ranks.js, js/search.js, js/utils.js, js/navbar.js
    - _Requirements: 8.4_
  - [x] 10.2 Удалить дублирующийся код из index.html
    - Удалить inline определение ranksData
    - Удалить inline функции поиска
    - Удалить статическую навигацию
    - _Requirements: 2.3, 3.3, 7.3_

- [x] 11. Интеграция модулей в auth.html
  - [x] 11.1 Обновить подключения скриптов и стилей
    - Подключить общие модули
    - _Requirements: 8.4_
  - [x] 11.2 Удалить дублирующийся код из auth.html
    - Удалить inline определение ranksData
    - Удалить inline функции поиска
    - _Requirements: 2.3, 3.3_

- [x] 12. Интеграция модулей в player.html
  - [x] 12.1 Обновить подключения скриптов и стилей
    - Подключить общие модули
    - _Requirements: 8.4_
  - [x] 12.2 Удалить дублирующийся код из player.html
    - Удалить inline определение ranksData
    - Удалить inline функции поиска
    - Удалить закомментированный CSS
    - _Requirements: 2.3, 3.3, 5.3_

- [x] 13. Интеграция модулей в guild.html
  - [x] 13.1 Обновить подключения скриптов и стилей
    - Подключить общие модули
    - _Requirements: 8.4_
  - [x] 13.2 Удалить дублирующийся код из guild.html
    - Удалить inline определение ranksData
    - Удалить inline функции поиска
    - _Requirements: 2.3, 3.3_

- [x] 14. Интеграция модулей в moders.html
  - [x] 14.1 Обновить подключения скриптов и стилей
    - Подключить общие модули
    - _Requirements: 8.4_
  - [x] 14.2 Удалить дублирующийся код из moders.html
    - Удалить inline определение ranksData
    - Удалить inline функции поиска
    - _Requirements: 2.3, 3.3_

- [x] 15. Интеграция модулей в tops.html
  - [x] 15.1 Обновить подключения скриптов и стилей
    - Подключить общие модули
    - _Requirements: 8.4_
  - [x] 15.2 Удалить дублирующийся код из tops.html
    - Удалить inline определение ranksData
    - Удалить inline функции поиска
    - _Requirements: 2.3, 3.3_

- [x] 16. Checkpoint - Проверка интеграции
  - Проверить работу всех страниц
  - Убедиться в работе поиска на каждой странице
  - Проверить отображение рангов

- [x] 17. Удаление неиспользуемых файлов
  - [x] 17.1 Удалить или интегрировать authUI.js
    - Проверить, нужен ли функционал из authUI.js
    - Удалить файл если не нужен
    - _Requirements: 5.1_
  - [x] 17.2 Удалить auth_include.txt
    - Файл не используется
    - _Requirements: 5.2_

- [x] 18. Обновление путей к ресурсам
  - [x] 18.1 Обновить пути к шрифтам во всех файлах
    - Изменить пути на assets/fonts/
    - _Requirements: 8.4_
  - [x] 18.2 Обновить пути к изображениям
    - Изменить пути на assets/images/
    - _Requirements: 8.4_
  - [x] 18.3 Написать property test для путей
    - **Property 6: Корректность путей после реструктуризации**
    - **Validates: Requirements 8.4**

- [x] 19. Проверка совместимости с API
  - [x] 19.1 Написать property test для API endpoints
    - **Property 7: Сохранение API endpoints**
    - **Validates: Requirements 9.1**
  - [x] 19.2 Написать property test для обработки ошибок
    - **Property 8: Корректная обработка ошибок API**
    - **Validates: Requirements 9.3**

- [x] 20. Final Checkpoint - Финальная проверка
  - Убедиться, что все страницы работают корректно
  - Проверить отсутствие ошибок в консоли
  - Проверить работу авторизации
  - Проверить работу поиска
  - Проверить отображение статистики игроков

## Notes

- Все тесты являются обязательными для полного покрытия
- Каждый checkpoint требует ручной проверки работоспособности
- При возникновении проблем на checkpoint — вернуться к предыдущим задачам
- Рекомендуется делать git commit после каждого checkpoint
