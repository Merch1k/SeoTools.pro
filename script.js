document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // ⚙️ НАСТРОЙКИ
    // ==========================================
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA';
    const TG_CHAT_ID = '5683927471'; 
    const MY_TON_ADDRESS = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB'; 
    const ADI_RATE = 600; // 1 ADI = 600 RUB

    // ==========================================
    // 🌍 СЛОВАРЬ (ПОЛНЫЙ)
    // ==========================================
    const translations = { 
        ru: { headerTitle: "SEO Утилита", loginBtn: "Войти", registerBtn: "Регистрация", logoutBtn: "Выход", languageBtn: "Язык", videoTitle: "Посмотрите наш продукт в действии", multitoolDesc: "Наш инструмент анализирует ключевые слова, отслеживает позиции и помогает вам обойти конкурентов.", loading: "Загрузка товаров...", developedIn: "Разработан в 2026.", authTitle: "Авторизация", authBtn: "Войти", demoMode: "Демо: введите любые данные", registerTitle: "Регистрация", sendRequestBtn: "Отправить заявку", buyPrefix: "Купить за", inLibrary: "В библиотеке", download: "Скачать", myPurchases: "Мои покупки", cart: "Корзина", regSuccess: "Заявка отправлена администратору!", regError: "Ошибка отправки. Попробуйте позже.", paySuccess: "Оплата принята! Доступ открыт.", welcome: "Добро пожаловать,", noSubs: "У вас пока нет активных подписок.", loginAlert: "Сначала войдите в аккаунт!" }, 
        en: { headerTitle: "SEO Utility", loginBtn: "Log In", registerBtn: "Sign Up", logoutBtn: "Log Out", languageBtn: "Language", videoTitle: "See our product in action", multitoolDesc: "Our tool analyzes keywords, tracks rankings, and helps you outrank competitors.", loading: "Loading products...", developedIn: "Developed in 2026.", authTitle: "Authorization", authBtn: "Log In", demoMode: "Demo: enter any data", registerTitle: "Registration", sendRequestBtn: "Send Request", buyPrefix: "Buy for", inLibrary: "Owned", download: "Download", myPurchases: "My Library", cart: "Cart", regSuccess: "Request sent to admin!", regError: "Sending error. Try again later.", paySuccess: "Payment confirmed! Access granted.", welcome: "Welcome,", noSubs: "No active subscriptions.", loginAlert: "Please log in first!" } 
    };
    
    let currentLang = 'ru'; 

    const products = [ 
        { id: 1, title: "Parser Pro", description: "Сбор данных с любых сайтов в пару кликов.", price: 1500, image: "https://placehold.co/600x400/1e293b/4ade80?text=PARSER+PRO" }, 
        { id: 2, title: "Rank Tracker", description: "Точный мониторинг позиций в Google и Яндекс.", price: 2500, image: "https://placehold.co/600x400/1e293b/00ffff?text=RANK+TRACKER" }, 
        { id: 3, title: "SEO Audit", description: "Полный технический аудит вашего сайта.", price: 3500, image: "https://placehold.co/600x400/1e293b/ff00ff?text=SEO+AUDIT" }, 
        { id: 4, title: "Unlimited", description: "Доступ ко всем инструментам без ограничений.", price: 9990, image: "https://placehold.co/600x400/1e293b/ffff66?text=UNLIMITED+VIP" } 
    ];

    let currentUser = localStorage.getItem('acus_user');
    let userPurchases = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
    let currentOrder = null;
    let checkInterval = null;

    // --- DOM ЭЛЕМЕНТЫ ---
    const grid = document.getElementById('products-grid');
    const mainMenu = document.getElementById('mainMenu');
    const authModal = document.getElementById('authModal');
    const paymentModal = document.getElementById('paymentModal');

    // ==========================================
    // 🔍 ПРОВЕРКА ОПЛАТЫ
    // ==========================================
    async function checkPayment() {
        if (!currentOrder) return;
        try {
            const res = await fetch(`https://toncenter.com/api/v2/getTransactions?address=${MY_TON_ADDRESS}&limit=10`);
            const data = await res.json();
            if (data.ok && data.result) {
                for (let tx of data.result) {
                    const memo = tx.in_msg.message || "";
                    const val = parseFloat(tx.in_msg.value) / 1000000000;
                    if (memo === currentOrder.memo && val >= (currentOrder.amount * 0.98)) {
                        userPurchases.push({ id: currentOrder.productId, expires: Date.now() + 2592000000 });
                        localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
                        alert(translations[currentLang].paySuccess);
                        location.reload();
                    }
                }
            }
        } catch (e) { console.log("Blockchain check..."); }
    }

    // ==========================================
    // 🛠 РЕНДЕР ТОВАРОВ (ПОДРОБНЫЙ)
    // ==========================================
    function renderProducts() {
        grid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            const isOwned = userPurchases.some(p => p.id === product.id);
            
            let btnText = isOwned ? translations[currentLang].inLibrary : `${translations[currentLang].buyPrefix} ${product.price} ₽`;
            
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-img-wrapper"><img src="${product.image}"></div>
                    <div class="card-info-block">
                        <h3>${product.title}</h3>
                        <p>${product.description}</p>
                    </div>
                    <button class="price-button ${isOwned?'owned':''}" ${isOwned?'':`onclick="buyProduct(${product.id})"`}>
                        ${btnText}
                    </button>
                </div>`;
            grid.appendChild(card);
        });
        apply3DEffect();
    }

    window.buyProduct = (id) => {
        if (!currentUser) { alert(translations[currentLang].loginAlert); authModal.classList.remove('hidden'); return; }
        const p = products.find(x => x.id === id);
        const amount = (p.price / ADI_RATE).toFixed(2);
        const memo = `ADI_${Math.floor(Math.random()*90000+10000)}`;
        currentOrder = { productId: id, amount, memo };

        document.getElementById('payName').textContent = p.title;
        document.getElementById('payAmount').textContent = `${amount} ADI`;
        document.getElementById('walletAddr').value = MY_TON_ADDRESS;
        document.getElementById('payMemo').value = memo;
        paymentModal.classList.remove('hidden');

        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(checkPayment, 15000);
    };

    // --- ЭФФЕКТЫ (ДЛЯ ВСЕХ УСТРОЙСТВ) ---
    function apply3DEffect() {
        document.querySelectorAll('.card').forEach(card => {
            const move = (e) => {
                const rect = card.getBoundingClientRect();
                const cx = e.touches ? e.touches[0].clientX : e.clientX;
                const cy = e.touches ? e.touches[0].clientY : e.clientY;
                const x = (cx - rect.left) / rect.width - 0.5;
                const y = (cy - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(1000px) rotateX(${y * -15}deg) rotateY(${x * 15}deg) scale3d(1.05, 1.05, 1.05)`;
            };
            card.addEventListener('mousemove', move);
            card.addEventListener('touchmove', move);
            card.addEventListener('mouseleave', () => card.style.transform = 'none');
            card.addEventListener('touchend', () => card.style.transform = 'none');
        });
    }

    // --- ОБРАБОТЧИКИ (МЕНЮ / ЛОГИН) ---
    document.getElementById('hamburgerBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        mainMenu.classList.toggle('hidden');
    });

    document.getElementById('menuLoginBtn').addEventListener('click', () => {
        authModal.classList.remove('hidden');
        mainMenu.classList.add('hidden');
    });

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser = document.getElementById('loginEmail').value;
        localStorage.setItem('acus_user', currentUser);
        location.reload();
    });

    document.getElementById('menuLogoutBtn').addEventListener('click', () => {
        localStorage.removeItem('acus_user');
        location.reload();
    });

    // АВРОРА
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        document.querySelector('.aurora.one').style.transform = `translate(${x*80-40}%, ${y*80-40}%)`;
        document.querySelector('.aurora.two').style.transform = `translate(${x*-80+40}%, ${y*-80+40}%)`;
    });

    if(currentUser) {
        document.getElementById('guestNav').classList.add('hidden');
        document.getElementById('userNav').classList.remove('hidden');
        document.getElementById('menuUserName').textContent = currentUser;
    }

    renderProducts();
});
