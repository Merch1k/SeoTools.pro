document.addEventListener('DOMContentLoaded', () => {

    const SOVEREIGN_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chat: '5683927471',
        wallet: 'UQBKg4_q8x5v2J1z...ВАШ_КОШЕЛЕК'
    };

    const STRINGS = {
        ru: { headerTitle: "Цифровая Элита", headerDesc: "Ультимативные решения для профессионалов.", loginBtn: "Вход", registerBtn: "Регистрация", logoutBtn: "Выход", myPurchases: "Арсенал", authBtn: "Авторизоваться", checkBtn: "Я оплатил", buy: "Активировать" },
        en: { headerTitle: "Digital Elite", headerDesc: "Ultimate solutions for industry professionals.", loginBtn: "Entry", registerBtn: "Join", logoutBtn: "Exit", myPurchases: "Arsenal", authBtn: "Authenticate", checkBtn: "Verified", buy: "Activate" }
    };

    let lang = localStorage.getItem('acus_lang') || 'ru';
    let user = localStorage.getItem('acus_user');

    const products = [
        { id: 1, name: "Parser Pro", desc: "Enterprise-grade data harvesting architecture.", price: 1500, img: "https://placehold.co/600x400/000/fff?text=PARSER" },
        { id: 2, name: "Neural Rank", desc: "AI-powered tracking for global search supremacy.", price: 2500, img: "https://placehold.co/600x400/000/fff?text=NEURAL" },
        { id: 3, name: "Audit Core", desc: "Deep infrastructure vulnerability diagnostics.", price: 3500, img: "https://placehold.co/600x400/000/fff?text=AUDIT" },
        { id: 4, name: "Legacy Pack", desc: "Infinite access to the complete ACUS arsenal.", price: 9990, img: "https://placehold.co/600x400/000/fff?text=LEGACY" }
    ];

    function renderProducts() {
        const grid = document.getElementById('imperialGrid');
        const buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        grid.innerHTML = '';
        
        products.forEach(p => {
            const owned = buys.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card-unit';
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-media"><img src="${p.img}" alt=""></div>
                    <h3 class="card-title">${p.name}</h3>
                    <p class="card-desc">${p.desc}</p>
                    <button class="btn-premium ${owned?'owned':''}" ${owned?'':`onclick="initPay(${p.id})"`}>
                        ${owned ? 'AUTHORIZED' : `${STRINGS[lang].buy} / ${p.price} ADI`}
                    </button>
                </div>`;
            grid.appendChild(card);
        });
        if(window.innerWidth > 1024) applyHapticPhysics();
    }

    // --- АДАПТИВНЫЙ СВЕТ И ФИЗИКА ---
    function applyHapticPhysics() {
        document.querySelectorAll('.card-unit').forEach(card => {
            card.onmousemove = (e) => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                
                // Свет
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);

                // Наклон
                const rotateX = (y - r.height/2) / -25;
                const rotateY = (x - r.width/2) / 25;
                card.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            };
            card.onmouseleave = () => {
                card.style.transform = '';
            };
        });
    }

    function syncUI() {
        user = localStorage.getItem('acus_user');
        document.getElementById('authGuest').classList.toggle('hidden', !!user);
        document.getElementById('authUser').classList.toggle('hidden', !user);
        if(user) document.getElementById('userName').innerText = user;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.innerText = STRINGS[lang][el.dataset.langKey];
        });
        
        // Кнопки языка
        document.querySelectorAll('.lang-node').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });

        renderProducts();
    }

    window.initPay = (id) => {
        if(!user) return openM('authModal');
        const p = products.find(x => x.id === id);
        document.getElementById('pTitle').innerText = p.name;
        document.getElementById('pAmount').innerText = p.price + ' ADI';
        window.activeId = id;
        openM('payModal');
    };

    document.getElementById('payForm').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = products.find(x => x.id === window.activeId);
        
        await fetch(`https://api.telegram.org/bot${SOVEREIGN_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: SOVEREIGN_CONFIG.chat, text: `🏛 SOVEREIGN ASSET TRANSFER: ${user}\nProduct: ${p.name}\nTX: ${hash}` })
        });
        
        let buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        buys.push({ id: p.id });
        localStorage.setItem(`buys_${user}`, JSON.stringify(buys));
        alert('Verification in progress. Status: Sovereign Pending.');
        closeM();
        renderProducts();
    };

    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('acus_user', document.getElementById('inpUser').value);
        syncUI();
        closeM();
    };

    document.getElementById('actLogout').onclick = () => {
        localStorage.removeItem('acus_user');
        syncUI();
        closeM();
    };

    function openM(id) { document.getElementById(id).classList.add('active'); }
    function closeM() { document.querySelectorAll('.modal-overlay, .vault-nav').forEach(el => el.classList.remove('active')); }

    document.getElementById('openMenu').onclick = () => openM('sideNav');
    document.querySelectorAll('#closeNav, .vault-blur, #closeAuth, #closePay').forEach(b => b.onclick = closeM);

    document.querySelectorAll('.lang-node').forEach(b => {
        b.onclick = () => {
            lang = b.dataset.lang;
            localStorage.setItem('acus_lang', lang);
            syncUI();
        };
    });

    document.getElementById('copyAddr').onclick = () => {
        navigator.clipboard.writeText(SOVEREIGN_CONFIG.wallet);
        alert('Vault address securely copied.');
    };

    syncUI();
});
