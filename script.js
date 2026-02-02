document.addEventListener('DOMContentLoaded', () => {

    const API = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chat: '5683927471',
        wallet: '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB'
    };

    const STRINGS = {
        ru: { headerTitle: "Цифровой Суверенитет", loginBtn: "Вход", registerBtn: "Присоединиться", logoutBtn: "Выход", myPurchases: "Арсенал", authBtn: "Авторизация", checkBtn: "Подтвердить платеж", buy: "Активировать" },
        en: { headerTitle: "Digital Sovereignty", loginBtn: "Entry", registerBtn: "Join", logoutBtn: "Exit", myPurchases: "Arsenal", authBtn: "Authenticate", checkBtn: "Confirm Payment", buy: "Activate" }
    };

    let lang = localStorage.getItem('acus_lang') || 'ru';
    let user = localStorage.getItem('acus_user');

    const products = [
        { id: 1, name: "Parser Pro", desc: "Enterprise-grade data harvesting architecture.", price: 1500, img: "https://placehold.co/600x400/000/fff?text=PARSER" },
        { id: 2, name: "Neural Rank", desc: "AI-powered global SEO dominance tracker.", price: 2500, img: "https://placehold.co/600x400/000/fff?text=NEURAL" },
        { id: 3, name: "Audit Core", desc: "High-precision infrastructure vulnerability scan.", price: 3500, img: "https://placehold.co/600x400/000/fff?text=AUDIT" },
        { id: 4, name: "Legacy Suite", desc: "Infinite access to the complete ACUS ecosystem.", price: 9990, img: "https://placehold.co/600x400/000/fff?text=LEGACY" }
    ];

    function render() {
        const grid = document.getElementById('sovereignGrid');
        const buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        grid.innerHTML = '';
        
        products.forEach(p => {
            const owned = buys.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card-unit';
            card.innerHTML = `
                <div class="card-visual">
                    <div class="visual-inner"><img src="${p.img}" alt=""></div>
                </div>
                <div class="card-info">
                    <h3>${p.name}</h3>
                    <p>${p.desc}</p>
                    <button class="cta-executive ${owned?'owned':''}" ${owned?'':`onclick="openPay(${p.id})"`}>
                        ${owned ? 'AUTHORIZED' : `${STRINGS[lang].buy} — ${p.price} ADI`}
                    </button>
                </div>`;
            grid.appendChild(card);
        });
        if(window.innerWidth > 1024) initParallax();
    }

    function initParallax() {
        document.querySelectorAll('.card-unit').forEach(c => {
            c.onmousemove = (e) => {
                const r = c.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                c.style.transform = `perspective(2000px) rotateX(${-y/40}deg) rotateY(${x/40}deg)`;
            };
            c.onmouseleave = () => c.style.transform = '';
        });
    }

    function update() {
        user = localStorage.getItem('acus_user');
        document.getElementById('guestBox').classList.toggle('hidden', !!user);
        document.getElementById('userBox').classList.toggle('hidden', !user);
        if(user) document.getElementById('userName').innerText = user;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.innerText = STRINGS[lang][el.dataset.langKey];
        });
        render();
    }

    window.openPay = (id) => {
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
        
        await fetch(`https://api.telegram.org/bot${API.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: API.chat, text: `🏛 SOVEREIGN PAY: ${user}\nProduct: ${p.name}\nTX: ${hash}` })
        });
        
        let buys = JSON.parse(localStorage.getItem(`buys_${user}`)) || [];
        buys.push({ id: p.id });
        localStorage.setItem(`buys_${user}`, JSON.stringify(buys));
        alert('Verification request processed.');
        closeM();
        render();
    };

    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('acus_user', document.getElementById('inpUser').value);
        update();
        closeM();
    };

    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('acus_user');
        update();
        closeM();
    };

    function openM(id) { document.getElementById(id).classList.add('active'); }
    function closeM() { document.querySelectorAll('.modal-frame, .nav-panel-wrap').forEach(el => el.classList.remove('active')); }

    document.getElementById('openNav').onclick = () => openM('sideNav');
    document.querySelectorAll('#closeNav, .nav-overlay, #closeAuth, #closePay, .modal-bg').forEach(b => b.onclick = closeM);

    document.querySelectorAll('.l-node').forEach(b => {
        b.onclick = () => {
            lang = b.dataset.lang;
            localStorage.setItem('acus_lang', lang);
            document.querySelectorAll('.l-node').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            update();
        };
    });

    document.getElementById('copyAddr').onclick = () => {
        navigator.clipboard.writeText(API.wallet);
        alert('Address copied to clipboard.');
    };

    update();
});
