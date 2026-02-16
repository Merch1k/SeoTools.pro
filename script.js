document.addEventListener('DOMContentLoaded', () => {

    const TG_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471'
    };

    const dictionary = {
        ru: {
            heroT: "Spatial SEO", heroS: "Инструменты нового измерения в иммерсивном исполнении.",
            market: "ЛИЦЕНЗИИ SPATIAL", buy: "Активировать", verify: "Подтвердить",
            authT: "Авторизация", authB: "Войти", status: "В сети"
        },
        en: {
            heroT: "Spatial SEO", heroS: "Next-gen tools within a spatial ecosystem.",
            market: "SPATIAL LICENSES", buy: "Get Access", verify: "Verify",
            authT: "Authentication", authB: "Enter", status: "Online"
        }
    };

    let curLang = localStorage.getItem('v_lang') || 'ru';
    let user = localStorage.getItem('v_user');
    let db = [];

    async function init() {
        try {
            const r = await fetch('db.json');
            db = await r.json();
            updateUI();
            renderGrid();
            setupIsland();
            loadAvatar();
        } catch (e) { console.error("Spatial Error", e); }
    }

    function setupIsland() {
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
            card.style.transitionDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <div style="font-size:0.6rem; letter-spacing:2px; color:var(--neon-green); margin-bottom:15px;">SPATIAL UNIT ${i+1}</div>
                <h3>${p.title}</h3>
                <div style="font-size:1.6rem; font-weight:800; color:#fff; margin:15px 0;">${p.price}</div>
                <button class="prime-action" onclick="openPay('${p.title}', '${p.price}')">
                    ${dictionary[curLang].buy}
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

    // ACTIONS
    window.openPay = (n, p) => {
        if (!user) return openM('auth');
        document.getElementById('payName').innerText = n;
        document.getElementById('payAmount').innerText = p;
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
        const msg = `💠 **VISION ORDER**\nClient: ${user}\nProduct: ${document.getElementById('payName').innerText}\nTX: ${document.getElementById('txHash').value}`;
        await fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text: msg, parse_mode: 'Markdown' })
        });
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
