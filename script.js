document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // ⚙️ НАСТРОЙКИ (ВВЕДИТЕ СВОИ ДАННЫЕ)
    // ==========================================
    // Получите токен у @BotFather и ваш ID у @userinfobot
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; 
    const TG_CHAT_ID = '5683927471'; 
    const ADMIN_USERNAME = '@seo_dark_side'; // Для связи
    
    // ВАШ КОШЕЛЕК ДЛЯ "ADI" (или TON/USDT)
    const CRYPTO_WALLET = 'UQBKg4_q8x5v2J1z...ВАШ_КОШЕЛЕК'; 
    
    const SUBSCRIPTION_DURATION = 60000 * 60 * 24; // 24 часа демо-доступа

    const isMobile = window.innerWidth <= 1024;

    // ==========================================
    // 🌍 LOCALIZATION & DATA
    // ==========================================
    const translations = { 
        ru: { 
            headerTitle: "Premium Utility", 
            authTitle: "Вход в систему",
            authBtn: "Войти",
            buyBtn: "Купить",
            owned: "Куплено",
            payTitle: "Оплата Crypto",
            payDesc: "Перевод на кошелек",
            checkBtn: "Я оплатил",
            sentToAdmin: "Заявка отправлена! Ожидайте активации.",
            copySuccess: "Кошелек скопирован!",
            error: "Ошибка отправки."
        }, 
        en: { 
            headerTitle: "Premium Utility", 
            authTitle: "System Login",
            authBtn: "Login",
            buyBtn: "Buy Access",
            owned: "Owned",
            payTitle: "Crypto Payment",
            payDesc: "Transfer to wallet",
            checkBtn: "I Have Paid",
            sentToAdmin: "Request sent! Wait for activation.",
            copySuccess: "Wallet copied!",
            error: "Sending error."
        } 
    };
    let currentLang = 'ru'; 

    const products = [ 
        { id: 1, title: "Parser Pro", description: "Сбор данных с любых сайтов. Высокая скорость.", price: 1500, image: "https://via.placeholder.com/600x400/13131f/6366f1?text=PARSER", file: "parser.exe" }, 
        { id: 2, title: "Rank Tracker", description: "Мониторинг позиций Google/Yandex в реальном времени.", price: 2500, image: "https://via.placeholder.com/600x400/13131f/06b6d4?text=TRACKER", file: "tracker.zip" }, 
        { id: 3, title: "SEO Audit", description: "Полный технический аудит и поиск ошибок сайта.", price: 3500, image: "https://via.placeholder.com/600x400/13131f/a855f7?text=AUDIT", file: "audit.dmg" }, 
        { id: 4, title: "VIP Full Pack", description: "Доступ ко всем инструментам навсегда.", price: 9990, image: "https://via.placeholder.com/600x400/13131f/10b981?text=VIP", file: "fullpack.rar" } 
    ];

    // State
    let currentUser = localStorage.getItem('acus_user');
    let userPurchases = [];
    let currentProduct = null;

    // DOM Elements
    const grid = document.getElementById('products-grid');
    const mainMenu = document.getElementById('mainMenu');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeMenuBtn = document.querySelector('.close-menu');
    const walletAddressEl = document.getElementById('walletAddress');
    
    // Modals
    const modals = {
        auth: document.getElementById('authModal'),
        reg: document.getElementById('regModal'),
        pay: document.getElementById('paymentModal'),
        lib: document.getElementById('libraryModal')
    };

    // ==========================================
    // 🛠 CORE LOGIC
    // ==========================================

    function init() {
        if(walletAddressEl) walletAddressEl.textContent = shortenAddress(CRYPTO_WALLET);
        loadPurchases();
        renderProducts();
        updateAuthUI();
        setupEventListeners();
    }

    function shortenAddress(addr) {
        if (addr.length < 10) return addr;
        return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
    }

    function loadPurchases() {
        if (!currentUser) return;
        const data = localStorage.getItem(`purchases_${currentUser}`);
        userPurchases = data ? JSON.parse(data) : [];
    }

    function renderProducts() {
        grid.innerHTML = '';
        products.forEach(p => {
            const isOwned = userPurchases.some(purchase => purchase.id === p.id);
            const btnClass = isOwned ? 'price-button owned' : 'price-button';
            const btnText = isOwned ? `<i class="fa fa-check"></i> ${translations[currentLang].owned}` : `${p.price} ADI`; // Используем ADI как валюту
            const onClick = isOwned ? '' : `onclick="openPayment(${p.id})"`;

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-img-wrapper"><img src="${p.image}" alt="${p.title}" loading="lazy"></div>
                <div class="card-content">
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <button class="${btnClass}" ${onClick}>${btnText}</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // ==========================================
    // 💰 CRYPTO PAYMENT SYSTEM
    // ==========================================
    
    window.openPayment = (id) => {
        if (!currentUser) {
            openModal('auth');
            return;
        }
        currentProduct = products.find(p => p.id === id);
        if(!currentProduct) return;

        document.getElementById('payName').textContent = currentProduct.title;
        document.getElementById('payAmount').textContent = `${currentProduct.price} ADI`;
        openModal('pay');
    };

    // Handle Payment Submission (Manual Check)
    document.getElementById('cryptoCheckForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const txHash = document.getElementById('txHash').value.trim();
        const btn = e.target.querySelector('button');
        
        if(txHash.length < 5) return alert('Введите корректный хэш');

        // UI Loading
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Проверка...';
        btn.disabled = true;

        // Message to Admin
        const msg = `
💰 <b>НОВАЯ ОПЛАТА (Crypto)</b>
👤 <b>User:</b> ${currentUser}
📦 <b>Товар:</b> ${currentProduct.title}
💎 <b>Сумма:</b> ${currentProduct.price} ADI
🧾 <b>TX Hash:</b> <code>${txHash}</code>

⚠️ <i>Проверьте поступление и свяжитесь с клиентом или выдайте доступ вручную (пока нет бэкенда).</i>
        `;

        try {
            await sendTelegram(msg);
            alert(translations[currentLang].sentToAdmin);
            
            // Временно выдаем доступ (ДЕМО РЕЖИМ) для удовлетворения требования "бесплатно и работает"
            // В реальном проекте админ должен подтвердить это в базе данных
            userPurchases.push({ id: currentProduct.id, date: Date.now() });
            localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
            
            closeAllModals();
            renderProducts();
            e.target.reset();
        } catch (err) {
            alert(translations[currentLang].error);
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    });

    // Copy Wallet Logic
    document.getElementById('walletCopyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(CRYPTO_WALLET).then(() => {
            alert(translations[currentLang].copySuccess);
        });
    });

    // ==========================================
    // 📨 TELEGRAM SENDER
    // ==========================================
    async function sendTelegram(text) {
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
        const resp = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        if(!resp.ok) throw new Error('TG API Error');
    }

    // ==========================================
    // 👤 AUTH & UI
    // ==========================================

    function updateAuthUI() {
        const guestNav = document.getElementById('guestNav');
        const userNav = document.getElementById('userNav');
        const nameDisplay = document.getElementById('menuUserName');

        if(currentUser) {
            guestNav.classList.add('hidden');
            userNav.classList.remove('hidden');
            nameDisplay.textContent = currentUser;
        } else {
            guestNav.classList.remove('hidden');
            userNav.classList.add('hidden');
        }
    }

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const login = document.getElementById('loginEmail').value;
        if(login) {
            currentUser = login;
            localStorage.setItem('acus_user', login);
            updateAuthUI();
            closeAllModals();
            loadPurchases();
            renderProducts();
        }
    });

    document.getElementById('regFormRequest').addEventListener('submit', async (e) => {
        e.preventDefault();
        const login = document.getElementById('newLogin').value;
        const pass = document.getElementById('newPass').value;
        
        await sendTelegram(`🆕 <b>РЕГИСТРАЦИЯ</b>\nLogin: ${login}\nPass: ${pass}`);
        alert('Заявка отправлена!');
        closeAllModals();
    });

    document.getElementById('menuLogoutBtn').addEventListener('click', () => {
        localStorage.removeItem('acus_user');
        currentUser = null;
        userPurchases = [];
        updateAuthUI();
        renderProducts();
        toggleMenu(false);
    });

    document.getElementById('menuLibraryBtn').addEventListener('click', () => {
        const list = document.getElementById('libraryList');
        list.innerHTML = '';
        
        if(userPurchases.length === 0) {
            list.innerHTML = '<p style="color:#aaa; text-align:center">Пусто</p>';
        } else {
            userPurchases.forEach(pur => {
                const prod = products.find(p => p.id === pur.id);
                if(prod) {
                    list.innerHTML += `
                        <div class="lib-item">
                            <span>${prod.title}</span>
                            <a href="#" class="lib-btn" onclick="alert('Скачивание ${prod.file}...')"><i class="fa fa-download"></i></a>
                        </div>
                    `;
                }
            });
        }
        openModal('lib');
        toggleMenu(false);
    });

    // ==========================================
    // 🎮 MENU & MODAL CONTROLS
    // ==========================================
    
    function toggleMenu(show) {
        if(show) mainMenu.classList.remove('hidden');
        else mainMenu.classList.add('hidden');
    }

    function openModal(name) {
        closeAllModals();
        modals[name].classList.remove('hidden');
    }

    function closeAllModals() {
        Object.values(modals).forEach(m => m.classList.add('hidden'));
    }

    hamburgerBtn.addEventListener('click', () => toggleMenu(true));
    closeMenuBtn.addEventListener('click', () => toggleMenu(false));
    document.querySelector('.menu-backdrop').addEventListener('click', () => toggleMenu(false));

    document.getElementById('menuLoginBtn').addEventListener('click', () => { toggleMenu(false); openModal('auth'); });
    document.getElementById('menuRegisterBtn').addEventListener('click', () => { toggleMenu(false); openModal('reg'); });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Initial Run
    init();
});
