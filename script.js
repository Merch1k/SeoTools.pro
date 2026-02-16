document.addEventListener('DOMContentLoaded', () => {

    const TG_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471'
    };

    const dictionary = {
        ru: {
            heroT: "Spatial SEO", heroS: "Инструменты нового измерения в иммерсивном исполнении.",
            market: "ЛИЦЕНЗИИ SPATIAL", buy: "Активировать", verify: "Подтвердить",
            authT: "Авторизация", authB: "Войти", status: "В сети", libT: "Мои лицензии",
            emptyLib: "У вас пока нет покупок."
        },
        en: {
            heroT: "Spatial SEO", heroS: "Next-gen tools within a spatial ecosystem.",
            market: "SPATIAL LICENSES", buy: "Get Access", verify: "Verify",
            authT: "Authentication", authB: "Enter", status: "Online", libT: "My Licenses",
            emptyLib: "No purchases found."
        }
    };

    let curLang = localStorage.getItem('v_lang') || 'ru';
    let user = localStorage.getItem('v_user');
    let products = [];
    let myPurchases = JSON.parse(localStorage.getItem(`v_buy_${user}`)) || [];

    // --- INIT ---
    async function init() {
        try {
            const r = await fetch('db.json');
            products = await r.json();
            updateUI();
            renderGrid();
            setupIsland();
            loadAvatar();
        } catch (e) { console.error("System Error", e); }
    }

    // --- DYNAMIC ISLAND ---
    function setupIsland() {
        const island = document.getElementById('mainIsland');
        island.addEventListener('click', () => {
            if (window.innerWidth < 768) island.classList.toggle('expanded');
        });
        document.getElementById('avatarTrigger').onclick = (e) => {
            if (!user) { e.stopPropagation(); openM('auth'); }
        };
    }

    // --- LANGUAGES ---
    document.getElementById('langBtn').onclick = (e) => {
        e.stopPropagation();
        curLang = curLang === 'ru' ? 'en' : 'ru';
        localStorage.setItem('v_lang', curLang);
        updateUI();
        renderGrid();
    };

    function updateUI() {
        const t = dictionary[curLang];
        document.getElementById('langBtn').innerText = curLang.toUpperCase();
        document.getElementById('txt-hero-title').innerHTML = `Spatial <span>SEO</span>`;
        document.getElementById('txt-hero-sub').innerText = t.heroS;
        document.getElementById('txt-market-tag').innerText = t.market;
        document.getElementById('txt-confirm').innerText = t.verify;
        document.getElementById('txt-auth-title').innerText = t.authT;
        document.getElementById('txt-auth-btn').innerText = t.authB;
        document.getElementById('txt-status').innerText = t.status;
        document.getElementById('txt-lib-title').innerText = t.libT;

        if (user) {
            document.getElementById('displayUserName').innerText = user;
            document.getElementById('logoutBtn').classList.remove('hidden');
        }
    }

    // --- GRID ---
    function renderGrid() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        products.forEach((p, i) => {
            const isOwned = myPurchases.some(item => item.id === p.id);
            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.transitionDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <div style="font-size:0.6rem; letter-spacing:2px; color:var(--neon-green); margin-bottom:15px;">SPATIAL UNIT ${i+1}</div>
                <h3>${p.title}</h3>
                <div style="font-size:1.6rem; font-weight:800; color:#fff; margin:15px 0;">${p.price}</div>
                <button class="prime-action ${isOwned?'owned':''}" onclick="${isOwned?'':`openPay('${p.title}', '${p.price}', ${p.id})`}">
                    ${isOwned ? 'OWNED' : dictionary[curLang].buy}
                </button>
            `;
            grid.appendChild(card);
        });
        
        const obs = new IntersectionObserver(ents => {
            ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    // --- LIBRARY ---
    document.getElementById('libBtn').onclick = (e) => {
        e.stopPropagation();
        if(!user) return openM('auth');
        renderLibrary();
        openM('lib');
    };

    function renderLibrary() {
        const list = document.getElementById('libList');
        list.innerHTML = '';
        if(myPurchases.length === 0) {
            list.innerHTML = `<p>${dictionary[curLang].emptyLib}</p>`;
            return;
        }
        myPurchases.forEach(p => {
            const item = document.createElement('div');
            item.className = 'lib-item';
            item.innerHTML = `<strong>${p.title}</strong><br><small>License Active</small>`;
            list.appendChild(item);
        });
    }

    // --- AVATAR ---
    document.getElementById('avatarInput').onchange = (e) => {
        const f = e.target.files[0];
        if (f) {
            const r = new FileReader();
            r.onload = (ev) => {
                localStorage.setItem(`v_img_${user}`, ev.target.result);
                loadAvatar();
            };
            r.readAsDataURL(f);
        }
    };

    function loadAvatar() {
        if (!user) return;
        const img = localStorage.getItem(`v_img_${user}`);
        if (img) {
            document.getElementById('userAvatar').src = img;
            document.getElementById('modalAvatar').src = img;
        }
    }

    // --- ACTIONS ---
    window.openPay = (name, price, id) => {
        if (!user) return openM('auth');
        document.getElementById('payName').innerText = name;
        document.getElementById('payAmount').innerText = price;
        window.currentPayId = id;
        openM('payment');
    };

    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('v_user', document.getElementById('loginUser').value);
        location.reload();
    };

    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('v_user');
        location.reload();
    };

    document.getElementById('payForm').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const product = products.find(p => p.id === window.currentPayId);
        
        const msg = `💠 **VISION ORDER**\nClient: ${user}\nProduct: ${product.title}\nTX: ${hash}`;
        
        await fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text: msg, parse_mode: 'Markdown' })
        });

        myPurchases.push({ id: product.id, title: product.title });
        localStorage.setItem(`v_buy_${user}`, JSON.stringify(myPurchases));
        
        alert("Verification broadcast sent.");
        location.reload();
    };

    function openM(id) { document.getElementById(`${id}Modal`).classList.remove('hidden'); }
    document.querySelectorAll('.close-btn, .spatial-blur').forEach(el => {
        el.onclick = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    });

    document.getElementById('copyWallet').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('walletText').innerText);
        alert("Spatial Address Copied.");
    };

    init();
});
