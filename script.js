document.addEventListener('DOMContentLoaded', () => {

    const TG_API = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chat: '5683927471'
    };
    const CRYPTO_ADDR = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB';

    const LANGUAGES = {
        ru: { headerTitle: "Цифровой Монолит", loginBtn: "Вход", registerBtn: "Регистрация", logoutBtn: "Выход", myPurchases: "Кабинет", authBtn: "Авторизоваться", checkBtn: "Подтвердить TX", buy: "Активировать" },
        en: { headerTitle: "Digital Monolith", loginBtn: "Entry", registerBtn: "Join", logoutBtn: "Exit", myPurchases: "Dashboard", authBtn: "Authorize", checkBtn: "Verify TX", buy: "Activate" }
    };

    let curLang = localStorage.getItem('acus_lang') || 'ru';
    let curUser = localStorage.getItem('acus_user');

    const products = [
        { id: 1, name: "Parser Pro", desc: "Absolute performance in data extraction.", price: 1500, img: "https://placehold.co/600x400/000/fff?text=PARSER" },
        { id: 2, name: "Neural Rank", desc: "AI-driven tracking for global search supremacy.", price: 2500, img: "https://placehold.co/600x400/000/fff?text=NEURAL" },
        { id: 3, name: "Audit Core", desc: "Deep technical infrastructure diagnostics.", price: 3500, img: "https://placehold.co/600x400/000/fff?text=AUDIT" },
        { id: 4, name: "VIP Legacy", desc: "Infinite access to the complete ACUS ecosystem.", price: 9990, img: "https://placehold.co/600x400/000/fff?text=VIP" }
    ];

    function render() {
        const grid = document.getElementById('monolithGrid');
        const purchases = JSON.parse(localStorage.getItem(`buys_${curUser}`)) || [];
        grid.innerHTML = '';
        
        products.forEach(p => {
            const owned = purchases.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-body">
                    <div class="card-media"><img src="${p.img}" alt=""></div>
                    <h3 class="card-title">${p.name}</h3>
                    <p class="card-desc">${p.desc}</p>
                    <button class="btn-luxury ${owned?'owned':''}" ${owned?'':`onclick="initPay(${p.id})"`}>
                        ${owned ? 'LICENSED' : `${LANGUAGES[curLang].buy} / ${p.price} ADI`}
                    </button>
                </div>`;
            grid.appendChild(card);
        });
        if(window.innerWidth > 1024) apply3D();
    }

    function apply3D() {
        document.querySelectorAll('.card').forEach(c => {
            c.onmousemove = (e) => {
                const r = c.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                c.style.transform = `perspective(1000px) rotateX(${-y/30}deg) rotateY(${x/30}deg)`;
            };
            c.onmouseleave = () => c.style.transform = '';
        });
    }

    function sync() {
        curUser = localStorage.getItem('acus_user');
        document.getElementById('navGuest').classList.toggle('hidden', !!curUser);
        document.getElementById('navUser').classList.toggle('hidden', !curUser);
        if(curUser) document.getElementById('userName').innerText = curUser;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.innerText = LANGUAGES[curLang][el.dataset.langKey];
        });
        render();
    }

    window.initPay = (id) => {
        if(!curUser) return openM('authModal');
        const p = products.find(x => x.id === id);
        document.getElementById('pTitle').innerText = p.name;
        document.getElementById('pAmount').innerText = p.price + ' ADI';
        window.targetId = id;
        openM('payModal');
    };

    document.getElementById('payForm').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = products.find(x => x.id === window.targetId);
        
        await fetch(`https://api.telegram.org/bot${TG_API.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_API.chat, text: `🏛 AUTHENTICATED PAY: ${curUser}\nSystem: ${p.name}\nTX: ${hash}` })
        });
        
        let buys = JSON.parse(localStorage.getItem(`buys_${curUser}`)) || [];
        buys.push({ id: p.id });
        localStorage.setItem(`buys_${curUser}`, JSON.stringify(buys));
        alert('Verification in progress...');
        closeM();
        render();
    };

    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('acus_user', document.getElementById('inpLogin').value);
        sync();
        closeM();
    };

    document.getElementById('logoutAction').onclick = () => {
        localStorage.removeItem('acus_user');
        sync();
        closeM();
    };

    function openM(id) { document.getElementById(id).classList.add('active'); }
    function closeM() { document.querySelectorAll('.modal-overlay, .side-nav').forEach(el => el.classList.remove('active')); }

    document.getElementById('openNav').onclick = () => openM('sideNav');
    document.querySelectorAll('#closeNav, .nav-blur, #closeAuth, #closePay, .modal-backdrop').forEach(b => b.onclick = closeM);

    document.querySelectorAll('.lang-node').forEach(b => {
        b.onclick = () => {
            curLang = b.dataset.lang;
            localStorage.setItem('acus_lang', curLang);
            document.querySelectorAll('.lang-node').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            sync();
        };
    });

    document.getElementById('walletCopy').onclick = () => {
        navigator.clipboard.writeText(CRYPTO_ADDR);
        alert('Address Securely Copied');
    };

    sync();
});
