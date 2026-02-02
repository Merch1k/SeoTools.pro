document.addEventListener('DOMContentLoaded', () => {

    const TG_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA';
    const TG_CHAT = '5683927471';
    const WALLET = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB';

    const translations = {
        ru: { headerTitle: "Премиум Экосистема", loginBtn: "Войти", registerBtn: "Регистрация", logoutBtn: "Выход", languageBtn: "Язык", myPurchases: "Мои покупки", authTitle: "Вход в систему", authBtn: "Войти", checkBtn: "Я оплатил", buy: "Купить", videoDesc: "Посмотрите возможности нашей утилиты в действии" },
        en: { headerTitle: "Premium Ecosystem", loginBtn: "Login", registerBtn: "Join", logoutBtn: "Logout", languageBtn: "Language", myPurchases: "My Library", authTitle: "Authorization", authBtn: "Log In", checkBtn: "Verified", buy: "Buy", videoDesc: "Watch our utility features in action" }
    };

    let currentLang = localStorage.getItem('acus_lang') || 'ru';
    let user = localStorage.getItem('acus_user');
    
    // Функция получения покупок для ТЕКУЩЕГО юзера
    function getPurchases() {
        if(!user) return [];
        return JSON.parse(localStorage.getItem(`buy_${user}`)) || [];
    }

    const products = [
        { id: 1, name: "Parser Pro", desc: "Data extraction at light speed.", price: 1500, img: "https://placehold.co/600x400/0c0c12/00ff88?text=PARSER" },
        { id: 2, name: "Rank Tracker", desc: "Monitor rankings in real-time.", price: 2500, img: "https://placehold.co/600x400/0c0c12/bc13fe?text=TRACKER" },
        { id: 3, name: "Audit Core", desc: "Deep technical SEO analysis.", price: 3500, img: "https://placehold.co/600x400/0c0c12/00ff88?text=AUDIT" },
        { id: 4, name: "VIP Stack", desc: "Unlimited access to all tools.", price: 9990, img: "https://placehold.co/600x400/0c0c12/bc13fe?text=VIP" }
    ];

    function renderProducts() {
        const grid = document.getElementById('productsGrid');
        const purchases = getPurchases();
        grid.innerHTML = '';
        
        products.forEach(p => {
            const isOwned = purchases.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-img"><img src="${p.img}" alt=""></div>
                <div class="card-info">
                    <h3>${p.name}</h3>
                    <p>${p.desc}</p>
                    <button class="buy-btn ${isOwned?'owned':''}" ${isOwned?'':`onclick="startPay(${p.id})"`}>
                        ${isOwned ? (currentLang === 'ru' ? 'КУПЛЕНО' : 'OWNED') : `${translations[currentLang].buy} ${p.price} ADI`}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // --- ЛОГИКА ИНТЕРФЕЙСА ---
    function updateUI() {
        user = localStorage.getItem('acus_user');
        const guestLinks = document.getElementById('guestLinks');
        const userLinks = document.getElementById('userLinks');
        const displayUserName = document.getElementById('displayUserName');

        if(user) {
            guestLinks.classList.add('hidden');
            userLinks.classList.remove('hidden');
            displayUserName.innerText = user;
        } else {
            guestLinks.classList.remove('hidden');
            userLinks.classList.add('hidden');
        }

        // Обновляем тексты
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            el.innerText = translations[currentLang][key];
        });

        // Активная кнопка языка
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });

        renderProducts();
    }

    // --- СОБЫТИЯ ---
    window.startPay = (id) => {
        if(!user) { openModal('authModal'); return; }
        const p = products.find(x => x.id === id);
        document.getElementById('payTitle').innerText = p.name;
        document.getElementById('payPrice').innerText = p.price + ' ADI';
        window.activeProductId = id;
        openModal('payModal');
    };

    document.getElementById('payForm').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = products.find(x => x.id === window.activeProductId);
        
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CHAT, text: `💰 ОПЛАТА: ${user}\nТовар: ${p.name}\nTX: ${hash}` })
        });
        
        let purchases = getPurchases();
        purchases.push({ id: p.id });
        localStorage.setItem(`buy_${user}`, JSON.stringify(purchases));
        
        alert(currentLang === 'ru' ? 'Заявка отправлена!' : 'Request sent!');
        closeModals();
        renderProducts();
    };

    // Авторизация
    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        const val = document.getElementById('userInp').value;
        localStorage.setItem('acus_user', val);
        updateUI();
        closeModals();
    };

    document.getElementById('logoutBtnMenu').onclick = () => {
        localStorage.removeItem('acus_user');
        updateUI();
        closeModals();
    };

    // Языки
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.onclick = () => {
            currentLang = btn.dataset.lang;
            localStorage.setItem('acus_lang', currentLang);
            updateUI();
        };
    });

    // Модалки и меню
    function openModal(id) { document.getElementById(id).classList.add('open'); }
    function closeModals() { 
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('open')); 
        document.getElementById('sideMenu').classList.remove('open');
    }

    document.getElementById('burgerBtn').onclick = () => openModal('sideMenu');
    document.querySelector('.menu-close').onclick = closeModals;
    document.querySelector('.menu-overlay').onclick = closeModals;
    document.querySelectorAll('.close-modal, .modal-bg').forEach(b => b.onclick = closeModals);
    
    document.getElementById('loginBtnMenu').onclick = () => openModal('authModal');
    document.getElementById('regBtnMenu').onclick = () => openModal('authModal');
    document.getElementById('libBtnMenu').onclick = () => {
        const list = document.getElementById('libList');
        const purchases = getPurchases();
        list.innerHTML = purchases.length ? '' : '<p>Empty</p>';
        purchases.forEach(pur => {
            const p = products.find(x => x.id === pur.id);
            list.innerHTML += `<div style="padding:10px; border-bottom:1px solid #222;">${p.name} - <span style="color:var(--accent)">Active</span></div>`;
        });
        openModal('libModal');
    };

    document.getElementById('copyWallet').onclick = () => {
        navigator.clipboard.writeText(WALLET);
        alert('Wallet Copied!');
    };

    // INIT
    updateUI();
});
