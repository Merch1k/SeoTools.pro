document.addEventListener('DOMContentLoaded', () => {

    // Вставьте сюда токен, который дал @BotFather
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; 
    // Вставьте сюда цифры вашего ID (от @userinfobot)
    const TG_CHAT_ID = '5683927471'; 

   document.addEventListener('DOMContentLoaded', () => {
    // === ТЕКСТОВЫЕ ДАННЫЕ (Языки) ===
    const langData = {
        ru: {
            headerTitle: "SEO УТИЛИТА",
            loginBtn: "Войти",
            registerBtn: "Регистрация",
            logoutBtn: "Выход",
            languageBtn: "Язык",
            videoTitle: "Посмотрите наш продукт в действии",
            multitoolTitle: "SEO Мультитул",
            multitoolDesc: "Наш инструмент анализирует ключевые слова, отслеживает позиции и помогает вам обойти конкурентов.",
            loading: "Загрузка товаров...",
            developedIn: "Разработан в 2026.",
            authTitle: "Авторизация",
            authBtn: "Войти",
            passwordPlaceholder: "Пароль",
            demoMode: "Демо режим: введите любые данные",
            registerTitle: "Регистрация",
            sendRequestBtn: "Отправить заявку",
            
            // Товары
            card1Title: "Parser Pro",
            card1Desc: "Сбор данных с любых сайтов в пару кликов.",
            card2Title: "Rank Tracker",
            card2Desc: "Точный мониторинг позиций в Google и Яндекс.",
            card3Title: "SEO Audit",
            card3Desc: "Полный технический аудит вашего сайта.",
            card4Title: "Unlimited",
            card4Desc: "Доступ ко всем инструментам без ограничений.",
            pricePrefix: "Купить за"
        },
        en: {
            headerTitle: "SEO UTILITY",
            loginBtn: "Login",
            registerBtn: "Register",
            logoutBtn: "Logout",
            languageBtn: "Language",
            videoTitle: "See our product in action",
            multitoolTitle: "SEO Multitool",
            multitoolDesc: "Our tool analyzes keywords, tracks rankings, and helps you outrank competitors.",
            loading: "Loading products...",
            developedIn: "Developed in 2026.",
            authTitle: "Authorization",
            authBtn: "Sign In",
            passwordPlaceholder: "Password",
            demoMode: "Demo mode: enter any data",
            registerTitle: "Registration",
            sendRequestBtn: "Send Request",
            
            card1Title: "Parser Pro",
            card1Desc: "Data scraping from any website in a few clicks.",
            card2Title: "Rank Tracker",
            card2Desc: "Accurate rank monitoring in Google and Yandex.",
            card3Title: "SEO Audit",
            card3Desc: "Full technical audit of your website.",
            card4Title: "Unlimited",
            card4Desc: "Access to all tools without limits.",
            pricePrefix: "Buy for"
        }
    };

    let currentLang = 'ru';

    // === СПИСОК ТОВАРОВ (МОК ДАННЫЕ) ===
    const products = [
        {
            id: 1,
            titleKey: 'card1Title',
            descKey: 'card1Desc',
            title: "Parser Pro",
            desc: "Сбор данных с любых сайтов в пару кликов.",
            price: 1500,
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=80"
        },
        {
            id: 2,
            titleKey: 'card2Title',
            descKey: 'card2Desc',
            title: "Rank Tracker",
            desc: "Точный мониторинг позиций в Google и Яндекс.",
            price: 2500,
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80"
        },
        {
            id: 3,
            titleKey: 'card3Title',
            descKey: 'card3Desc',
            title: "SEO Audit",
            desc: "Полный технический аудит вашего сайта.",
            price: 3500,
            image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=500&q=80"
        },
        {
            id: 4,
            titleKey: 'card4Title',
            descKey: 'card4Desc',
            title: "Unlimited",
            desc: "Доступ ко всем инструментам без ограничений.",
            price: 9990,
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80"
        }
    ];

    // === ГЕНЕРАЦИЯ ТОВАРОВ ===
    const productsGrid = document.getElementById('products-grid');

    function displayProducts(lang) {
        productsGrid.innerHTML = ''; // Очистка
        
        // Получаем тексты для текущего языка
        const t = langData[lang];

        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('card');
            
            // Получаем перевод для конкретного товара
            const title = t[product.titleKey] || product.title;
            const desc = t[product.descKey] || product.desc;

            // ВАЖНО: Новая структура HTML для карточки
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-img-wrapper">
                        <img src="${product.image}" alt="${title}">
                    </div>
                    <div class="card-info-block">
                        <h3 data-lang-key="${product.titleKey}">${title}</h3>
                        <p data-lang-key="${product.descKey}">${desc}</p>
                        <button class="price-button" onclick="alert('Товар добавлен в корзину (Демо)')">
                            <span data-lang-key="pricePrefix">${t.pricePrefix}</span> ${product.price} ₽
                        </button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    // Имитация загрузки
    setTimeout(() => {
        displayProducts(currentLang);
    }, 800);

    // === ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА ===
    function setLanguage(lang) {
        currentLang = lang;
        const t = langData[lang];

        // 1. Обновляем все статические элементы с атрибутом data-lang-key
        document.querySelectorAll('[data-lang-key]').forEach(elem => {
            const key = elem.getAttribute('data-lang-key');
            if (t[key]) {
                elem.textContent = t[key];
            }
        });

        // 2. Обновляем плейсхолдеры
        document.querySelectorAll('[data-lang-placeholder]').forEach(elem => {
            const key = elem.getAttribute('data-lang-placeholder');
            if (t[key]) {
                elem.placeholder = t[key];
            }
        });

        // 3. Перерисовываем товары (чтобы обновились названия внутри JS)
        displayProducts(lang);
    }

    // Обработчик клика по языкам
    document.querySelectorAll('.lang-submenu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
        });
    });


    // === МЕНЮ БУРГЕР И ВЫПАДАШКИ ===
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainMenu = document.getElementById('mainMenu');
    const menuLangBtn = document.getElementById('menuLangBtn');
    const langSubmenu = document.getElementById('langSubmenu');

    // Тоггл главного меню
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainMenu.classList.toggle('hidden');
    });

    // Тоггл подменю языка
    menuLangBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        langSubmenu.classList.toggle('hidden');
    });

    // Закрытие меню при клике вне
    document.addEventListener('click', (e) => {
        if (!mainMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            mainMenu.classList.add('hidden');
            langSubmenu.classList.add('hidden');
        }
    });

    // === МОДАЛЬНЫЕ ОКНА ===
    const authModal = document.getElementById('authModal');
    const regModal = document.getElementById('regModal');
    
    // Кнопки открытия
    document.getElementById('menuLoginBtn').addEventListener('click', (e) => { e.preventDefault(); authModal.classList.remove('hidden'); });
    document.getElementById('menuRegisterBtn').addEventListener('click', (e) => { e.preventDefault(); regModal.classList.remove('hidden'); });
    
    // Кнопки закрытия (крестики)
    document.querySelector('.close').addEventListener('click', () => authModal.classList.add('hidden'));
    document.querySelector('.close-reg').addEventListener('click', () => regModal.classList.add('hidden'));

    // Закрытие по клику на фон
    window.addEventListener('click', (e) => {
        if (e.target === authModal) authModal.classList.add('hidden');
        if (e.target === regModal) regModal.classList.add('hidden');
    });

    // === ЛОГИКА АВТОРИЗАЦИИ (ДЕМО) ===
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const menuUserName = document.getElementById('menuUserName');

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const login = document.getElementById('loginEmail').value;
        
        // "Входим"
        authModal.classList.add('hidden');
        guestNav.classList.add('hidden');
        userNav.classList.remove('hidden');
        menuUserName.textContent = login;
        
        alert('Добро пожаловать, ' + login + '!');
    });

    document.getElementById('menuLogoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        guestNav.classList.remove('hidden');
        userNav.classList.add('hidden');
    });
    
    // === ЛОГИКА РЕГИСТРАЦИИ (ДЕМО) ===
    document.getElementById('regFormRequest').addEventListener('submit', (e) => {
        e.preventDefault();
        regModal.classList.add('hidden');
        alert('Заявка отправлена администратору!');
    });
});
