document.addEventListener('DOMContentLoaded', () => {

    const TG_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471'
    };

    const lexicon = {
        ru: {
            heroT: "Pure Excellence", heroS: "Цифровое доминирование высшего уровня.",
            market: "КОЛЛЕКЦИЯ ТАРИФОВ", buy: "Оформить доступ", verify: "Валидация",
            authT: "Авторизация", authB: "Войти в студию", status: "В сети"
        },
        en: {
            heroT: "Pure Excellence", heroS: "Elite digital dominance ecosystem.",
            market: "CURATED COLLECTION", buy: "Get Access", verify: "Verify Purchase",
            authT: "Client Login", authB: "Enter Studio", status: "Online"
        }
    };

    let curLang = localStorage.getItem('p_lang') || 'ru';
    let user = localStorage.getItem('p_user');
    let db = [];

    async function start() {
        try {
            const r = await fetch('db.json');
            db = await r.json();
            updateLanguage();
            renderGrid();
            handleIsland();
            loadProfileData();
        } catch (e) { console.error("Luxury Error", e); }
    }

    function handleIsland() {
        const island = document.getElementById('mainIsland');
        island.addEventListener('click', () => {
            if (window.innerWidth < 768) island.classList.toggle('expanded');
        });
        document.getElementById('avatarTrigger').onclick = (e) => {
            if (!user) { e.stopPropagation(); openM('auth'); }
        };
    }

    document.getElementById('langBtn').onclick = (e) => {
        e.stopPropagation();
        curLang = curLang === 'ru' ? 'en' : 'ru';
        localStorage.setItem('p_lang', curLang);
        updateLanguage();
        renderGrid();
    };

    function updateLanguage() {
        const t = lexicon[curLang];
        document.getElementById('langBtn').innerText = curLang.toUpperCase();
        document.getElementById('txt-hero-title').innerHTML = `Pure <span>Excellence</span>`;
        document.getElementById('txt-hero-sub').innerText = t.heroS;
        document.getElementById('txt-market-tag').innerText = t.market;
        document.getElementById('txt-confirm').innerText = t.verify;
        document.getElementById('txt-auth-title').innerText = t.authT;
        document.getElementById('txt-auth-btn').innerText = t.authB;
        document.getElementById('txt-status').innerText = t.status;

        if (user) {
            document.getElementById('displayUserName').innerText = user;
            document.getElementById('logoutBtn').classList.remove('hidden');
        }
    }

    function renderGrid() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        db.forEach((p, i) => {
            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.transitionDelay = `${i * 0.15}s`;
            card.innerHTML = `
                <div style="font-size:0.7rem; letter-spacing:2px; color:var(--gold); margin-bottom:10px;">TIER ${i+1}</div>
                <h3>${p.title}</h3>
                <div style="font-size:1.8rem; font-weight:800; color:#fff; margin:20px 0;">${p.price}</div>
                <button class="confirm-btn" onclick="triggerPay('${p.title}', '${p.price}')">
                    ${lexicon[curLang].buy}
                </button>
            `;
            grid.appendChild(card);
        });
        
        const obs = new IntersectionObserver(ents => {
            ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    // PROFILE
    document.getElementById('avatarInput').onchange = (e) => {
        const f = e.target.files[0];
        if (f) {
            const r = new FileReader();
            r.onload = (ev) => {
                localStorage.setItem(`p_img_${user}`, ev.target.result);
                loadProfileData();
            };
            r.readAsDataURL(f);
        }
    };

    function loadProfileData() {
        if (!user) return;
        const img = localStorage.getItem(`p_img_${user}`);
        if (img) {
            document.getElementById('userAvatar').src = img;
            document.getElementById('modalAvatar').src = img;
        }
    }

    // ACTIONS
    window.triggerPay = (n, p) => {
        if (!user) return openM('auth');
        document.getElementById('payName').innerText = n;
        document.getElementById('payAmount').innerText = p;
        openM('payment');
    };

    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('p_user', document.getElementById('loginUser').value);
        location.reload();
    };

    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('p_user');
        location.reload();
    };

    document.getElementById('payForm').onsubmit = async (e) => {
        e.preventDefault();
        const msg = `👑 **LUXURY ORDER**\nClient: ${user}\nProduct: ${document.getElementById('payName').innerText}\nHash: ${document.getElementById('txHash').value}`;
        await fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text: msg, parse_mode: 'Markdown' })
        });
        alert("Transaction Logged. Verification in process.");
        location.reload();
    };

    function openM(id) { document.getElementById(`${id}Modal`).classList.remove('hidden'); }
    document.querySelectorAll('.close-modal, .modal-blur').forEach(el => {
        el.onclick = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    });

    document.getElementById('copyWallet').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('walletText').innerText);
        alert("Gold Network Address Copied.");
    };

    start();
});
