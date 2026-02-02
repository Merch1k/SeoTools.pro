document.addEventListener('DOMContentLoaded', () => {

    const SYSTEM_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chat: '5683927471',
        wallet: 'UQBKg4_q8x5v2J1z...YOUR_WALLET'
    };

    const LOCALES = {
        ru: { headerTitle: "Цифровая Элита", loginBtn: "Вход", registerBtn: "Регистрация", logoutBtn: "Выход", myPurchases: "Арсенал", authBtn: "Авторизоваться", checkBtn: "Завершить", buy: "Активировать" },
        en: { headerTitle: "Digital Elite", loginBtn: "Entry", registerBtn: "Join", logoutBtn: "Exit", myPurchases: "Arsenal", authBtn: "Authenticate", checkBtn: "Complete", buy: "Activate" }
    };

    let lang = localStorage.getItem('acus_lang') || 'ru';
    let user = localStorage.getItem('acus_user');

    const products = [
        { id: 1, name: "Parser Pro", desc: "Absolute data harvesting performance architecture.", price: 1500, img: "https://placehold.co/600x400/000/fff?text=PARSER" },
        { id: 2, name: "Neural Rank", desc: "AI-powered dominance tracker for global SEO.", price: 2500, img: "https://placehold.co/600x400/000/fff?text=NEURAL" },
        { id: 3, name: "Audit Core", desc: "Exposing infrastructure vulnerabilities through deep scan.", price: 3500, img: "https://placehold.co/600x400/000/fff?text=AUDIT" },
        { id: 4, name: "Sovereign Pack", desc: "Complete access to the entire digital arsenal.", price: 9990, img: "https://placehold.co/600x400/000/fff?text=SOVEREIGN" }
    ];

    function render() {
        const grid = document.getElementById('monolithGrid');
        const buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        grid.innerHTML = '';
        
        products.forEach(p => {
            const owned = buys.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card-scene';
            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="card-media"><img src="${p.img}" alt=""></div>
                        <h3 class="card-title">${p.name}</h3>
                        <p class="card-desc">${p.desc}</p>
                        <button class="btn-premium ${owned?'owned':''}" ${owned?'':`onclick="initPay(${p.id})"`}>
                            ${owned ? 'AUTHORIZED' : `${LOCALES[lang].buy} / ${p.price} ADI`}
                        </button>
                    </div>
                </div>`;
            grid.appendChild(card);
        });
        if(window.innerWidth > 1024) initDynamicTilt();
    }

    // --- DEEP GLASS PARALLAX EFFECT ---
    function initDynamicTilt() {
        document.querySelectorAll('.card').forEach(c => {
            c.onmousemove = (e) => {
                const r = c.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                
                // Элементы
                const img = c.querySelector('img');
                const title = c.querySelector('.card-title');
                const desc = c.querySelector('.card-desc');
                const btn = c.querySelector('button');

                c.style.transform = `perspective(2000px) rotateX(${-y/40}deg) rotateY(${x/40}deg)`;
                img.style.transform = `scale(1.1) translate(${x/30}px, ${y/30}px)`;
                title.style.transform = `translateZ(50px) translate(${x/25}px, ${y/25}px)`;
                desc.style.transform = `translateZ(30px) translate(${x/35}px, ${y/35}px)`;
                btn.style.transform = `translateZ(60px) translate(${x/15}px, ${y/15}px)`;
            };
            c.onmouseleave = () => {
                c.style.transform = '';
                [c.querySelector('img'), c.querySelector('.card-title'), c.querySelector('.card-desc'), c.querySelector('button')].forEach(el => el.style.transform = '');
            };
        });
    }

    function sync() {
        user = localStorage.getItem('acus_user');
        document.getElementById('guestBox').classList.toggle('hidden', !!user);
        document.getElementById('userBox').classList.toggle('hidden', !user);
        if(user) document.getElementById('userName').innerText = user;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.innerText = LOCALES[lang][el.dataset.langKey];
        });
        render();
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
        
        await fetch(`https://api.telegram.org/bot${SYSTEM_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: SYSTEM_CONFIG.chat, text: `🏛 SOVEREIGN ASSET VERIFICATION: ${user}\nItem: ${p.name}\nTX: ${hash}` })
        });
        
        let buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        buys.push({ id: p.id });
        localStorage.setItem(`buys_${user}`, JSON.stringify(buys));
        alert('Asset transfer verification in progress.');
        closeM();
        render();
    };

    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('acus_user', document.getElementById('inpUser').value);
        sync();
        closeM();
    };

    document.getElementById('actLogout').onclick = () => {
        localStorage.removeItem('acus_user');
        sync();
        closeM();
    };

    function openM(id) { document.getElementById(id).classList.add('active'); }
    function closeM() { document.querySelectorAll('.modal-wrap, .nav-vault').forEach(el => el.classList.remove('active')); }

    document.getElementById('navOpen').onclick = () => openM('navVault');
    document.querySelectorAll('#navClose, .vault-overlay, #authClose, #payClose').forEach(b => b.onclick = closeM);

    document.querySelectorAll('.node-lang').forEach(b => {
        b.onclick = () => {
            lang = b.dataset.lang;
            localStorage.setItem('acus_lang', lang);
            document.querySelectorAll('.node-lang').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            sync();
        };
    });

    document.getElementById('copyAddr').onclick = () => {
        navigator.clipboard.writeText(SYSTEM_CONFIG.wallet);
        alert('Vault address securely copied.');
    };

    sync();
});
