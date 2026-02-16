/**
 * 🍏 ACUS SPATIAL ENGINE v5.0 - SUPABASE REAL-TIME
 */

const ACUS = {
    config: {
        tg_token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        tg_chat: '5683927471',
        sb_url: 'https://merch1k.github.io/SeoTools.pro/', // Например: https://xyz.supabase.co
        sb_key: 'sb_secret_nK5p8CjSkFL17apzHScAQA_uapRyw6e',    // API Key (anon public)
        wallet: '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB'
    },
    
    dict: {
        ru: { buy: "Купить", pending: "Проверка", owned: "Активно", authT: "Авторизация", authB: "Войти" },
        en: { buy: "Purchase", pending: "Verifying", owned: "Owned", authT: "Authentication", authB: "Enter" }
    },

    state: {
        lang: localStorage.getItem('v_lang') || 'ru',
        user: localStorage.getItem('v_user') || null,
        db: [],
        userPurchases: [] // Данные из Supabase
    },

    init: async function() {
        try {
            // 1. Грузим товары из локального db.json
            const res = await fetch('db.json');
            this.state.db = await res.json();
            
            // 2. Если юзер залогинен, проверяем его покупки в реальной БД
            if(this.state.user) {
                await this.syncPurchases();
            }
        } catch (e) { console.error("Database error", e); }

        this.render();
        this.events();
        this.loadProfile();
        this.animate();
    },

    // Синхронизация с базой данных
    syncPurchases: async function() {
        const url = `${this.config.sb_url}/rest/v1/purchases?username=eq.${this.state.user}`;
        const res = await fetch(url, {
            headers: { 'apikey': this.config.sb_key, 'Authorization': `Bearer ${this.config.sb_key}` }
        });
        this.state.userPurchases = await res.json();
    },

    render: function() {
        const t = this.dict[this.state.lang];
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        this.state.db.forEach((p, i) => {
            // Ищем статус товара в базе данных
            const record = this.state.userPurchases.find(x => x.product_id === p.id);
            
            let bText = t.buy;
            let bClass = "";
            let bAction = `ACUS.openPay(${p.id})`;

            if (record) {
                if (record.status === 'approved') {
                    bText = t.owned; bClass = "owned"; bAction = "";
                } else if (record.status === 'pending') {
                    bText = t.pending; bClass = "pending"; bAction = "alert('Ваш хеш на проверке у администратора...')";
                }
            }

            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.transitionDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <div style="font-size:0.6rem; letter-spacing:2px; color:var(--emerald); margin-bottom:15px; text-transform:uppercase;">Unit ${p.id}</div>
                <h3>${p.title}</h3>
                <div style="font-size:1.6rem; font-weight:800; color:#fff; margin:15px 0;">${p.price}</div>
                <button class="glass-action-btn ${bClass}" onclick="${bAction}">${bText}</button>
            `;
            grid.appendChild(card);
        });
        
        // Рендер аватара и имени
        if (this.state.user) {
            document.getElementById('displayUserName').innerText = this.state.user;
            document.getElementById('logoutBtn').classList.remove('hidden');
        }
    },

    submitPayment: async function(e) {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = this.state.db.find(x => x.id === this.state.activeId);

        // 1. Записываем в Supabase
        const url = `${this.config.sb_url}/rest/v1/purchases`;
        await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': this.config.sb_key,
                'Authorization': `Bearer ${this.config.sb_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.user,
                product_id: p.id,
                hash: hash,
                status: 'pending'
            })
        });

        // 2. Уведомляем админа в Телеграм
        const msg = `🔔 **НОВАЯ ОПЛАТА**\n\nКлиент: ${this.state.user}\nТовар: ${p.title}\nHash: \`${hash}\`\n\nВведите /check в боте для управления.`;
        await fetch(`https://api.telegram.org/bot${this.config.tg_token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: this.config.tg_chat, text: msg, parse_mode: 'Markdown' })
        });

        alert("Транзакция отправлена! Ожидайте подтверждения.");
        location.reload();
    },

    // Остальные функции (modal, animate, handleAvatar, loadProfile) остаются из прошлого ответа
    modal: function(id) { document.getElementById(`${id}Modal`).classList.remove('hidden'); },
    closeModals: function() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); },
    openPay: function(id) {
        if(!this.state.user) return this.modal('auth');
        const p = this.state.db.find(x => x.id === id);
        document.getElementById('payName').innerText = p.title;
        document.getElementById('payAmount').innerText = p.price;
        this.state.activeId = id;
        this.modal('payment');
    },
    events: function() {
        const island = document.getElementById('mainIsland');
        island.onclick = () => { if(window.innerWidth < 768) island.classList.toggle('active'); };
        document.getElementById('avatarTrigger').onclick = (e) => { if(!this.state.user) { e.stopPropagation(); this.modal('auth'); } };
        document.getElementById('loginForm').onsubmit = (e) => {
            e.preventDefault();
            localStorage.setItem('v_user', document.getElementById('loginUser').value);
            location.reload();
        };
        document.getElementById('payForm').onsubmit = (e) => this.submitPayment(e);
        document.querySelectorAll('.close-modal-btn, .modal-backdrop').forEach(el => el.onclick = () => this.closeModals());
        document.getElementById('logoutBtn').onclick = () => { localStorage.removeItem('v_user'); location.reload(); };
        document.getElementById('copyWallet').onclick = () => { navigator.clipboard.writeText(this.config.wallet); alert("Copied"); };
    },
    animate: function() {
        const obs = new IntersectionObserver(ents => { ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); }); }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    },
    loadProfile: function() {
        if(!this.state.user) return;
        const img = localStorage.getItem(`v_img_${this.state.user}`);
        if(img) { document.getElementById('userAvatar').src = img; document.getElementById('modalAvatar').src = img; }
    }
};

ACUS.init();
