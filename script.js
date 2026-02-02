document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // ⚙️ НАСТРОЙКИ (ВВЕДИТЕ СВОИ ДАННЫЕ)
    // ==========================================
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; // Например: '700123456:AAHi...'
    const TG_CHAT_ID = '5683927471';     // Например: '987654321'
    
    // ВРЕМЯ ЖИЗНИ ПОДПИСКИ
    // 60000 = 1 минута (для теста). 
    // Чтобы сделать 30 дней, поставьте: 2592000000
    const SUBSCRIPTION_DURATION = 60000; 

    // ==========================================
    // 🌍 СЛОВАРЬ ПЕРЕВОДОВ (RU / EN)
    // ==========================================
    const translations = {
        ru: {
            headerTitle: "SEO Утилита",
            loginBtn: "Войти",
            registerBtn: "Регистрация",
            logoutBtn: "Выход",
            languageBtn: "Язык",
            videoTitle: "Посмотрите наш продукт в действии",
            multitoolDesc: "Наш инструмент анализирует ключевые слова, отслеживает позиции и помогает вам обойти конкурентов.",
            loading: "Загрузка товаров...",
            developedIn: "Разработан в 2026.",
            authTitle: "Авторизация",
            authBtn: "Войти",
            demoMode: "Демо: введите любые данные",
            registerTitle: "Регистрация",
            sendRequestBtn: "Отправить заявку",
            buyPrefix: "Купить за",
            inLibrary: "В библиотеке",
            download: "Скачать",
            myPurchases: "Мои покупки",
            cart: "Корзина",
            regSuccess: "Заявка отправлена администратору!",
            regError: "Ошибка отправки. Попробуйте позже.",
            paySuccess: "Оплата прошла успешно!",
            welcome: "Добро пожаловать,",
            noSubs: "У вас пока нет активных подписок.",
            loginAlert: "Сначала войдите в аккаунт!"
        },
        en: {
            headerTitle: "SEO Utility",
            loginBtn: "Log In",
            registerBtn: "Sign Up",
            logoutBtn: "Log Out",
            languageBtn: "Language",
            videoTitle: "See our product in action",
            multitoolDesc: "Our tool analyzes keywords, tracks rankings, and helps you outrank competitors.",
            loading: "Loading products...",
            developedIn: "Developed in 2026.",
            authTitle: "Authorization",
            authBtn: "Log In",
            demoMode: "Demo: enter any data",
            registerTitle: "Registration",
            sendRequestBtn: "Send Request",
            buyPrefix: "Buy for",
            inLibrary: "Owned",
            download: "Download",
            myPurchases: "My Library",
            cart: "Cart",
            regSuccess: "Request sent to admin!",
            regError: "Sending error. Try again later.",
            paySuccess: "Payment successful!",
            welcome: "Welcome,",
            noSubs: "No active subscriptions.",
            loginAlert: "Please log in first!"
        }
    };

    let currentLang = 'ru'; 

    // --- ДАННЫЕ ТОВАРОВ ---
    const products = [
        { 
            id: 1, 
            title: "Parser Pro", 
            description: "Сбор данных с любых сайтов в пару кликов.", 
            price: 1500, 
            image: "https://placehold.co/600x400/1e293b/4ade80?text=PARSER+PRO",
            file: "parser_setup.exe"
        },
        { 
            id: 2, 
            title: "Rank Tracker", 
            description: "Точный мониторинг позиций в Google и Яндекс.", 
            price: 2500, 
            image: "https://placehold.co/600x400/1e293b/00ffff?text=RANK+TRACKER",
            file: "rank_tracker.zip"
        },
        { 
            id: 3, 
            title: "SEO Audit", 
            description: "Полный технический аудит вашего сайта.", 
            price: 3500, 
            image: "https://placehold.co/600x400/1e293b/ff00ff?text=SEO+AUDIT",
            file: "audit_tool.dmg"
        },
        { 
            id: 4, 
            title: "Unlimited", 
            description: "Доступ ко всем инструментам без ограничений.", 
            price: 9990, 
            image: "https://placehold.co/600x400/1e293b/ffff66?text=UNLIMITED+VIP",
            file: "acus_full_pack.rar"
        }
    ];

    // --- ЛОГИКА ДАННЫХ (LocalStorage) ---
    let currentUser = localStorage.getItem('acus_user');
    let rawPurchases = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
    
    // Превращаем старые данные (просто ID) в новые (ID + Время)
    let userPurchases = rawPurchases.map(item => {
        if (typeof item === 'number') {
            return { id: item, expires: Date.now() + SUBSCRIPTION_DURATION };
        }
        return item;
    });

    let currentProductToBuy = null;

    // --- DOM ЭЛЕМЕНТЫ ---
    const grid = document.getElementById('products-grid');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainMenu = document.getElementById('mainMenu');
    
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const menuUserName = document.getElementById('menuUserName');
    
    const menuLoginBtn = document.getElementById('menuLoginBtn');
    const menuRegisterBtn = document.getElementById('menuRegisterBtn');
    const menuLogoutBtn = document.getElementById('menuLogoutBtn');
    const menuLibraryBtn = document.getElementById('menuLibraryBtn');
    
    const menuLangBtn = document.getElementById('menuLangBtn');
    const langSubmenu = document.getElementById('langSubmenu');
    const langLinks = document.querySelectorAll('.lang-submenu a');

    const authModal = document.getElementById('authModal');
    const regModal = document.getElementById('regModal');
    const paymentModal = document.getElementById('paymentModal');
    const libraryModal = document.getElementById('libraryModal');

    // ==========================================
    // 🛠 ФУНКЦИИ
    // ==========================================

    // 1. Проверка таймера подписки
    function checkExpirations() {
        if (!currentUser) return;
        const now = Date.now();
        const initialCount = userPurchases.length;
        
        // Оставляем только те, у которых время НЕ вышло
        userPurchases = userPurchases.filter(p => p.expires > now);
        
        // Если что-то удалилось — сохраняем изменения
        if (userPurchases.length !== initialCount) {
            localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
        }
    }

    // 2. Отрисовка товаров
    function renderProducts() {
        checkExpirations();
        grid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const purchase = userPurchases.find(p => p.id === product.id);
            const isOwned = !!purchase;
            
            let btnClass = isOwned ? 'price-button owned' : 'price-button';
            
            let btnContent = '';
            if (isOwned) {
                // Считаем минуты до конца
                const timeLeft = Math.max(0, Math.ceil((purchase.expires - Date.now()) / 60000));
                const inLibText = translations[currentLang].inLibrary;
                btnContent = `<i class="fa fa-check"></i> ${inLibText} <br><span style="font-size:0.7em; opacity:0.8">${timeLeft} min left</span>`;
            } else {
                const buyText = translations[currentLang].buyPrefix;
                btnContent = `${buyText} ${product.price} ₽`;
            }

            let clickAttr = isOwned ? '' : `onclick="buyProduct(${product.id})"`;

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="card-info-block">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                </div>
                <button class="${btnClass}" ${clickAttr}>
                    ${btnContent}
                </button>
            `;
            grid.appendChild(card);
        });
    }

    // 3. Смена языка
    function setLanguage(lang) {
        if (!translations[lang]) return;
        currentLang = lang;
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (translations[lang][key]) el.textContent = translations[lang][key];
        });
        
        // Обновляем текст в меню
        if(menuLibraryBtn) menuLibraryBtn.innerHTML = `<i class="fa fa-download"></i> ${translations[lang].myPurchases}`;
        const cartBtn = document.getElementById('menuCartBtn');
        if(cartBtn) cartBtn.innerHTML = `<i class="fa fa-shopping-cart"></i> ${translations[lang].cart}`;
        
        renderProducts();
        langSubmenu.classList.add('hidden');
    }

    // ==========================================
    // ⚡️ ОБРАБОТЧИКИ СОБЫТИЙ
    // ==========================================

    // Меню языка
    if (menuLangBtn) {
        menuLangBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            langSubmenu.classList.toggle('hidden');
        });
    }
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setLanguage(e.target.getAttribute('data-lang'));
        });
    });

    // Функция покупки (глобальная)
    window.buyProduct = (id) => {
        if (!currentUser) {
            alert(translations[currentLang].loginAlert);
            authModal.classList.remove('hidden');
            return;
        }
        currentProductToBuy = products.find(p => p.id === id);
        if(currentProductToBuy) {
            document.getElementById('payName').textContent = currentProductToBuy.title;
            document.getElementById('payAmount').textContent = currentProductToBuy.price + ' ₽';
            paymentModal.classList.remove('hidden');
        }
    };

    // Форма оплаты
    document.getElementById('paymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = '...';
        btn.disabled = true;

        setTimeout(() => {
            if(currentProductToBuy) {
                const purchaseData = {
                    id: currentProductToBuy.id,
                    expires: Date.now() + SUBSCRIPTION_DURATION
                };
                userPurchases.push(purchaseData);
                localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
                
                alert(translations[currentLang].paySuccess);
                paymentModal.classList.add('hidden');
                e.target.reset();
                renderProducts(); 
            }
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1500);
    });

    // Открытие библиотеки
    if(menuLibraryBtn) {
        menuLibraryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mainMenu.classList.add('hidden');
            renderLibrary();
            libraryModal.classList.remove('hidden');
        });
    }

    function renderLibrary() {
        checkExpirations();
        const list = document.getElementById('libraryList');
        list.innerHTML = '';
        if(userPurchases.length === 0) {
            list.innerHTML = `<p style="color:#aaa">${translations[currentLang].noSubs}</p>`;
        } else {
            userPurchases.forEach(purchase => {
                const p = products.find(prod => prod.id === purchase.id);
                if(p) {
                    const dateEnd = new Date(purchase.expires).toLocaleString();
                    const dlText = translations[currentLang].download;
                    list.innerHTML += `
                        <div class="lib-item">
                            <div>
                                <span style="font-weight:bold; display:block;">${p.title}</span>
                                <span style="font-size:0.8em; color:#4ade80;">Do: ${dateEnd}</span>
                            </div>
                            <a href="#" class="download-link" onclick="alert('${dlText}: ${p.file}')">
                                <i class="fa fa-download"></i> ${dlText}
                            </a>
                        </div>
                    `;
                }
            });
        }
    }

    // Авторизация (Вход)
    function updateAuthUI() {
        if(currentUser) {
            guestNav.classList.add('hidden');
            userNav.classList.remove('hidden');
            menuUserName.textContent = currentUser;
            checkExpirations();
        } else {
            guestNav.classList.remove('hidden');
            userNav.classList.add('hidden');
        }
        renderProducts();
    }

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const login = document.getElementById('loginEmail').value;
        if(login) {
            currentUser = login;
            localStorage.setItem('acus_user', login);
            let loaded = JSON.parse(localStorage.getItem(`purchases_${login}`)) || [];
            // Восстанавливаем формат данных, если он был старым
            userPurchases = loaded.map(item => {
                 if (typeof item === 'number') return { id: item, expires: Date.now() + SUBSCRIPTION_DURATION };
                 return item;
            });
            updateAuthUI();
            authModal.classList.add('hidden');
            alert(`${translations[currentLang].welcome} ${login}!`);
        }
    });

    // Выход
    if(menuLogoutBtn) {
        menuLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('acus_user');
            currentUser = null;
            userPurchases = [];
            updateAuthUI();
            mainMenu.classList.add('hidden');
        });
    }

    // 🚀 РЕГИСТРАЦИЯ + TELEGRAM (ИСПРАВЛЕНО)
    const regForm = document.getElementById('regFormRequest');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const login = document.getElementById('newLogin').value;
            const pass = document.getElementById('newPass').value;
            const btn = regForm.querySelector('button');
            const originalText = btn.textContent;

            if(!login || !pass) return;

            btn.disabled = true;
            btn.textContent = '...';

            // Сообщение для Телеграма
            const message = `🔔 <b>Новая заявка!</b>\n\n👤 <b>Логин:</b> ${login}\n🔑 <b>Пароль:</b> ${pass}`;

            // Отправка запроса
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
                    alert(translations[currentLang].regSuccess);
                    regModal.classList.add('hidden');
                    regForm.reset();
                } else {
                    console.error('Ошибка Telegram:', response);
                    alert(translations[currentLang].regError);
                }
            })
            .catch(error => {
                console.error('Ошибка сети:', error);
                alert(translations[currentLang].regError);
            })
            .finally(() => {
                btn.disabled = false;
                btn.textContent = originalText;
            });
        });
    }

    // Управление меню (Бургер)
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainMenu.classList.toggle('hidden');
    });

    // Открытие модалок через меню
    if(menuLoginBtn) menuLoginBtn.addEventListener('click', () => { authModal.classList.remove('hidden'); mainMenu.classList.add('hidden'); });
    if(menuRegisterBtn) menuRegisterBtn.addEventListener('click', () => { regModal.classList.remove('hidden'); mainMenu.classList.add('hidden'); });

    // Закрытие крестиком
    document.querySelectorAll('.close, .close-reg, .close-payment, .close-library').forEach(btn => {
        btn.addEventListener('click', () => {
            authModal.classList.add('hidden');
            regModal.classList.add('hidden');
            paymentModal.classList.add('hidden');
            libraryModal.classList.add('hidden');
        });
    });

    // Запуск при загрузке
    updateAuthUI();
});

