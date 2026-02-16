document.addEventListener('DOMContentLoaded', () => {
    
    const TG_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471'
    };

    const translations = {
        ru: {
            heroTitle: "Spatial Reality", heroSub: "SEO инструменты будущего.",
            market: "МАРКЕТПЛЕЙС", buy: "Купить", confirm: "Подтвердить",
            authTitle: "Вход", authBtn: "Войти", status: "В сети"
        },
        en: {
            heroTitle: "Spatial Reality", heroSub: "Next-gen SEO ecosystem.",
            market: "MARKETPLACE", buy: "Get Access", confirm: "Verify",
            authTitle: "Sign In", authBtn: "Enter", status: "Online"
        }
    };

    let curLang = localStorage.getItem('v_lang') || 'ru';
    let currentUser = localStorage.getItem('v_user');
    let products = [];

    // --- INIT ---
    async function init() {
        try {
            const res = await fetch('db.json');
            products = await res.json();
            updateUI();
            renderGrid();
            setupIsland();
            loadAvatar();
        } catch (e) { console.error(e); }
    }

    // --- DYNAMIC ISLAND LOGIC ---
    function setupIsland() {
        const island = document.getElementById('mainIsland');
        
        // Для мобилок: переключение по клику
        island.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                island.classList.toggle('expanded');
            }
        });

        // Авторизация при клике на аватар, если гость
        document.getElementById('islandAvatarTrigger').onclick = (e) => {
            if (!currentUser) {
                e.stopPropagation();
                document.getElementById('authModal').classList.remove('hidden');
            }
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
        const t = translations[curLang];
        document.getElementById('langBtn').innerText = curLang.toUpperCase();
        document.getElementById('txt-hero-title').innerText = t.heroTitle;
        document.getElementById('txt-hero-sub').innerText = t.heroSub;
        document.getElementById('txt-market-tag').innerText = t.market;
        document.getElementById('txt-confirm').innerText = t.confirm;
        document.getElementById('txt-auth-title').innerText = t.authTitle;
        document.getElementById('txt-auth-btn').innerText = t.authBtn;
        document.getElementById('txt-status').innerText = t.status;

        if (currentUser) {
            document.getElementById('displayUserName').innerText = currentUser;
            document.getElementById('logoutBtn').classList.remove('hidden');
        }
    }

    // --- GRID ---
    function renderGrid() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        products.forEach((p, i) => {
            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.transitionDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <h3>${p.title}</h3>
                <div style="color:var(--accent); font-weight:800; margin:10px 0;">${p.price}</div>
                <p style="font-size:0.8rem; opacity:0.6;">${p.description}</p>
                <button class="pay-btn" onclick="openPay('${p.title}', '${p.price}')">
                    ${translations[curLang].buy}
                </button>
            `;
            grid.appendChild(card);
        });
        
        // Анимация скролла
        const obs = new IntersectionObserver(entries => {
            entries.forEach(en => { if(en.isIntersecting) en.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    // --- AVATAR UPLOAD ---
    document.getElementById('avatarInput').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const b64 = ev.target.result;
                localStorage.setItem(`v_avatar_${currentUser}`, b64);
                loadAvatar();
            };
            reader.readAsDataURL(file);
        }
    };

    function loadAvatar() {
        if (!currentUser) return;
        const saved = localStorage.getItem(`v_avatar_${currentUser}`);
        if (saved) {
            document.getElementById('userAvatar').src = saved;
            document.getElementById('modalAvatar').src = saved;
        }
    }

    // --- AUTH & PAY ---
    window.openPay = (name, price) => {
        if (!currentUser) return document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('payName').innerText = name;
        document.getElementById('payAmount').innerText = price;
        document.getElementById('paymentModal').classList.remove('hidden');
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
        const msg = `💎 ОПЛАТА\nUser: ${currentUser}\nItem: ${document.getElementById('payName').innerText}\nTX: ${document.getElementById('txHash').value}`;
        await fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text: msg })
        });
        alert("Заявка отправлена!");
        location.reload();
    };

    // CLOSE
    document.querySelectorAll('.close-modal, .modal-backdrop').forEach(el => {
        el.onclick = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    });

    init();
});
