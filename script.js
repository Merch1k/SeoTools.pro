document.addEventListener('DOMContentLoaded', () => {

    const TG_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA';
    const TG_CHAT = '5683927471';
    const WALLET = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB';

    const translations = {
        ru: { headerTitle: "Элитные Системы", loginBtn: "Вход", registerBtn: "Регистрация", logoutBtn: "Выход", languageBtn: "Язык", myPurchases: "Мой кабинет", authTitle: "Система ACUS", authBtn: "Войти в систему", checkBtn: "Подтвердить платеж", buy: "Активировать" },
        en: { headerTitle: "Elite Systems", loginBtn: "Login", registerBtn: "Join", logoutBtn: "Logout", languageBtn: "Language", myPurchases: "My Dashboard", authTitle: "ACUS System", authBtn: "Log In Now", checkBtn: "Confirm TX", buy: "Activate Now" }
    };

    let currentLang = localStorage.getItem('lang') || 'ru';
    let user = localStorage.getItem('user');

    const products = [
        { id: 1, name: "Parser Pro", desc: "Enterprise-grade data mining at maximum speed.", price: 1500, img: "https://placehold.co/600x400/000/00ffa3?text=PARSER" },
        { id: 2, name: "Neural Rank", desc: "AI-powered position monitoring for global SEO.", price: 2500, img: "https://placehold.co/600x400/000/7000ff?text=NEURAL" },
        { id: 3, name: "Audit Core", desc: "Deep technical scan of infrastructure and code.", price: 3500, img: "https://placehold.co/600x400/000/00ffa3?text=AUDIT" },
        { id: 4, name: "Unlimited VIP", desc: "Total control. All tools. Lifetime updates.", price: 9990, img: "https://placehold.co/600x400/000/7000ff?text=VIP" }
    ];

    function renderProducts() {
        const grid = document.getElementById('productGrid');
        const buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        grid.innerHTML = '';
        
        products.forEach(p => {
            const owned = buys.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card-wrapper';
            card.innerHTML = `
                <div class="card">
                    <div class="card-content">
                        <div class="card-image"><img src="${p.img}" alt=""></div>
                        <h3 class="card-title">${p.name}</h3>
                        <p class="card-desc">${p.desc}</p>
                        <button class="buy-btn ${owned?'owned':''}" ${owned?'':`onclick="openPay(${p.id})"`}>
                            ${owned ? 'ACTIVE' : `${translations[currentLang].buy} — ${p.price} ADI`}
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        if(window.innerWidth > 1024) initTilt();
    }

    // --- TILT ---
    function initTilt() {
        document.querySelectorAll('.card').forEach(c => {
            c.onmousemove = (e) => {
                const r = c.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                c.style.transform = `perspective(1000px) rotateX(${-y/25}deg) rotateY(${x/25}deg)`;
            };
            c.onmouseleave = () => c.style.transform = '';
        });
    }

    function syncUI() {
        user = localStorage.getItem('user');
        document.getElementById('guestBox').classList.toggle('hidden', !!user);
        document.getElementById('userBox').classList.toggle('hidden', !user);
        if(user) document.getElementById('userNameDisplay').innerText = user;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.innerText = translations[currentLang][el.dataset.langKey];
        });
        
        renderProducts();
    }

    // --- LOGIC ---
    window.openPay = (id) => {
        if(!user) return openM('authModal');
        const p = products.find(x => x.id === id);
        document.getElementById('payName').innerText = p.name;
        document.getElementById('payAmount').innerText = p.price + ' ADI';
        window.activeProductId = id;
        openM('payModal');
    };

    document.getElementById('payForm').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = products.find(x => x.id === window.activeProductId);
        
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CHAT, text: `💎 ELITE PAY: ${user}\nItem: ${p.name}\nHash: ${hash}` })
        });
        
        let buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        buys.push({ id: p.id });
        localStorage.setItem(`buys_${user}`, JSON.stringify(buys));
        alert('Verification in progress...');
        closeM();
        renderProducts();
    };

    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('user', document.getElementById('loginInp').value);
        syncUI();
        closeM();
    };

    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('user');
        syncUI();
        closeM();
    };

    // --- MODALS ---
    function openM(id) { document.getElementById(id).classList.add('active'); }
    function closeM() { document.querySelectorAll('.modal-overlay, .side-menu').forEach(el => el.classList.remove('active')); }

    document.getElementById('openMenu').onclick = () => openM('sideMenu');
    document.getElementById('closeMenu').onclick = closeM;
    document.querySelector('.menu-blur').onclick = closeM;
    document.querySelectorAll('.modal-backdrop, .close-btn').forEach(b => b.onclick = closeM);

    document.querySelectorAll('.lang-btn-style').forEach(b => {
        b.onclick = () => {
            currentLang = b.dataset.lang;
            localStorage.setItem('lang', currentLang);
            document.querySelectorAll('.lang-btn-style').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            syncUI();
        };
    });

    document.getElementById('copyAddr').onclick = () => {
        navigator.clipboard.writeText(WALLET);
        alert('Wallet Address Copied');
    };

    syncUI();
});
