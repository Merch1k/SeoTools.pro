document.addEventListener('DOMContentLoaded', () => {

    // --- !!! НАСТРОЙКИ TELEGRAM !!! ---
    // Вставьте сюда токен, который дал @BotFather
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; 
    // Вставьте сюда цифры вашего ID (от @userinfobot)
    const TG_CHAT_ID = '5683927471'; 

    // --- СЛОВАРЬ ПЕРЕВОДОВ ---
    const translations = {
        ru: {
            languageBtn: "Язык", headerTitle: "SEO Мультитул", loginBtn: "Войти", logoutBtn: "Выйти",
            registerBtn: "Регистрация", registerTitle: "Регистрация", sendRequestBtn: "Отправить заявку",
            videoTitle: "Посмотрите наш продукт в действии", multitoolTitle: "SEO Мультитул",
            multitoolDesc: "Наш инструмент анализирует ключевые слова, отслеживает позиции и помогает вам обойти конкурентов.",
            loading: "Загрузка товаров...", authTitle: "Авторизация", passwordPlaceholder: "Пароль", authBtn: "Войти",
            demoMode: "Введите данные для входа", developedIn: "Разработан в 2026.", telegramBtn: "Наш Telegram канал"
        },
        en: {
            languageBtn: "Language", headerTitle: "SEO Multitool", loginBtn: "Login", logoutBtn: "Logout",
            registerBtn: "Registration", registerTitle: "Registration", sendRequestBtn: "Send Request",
            videoTitle: "See our product in action", multitoolTitle: "SEO Multitool",
            multitoolDesc: "Our tool analyzes keywords, tracks rankings, and helps you outperform competitors.",
            loading: "Loading products...", authTitle: "Authorization", passwordPlaceholder: "Password", authBtn: "Login",
            demoMode: "Enter login credentials", developedIn: "Developed in 2026.", telegramBtn: "Our Telegram channel"
        }
    };

    // --- ЭЛЕМЕНТЫ DOM ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainMenu = document.getElementById('mainMenu');
    
    // Внутренние блоки меню
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const menuUserName = document.getElementById('menuUserName');
    
    // Кнопки
    const menuLoginBtn = document.getElementById('menuLoginBtn');
    const menuRegisterBtn = document.getElementById('menuRegisterBtn');
    const menuLogoutBtn = document.getElementById('menuLogoutBtn');
    
    const menuLangBtn = document.getElementById('menuLangBtn');
    const langSubmenu = document.getElementById('langSubmenu');

    // Модальные окна
    const authModal = document.getElementById('authModal');
    const regModal = document.getElementById('regModal');
    const loginForm = document.getElementById('loginForm');
    const regFormRequest = document.getElementById('regFormRequest');
    const closeBtns = document.querySelectorAll('.close, .close-reg');

    // --- УПРАВЛЕНИЕ МЕНЮ ---
    if(hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mainMenu.classList.toggle('hidden');
            if (!mainMenu.classList.contains('hidden')) {
                if(langSubmenu) langSubmenu.classList.add('hidden');
            }
        });
    }

    if(menuLangBtn) {
        menuLangBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            if(langSubmenu) langSubmenu.classList.toggle('hidden');
        });
    }

    if(langSubmenu) {
        langSubmenu.addEventListener('click', (e) => {
            if(e.target.tagName === 'A') {
                e.preventDefault();
                const selectedLang = e.target.dataset.lang;
                setLanguage(selectedLang);
                mainMenu.classList.add('hidden');
                langSubmenu.classList.add('hidden');
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (mainMenu && !mainMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            mainMenu.classList.add('hidden');
            if(langSubmenu) langSubmenu.classList.add('hidden');
        }
    });

    // --- СМЕНА ЯЗЫКА ---
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
    setLanguage(localStorage.getItem('language') || 'ru');

    // --- ЗАГРУЗКА ТОВАРОВ ---
    const grid = document.getElementById('products-grid');
    if(grid) {
        fetch('db.json')
            .then(res => res.json())
            .then(data => {
                grid.innerHTML = '';
                data.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    let videoHTML = product.video ? `<div class="video-container"><video controls muted><source src="${product.video}" type="video/mp4"></video></div>` : '';

                    card.innerHTML = `
                        <div class="card-img-wrapper">
                            <img src="${product.image}" alt="${product.title}">
                            ${videoHTML}
                        </div>
                        <div class="card-info-block">
                            <h3>${product.title}</h3>
                            <p>${product.description}</p>
                        </div>
                        <button class="price-button">${product.price}</button>
                    `;
                    grid.appendChild(card);
                });
            })
            .catch(err => {
                grid.innerHTML = '<p style="color:red">Ошибка db.json</p>';
                console.error(err);
            });
    }

    // --- МОДАЛЬНЫЕ ОКНА ---
    function closeModal() {
        if(authModal) authModal.classList.add('hidden');
        if(regModal) regModal.classList.add('hidden');
    }

    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    if(menuLoginBtn) {
        menuLoginBtn.addEventListener('click', () => {
            if(authModal) authModal.classList.remove('hidden');
            if(mainMenu) mainMenu.classList.add('hidden');
        });
    }

    if(menuRegisterBtn) {
        menuRegisterBtn.addEventListener('click', () => {
            if(regModal) regModal.classList.remove('hidden');
            if(mainMenu) mainMenu.classList.add('hidden');
        });
    }

    // --- ЛОГИКА ВХОДА (users.json) ---
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail').value.trim();
            const passInput = document.getElementById('loginPass').value.trim();
            const btn = loginForm.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = '...';
            
            fetch('users.json')
                .then(r => r.json())
                .then(users => {
                    const found = users.find(u => u.login === emailInput && u.password === passInput);
                    if(found) {
                        localStorage.setItem('user', found.login);
                        updateAuthUI(found.login);
                        closeModal();
                        alert(`Добро пожаловать, ${found.login}!`);
                    } else {
                        alert('Неверный логин или пароль');
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('Ошибка чтения users.json');
                })
                .finally(() => btn.textContent = originalText);
        });
    }

    // --- ЛОГИКА РЕГИСТРАЦИИ (TELEGRAM) ---
    if(regFormRequest) {
        regFormRequest.addEventListener('submit', (e) => {
            e.preventDefault();
            const login = document.getElementById('newLogin').value;
            const pass = document.getElementById('newPass').value;
            const btn = regFormRequest.querySelector('button');
            
            btn.textContent = 'Отправка...';
            btn.disabled = true;

            const msg = `🚀 <b>НОВАЯ ЗАЯВКА</b>\n👤: <code>${login}</code>\n🔑: <code>${pass}</code>`;

            fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: TG_CHAT_ID, text: msg, parse_mode: 'HTML' })
            })
            .then(r => {
                if(r.ok) {
                    alert('Заявка отправлена!');
                    closeModal();
                    regFormRequest.reset();
                } else {
                    alert('Ошибка Telegram API');
                }
            })
            .catch(() => alert('Ошибка сети'))
            .finally(() => {
                btn.textContent = 'Отправить заявку';
                btn.disabled = false;
            });
        });
    }

    // --- ВЫХОД ---
    if(menuLogoutBtn) {
        menuLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            updateAuthUI(null);
            mainMenu.classList.add('hidden');
        });
    }

    // --- ПЕРЕКЛЮЧЕНИЕ ИНТЕРФЕЙСА ---
    function updateAuthUI(user) {
        if(user) {
            // Вошли
            if(guestNav) guestNav.classList.add('hidden');
            if(userNav) userNav.classList.remove('hidden');
            if(menuUserName) menuUserName.textContent = user;
        } else {
            // Не вошли
            if(guestNav) guestNav.classList.remove('hidden');
            if(userNav) userNav.classList.add('hidden');
        }
    }

    const savedUser = localStorage.getItem('user');
    updateAuthUI(savedUser);

});

