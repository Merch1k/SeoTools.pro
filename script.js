document.addEventListener('DOMContentLoaded', () => {

    // === ⚙️ НАСТРОЙКИ ===
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; 
    const TG_CHAT_ID = '5683927471'; 
    const CRYPTO_WALLET = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB'; 

    // === 🌍 СЛОВАРЬ ПЕРЕВОДОВ ===
    const translations = {
        ru: { headerTitle: "SEO Утилита", loginBtn: "Войти", registerBtn: "Регистрация", logoutBtn: "Выход", languageBtn: "Язык", loading: "Загрузка товаров...", developedIn: "Разработано для лучших.", authTitle: "Авторизация", authBtn: "Войти", registerTitle: "Регистрация", sendRequestBtn: "Отправить заявку", buyPrefix: "Купить за", inLibrary: "В библиотеке", download: "Скачать", myPurchases: "Мои покупки", regSuccess: "Заявка отправлена!", regError: "Ошибка отправки.", paySuccess: "Оплата прошла успешно!", welcome: "Добро пожаловать,", noSubs: "У вас нет покупок.", loginAlert: "Сначала войдите в аккаунт!", checkBtn: "Я Оплатил" },
        en: { headerTitle: "SEO Utility", loginBtn: "Log In", registerBtn: "Sign Up", logoutBtn: "Log Out", languageBtn: "Language", loading: "Loading products...", developedIn: "Developed for the best.", authTitle: "Authorization", authBtn: "Log In", registerTitle: "Registration", sendRequestBtn: "Send Request", buyPrefix: "Buy for", inLibrary: "Owned", download: "Download", myPurchases: "My Library", regSuccess: "Request sent!", regError: "Sending error.", paySuccess: "Payment successful!", welcome: "Welcome,", noSubs: "No purchases yet.", loginAlert: "Please log in first!", checkBtn: "I Have Paid" }
    };
    let currentLang = 'ru';

    // === 📦 ДАННЫЕ ТОВАРОВ ===
    const products = [
        { id: 1, title: "Parser Pro", description: "Сбор данных с любых сайтов в пару кликов.", price: 1500, image: "https://placehold.co/600x400/1e293b/4ade80?text=PARSER+PRO", file: "parser_setup.exe" }, 
        { id: 2, title: "Rank Tracker", description: "Точный мониторинг позиций в Google и Яндекс.", price: 2500, image: "https://placehold.co/600x400/1e293b/00ffff?text=RANK+TRACKER", file: "rank_tracker.zip" }, 
        { id: 3, title: "SEO Audit", description: "Полный технический аудит вашего сайта.", price: 3500, image: "https://placehold.co/600x400/1e293b/ff00ff?text=SEO+AUDIT", file: "audit_tool.dmg" }, 
        { id: 4, title: "Unlimited", description: "Доступ ко всем инструментам без ограничений.", price: 9990, image: "https://placehold.co/600x400/1e293b/ffff66?text=UNLIMITED+VIP", file: "acus_full_pack.rar" }
    ];
    
    // === Состояние приложения ===
    let currentUser = localStorage.getItem('acus_user');
    let userPurchases = []; 
    let currentProductToBuy = null;
    
    // === DOM Элементы ===
    const grid = document.getElementById('products-grid');
    const mainMenu = document.getElementById('mainMenu');
    const modals = {
        auth: document.getElementById('authModal'),
        reg: document.getElementById('regModal'),
        pay: document.getElementById('paymentModal'),
        lib: document.getElementById('libraryModal')
    };

    // === 🛠️ ФУНКЦИИ ===
    function init() {
        if(document.getElementById('walletAddress')) document.getElementById('walletAddress').textContent = CRYPTO_WALLET.substring(0,6) + '...' + CRYPTO_WALLET.slice(-4);
        loadPurchases();
        setLanguage(currentLang); // Применяет язык и рендерит товары
        updateAuthUI();
        setupEventListeners();
    }

    function loadPurchases() {
        if (!currentUser) { userPurchases = []; return; }
        userPurchases = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
    }

    function renderProducts() {
        grid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            const isOwned = userPurchases.some(p => p.id === product.id);
            const btnClass = isOwned ? 'price-button owned' : 'price-button';
            const buyText = translations[currentLang].buyPrefix;
            const ownedText = translations[currentLang].inLibrary;
            const btnContent = isOwned ? ownedText : `${buyText} ${product.price} ADI`;
            const clickAttr = isOwned ? '' : `onclick="buyProduct(${product.id})"`;
            
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-img-wrapper"><img src="${product.image}" alt="${product.title}"></div>
                    <div class="card-info-block">
                        <h3>${product.title}</h3>
                        <p>${product.description}</p>
                    </div>
                    <button class="${btnClass}" ${clickAttr}>${btnContent}</button>
                </div>`;
            grid.appendChild(card);
        });
    }

    function setLanguage(lang) {
        if (!translations[lang]) return;
        currentLang = lang;
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (translations[lang][key]) {
                // Сохраняем иконку, если она есть
                const icon = el.querySelector('i');
                if (icon) {
                    el.innerHTML = `${icon.outerHTML} ${translations[lang][key]}`;
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });
        document.querySelectorAll('.lang-options button').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
        renderProducts();
    }

    function updateAuthUI() {
        const guestNav = document.getElementById('guestNav');
        const userNav = document.getElementById('userNav');
        if(currentUser) {
            guestNav.classList.add('hidden');
            userNav.classList.remove('hidden');
            document.getElementById('menuUserName').textContent = currentUser;
        } else {
            guestNav.classList.remove('hidden');
            userNav.classList.add('hidden');
        }
    }
    
    // === ⚡️ ОБРАБОТЧИКИ СОБЫТИЙ ===
    function setupEventListeners() {
        // Меню
        document.getElementById('hamburgerBtn').addEventListener('click', () => mainMenu.classList.add('active'));
        document.querySelector('.close-menu').addEventListener('click', () => mainMenu.classList.remove('active'));
        document.querySelector('.menu-backdrop').addEventListener('click', () => mainMenu.classList.remove('active'));

        // Языки
        document.querySelectorAll('.lang-options button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                setLanguage(e.target.getAttribute('data-lang'));
                mainMenu.classList.remove('active');
            });
        });

        // Кнопки меню
        document.getElementById('menuLoginBtn').addEventListener('click', () => { openModal('auth'); });
        document.getElementById('menuRegisterBtn').addEventListener('click', () => { openModal('reg'); });
        document.getElementById('menuLogoutBtn').addEventListener('click', logout);
        document.getElementById('menuLibraryBtn').addEventListener('click', showLibrary);

        // Модалки
        document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', closeModals));
        
        // Формы
        document.getElementById('loginForm').addEventListener('submit', login);
        document.getElementById('regFormRequest').addEventListener('submit', register);
        document.getElementById('cryptoCheckForm').addEventListener('submit', handlePayment);
        document.getElementById('walletCopyBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(CRYPTO_WALLET).then(() => alert('Кошелек скопирован!'));
        });
    }

    // === Действия ===
    window.buyProduct = (id) => {
        if (!currentUser) { alert(translations[currentLang].loginAlert); openModal('auth'); return; }
        currentProductToBuy = products.find(p => p.id === id);
        if(currentProductToBuy) {
            document.getElementById('payName').textContent = currentProductToBuy.title;
            document.getElementById('payAmount').textContent = `${currentProductToBuy.price} ADI`;
            openModal('pay');
        }
    };

    function handlePayment(e) {
        e.preventDefault();
        const txHash = document.getElementById('txHash').value;
        const msg = `💎 CRYPTO PAYMENT\nUser: ${currentUser}\nItem: ${currentProductToBuy.title}\nTX: \`${txHash}\``;
        
        // Отправка в телеграм
        fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CHAT_ID, text: msg, parse_mode: 'Markdown' })
        }).then(res => {
            if(res.ok) {
                // Демо-активация
                userPurchases.push({ id: currentProductToBuy.id });
                localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
                alert(translations[currentLang].paySuccess);
                closeModals();
                renderProducts();
            } else {
                alert(translations[currentLang].regError);
            }
        });
    }

    function login(e) {
        e.preventDefault();
        currentUser = document.getElementById('loginEmail').value;
        localStorage.setItem('acus_user', currentUser);
        loadPurchases();
        updateAuthUI();
        renderProducts();
        closeModals();
        alert(`${translations[currentLang].welcome} ${currentUser}!`);
    }

    function logout() {
        localStorage.removeItem('acus_user');
        currentUser = null;
        loadPurchases();
        updateAuthUI();
        renderProducts();
        mainMenu.classList.remove('active');
    }

    function register(e) { e.preventDefault(); alert(translations[currentLang].regSuccess); closeModals(); }

    function showLibrary() {
        const list = document.getElementById('libraryList');
        list.innerHTML = '';
        if(userPurchases.length === 0) list.innerHTML = `<p>${translations[currentLang].noSubs}</p>`;
        else userPurchases.forEach(pur => {
            const p = products.find(prod => prod.id === pur.id);
            if(p) list.innerHTML += `<div class="lib-item">${p.title}</div>`;
        });
        openModal('lib');
    }

    function openModal(name) { mainMenu.classList.remove('active'); closeModals(); modals[name].classList.remove('hidden'); }
    function closeModals() { Object.values(modals).forEach(m => m.classList.add('hidden')); }
    
    // === ЗАПУСК ===
    init();
});
