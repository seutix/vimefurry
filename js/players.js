/**
 * Модуль players.js - Управление страницей игроков
 */

class PlayersManager {
    constructor() {
        // Используем CORS прокси для обхода ограничений
        this.apiUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://vimetop.ru/api/v1/players');
        this.players = [];
        this.filteredPlayers = [];
        this.isLoading = false;
        
        // Пагинация
        this.currentPage = 1;
        this.totalPages = 1;
        this.hasNext = false;
        this.hasPrev = false;
        this.totalPlayers = 0;
        
        // Статистика по рангам
        this.rankStats = {};
        
        this.filters = {
            rank: '',
            search: ''
        };
        
        this.init();
    }
    
    init() {
        this.loadRankStats();
        this.bindEvents();
        this.loadPlayers();
    }
    
    async loadRankStats() {
        try {
            // Пробуем загрузить статистику из API
            const targetUrl = 'https://vimetop.ru/api/v1/players/stats';
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
            
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Статистика по рангам:', data);
                
                if (data && data.success && data.response) {
                    this.rankStats = data.response.ranks || data.response;
                    this.updateRankOptions();
                    return;
                }
            }
        } catch (error) {
            console.log('API статистики недоступен, загружаем вручную');
        }
        
        // Если API статистики недоступен, загружаем по одному запросу для каждого ранга
        await this.loadRankStatsManually();
    }
    
    async loadRankStatsManually() {
        const ranks = [
            'PLAYER', 'VIP', 'PREMIUM', 'HOLY', 'IMMORTAL', 'DIVINE', 'THANE', 
            'ELITE', 'ETERNAL', 'CELESTIAL', 'ABSOLUTE', 'IMPERIAL', 'ULTIMATE', 
            'VIME', 'JRBUILDER', 'BUILDER', 'SRBUILDER', 'MAPLEAD', 'YOUTUBE', 
            'DEV', 'ORGANIZER', 'HELPER', 'MODER', 'WARDEN', 'CHIEF', 'ADMIN'
        ];
        
        // Загружаем статистику параллельно для ускорения
        const promises = ranks.map(async (rank) => {
            try {
                const targetUrl = `https://vimetop.ru/api/v1/players?page=1&limit=1&rank=${rank}`;
                const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
                
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.success && data.response && data.response.pagination) {
                        this.rankStats[rank] = data.response.pagination.total;
                        // Обновляем сразу после получения данных
                        this.updateRankOption(rank, data.response.pagination.total);
                    }
                }
            } catch (error) {
                console.error(`Ошибка загрузки статистики для ${rank}:`, error);
            }
        });
        
        await Promise.all(promises);
        console.log('Загруженная статистика:', this.rankStats);
    }
    
    updateRankOption(rankCode, count) {
        // Обновляем в кастомном селекте
        const customOption = document.querySelector(`.custom-option[data-value="${rankCode}"]`);
        if (customOption) {
            const text = customOption.textContent.split('(')[0].trim();
            customOption.innerHTML = `${text} <span class="rank-count">(${count.toLocaleString()})</span>`;
        }
        
        // Обновляем в скрытом select для совместимости
        const rankFilter = document.getElementById('rankFilter');
        if (!rankFilter) return;
        
        const option = rankFilter.querySelector(`option[value="${rankCode}"]`);
        if (option) {
            const originalText = option.textContent.split(' (')[0];
            option.textContent = `${originalText} (${count.toLocaleString()})`;
        }
    }
    
    updateRankOptions() {
        const rankFilter = document.getElementById('rankFilter');
        if (!rankFilter) return;
        
        // Обновляем текст опций, добавляя количество игроков
        const options = rankFilter.querySelectorAll('option');
        options.forEach(option => {
            const rankCode = option.value;
            if (rankCode && this.rankStats[rankCode]) {
                const count = this.rankStats[rankCode];
                const originalText = option.textContent.split(' (')[0]; // Убираем старый счетчик если есть
                option.textContent = `${originalText} (${count.toLocaleString()})`;
            }
        });
    }
    
    bindEvents() {
        // Кастомный селект рангов
        const customSelect = document.getElementById('customRankSelect');
        const trigger = customSelect.querySelector('.custom-select-trigger');
        const options = customSelect.querySelectorAll('.custom-option');
        
        trigger.addEventListener('click', () => {
            customSelect.classList.toggle('open');
        });
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                const rank = option.getAttribute('data-rank');
                const text = option.textContent.split('(')[0].trim();
                
                // Обновляем trigger
                const triggerSpan = trigger.querySelector('span');
                triggerSpan.textContent = text || 'Все ранги';
                
                // Применяем стиль ранга к trigger
                if (rank && typeof getRankColors === 'function') {
                    const colors = getRankColors(rank);
                    trigger.classList.add('has-rank');
                    
                    if (colors.length > 1) {
                        trigger.style.background = `linear-gradient(to right, ${colors.map(c => `#${c}`).join(', ')})`;
                    } else {
                        trigger.style.background = `#${colors[0]}`;
                    }
                } else {
                    // Сброс стиля для "Все ранги"
                    trigger.classList.remove('has-rank');
                    trigger.style.background = 'white';
                }
                
                // Убираем selected у всех
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Закрываем селект
                customSelect.classList.remove('open');
                
                // Обновляем скрытый select
                document.getElementById('rankFilter').value = value;
                
                // Применяем фильтр
                this.filters.rank = value;
                this.currentPage = 1;
                this.loadPlayers();
            });
        });
        
        // Закрытие при клике вне селекта
        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
            }
        });
        
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase().trim();
            
            if (!this.filters.search) {
                this.applyFilters();
                return;
            }
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchPlayers();
            }, 500);
        });
        
        // Кнопки пагинации
        document.getElementById('prevPageBtn').addEventListener('click', () => {
            if (this.hasPrev) {
                this.currentPage--;
                this.loadPlayers();
            }
        });
        
        document.getElementById('nextPageBtn').addEventListener('click', () => {
            if (this.hasNext) {
                this.currentPage++;
                this.loadPlayers();
            }
        });
        
        document.getElementById('firstPageBtn').addEventListener('click', () => {
            if (this.currentPage !== 1) {
                this.currentPage = 1;
                this.loadPlayers();
            }
        });
        
        document.getElementById('lastPageBtn').addEventListener('click', () => {
            if (this.currentPage !== this.totalPages) {
                this.currentPage = this.totalPages;
                this.loadPlayers();
            }
        });
        
        const pageInput = document.getElementById('pageInput');
        pageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const page = parseInt(pageInput.value);
                if (page >= 1 && page <= this.totalPages) {
                    this.currentPage = page;
                    this.loadPlayers();
                }
            }
        });
    }
    
    async loadPlayers() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            // Формируем URL с параметрами
            let targetUrl = `https://vimetop.ru/api/v1/players?page=${this.currentPage}&limit=100`;
            
            // Добавляем фильтр по рангу если выбран
            if (this.filters.rank) {
                targetUrl += `&rank=${this.filters.rank}`;
            }
            
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
            
            console.log('Загружаем данные с:', targetUrl);
            const response = await fetch(proxyUrl);
            
            console.log('Статус ответа:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Полученные данные:', data);
            
            // Проверяем структуру {success: true, response: {...}}
            if (data && data.success && data.response) {
                const responseData = data.response;
                
                // Сохраняем информацию о пагинации
                if (responseData.pagination) {
                    this.currentPage = responseData.pagination.page;
                    this.totalPages = responseData.pagination.total_pages;
                    this.hasNext = responseData.pagination.has_next;
                    this.hasPrev = responseData.pagination.has_prev;
                    this.totalPlayers = responseData.pagination.total;
                    console.log('Пагинация:', responseData.pagination);
                }
                
                // Проверяем разные возможные структуры внутри response
                if (Array.isArray(responseData)) {
                    this.players = responseData;
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    this.players = responseData.data;
                } else if (responseData.players && Array.isArray(responseData.players)) {
                    this.players = responseData.players;
                } else {
                    console.error('Неожиданная структура response:', responseData);
                    this.showError('Неверная структура данных от API');
                    return;
                }
                
                console.log('Загружено игроков:', this.players.length);
                this.applyFilters();
                this.updatePagination();
            } else {
                console.error('Неожиданная структура данных:', data);
                this.showError('Неверная структура данных от API');
            }
        } catch (error) {
            console.error('Ошибка при загрузке игроков:', error);
            this.showError('Ошибка при загрузке данных: ' + error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    applyFilters() {
        // Фильтруем только по поиску (ранг уже отфильтрован на сервере)
        this.filteredPlayers = this.players.filter(player => {
            // Фильтр по поиску
            if (this.filters.search && !player.username.toLowerCase().includes(this.filters.search)) {
                return false;
            }
            
            return true;
        });
        
        this.filteredPlayers.sort((a, b) => b.level - a.level);
        this.renderPlayers();
    }
    
    async searchPlayers() {
        if (!this.filters.search) {
            this.applyFilters();
            return;
        }
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            // Поиск по нику через API
            let targetUrl = `https://vimetop.ru/api/v1/players?page=1&limit=100&search=${encodeURIComponent(this.filters.search)}`;
            
            // Добавляем фильтр по рангу если выбран
            if (this.filters.rank) {
                targetUrl += `&rank=${this.filters.rank}`;
            }
            
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
            
            console.log('Поиск игроков:', targetUrl);
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.success && data.response) {
                const responseData = data.response;
                
                // Сохраняем информацию о пагинации
                if (responseData.pagination) {
                    this.currentPage = responseData.pagination.page;
                    this.totalPages = responseData.pagination.total_pages;
                    this.hasNext = responseData.pagination.has_next;
                    this.hasPrev = responseData.pagination.has_prev;
                    this.totalPlayers = responseData.pagination.total;
                }
                
                if (Array.isArray(responseData)) {
                    this.players = responseData;
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    this.players = responseData.data;
                } else if (responseData.players && Array.isArray(responseData.players)) {
                    this.players = responseData.players;
                }
                
                this.applyFilters();
                this.updatePagination();
            }
        } catch (error) {
            console.error('Ошибка при поиске игроков:', error);
            // Если поиск через API не работает, ищем локально
            this.applyFilters();
        } finally {
            this.isLoading = false;
        }
    }
    
    renderPlayers() {
        const tbody = document.getElementById('playersTableBody');
        console.log('Рендерим игроков:', this.filteredPlayers.length);
        
        if (!tbody) {
            console.error('Элемент playersTableBody не найден!');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (this.filteredPlayers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4">
                        <div class="loading">Игроки не найдены</div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Вычисляем начальный номер для текущей страницы
        const startNumber = (this.currentPage - 1) * 100;
        
        this.filteredPlayers.forEach((player, index) => {
            const row = this.createPlayerRow(player, startNumber + index + 1);
            tbody.appendChild(row);
        });
        
        console.log('Рендеринг завершен');
    }
    
    createPlayerRow(player, index) {
        const row = document.createElement('tr');
        row.addEventListener('click', () => {
            window.location.href = `player.html?username=${encodeURIComponent(player.username)}`;
        });
        
        // Номер
        const numCell = document.createElement('td');
        numCell.textContent = index;
        row.appendChild(numCell);
        
        // Игрок (с головой, ником, рангом, гильдией, праймом)
        const playerCell = document.createElement('td');
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-name-cell';
        
        // Голова
        const head = document.createElement('img');
        head.className = 'player-head';
        head.src = `https://skin.vimeworld.com/helm/3d/${player.username}.png`;
        head.alt = player.username;
        head.onerror = () => {
            head.src = 'https://skin.vimeworld.com/helm/3d/Steve.png';
        };
        playerDiv.appendChild(head);
        
        // Контейнер для информации
        const infoContainer = document.createElement('div');
        infoContainer.style.display = 'flex';
        infoContainer.style.flexDirection = 'column';
        infoContainer.style.gap = '4px';
        
        // Первая строка: ник + ранг + прайм
        const nameRow = document.createElement('div');
        nameRow.style.display = 'flex';
        nameRow.style.alignItems = 'center';
        nameRow.style.gap = '6px';
        
        // Ник
        const nameSpan = document.createElement('span');
        nameSpan.textContent = player.username;
        nameSpan.style.fontFamily = 'VimeArtBold, sans-serif';
        
        // Применяем кастомные цвета
        if (player.custom_colors && player.custom_colors.length > 0) {
            let colors = [];
            
            // Проверяем тип данных custom_colors
            if (typeof player.custom_colors === 'string') {
                colors = player.custom_colors.split(',').filter(c => c.trim());
            } else if (Array.isArray(player.custom_colors)) {
                colors = player.custom_colors;
            }
            
            if (colors.length === 1) {
                nameSpan.style.color = `#${colors[0]}`;
            } else if (colors.length > 1) {
                nameSpan.style.background = `linear-gradient(to right, ${colors.map(c => `#${c}`).join(', ')})`;
                nameSpan.style.webkitBackgroundClip = 'text';
                nameSpan.style.webkitTextFillColor = 'transparent';
            }
        }
        nameRow.appendChild(nameSpan);
        
        // Ранг (если не PLAYER)
        const playerRank = player.rank || 'PLAYER';
        if (playerRank !== 'PLAYER' && typeof getRankName === 'function' && typeof getRankColors === 'function') {
            const rankSpan = document.createElement('span');
            rankSpan.className = 'player-rank-badge';
            rankSpan.textContent = getRankName(playerRank);
            rankSpan.style.fontSize = '0.7rem';
            rankSpan.style.padding = '2px 6px';
            rankSpan.style.borderRadius = '4px';
            rankSpan.style.color = '#fff';
            rankSpan.style.fontFamily = 'VimeArtBold, sans-serif';
            
            const rankColors = getRankColors(playerRank);
            if (rankColors.length > 1) {
                rankSpan.style.background = `linear-gradient(to right, ${rankColors.map(c => `#${c}`).join(', ')})`;
            } else {
                rankSpan.style.background = `#${rankColors[0]}`;
            }
            nameRow.appendChild(rankSpan);
        }
        
        // Prime
        if (player.is_prime) {
            const primeSpan = document.createElement('span');
            primeSpan.className = 'player-prime-badge';
            primeSpan.textContent = 'Prime';
            primeSpan.style.fontSize = '0.65rem';
            primeSpan.style.padding = '2px 5px';
            primeSpan.style.borderRadius = '4px';
            primeSpan.style.background = 'rgba(52, 152, 219, 0.2)';
            primeSpan.style.color = '#3498db';
            primeSpan.style.fontFamily = 'VimeArtBold, sans-serif';
            nameRow.appendChild(primeSpan);
        }
        
        infoContainer.appendChild(nameRow);
        
        // Вторая строка: гильдия (если есть)
        if (player.guild && player.guild.name) {
            const guildRow = document.createElement('div');
            guildRow.style.fontSize = '0.7rem';
            guildRow.style.color = '#7f8c8d';
            guildRow.style.fontFamily = 'VimeArtBold, sans-serif';
            
            const guildTag = document.createElement('span');
            guildTag.style.fontWeight = 'bold';
            guildTag.textContent = `[${player.guild.tag}] `;
            
            // Применяем цвет гильдии если есть
            if (player.guild.color) {
                guildTag.style.color = `#${player.guild.color}`;
            }
            
            const guildName = document.createElement('span');
            guildName.textContent = player.guild.name;
            
            guildRow.appendChild(guildTag);
            guildRow.appendChild(guildName);
            infoContainer.appendChild(guildRow);
        }
        
        playerDiv.appendChild(infoContainer);
        playerCell.appendChild(playerDiv);
        row.appendChild(playerCell);
        
        // Уровень
        const levelCell = document.createElement('td');
        levelCell.textContent = player.level;
        levelCell.style.fontFamily = 'VimeArtBold, sans-serif';
        row.appendChild(levelCell);
        
        // Наиграно
        const playedCell = document.createElement('td');
        playedCell.textContent = this.formatPlayTime(player.played_seconds);
        playedCell.style.fontFamily = 'VimeArtBold, sans-serif';
        row.appendChild(playedCell);
        
        return row;
    }
    
    formatPlayTime(seconds) {
        if (!seconds || seconds === 0) return '0ч';
        
        const hours = Math.floor(seconds / 3600);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}д ${hours % 24}ч`;
        }
        return `${hours}ч`;
    }
    
    showLoading() {
        const tbody = document.getElementById('playersTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="loading">Загрузка игроков...</div>
                </td>
            </tr>
        `;
    }
    
    showError(message) {
        const tbody = document.getElementById('playersTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="error">${message}</div>
                </td>
            </tr>
        `;
    }
    
    updatePagination() {
        // Обновляем текст с информацией о странице
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) {
            pageInfo.textContent = `Страница ${this.currentPage} из ${this.totalPages.toLocaleString()} (всего игроков: ${this.totalPlayers.toLocaleString()})`;
        }
        
        // Обновляем поле ввода страницы
        const pageInput = document.getElementById('pageInput');
        if (pageInput) {
            pageInput.value = this.currentPage;
            pageInput.max = this.totalPages;
        }
        
        // Обновляем состояние кнопок
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const firstBtn = document.getElementById('firstPageBtn');
        const lastBtn = document.getElementById('lastPageBtn');
        
        if (prevBtn) prevBtn.disabled = !this.hasPrev;
        if (nextBtn) nextBtn.disabled = !this.hasNext;
        if (firstBtn) firstBtn.disabled = this.currentPage === 1;
        if (lastBtn) lastBtn.disabled = this.currentPage === this.totalPages;
        
        // Обновляем номера страниц
        this.renderPageNumbers();
    }
    
    renderPageNumbers() {
        const container = document.getElementById('pageNumbers');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Показываем до 5 страниц вокруг текущей
        const maxPages = 5;
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
        
        // Корректируем если мало страниц в конце
        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-number-btn';
            pageBtn.textContent = i;
            
            if (i === this.currentPage) {
                pageBtn.classList.add('active');
                pageBtn.disabled = true;
            }
            
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.loadPlayers();
            });
            
            container.appendChild(pageBtn);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.playersManager = new PlayersManager();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayersManager;
}
