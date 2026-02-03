document.addEventListener('DOMContentLoaded', () => {

    const CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chat: '5683927471',
        wallet: 'UQBKg4_q8x5v2J1z...ВАШ_КОШЕЛЕК'
    };

    const STRINGS = {
        ru: { headerTitle: "Цифровая Элита", loginBtn: "Вход", registerBtn: "Регистрация", logoutBtn: "Выход", myPurchases: "Кабинет", authBtn: "Авторизоваться", checkBtn: "Подтвердить TX", buy: "Активировать" },
        en: { headerTitle: "Digital Elite", loginBtn: "Entry", registerBtn: "Join", logoutBtn: "Exit", myPurchases: "Dashboard", authBtn: "Authenticate", checkBtn: "Confirm TX", buy: "Activate" }
    };

    let lang = localStorage.getItem('acus_lang') || 'ru';
    let user = localStorage.getItem('acus_user');

    const products = [
        { id: 1, name: "Parser Pro", desc: "Enterprise-grade data harvesting architecture.", price: 1500, img: "https://placehold.co/600x400/000/fff?text=PARSER" },
        { id: 2, name: "Neural Rank", desc: "AI-powered tracking for global search supremacy.", price: 2500, img: "https://placehold.co/600x400/000/fff?text=NEURAL" },
        { id: 3, name: "Audit Core", desc: "Deep technical SEO analysis of infrastructure.", price: 3500, img: "https://placehold.co/600x400/000/fff?text=AUDIT" },
        { id: 4, name: "VIP Suite", desc: "Infinite access to the complete ACUS legacy.", price: 9990, img: "https://placehold.co/600x400/000/fff?text=VIP" }
    ];

    function render() {
        const grid = document.getElementById('eliteGrid');
        const buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        grid.innerHTML = '';
        
        products.forEach(p => {
            const owned = buys.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card-scene';
            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="card-image-wrapper"><img src="${p.img}" alt=""></div>
                        <h3 class="card-title">${p.name}</h3>
                        <p class="card-desc">${p.desc}</p>
                        <button class="btn-premium ${owned?'owned':''}" ${owned?'':`onclick="initPay(${p.id})"`}>
                            ${owned ? 'AUTHORIZED' : `${STRINGS[lang].buy} / ${p.price} ADI`}
                        </button>
                    </div>
                </div>`;
            grid.appendChild(card);
        });
        if(window.innerWidth > 1024) applyRayPhysics();
    }

    // --- ADAPTIVE LIGHTING PHYSICS ---
    function applyRayPhysics() {
        document.querySelectorAll('.card').forEach(c => {
            c.onmousemove = (e) => {
                const r = c.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                
                c.style.setProperty('--x', `${x}px`);
                c.style.setProperty('--y', `${y}px`);

                const rotateX = (y - r.height/2) / -25;
                const rotateY = (x - r.width/2) / 25;
                c.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            };
            c.onmouseleave = () => {
                c.style.transform = '';
            };
        });
    }

    function sync() {
        user = localStorage.getItem('acus_user');
        document.getElementById('authGuest').classList.toggle('hidden', !!user);
        document.getElementById('authUser').classList.toggle('hidden', !user);
        if(user) document.getElementById('userName').innerText = user;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.innerText = STRINGS[lang][el.dataset.langKey];
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
        
        await fetch(`https://api.telegram.org/bot${CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: CONFIG.chat, text: `🏛 SOVEREIGN ASSET VERIFICATION: ${user}\nProduct: ${p.name}\nTX: ${hash}` })
        });
        
        let buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        buys.push({ id: p.id });
        localStorage.setItem(`buys_${user}`, JSON.stringify(buys));
        alert('Verification request processed by Sovereignty.');
        closeM();
        render();
    };

    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('acus_user', document.getElementById('inpUser').value);
        sync();
        closeM();
    };

    document.getElementById('goLogout').onclick = () => {
        localStorage.removeItem('acus_user');
        sync();
        closeM();
    };

    function openM(id) { document.getElementById(id).classList.add('active'); }
    function closeM() { document.querySelectorAll('.modal-overlay, .vault-nav').forEach(el => el.classList.remove('active')); }

    document.getElementById('navOpen').onclick = () => openM('sideNav');
    document.querySelectorAll('#navClose, .vault-blur, #authClose, #payClose').forEach(b => b.onclick = closeM);

    document.querySelectorAll('.l-node').forEach(b => {
        b.onclick = () => {
            lang = b.dataset.lang;
            localStorage.setItem('acus_lang', lang);
            document.querySelectorAll('.l-node').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            sync();
        };
    });

    document.getElementById('copyAddr').onclick = () => {
        navigator.clipboard.writeText(CONFIG.wallet);
        alert('Vault address securely copied.');
    };

    sync();
});
