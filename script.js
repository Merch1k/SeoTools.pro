/**
 * 🍏 ACUS SPATIAL ENGINE v3.0
 * Deeply optimized core with full state management
 */

const APP = {
    config: {
        tg_token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        tg_chat: '5683927471',
        wallet: '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB'
    },
    
    dict: {
        ru: {
            heroT: "Spatial SEO", heroS: "Инструменты нового измерения в иммерсивном исполнении.",
            market: "ЛИЦЕНЗИИ SPATIAL", buy: "Активировать", verify: "Подтвердить",
            authT: "Авторизация", authB: "Войти", status: "В сети", libT: "Мои покупки",
            emptyLib: "Библиотека пуста", alertPay: "Заявка отправлена администратору!"
        },
        en: {
            heroT: "Spatial SEO", heroS: "High-end tools within a spatial ecosystem.",
            market: "SPATIAL LICENSES", buy: "Get Access", verify: "Verify",
            authT: "Authentication", authB: "Enter", status: "Online", libT: "Purchases",
            emptyLib: "No items found", alertPay: "Sent to verification!"
        }
    },

    state: {
        lang: localStorage.getItem('acus_lang') || 'ru',
        user: localStorage.getItem('acus_user') || null,
        products: [],
        purchases: []
    },

    init: async function() {
        // Load data
        try {
            const res = await fetch('db.json');
            this.state.products = await res.json();
            if(this.state.user) {
                this.state.purchases = JSON.parse(localStorage.getItem(`acus_buy_${this.state.user}`)) || [];
            }
        } catch (e) { console.error("Data Fetch Error", e); }

        this.render();
        this.setupEvents();
        this.loadProfile();
        this.initAnimations();
    },

    render: function() {
        const t = this.dict[this.state.lang];
        
        // Update Static Text
        document.getElementById('langBtn').innerText = this.state.lang.toUpperCase();
        document.getElementById('txt-hero-title').innerHTML = `Spatial <span>SEO</span>`;
        document.getElementById('txt-hero-sub').innerText = t.heroS;
        document.getElementById('txt-market-tag').innerText = t.market;
        document.getElementById('txt-confirm').innerText = t.verify;
        document.getElementById('txt-auth-title').innerText = t.authT;
        document.getElementById('txt-auth-btn').innerText = t.authB;
        document.getElementById('txt-status').innerText = t.status;
        document.getElementById('txt-lib-title').innerText = t.libT;

        if (this.state.user) {
            document.getElementById('displayUserName').innerText = this.state.user;
            document.getElementById('logoutBtn').classList.remove('hidden');
        }

        // Render Cards
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        this.state.products.forEach((p, i) => {
            const isOwned = this.state.purchases.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.transitionDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <div style="font-size:0.6rem; letter-spacing:2px; color:var(--emerald); margin-bottom:15px; text-transform:uppercase;">Unit-Layer ${p.id}</div>
                <h3>${p.title}</h3>
                <div class="price" style="font-size:1.6rem; font-weight:800; color:#fff; margin:15px 0;">${p.price}</div>
                <button class="action-prime ${isOwned?'owned':''}" onclick="${isOwned?'':`APP.openPay(${p.id})`}">
                    ${isOwned ? 'OWNED' : t.buy}
                </button>
            `;
            grid.appendChild(card);
        });
    },

    setupEvents: function() {
        // Island logic
        const island = document.getElementById('mainIsland');
        island.onclick = (e) => {
            if (window.innerWidth < 768) island.classList.toggle('active');
        };
        
        // Avatar interaction
        document.getElementById('avatarTrigger').onclick = (e) => {
            if(!this.state.user) { e.stopPropagation(); this.openModal('auth'); }
        };

        // Lang Switch
        document.getElementById('langBtn').onclick = (e) => {
            e.stopPropagation();
            this.state.lang = this.state.lang === 'ru' ? 'en' : 'ru';
            localStorage.setItem('acus_lang', this.state.lang);
            this.render();
        };

        // Lib Open
        document.getElementById('libBtn').onclick = (e) => {
            e.stopPropagation();
            if(!this.state.user) return this.openModal('auth');
            this.renderLibrary();
            this.openModal('lib');
        };

        // Forms
        document.getElementById('loginForm').onsubmit = (e) => {
            e.preventDefault();
            const val = document.getElementById('loginUser').value;
            localStorage.setItem('acus_user', val);
            location.reload();
        };

        document.getElementById('payForm').onsubmit = (e) => this.handlePayment(e);

        document.getElementById('logoutBtn').onclick = () => {
            localStorage.removeItem('acus_user');
            location.reload();
        };

        // Close logic
        document.querySelectorAll('.close-x, .modal-blur').forEach(el => {
            el.onclick = () => this.closeModals();
        });

        // Copy wallet
        document.getElementById('copyWallet').onclick = () => {
            navigator.clipboard.writeText(this.config.wallet);
            alert("Address Copied");
        };

        // Avatar Upload
        document.getElementById('avatarInput').onchange = (e) => this.handleAvatar(e);
    },

    openPay: function(id) {
        if(!this.state.user) return this.openModal('auth');
        const p = this.state.products.find(x => x.id === id);
        document.getElementById('payName').innerText = p.title;
        document.getElementById('payAmount').innerText = p.price;
        this.state.activeId = id;
        this.openModal('payment');
    },

    handlePayment: async function(e) {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = this.state.products.find(x => x.id === this.state.activeId);
        
        const msg = `💠 **NEW SPATIAL ORDER**\nClient: ${this.state.user}\nProduct: ${p.title}\nTX Hash: \`${hash}\``;
        
        try {
            await fetch(`https://api.telegram.org/bot${this.config.tg_token}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: this.config.tg_chat, text: msg, parse_mode: 'Markdown' })
            });

            this.state.purchases.push({ id: p.id, title: p.title });
            localStorage.setItem(`acus_buy_${this.state.user}`, JSON.stringify(this.state.purchases));
            
            alert(this.dict[this.state.lang].alertPay);
            location.reload();
        } catch(err) { alert("Network Error"); }
    },

    renderLibrary: function() {
        const list = document.getElementById('libList');
        list.innerHTML = '';
        if(this.state.purchases.length === 0) {
            list.innerHTML = `<p style="opacity:0.5">${this.dict[this.state.lang].emptyLib}</p>`;
            return;
        }
        this.state.purchases.forEach(p => {
            const item = document.createElement('div');
            item.className = 'lib-item';
            item.innerHTML = `<strong>${p.title}</strong><br><small style="color:var(--emerald); opacity:0.7">License Status: Active</small>`;
            list.appendChild(item);
        });
    },

    handleAvatar: function(e) {
        const file = e.target.files[0];
        if(file && this.state.user) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                localStorage.setItem(`acus_img_${this.state.user}`, ev.target.result);
                this.loadProfile();
            };
            reader.readAsDataURL(file);
        }
    },

    loadProfile: function() {
        if(!this.state.user) return;
        const img = localStorage.getItem(`acus_img_${this.state.user}`);
        if(img) {
            document.getElementById('userAvatar').src = img;
            document.getElementById('modalAvatar').src = img;
        }
    },

    initAnimations: function() {
        const observer = new IntersectionObserver(ents => {
            ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    },

    openModal: function(id) {
        document.getElementById(`${id}Modal`).classList.remove('hidden');
    },

    closeModals: function() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }
};

APP.init();
