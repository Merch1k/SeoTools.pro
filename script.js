document.addEventListener('DOMContentLoaded', () => {

    const CONFIG = {
        tgToken: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        tgChat: '5683927471',
        wallet: 'UQBKg4_q8x5v2J1z...YOUR_WALLET'
    };

    const TRANSLATIONS = {
        ru: { headerTitle: "Цифровая Элита", loginBtn: "Вход", registerBtn: "Регистрация", logoutBtn: "Выход", myPurchases: "Арсенал", authTitle: "Доступ к ACUS", authBtn: "Авторизоваться", checkBtn: "Подтвердить TX", buy: "Активировать" },
        en: { headerTitle: "Digital Elite", loginBtn: "Entry", registerBtn: "Join", logoutBtn: "Exit", myPurchases: "Arsenal", authTitle: "ACUS Access", authBtn: "Authenticate", checkBtn: "Confirm TX", buy: "Activate" }
    };

    let lang = localStorage.getItem('acus_lang') || 'ru';
    let user = localStorage.getItem('acus_user');

    const products = [
        { id: 1, name: "Parser Pro", desc: "Absolute data harvesting performance.", price: 1500, img: "https://placehold.co/600x400/000/00ff8f?text=PARSER" },
        { id: 2, name: "Neural Rank", desc: "AI-driven global ranking dominance.", price: 2500, img: "https://placehold.co/600x400/000/4f46e5?text=NEURAL" },
        { id: 3, name: "Audit Core", desc: "Exposing infrastructure vulnerabilities.", price: 3500, img: "https://placehold.co/600x400/000/00ff8f?text=AUDIT" },
        { id: 4, name: "VIP Legacy", desc: "The complete ACUS arsenal forever.", price: 9990, img: "https://placehold.co/600x400/000/4f46e5?text=LEGACY" }
    ];

    function render() {
        const grid = document.getElementById('titanGrid');
        const buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        grid.innerHTML = '';
        
        products.forEach(p => {
            const owned = buys.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card-outer';
            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="card-media"><img src="${p.img}" alt=""></div>
                        <h3 class="card-title">${p.name}</h3>
                        <p class="card-desc">${p.desc}</p>
                        <button class="btn-premium ${owned?'owned':''}" ${owned?'':`onclick="startPay(${p.id})"`}>
                            ${owned ? 'ACTIVE' : `${TRANSLATIONS[lang].buy} ${p.price} ADI`}
                        </button>
                    </div>
                </div>`;
            grid.appendChild(card);
        });
        if(window.innerWidth > 1024) initTilt();
    }

    function initTilt() {
        document.querySelectorAll('.card').forEach(c => {
            c.onmousemove = (e) => {
                const r = c.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                c.style.transform = `perspective(2000px) rotateX(${-y/30}deg) rotateY(${x/30}deg)`;
            };
            c.onmouseleave = () => c.style.transform = '';
        });
    }

    function sync() {
        user = localStorage.getItem('acus_user');
        document.getElementById('authGuest').classList.toggle('hidden', !!user);
        document.getElementById('authUser').classList.toggle('hidden', !user);
        if(user) document.getElementById('userLabel').innerText = user;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.innerText = TRANSLATIONS[lang][el.dataset.langKey];
        });
        render();
    }

    window.startPay = (id) => {
        if(!user) return openM('authModal');
        const p = products.find(x => x.id === id);
        document.getElementById('pName').innerText = p.name;
        document.getElementById('pPrice').innerText = p.price + ' ADI';
        window.activeId = id;
        openM('payModal');
    };

    document.getElementById('payForm').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = products.find(x => x.id === window.activeId);
        
        await fetch(`https://api.telegram.org/bot${CONFIG.tgToken}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: CONFIG.tgChat, text: `💎 GLOBAL PAY: ${user}\nProduct: ${p.name}\nTX: ${hash}` })
        });
        
        let buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        buys.push({ id: p.id });
        localStorage.setItem(`buys_${user}`, JSON.stringify(buys));
        alert('Verification request sent.');
        closeM();
        render();
    };

    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('acus_user', document.getElementById('inpUser').value);
        sync();
        closeM();
    };

    document.getElementById('doLogout').onclick = () => {
        localStorage.removeItem('acus_user');
        sync();
        closeM();
    };

    function openM(id) { document.getElementById(id).classList.add('active'); }
    function closeM() { document.querySelectorAll('.modal-overlay, .side-nav').forEach(el => el.classList.remove('active')); }

    document.getElementById('navOpen').onclick = () => openM('sideNav');
    document.querySelectorAll('#navClose, .side-blur, #authClose, #payClose, .modal-backdrop').forEach(b => b.onclick = closeM);

    document.querySelectorAll('.lang-node').forEach(b => {
        b.onclick = () => {
            lang = b.dataset.lang;
            localStorage.setItem('acus_lang', lang);
            document.querySelectorAll('.lang-node').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            sync();
        };
    });

    document.getElementById('copyBtn').onclick = () => {
        navigator.clipboard.writeText(CONFIG.wallet);
        alert('Address Securely Copied');
    };

    sync();
});
