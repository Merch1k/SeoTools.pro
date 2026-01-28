document.addEventListener('DOMContentLoaded', () => {

    // --- НАСТРОЙКИ TELEGRAM (ВСТАВЬТЕ СВОИ ДАННЫЕ!) ---
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; // Пример: '712345678:AAH...'
    const TG_CHAT_ID = '5683927471';             // Пример: '123456789'

    // --- СЛОВАРЬ ПЕРЕВОДОВ ---
    const translations = {
        ru: {
            languageBtn: "Язык", headerTitle: "SEO Утилита", loginBtn: "Войти", logoutBtn: "Выйти",
            registerBtn: "Регистрация", registerTitle: "Регистрация", sendRequestBtn: "Отправить заявку",
            videoTitle: "Посмотрите наш продукт в действии", multitoolTitle: "SEO Мультитул",
            multitoolDesc: "Наш инструмент анализирует ключевые слова...",
            loading: "Загрузка товаров...", authTitle: "Авторизация", passwordPlaceholder: "Пароль", authBtn: "Войти",
            demoMode: "Введите данные для входа", developedIn: "Разработан в 2026.", telegramBtn: "Наш Telegram канал"
        },
        en: {
            languageBtn: "Language", headerTitle: "SEO Utility", loginBtn: "Login", logoutBtn: "Logout",
            registerBtn: "Registration", registerTitle: "Registration", sendRequestBtn: "Send Request",
            videoTitle: "See our product in action", multitoolTitle: "SEO Multitool",
            multitoolDesc: "Our tool analyzes keywords...",
            loading: "Loading products...", authTitle: "Authorization", passwordPlaceholder: "Password", authBtn: "Login",
            demoMode: "Enter login credentials", developedIn: "Developed in 2026.", telegramBtn: "Our Telegram channel"
        }
    };

    // --- ЭЛЕМЕНТЫ МЕНЮ ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainMenu = document.getElementById('mainMenu');
    const menuLoginBtn = document.getElementById('menuLoginBtn');
    const menuRegisterBtn = document.getElementById('menuRegisterBtn');
    const menuLangBtn = document.getElementById('menuLangBtn');
    const langSubmenu = document.getElementById('langSubmenu');

    // Управление меню
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainMenu.classList.toggle('hidden');
        if (mainMenu.classList.contains('hidden')) langSubmenu.classList.add('hidden');
    });

    menuLangBtn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        langSubmenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!mainMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            mainMenu.classList.add('hidden');
            langSubmenu.classList.add('hidden');
        }
    });

    // Смена языка
    const setLanguage = (lang) => {
        localStorage.setItem('language', lang);
        document.querySelectorAll('[data-lang-key]').forEach(elem => {
            const key = elem.dataset.langKey;
            if (translations[lang][key]) elem.textContent = translations[lang][key];
        });
        document.querySelectorAll('[data-lang-placeholder]').forEach(elem => {
            const key = elem.dataset.langPlaceholder;
            if (translations[lang][key]) elem.placeholder = translations[lang][key];
        });
    };

    langSubmenu.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = e.target.dataset.lang;
        if (selectedLang) {
            setLanguage(selectedLang);
            mainMenu.classList.add('hidden');
            langSubmenu.classList.add('hidden');
        }
    });
    setLanguage(localStorage.getItem('language') || 'ru');

    // --- ЗАГРУЗКА ТОВАРОВ ---
    const grid = document.getElementById('products-grid');
    fetch('db.json').then(res => res.json()).then(data => {
        grid.innerHTML = '';
        data.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            let videoHTML = product.video ? `<div class="video-container"><video controls muted><source src="${product.video}" type="video/mp4"></video></div>` : '';
            card.innerHTML = `<img src="${product.image}" alt="${product.title}"><div class="card-content"><h3>${product.title}</h3><p>${product.description}</p><button class="price-button">${product.price}</button>${videoHTML}</div>`;
            grid.appendChild(card);
        });
    }).catch(err => console.error(err));

    // --- СИСТЕМА АВТОРИЗАЦИИ ---
    const authModal = document.getElementById('authModal');
    const regModal = document.getElementById('regModal');
    const closeBtns = document.querySelectorAll('.close, .close-reg');
    
    // Формы
    const loginForm = document.getElementById('loginForm');
    const regFormRequest = document.getElementById('regFormRequest');
    
    // UI профиля
    const userProfile = document.getElementById('userProfile');
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    // Открытие окон
    if (menuLoginBtn) {
        menuLoginBtn.addEventListener('click', () => {
            if (authModal) authModal.classList.remove('hidden');
            if (mainMenu) mainMenu.classList.add('hidden');
            if (langSubmenu) langSubmenu.classList.add('hidden');
        });
    } else {
        console.warn('Кнопка menuLoginBtn не найдена в HTML');
    }

    // Функция для кнопки "Регистрация"
    if (menuRegisterBtn) {
        menuRegisterBtn.addEventListener('click', () => {
            if (regModal) regModal.classList.remove('hidden');
            if (mainMenu) mainMenu.classList.add('hidden');
            if (langSubmenu) langSubmenu.classList.add('hidden');
        });
    }

    // Функция для закрытия крестиками
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (authModal) authModal.classList.add('hidden');
            if (regModal) regModal.classList.add('hidden');
        });
    });

    // === ЛОГИКА ВХОДА (ПРОВЕРКА ЧЕРЕЗ USERS.JSON) ===
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('loginEmail').value.trim(); // Используем поле email как логин
        const passInput = document.getElementById('loginPass').value.trim();
        const btn = loginForm.querySelector('button');

        btn.textContent = 'Проверка...';
        
        // Скачиваем базу пользователей
        fetch('users.json')
            .then(response => {
                if (!response.ok) throw new Error("Файл users.json не найден!");
                return response.json();
            })
            .then(users => {
                // Ищем совпадение
                const userFound = users.find(u => u.login === emailInput && u.password === passInput);
                
                if (userFound) {
                    localStorage.setItem('user', userFound.login);
                    updateAuthUI(userFound.login);
                    authModal.classList.add('hidden');
                    alert(`Добро пожаловать, ${userFound.login}!`);
                } else {
                    alert('Неверный логин или пароль, либо аккаунт еще не активирован.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Ошибка системы авторизации.');
            })
            .finally(() => {
                btn.textContent = translations[localStorage.getItem('language') || 'ru'].authBtn;
            });
    });

    // === ЛОГИКА РЕГИСТРАЦИИ (ОТПРАВКА В TELEGRAM) ===
    regFormRequest.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLogin = document.getElementById('newLogin').value;
        const newPass = document.getElementById('newPass').value;
        const btn = regFormRequest.querySelector('button');
        
        btn.textContent = 'Отправка...';
        btn.disabled = true;

        // Формируем сообщение для Телеграма
        const message = `🚀 <b>НОВАЯ ЗАЯВКА НА САЙТЕ</b>\n\n👤 Логин: <code>${newLogin}</code>\n🔑 Пароль: <code>${newPass}</code>\n\n<i>Добавьте в users.json, чтобы активировать.</i>`;

        // Отправляем через API Telegram
        fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        })
        .then(response => {
            if (response.ok) {
                alert('Заявка отправлена администратору! Ожидайте активации доступа.');
                regModal.classList.add('hidden');
                regFormRequest.reset();
            } else {
                alert('Ошибка отправки. Свяжитесь с админом напрямую.');
            }
        })
        .catch(err => {
            console.error(err);
            alert('Ошибка сети.');
        })
        .finally(() => {
            btn.textContent = 'Отправить заявку';
            btn.disabled = false;
        });
    });

    // Выход
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        updateAuthUI(null);
    });

    function updateAuthUI(user) {
        const hamburgerContainer = document.querySelector('.menu-container');
        if (user) {
            hamburgerContainer.classList.add('hidden');
            userProfile.classList.remove('hidden');
            userProfile.style.display = 'flex';
            userNameSpan.textContent = user;
        } else {
            hamburgerContainer.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
    }

    const savedUser = localStorage.getItem('user');
    updateAuthUI(savedUser);
});
console.log('--- ПРОВЕРКА ЭЛЕМЕНТОВ ---');
console.log('Кнопка входа в меню:', document.getElementById('menuLoginBtn') ? 'OK' : 'НЕ НАЙДЕНА (Проверьте HTML)');
console.log('Окно входа:', document.getElementById('authModal') ? 'OK' : 'НЕ НАЙДЕНО');
console.log('Форма входа:', document.getElementById('loginForm') ? 'OK' : 'НЕ НАЙДЕНА');
console.log('Файл users.json:', 'Проверяется при входе...');




