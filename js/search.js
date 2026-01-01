/**
 * Модуль search.js - Функции поиска и работы с недавними никнеймами
 * 
 * Этот модуль предоставляет единый источник функций для:
 * - Загрузки и сохранения недавних никнеймов
 * - Поиска игроков по никнейму или ID
 * - Инициализации быстрого поиска в навигации
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

// Константы
const MAX_RECENT_NICKS = 5;

/**
 * Загружает список недавних никнеймов из localStorage
 * @returns {string[]} Массив никнеймов
 */
function loadRecentNicks() {
    try {
        const data = JSON.parse(localStorage.getItem('recentNicks') || '[]');
        // Проверяем, что результат является массивом
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

/**
 * Сохраняет никнейм в список недавних
 * Получает оригинальный никнейм из API и добавляет в начало списка
 * @param {string} nick - Никнейм для сохранения
 * @param {function} [onUpdate] - Callback для обновления UI после сохранения
 */
function saveRecentNick(nick, onUpdate) {
    // Получаем оригинальный никнейм из API
    fetch(`https://api.vimeworld.com/user/name/${nick}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const originalUsername = data[0].username;
                let nicks = loadRecentNicks();
                // Удаляем все совпадения по нижнему регистру
                nicks = nicks.filter(n => n.toLowerCase() !== originalUsername.toLowerCase());
                nicks.unshift(originalUsername); // Добавляем оригинальный ник из API
                nicks = nicks.slice(0, MAX_RECENT_NICKS);
                localStorage.setItem('recentNicks', JSON.stringify(nicks));
                if (onUpdate) onUpdate(nicks);
            }
        })
        .catch(error => {
            console.error('Ошибка при получении оригинального никнейма:', error);
            // Если не удалось получить оригинальный никнейм, сохраняем введенный
            let nicks = loadRecentNicks();
            nicks = nicks.filter(n => n.toLowerCase() !== nick.toLowerCase());
            nicks.unshift(nick);
            nicks = nicks.slice(0, MAX_RECENT_NICKS);
            localStorage.setItem('recentNicks', JSON.stringify(nicks));
            if (onUpdate) onUpdate(nicks);
        });
}


/**
 * Сохраняет никнейм синхронно (без запроса к API)
 * Используется когда оригинальный никнейм уже известен
 * @param {string} nick - Никнейм для сохранения
 * @returns {string[]} Обновленный список никнеймов
 */
function saveRecentNickSync(nick) {
    let nicks = loadRecentNicks();
    nicks = nicks.filter(n => n.toLowerCase() !== nick.toLowerCase());
    nicks.unshift(nick);
    nicks = nicks.slice(0, MAX_RECENT_NICKS);
    localStorage.setItem('recentNicks', JSON.stringify(nicks));
    return nicks;
}

/**
 * Получает оригинальный никнейм игрока из API
 * @param {string} inputName - Введенный никнейм
 * @returns {Promise<string|null>} Оригинальный никнейм или null
 */
async function getOriginalUsername(inputName) {
    try {
        const response = await fetch(`https://api.vimeworld.com/user/name/${inputName}`);
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].username;
        }
        return null;
    } catch (error) {
        console.error('Ошибка при получении оригинального никнейма:', error);
        return null;
    }
}

/**
 * Получает данные игрока по ID
 * @param {string} playerId - ID игрока
 * @returns {Promise<object|null>} Данные игрока или null
 */
async function getPlayerById(playerId) {
    try {
        const response = await fetch(`https://api.vimeworld.com/user/${playerId}`);
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0];
        }
        return null;
    } catch (error) {
        console.error('Ошибка при получении данных игрока по ID:', error);
        return null;
    }
}

/**
 * Выполняет поиск и перенаправление на страницу игрока
 * Поддерживает поиск по никнейму и по ID (формат "id:12345")
 * @param {string} inputName - Введенное значение для поиска
 * @param {HTMLInputElement} [inputElement] - Элемент ввода для блокировки во время поиска
 * @param {function} [onUpdate] - Callback для обновления списка недавних ников
 */
function searchAndRedirect(inputName, inputElement, onUpdate) {
    if (!inputName || !inputName.trim()) return;
    
    // Блокируем поле ввода
    if (inputElement) {
        inputElement.disabled = true;
    }
    
    const lowerInputName = inputName.toLowerCase();
    
    // Проверяем, является ли запрос поиском по ID
    if (lowerInputName.startsWith('id:')) {
        const playerId = inputName.slice(3).trim();
        
        // Проверяем, что после "id:" есть только цифры
        if (!/^\d+$/.test(playerId)) {
            alert('После "id:" должны быть только цифры');
            if (inputElement) inputElement.disabled = false;
            return;
        }
        
        // Получаем данные игрока по ID
        getPlayerById(playerId)
            .then(player => {
                if (player) {
                    const originalUsername = player.username;
                    
                    // Сохраняем в историю
                    const nicks = saveRecentNickSync(originalUsername);
                    if (onUpdate) onUpdate(nicks);
                    
                    // Перенаправляем на страницу игрока
                    window.location.href = `player.html?username=${encodeURIComponent(originalUsername)}`;
                } else {
                    alert('Игрок с таким ID не найден');
                }
            })
            .catch(error => {
                console.error('Ошибка при получении данных игрока по ID:', error);
                alert('Произошла ошибка при поиске игрока по ID');
            })
            .finally(() => {
                if (inputElement) inputElement.disabled = false;
            });
    } else {
        // Обычный поиск по никнейму
        getOriginalUsername(inputName)
            .then(originalUsername => {
                if (originalUsername) {
                    // Сохраняем в историю
                    const nicks = saveRecentNickSync(originalUsername);
                    if (onUpdate) onUpdate(nicks);
                    
                    // Перенаправляем на страницу с оригинальным никнеймом
                    window.location.href = `player.html?username=${encodeURIComponent(originalUsername)}`;
                } else {
                    alert('Игрок не найден');
                }
            })
            .catch(error => {
                console.error('Ошибка при получении оригинального никнейма:', error);
                alert('Произошла ошибка при поиске игрока');
            })
            .finally(() => {
                if (inputElement) inputElement.disabled = false;
            });
    }
}


/**
 * Создает элемент списка для недавнего никнейма
 * @param {string} nick - Никнейм
 * @param {function} onClick - Callback при клике
 * @param {object} [options] - Дополнительные опции
 * @param {object} [options.ranksData] - Данные о рангах
 * @param {function} [options.getPlayerData] - Функция получения кешированных данных
 * @param {function} [options.savePlayerData] - Функция сохранения данных в кеш
 * @returns {HTMLLIElement} Элемент списка
 */
function createRecentNickItem(nick, onClick, options = {}) {
    const { ranksData, getPlayerData, savePlayerData } = options;
    
    const li = document.createElement('li');
    
    // Создаем контейнер для головы
    const headContainer = document.createElement('div');
    headContainer.style.position = 'relative';
    headContainer.style.width = '25px';
    headContainer.style.height = '25px';
    
    // Добавляем базовую голову
    const head = document.createElement('img');
    head.src = `https://skin.vimeworld.com/head/${nick}.png?t=${Date.now()}`;
    head.className = 'mini-head';
    head.alt = '';
    headContainer.appendChild(head);
    
    // Добавляем оверлей головы
    const skinFullUrl = `https://skin.vimeworld.com/raw/skin/${nick}.png?t=${Date.now()}`;
    const skinFullImg = new Image();
    
    skinFullImg.onerror = function() {
        // Игнорируем ошибку загрузки скина
    };
    
    skinFullImg.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const skinResolution = skinFullImg.width;
        const scale = skinResolution / 64;
        
        const baseOverlayX = 40;
        const baseOverlayY = 8;
        const baseOverlaySize = 8;
        
        const scaledOverlayX = baseOverlayX * scale;
        const scaledOverlayY = baseOverlayY * scale;
        const scaledOverlaySize = baseOverlaySize * scale;
        
        canvas.width = scaledOverlaySize;
        canvas.height = scaledOverlaySize;
        
        ctx.drawImage(skinFullImg, scaledOverlayX, scaledOverlayY, scaledOverlaySize, scaledOverlaySize, 0, 0, scaledOverlaySize, scaledOverlaySize);
        
        const overlayImg = document.createElement('img');
        overlayImg.src = canvas.toDataURL();
        overlayImg.alt = `${nick} head overlay`;
        overlayImg.className = 'mini-head-overlay';
        headContainer.appendChild(overlayImg);
    };
    
    skinFullImg.crossOrigin = "Anonymous";
    skinFullImg.src = skinFullUrl;
    
    // Создаем контейнер для ника и статуса
    const nickContainer = document.createElement('div');
    nickContainer.style.display = 'flex';
    nickContainer.style.alignItems = 'center';
    nickContainer.style.gap = '4px';
    
    // Ник
    const nickSpan = document.createElement('span');
    nickSpan.textContent = nick;
    nickSpan.style.color = '#2c3e50';
    nickContainer.appendChild(nickSpan);
    
    // Добавляем индикатор онлайн-статуса
    
    li.appendChild(headContainer);
    li.appendChild(nickContainer);
    
    // Применяем кешированные данные если доступны
    if (getPlayerData && ranksData) {
        const cachedData = getPlayerData(nick);
        if (cachedData) {
            applyPlayerDataToElement(nickSpan, li, cachedData, ranksData);
        }
    }
    
    // Получаем актуальные данные с API
    fetchAndApplyPlayerData(nick, nickSpan, li, { ranksData, savePlayerData });
    
    // Обработчик клика
    li.addEventListener('click', () => onClick(nick));
    
    return li;
}

/**
 * Применяет данные игрока к элементам UI
 * @param {HTMLElement} nickSpan - Элемент с никнеймом
 * @param {HTMLElement} li - Элемент списка
 * @param {object} data - Данные игрока
 * @param {object} ranksData - Данные о рангах
 */
function applyPlayerDataToElement(nickSpan, li, data, ranksData) {
    // Применяем кастомные цвета к никнейму
    if (data.customColors && data.customColors.length > 0) {
        if (data.customColors.length === 1) {
            nickSpan.style.color = `#${data.customColors[0]}`;
        } else {
            const gradient = `linear-gradient(to right, ${data.customColors.map(color => `#${color}`).join(', ')})`;
            nickSpan.style.background = gradient;
            nickSpan.style.webkitBackgroundClip = 'text';
            nickSpan.style.webkitTextFillColor = 'transparent';
        }
    }
    
    // Добавляем ранг
    const mainRank = data.rank || "PLAYER";
    if (ranksData && mainRank !== "PLAYER" && !li.querySelector('.player-rank')) {
        const rankInfo = ranksData[mainRank] || ranksData["PLAYER"];
        const rank = document.createElement('span');
        rank.className = 'player-rank';
        rank.textContent = rankInfo.name;
        
        if (rankInfo.colors && rankInfo.colors.length > 0) {
            if (rankInfo.colors.length === 1) {
                rank.style.background = `#${rankInfo.colors[0]}`;
            } else {
                const gradient = `linear-gradient(to right, ${rankInfo.colors.map(color => `#${color}`).join(', ')})`;
                rank.style.background = gradient;
            }
        }
        
        li.appendChild(rank);
    }
}


/**
 * Получает данные игрока с API и применяет к элементам
 * @param {string} nick - Никнейм
 * @param {HTMLElement} nickSpan - Элемент с никнеймом
 * @param {HTMLElement} li - Элемент списка
 * @param {HTMLElement} onlineStatus - Элемент статуса онлайн
 * @param {object} options - Опции
 */
function fetchAndApplyPlayerData(nick, nickSpan, li, options = {}, onlineStatus=null) {
    const { ranksData, savePlayerData } = options;
    
    fetch(`https://api.vimeworld.com/user/name/${nick}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const player = data[0];
                
                // Сохраняем данные в кеш
                if (savePlayerData) {
                    savePlayerData(nick, {
                        rank: player.rank || "PLAYER",
                        customColors: player.customColors || [],
                        username: player.username
                    });
                }
                
                // Применяем данные к элементам
                if (ranksData) {
                    applyPlayerDataToElement(nickSpan, li, player, ranksData);
                }
                
                if (onlineStatus !== null) {
                // Проверяем онлайн-статус
                fetch(`https://api.vimeworld.com/user/name/${nick}/session`)
                    .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.json();
                    })
                    .then(sessionData => {
                        if (sessionData && sessionData.online) {
                            onlineStatus.className = 'online-status ' + (sessionData.online.value ? 'online' : 'offline');
                        } else {
                            onlineStatus.className = 'online-status unknown';
                        }
                    })
                    .catch(() => {
                        onlineStatus.className = 'online-status unknown';
                    });
                }
            }
        })
        .catch(error => {
            console.error('Ошибка при получении данных игрока:', error);
        });
}

/**
 * Обновляет список недавних никнеймов в UI
 * @param {HTMLElement} listElement - Элемент списка (ul)
 * @param {string[]} nicks - Массив никнеймов
 * @param {function} onNickClick - Callback при клике на никнейм
 * @param {object} [options] - Дополнительные опции
 */
function updateRecentNicksList(listElement, nicks, onNickClick, options = {}) {
    listElement.innerHTML = '';
    nicks.forEach(nick => {
        const li = createRecentNickItem(nick, onNickClick, options);
        listElement.appendChild(li);
    });
}

/**
 * Инициализирует быстрый поиск в навигации
 * @param {string} inputId - ID поля ввода
 * @param {string} dropdownId - ID выпадающего списка
 * @param {object} [options] - Дополнительные опции
 * @param {object} [options.ranksData] - Данные о рангах
 * @param {function} [options.getPlayerData] - Функция получения кешированных данных
 * @param {function} [options.savePlayerData] - Функция сохранения данных в кеш
 */
function initQuickSearch(inputId, dropdownId, options = {}) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    
    if (!input || !dropdown) {
        console.warn('initQuickSearch: элементы не найдены', { inputId, dropdownId });
        return;
    }
    
    const listElement = dropdown.querySelector('.recent-nicks-list') || dropdown.querySelector('ul');
    if (!listElement) {
        console.warn('initQuickSearch: список не найден в dropdown');
        return;
    }
    
    // Функция обновления списка
    const updateList = (nicks) => {
        updateRecentNicksList(listElement, nicks, (nick) => {
            input.value = nick;
            dropdown.classList.remove('active');
            searchAndRedirect(nick, input, updateList);
        }, options);
    };
    
    // Загружаем начальный список
    const nicks = loadRecentNicks();
    updateList(nicks);
    
    // Показ/скрытие выпадающего окна
    input.addEventListener('focus', () => {
        if (listElement.children.length > 0) {
            dropdown.classList.add('active');
        }
    });
    
    input.addEventListener('input', () => {
        if (listElement.children.length > 0 && input.value.trim() === '') {
            dropdown.classList.add('active');
        } else {
            dropdown.classList.remove('active');
        }
    });
    
    input.addEventListener('blur', () => {
        setTimeout(() => dropdown.classList.remove('active'), 150);
    });
    
    // Обработчик Enter для поиска
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const username = this.value.trim();
            if (username) {
                searchAndRedirect(username, input, updateList);
            }
        }
    });
    
    // Обработчик клика по кнопке поиска
    const searchBtn = document.getElementById('quick-search-btn');
    if (searchBtn) {
        searchBtn.onclick = function() {
            const username = input.value.trim();
            if (username) {
                searchAndRedirect(username, input, updateList);
            }
        };
    }
    
    return {
        updateList,
        input,
        dropdown,
        listElement
    };
}

// Экспорт для использования в других модулях (если используется module system)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MAX_RECENT_NICKS,
        loadRecentNicks,
        saveRecentNick,
        saveRecentNickSync,
        getOriginalUsername,
        getPlayerById,
        searchAndRedirect,
        createRecentNickItem,
        updateRecentNicksList,
        initQuickSearch
    };
}
