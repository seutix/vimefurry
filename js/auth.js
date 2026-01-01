// Функции для работы с куки
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Функция для проверки авторизации
function checkAuth() {
    const token = getCookie('vime_token');
    const authData = localStorage.getItem('vime_auth');
    
    console.log('Проверка авторизации - токен:', token ? 'существует' : 'отсутствует', 
               ', данные в localStorage:', authData ? 'существуют' : 'отсутствуют');
    
    if (token && authData) {
        try {
            const parsedData = JSON.parse(authData);
            console.log('Данные авторизации успешно разобраны:', parsedData.userData.username);
            return {
                isAuthorized: true,
                token: token,
                userData: parsedData.userData
            };
        } catch (e) {
            console.error('Ошибка при чтении данных авторизации:', e);
        }
    }
    
    return { isAuthorized: false };
}

// Функция для выхода из аккаунта
function logout() {
    eraseCookie('vime_token');
    eraseCookie('vime_user_id');
    eraseCookie('vime_username');
    localStorage.removeItem('vime_auth');
    
    // Оповещаем другие вкладки
    window.dispatchEvent(new CustomEvent('vime_auth_update'));
    
    // Обновляем интерфейс
    updateAuthUI();
}

// Функция для обновления интерфейса в зависимости от состояния авторизации
function updateAuthUI() {
    console.log('Обновление UI авторизации...');
    const authStatus = checkAuth();
    const authKeyBtn = document.getElementById('auth-key-btn');
    
    if (!authKeyBtn) {
        console.error('Элемент auth-key-btn не найден на странице');
        return;
    }
    
    console.log('Статус авторизации:', authStatus.isAuthorized);
    
    if (authStatus.isAuthorized && authStatus.userData) {
        // Пользователь авторизован - отображаем его голову
        const userData = authStatus.userData;
        console.log('Данные пользователя:', userData);
        
        authKeyBtn.innerHTML = '';
        authKeyBtn.style.padding = '0';
        authKeyBtn.style.overflow = 'visible';
        authKeyBtn.style.borderRadius = '0';
        authKeyBtn.style.background = 'transparent';
        authKeyBtn.style.boxShadow = 'none';
        
        const headContainer = document.createElement('div');        
        headContainer.style.position = 'relative';        
        headContainer.style.width = '35px';        
        headContainer.style.height = '35px';        
        headContainer.style.display = 'inline-block';        
        headContainer.style.verticalAlign = 'middle';                
        
        // Базовая голова
        const head = document.createElement('img');        
        head.src = `https://skin.vimeworld.com/head/${userData.username}.png`;        
        head.alt = '';        
        head.style.position = 'absolute';
        head.style.top = '0';
        head.style.left = '0';
        head.style.width = '100%';        
        head.style.height = '100%';        
        head.style.imageRendering = 'pixelated';
        head.style.objectFit = 'cover';
        headContainer.appendChild(head);
        
        // Добавляем оверлей головы из полного скина
        const skinFullUrl = `https://skin.vimeworld.com/raw/skin/${userData.username}.png`;
        const skinFullImg = new Image();
        
        skinFullImg.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Определяем размер скина и рассчитываем масштабирование
            const skinResolution = skinFullImg.width;
            const scale = skinResolution / 64;
            
            // Координаты и размер оверлея головы
            const baseOverlayX = 40;
            const baseOverlayY = 8;
            const baseOverlaySize = 8;
            
            // Масштабируем координаты и размер
            const scaledOverlayX = baseOverlayX * scale;
            const scaledOverlayY = baseOverlayY * scale;
            const scaledOverlaySize = baseOverlaySize * scale;
            
            canvas.width = scaledOverlaySize;
            canvas.height = scaledOverlaySize;
            
            // Вырезаем оверлей головы
            ctx.drawImage(skinFullImg, scaledOverlayX, scaledOverlayY, scaledOverlaySize, scaledOverlaySize, 0, 0, scaledOverlaySize, scaledOverlaySize);
            
            // Создаем изображение из canvas и добавляем на страницу
            const overlayImg = document.createElement('img');
            overlayImg.src = canvas.toDataURL();
            overlayImg.alt = `${userData.username} head overlay`;
            overlayImg.style.position = 'absolute';
            overlayImg.style.top = '0';
            overlayImg.style.left = '0';
            overlayImg.style.width = '100%';
            overlayImg.style.height = '100%';
            overlayImg.style.imageRendering = 'pixelated';
            overlayImg.style.transform = 'scale(1.1)';
            overlayImg.style.transformOrigin = 'center center';
            headContainer.appendChild(overlayImg);
        };
        
        skinFullImg.onerror = function() {
            // Игнорируем ошибку загрузки скина
        };
        
        // Устанавливаем crossOrigin и src после обработчиков
        skinFullImg.crossOrigin = "Anonymous";
        skinFullImg.src = skinFullUrl;
        
        authKeyBtn.appendChild(headContainer);
        console.log('Контейнер головы добавлен в auth-key-btn');
        
        // Добавляем выпадающее меню при клике
        authKeyBtn.onclick = function(e) {
            e.stopPropagation();
            
            // Проверяем, существует ли уже меню
            let authMenu = document.getElementById('auth-dropdown-menu');
            
            if (authMenu) {
                // Если меню уже открыто, закрываем его
                document.body.removeChild(authMenu);
                return;
            }
            
            // Создаем выпадающее меню
            authMenu = document.createElement('div');
            authMenu.id = 'auth-dropdown-menu';
            authMenu.style.position = 'absolute';
            authMenu.style.top = '70px';
            authMenu.style.right = '24px';
            authMenu.style.background = '#fff';
            authMenu.style.borderRadius = '10px';
            authMenu.style.boxShadow = '0 8px 24px rgba(52,152,219,0.10)';
            authMenu.style.padding = '10px 0';
            authMenu.style.zIndex = '1010';
            authMenu.style.minWidth = '150px';
            
            // Добавляем кнопку профиля - ведет на ник, зарегистрированный в API
            const profileBtn = document.createElement('div');
            profileBtn.style.padding = '10px 15px';
            profileBtn.style.cursor = 'pointer';
            profileBtn.style.fontFamily = "'VimeArtBold', sans-serif";
            profileBtn.style.color = '#3498db';
            profileBtn.style.transition = 'background 0.2s';
            profileBtn.style.borderBottom = '1px solid #e6f3ff';
            profileBtn.style.marginBottom = '5px';
            profileBtn.textContent = 'Профиль';
            
            profileBtn.onmouseover = function() {
                profileBtn.style.background = '#f8f9fa';
            };
            
            profileBtn.onmouseout = function() {
                profileBtn.style.background = 'transparent';
            };
            
            profileBtn.onclick = function(e) {
                e.stopPropagation();
                // Переходим на профиль пользователя, зарегистрированного в API
                window.location.href = `player.html?username=${encodeURIComponent(userData.username)}`;
            };
            
            authMenu.appendChild(profileBtn);
            
            // Добавляем кнопку выхода
            const logoutBtn = document.createElement('div');
            logoutBtn.style.padding = '10px 15px';
            logoutBtn.style.cursor = 'pointer';
            logoutBtn.style.fontFamily = "'VimeArtBold', sans-serif";
            logoutBtn.style.color = '#e74c3c';
            logoutBtn.style.transition = 'background 0.2s';
            logoutBtn.textContent = 'Выйти';
            
            logoutBtn.onmouseover = function() {
                logoutBtn.style.background = '#f8f9fa';
            };
            
            logoutBtn.onmouseout = function() {
                logoutBtn.style.background = 'transparent';
            };
            
            logoutBtn.onclick = function(e) {
                e.stopPropagation();
                logout();
                if (document.body.contains(authMenu)) {
                    document.body.removeChild(authMenu);
                }
            };
            
            authMenu.appendChild(logoutBtn);
            document.body.appendChild(authMenu);
            
            // Добавляем обработчик для закрытия меню при клике вне его
            setTimeout(() => {
                document.addEventListener('click', function closeMenu(e) {
                    if (!authMenu.contains(e.target) && !authKeyBtn.contains(e.target)) {
                        if (document.body.contains(authMenu)) {
                            document.body.removeChild(authMenu);
                        }
                        document.removeEventListener('click', closeMenu);
                    }
                });
            }, 0);
        };
    } else {
        // Пользователь не авторизован - отображаем только иконку ключа
        authKeyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 16" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M16 5.5C16 8.53757 13.5376 11 10.5 11H7V13H5V15L4 16H0V12L5.16351 6.83649C5.0567 6.40863 5 5.96094 5 5.5C5 2.46243 7.46243 0 10.5 0C13.5376 0 16 2.46243 16 5.5ZM13 4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4Z" fill="#3498db"/>
            </svg>
        `;
        // Делаем кнопку полностью прозрачной, оставляя только иконку
        authKeyBtn.style.padding = '8px';
        authKeyBtn.style.overflow = 'visible';
        authKeyBtn.style.borderRadius = '0';
        authKeyBtn.style.background = 'transparent';
        authKeyBtn.style.boxShadow = 'none';
        authKeyBtn.style.border = 'none';
        authKeyBtn.style.cursor = 'pointer';
        authKeyBtn.style.transition = 'transform 0.2s';
        
        // Добавляем эффект при наведении
        authKeyBtn.onmouseenter = function() {
            authKeyBtn.style.transform = 'scale(1.1)';
        };
        
        authKeyBtn.onmouseleave = function() {
            authKeyBtn.style.transform = 'scale(1)';
        };
        
        authKeyBtn.onclick = function() {
            window.location.href = 'auth.html';
        };
    }
}

// Флаг для отслеживания, была ли уже выполнена проверка авторизации
let authCheckPerformed = false;

// Вызываем функцию обновления интерфейса при загрузке страницы (только один раз)
document.addEventListener('DOMContentLoaded', function() {
    if (!authCheckPerformed) {
        console.log('DOMContentLoaded: Обновляем UI авторизации');
        updateAuthUI();
        authCheckPerformed = true;
    }
});

// Слушаем изменения в localStorage для синхронизации между вкладками
window.addEventListener('storage', function(e) {
    if (e.key === 'vime_auth') {
        console.log('Обнаружено изменение в localStorage: vime_auth');
        updateAuthUI();
        authCheckPerformed = true; // Помечаем, что проверка была выполнена
    }
});

// Также слушаем кастомное событие vime_auth_update
window.addEventListener('vime_auth_update', function() {
    console.log('Получено событие vime_auth_update');
    updateAuthUI();
    authCheckPerformed = true; // Помечаем, что проверка была выполнена
}); 
