document.addEventListener('DOMContentLoaded', () => {

    // --- СЛОВАРЬ ПЕРЕВОДОВ ---
    const translations = {
        ru: {
            languageBtn: "Язык", headerTitle: "Мультитул для SEO задач", loginBtn: "Войти", logoutBtn: "Выйти",
            videoTitle: "Посмотрите наш продукт в действии", multitoolTitle: "SEO Мультитул",
            multitoolDesc: "Наш инструмент анализирует ключевые слова, отслеживает позиции и помогает вам обойти конкурентов. Посмотрите, как легко управлять вашей SEO-стратегией.",
            loading: "Загрузка товаров...", authTitle: "Авторизация", passwordPlaceholder: "Пароль", authBtn: "Войти",
            demoMode: "Демо режим: введите любые данные", developedIn: "Разработан в 2026.", telegramBtn: "Наш Telegram канал"
        },
        en: {
            languageBtn: "Language", headerTitle: "Multitool for SEO tasks", loginBtn: "Login", logoutBtn: "Logout",
            videoTitle: "See our product in action", multitoolTitle: "SEO Multitool",
            multitoolDesc: "Our tool analyzes keywords, tracks rankings, and helps you outperform competitors. See how easy it is to manage your SEO strategy.",
            loading: "Loading products...", authTitle: "Authorization", passwordPlaceholder: "Password", authBtn: "Login",
            demoMode: "Demo mode: enter any data", developedIn: "Developed in 2026.", telegramBtn: "Our Telegram channel"
        }
    };

    // --- ЭЛЕМЕНТЫ DOM ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainMenu = document.getElementById('mainMenu');
    const menuLoginBtn = document.getElementById('menuLoginBtn');
    const menuLangBtn = document.getElementById('menuLangBtn');
    const langSubmenu = document.getElementById('langSubmenu');

    // --- ЛОГИКА МЕНЮ ---
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем закрытие меню сразу после открытия
        mainMenu.classList.toggle('hidden');
        if (mainMenu.classList.contains('hidden')) { // Если главное меню закрыли, то и вложенное тоже
            langSubmenu.classList.add('hidden');
        }
    });

    menuLangBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        langSubmenu.classList.toggle('hidden');
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!mainMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            mainMenu.classList.add('hidden');
            langSubmenu.classList.add('hidden');
        }
    });
    
    // --- ЛОГИКА СМЕНЫ ЯЗЫКА ---
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
            mainMenu.classList.add('hidden'); // Закрываем все меню после выбора
            langSubmenu.classList.add('hidden');
        }
    });
    
    const savedLang = localStorage.getItem('language') || 'ru';
    setLanguage(savedLang);

    // --- ЛОГИКА ЗАГРУЗКИ ТОВАРОВ ---
    const grid = document.getElementById('products-grid');
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            grid.innerHTML = '';
            data.forEach(product => {
                const card = document.createElement('div');
                card.className = 'card';
                let videoHTML = product.video ? `<div class="video-container"><video controls muted><source src="${product.video}" type="video/mp4"></video></div>` : '';
                card.innerHTML = `<img src="${product.image}" alt="${product.title}"><div class.card-content"><h3>${product.title}</h3><p>${product.description}</p><button class="price-button">${product.price}</button>${videoHTML}</div>`;
                grid.appendChild(card);
            });
        })
        .catch(err => {
            grid.innerHTML = '<p style="color:red">Ошибка загрузки товаров.</p>';
            console.error(err);
        });

    // --- ЛОГИКА АВТОРИЗАЦИИ ---
    const modal = document.getElementById('authModal');
    const authBtn = document.getElementById('authBtn'); // Старая кнопка (может быть удалена из HTML, но на всякий случай оставим)
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const userProfile = document.getElementById('userProfile');
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    const openModal = () => {
        modal.classList.remove('hidden');
        mainMenu.classList.add('hidden'); // Закрываем меню при открытии модального окна
        langSubmenu.classList.add('hidden');
    };

    menuLoginBtn.addEventListener('click', openModal);

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        localStorage.setItem('user', email);
        updateAuthUI(email);
        modal.classList.add('hidden');
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        updateAuthUI(null);
    });

    function updateAuthUI(user) {
        const hamburgerContainer = document.querySelector('.menu-container');
        if (user) {
            hamburgerContainer.classList.add('hidden'); // Прячем меню-бургер
            userProfile.classList.remove('hidden');
            userProfile.style.display = 'flex';
            userNameSpan.textContent = user;
        } else {
            hamburgerContainer.classList.remove('hidden'); // Показываем меню-бургер
            userProfile.classList.add('hidden');
        }
    }

    const savedUser = localStorage.getItem('user');
    updateAuthUI(savedUser);
});



