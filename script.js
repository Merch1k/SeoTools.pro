document.addEventListener('DOMContentLoaded', () => {

    const TG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chat: '5683927471'
    };
    const WALLET_ADDR = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB';

    const translations = {
        ru: { headerTitle: "Элитные Утилиты", loginBtn: "Войти", registerBtn: "Регистрация", logoutBtn: "Выход", languageBtn: "Язык", myPurchases: "Мои покупки", authTitle: "Вход", authBtn: "Войти", checkBtn: "Подтвердить", buy: "Купить", videoDesc: "Премиальное качество анализа данных" },
        en: { headerTitle: "Elite Utilities", loginBtn: "Login", registerBtn: "Sign Up", logoutBtn: "Logout", languageBtn: "Language", myPurchases: "Library", authTitle: "Login", authBtn: "Enter", checkBtn: "Verify", buy: "Buy", videoDesc: "Premium data analysis quality" }
    };

    let lang = localStorage.getItem('lang') || 'ru';
    let user = localStorage.getItem('user');

    const products = [
        { id: 1, name: "Parser Pro", desc: "Enterprise data harvesting system.", price: 1500, img: "https://placehold.co/600x400/0a0a0f/00ff88?text=PARSER" },
        { id: 2, name: "Rank Tracker", desc: "Real-time global position monitoring.", price: 2500, img: "https://placehold.co/600x400/0a0a0f/bc13fe?text=TRACKER" },
        { id: 3, name: "Audit Core", desc: "Advanced technical infrastructure scan.", price: 3500, img: "https://placehold.co/600x400/0a0a0f/00ff88?text=AUDIT" },
        { id: 4, name: "VIP Stack", desc: "Complete digital arsenal. Lifetime.", price: 9990, img: "https://placehold.co/600x400/0a0a0f/bc13fe?text=VIP" }
    ];

    function render() {
        const grid = document.getElementById('grid');
        const buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        grid.innerHTML = '';
        
        products.forEach(p => {
            const owned = buys.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card-wrapper';
            card.innerHTML = `
                <div class="card">
                    <div class="card-inner">
                        <div class="card-img"><img src="${p.img}" alt=""></div>
                        <div class="card-info">
                            <h3>${p.name}</h3>
                            <p>${p.desc}</p>
                            <button class="buy-btn ${owned?'owned':''}" ${owned?'':`onclick="openPay(${p.id})"`}>
                                ${owned ? (lang==='ru'?'КУПЛЕНО':'OWNED') : `${translations[lang].buy} ${p.price} ADI`}
                            </button>
                        </div>
                    </div>
                </div>`;
            grid.appendChild(card);
        });
        if(window.innerWidth > 1024) initTilt();
    }

    // --- TILT EFFECT (ПК) ---
    function initTilt() {
        document.querySelectorAll('.card').forEach(c => {
            c.onmousemove = (e) => {
                const r = c.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                c.style.transform = `perspective(1000px) rotateX(${-y/20}deg) rotateY(${x/20}deg)`;
            };
            c.onmouseleave = () => c.style.transform = '';
        });
    }

    function updateUI() {
        user = localStorage.getItem('user');
        document.getElementById('guestBox').classList.toggle('hidden', !!user);
        document.getElementById('userBox').classList.toggle('hidden', !user);
        if(user) document.getElementById('userNameText').innerText = user;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.innerText = translations[lang][el.dataset.langKey];
        });
        document.querySelectorAll('.l-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        render();
    }

    // --- PAYMENTS ---
    window.openPay = (id) => {
        if(!user) return openM('authModal');
        const p = products.find(x => x.id === id);
        document.getElementById('payProdName').innerText = p.name;
        document.getElementById('payProdPrice').innerText = p.price + ' ADI';
        window.activeId = id;
        openM('payModal');
    };

    document.getElementById('payForm').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = products.find(x => x.id === window.activeId);
        
        await fetch(`https://api.telegram.org/bot${TG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG.chat, text: `💎 ОПЛАТА: ${user}\nProduct: ${p.name}\nTX: ${hash}` })
        });
        
        let buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        buys.push({ id: p.id });
        localStorage.setItem(`buys_${user}`, JSON.stringify(buys));
        alert('Запрос отправлен!');
        closeM();
        render();
    };

    // --- AUTH ---
    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        const val = document.getElementById('uInp').value;
        localStorage.setItem('user', val);
        updateUI();
        closeM();
    };

    document.getElementById('logoutAction').onclick = () => {
        localStorage.removeItem('user');
        updateUI();
        closeM();
    };

    // --- UI HELPERS ---
    function openM(id) { document.getElementById(id).classList.add('open'); }
    function closeM() { document.querySelectorAll('.modal, .menu-wrap').forEach(el => el.classList.remove('open')); }

    document.getElementById('menuBtn').onclick = () => openM('sideMenu');
    document.querySelectorAll('.close-btn, .menu-overlay').forEach(b => b.onclick = closeM);

    document.getElementById('loginOpen').onclick = () => openM('authModal');
    document.getElementById('regOpen').onclick = () => openM('authModal');

    document.querySelectorAll('.l-btn').forEach(b => {
        b.onclick = () => { lang = b.dataset.lang; localStorage.setItem('lang', lang); updateUI(); };
    });

    document.getElementById('copyWallet').onclick = () => {
        navigator.clipboard.writeText(WALLET_ADDR);
        alert('Copied!');
    };

    document.getElementById('libOpen').onclick = () => {
        const buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        const cont = document.getElementById('libContent');
        cont.innerHTML = buys.length ? '' : '<p>Empty</p>';
        buys.forEach(b => {
            const p = products.find(x => x.id === b.id);
            cont.innerHTML += `<div style="padding:15px; background:rgba(255,255,255,0.05); margin-bottom:10px; border-radius:10px;">${p.name} - <span style="color:var(--accent)">Active</span></div>`;
        });
        openM('libModal');
    };

    updateUI();
});
