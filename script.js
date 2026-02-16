/**
 * 🍏 ACUS SPATIAL ENGINE v4.0 - PRO
 * Полная реализация системы подтверждения и иммерсивного дизайна
 */

const ACUS = {
    config: {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471',
        wallet: '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB'
    },
    
    dict: {
        ru: {
            heroT: "Spatial SEO", heroS: "Инструменты нового измерения в иммерсивном исполнении.",
            buy: "Купить", pending: "Проверка", owned: "Активно", 
            authT: "Авторизация", authB: "Войти", status: "Система Активна", market: "SPATIAL LICENSES"
        },
        en: {
            heroT: "Spatial SEO", heroS: "Next-gen tools within a spatial ecosystem.",
            buy: "Purchase", pending: "Verifying", owned: "Owned",
            authT: "Authentication", authB: "Enter", status: "System Active", market: "CURATED LICENSES"
        }
    },

    state: {
        lang: localStorage.getItem('v_lang') || 'ru',
        user: localStorage.getItem('v_user') || null,
        db: [],
        purchased: [], // Список одобренных ID
        pending: []    // Список ID на проверке
    },

    init: async function() {
        // Загрузка данных
        try {
            const res = await fetch('db.json');
            this.state.db = await res.json();
            
            if(this.state.user) {
                this.state.purchased = JSON.parse(localStorage.getItem(`v_buy_${this.state.user}`)) || [];
                this.state.pending = JSON.parse(localStorage.getItem(`v_pending_${this.state.user}`)) || [];
            }
        } catch (e) { console.error("Database error", e); }

        this.render();
        this.events();
        this.loadProfile();
        this.animate();
    },

    render: function() {
        const t = this.dict[this.state.lang];
        
        // Обновляем тексты интерфейса
        document.getElementById('langBtn').innerText = this.state.lang.toUpperCase();
        document.getElementById('txt-hero-title').innerHTML = `Spatial <span>SEO</span>`;
        document.getElementById('txt-hero-sub').innerText = t.heroS;
        document.getElementById('txt-market-tag').innerText = t.market;
        document.getElementById('txt-auth-title').innerText = t.authT;
        document.getElementById('txt-auth-btn').innerText = t.authB;
        document.getElementById('txt-status').innerText = t.status;

        if (this.state.user) {
            document.getElementById('displayUserName').innerText = this.state.user;
            document.getElementById('logoutBtn').classList.remove('hidden');
        }

        // Рендерим сетку
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        this.state.db.forEach((p, i) => {
            const isOwned = this.state.purchased.some(x => x.id === p.id);
            const isPending = this.state.pending.some(x => x.id === p.id);
            
            let bText = t.buy;
            let bClass = "";
            let bAction = `ACUS.openPay(${p.id})`;

            if(isOwned) {
                bText = t.owned; bClass = "owned"; bAction = "";
            } else if(isPending) {
                bText = t.pending; bClass = "pending"; bAction = "alert('Ожидайте подтверждения админом...')";
            }

            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.transitionDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <div style="font-size:0.6rem; letter-spacing:2px; color:var(--neon-green); margin-bottom:15px; text-transform:uppercase;">Unit ${p.id}</div>
                <h3>${p.title}</h3>
                <div style="font-size:1.6rem; font-weight:800; color:#fff; margin:15px 0;">${p.price}</div>
                <button class="glass-action-btn ${bClass}" onclick="${bAction}">
                    ${bText}
                </button>
            `;
            grid.appendChild(card);
        });
    },

    events: function() {
        const island = document.getElementById('mainIsland');
        
        // Островок
        island.onclick = (e) => {
            if(window.innerWidth < 768) island.classList.toggle('active');
        };

        document.getElementById('avatarTrigger').onclick = (e) => {
            if(!this.state.user) { e.stopPropagation(); this.modal('auth'); }
        };

        // Язык
        document.getElementById('langBtn').onclick = (e) => {
            e.stopPropagation();
            this.state.lang = this.state.lang === 'ru' ? 'en' : 'ru';
            localStorage.setItem('v_lang', this.state.lang);
            this.render();
        };

        // Формы
        document.getElementById('loginForm').onsubmit = (e) => {
            e.preventDefault();
            localStorage.setItem('v_user', document.getElementById('loginUser').value);
            location.reload();
        };

        document.getElementById('payForm').onsubmit = (e) => this.submitPayment(e);

        // Кнопки закрытия
        document.querySelectorAll('.close-modal-btn, .modal-backdrop').forEach(el => {
            el.onclick = () => this.closeModals();
        });

        // Библиотека
        document.getElementById('libBtn').onclick = (e) => {
            e.stopPropagation();
            if(!this.state.user) return this.modal('auth');
            this.renderLibrary();
            this.modal('lib');
        };

        document.getElementById('logoutBtn').onclick = () => {
            localStorage.removeItem('v_user');
            location.reload();
        };

        document.getElementById('avatarInput').onchange = (e) => this.handleAvatar(e);
        
        document.getElementById('copyWallet').onclick = () => {
            navigator.clipboard.writeText(this.config.wallet);
            alert("Address Copied");
        };
    },

    openPay: function(id) {
        if(!this.state.user) return this.modal('auth');
        const p = this.state.db.find(x => x.id === id);
        document.getElementById('payName').innerText = p.title;
        document.getElementById('payAmount').innerText = p.price;
        this.state.activeId = id;
        this.modal('payment');
    },

    submitPayment: async function(e) {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = this.state.db.find(x => x.id === this.state.activeId);
        
        // Отправка уведомления админу (вам в телеграм)
        const msg = `⚡ **ЗАЯВКА НА АКТИВАЦИЮ**\n\n` +
                    `Пользователь: ${this.state.user}\n` +
                    `Продукт: ${p.title}\n` +
                    `Хеш: \`${hash}\`\n\n` +
                    `Чтобы одобрить, зайдите в свою панель или свяжитесь с клиентом.`;

        try {
            await fetch(`https://api.telegram.org/bot${this.config.token}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: this.config.chatId, text: msg, parse_mode: 'Markdown' })
            });

            // Добавляем в список ОЖИДАНИЯ
            this.state.pending.push({ id: p.id, title: p.title });
            localStorage.setItem(`v_pending_${this.state.user}`, JSON.stringify(this.state.pending));
            
            alert("Транзакция отправлена на проверку. После подтверждения лицензия появится в вашем доступе.");
            location.reload();
        } catch (err) { alert("Ошибка сети"); }
    },

    renderLibrary: function() {
        const list = document.getElementById('libList');
        list.innerHTML = '';
        if(this.state.purchased.length === 0) {
            list.innerHTML = `<p style="opacity:0.5">У вас пока нет активных лицензий.</p>`;
            return;
        }
        this.state.purchased.forEach(p => {
            const div = document.createElement('div');
            div.style.background = 'rgba(255,255,255,0.05)';
            div.style.padding = '15px';
            div.style.borderRadius = '15px';
            div.style.marginBottom = '10px';
            div.innerHTML = `<strong>${p.title}</strong><br><small style="color:var(--neon-green)">Лицензия: ACTIVE</small>`;
            list.appendChild(div);
        });
    },

    handleAvatar: function(e) {
        const file = e.target.files[0];
        if(file && this.state.user) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                localStorage.setItem(`v_img_${this.state.user}`, ev.target.result);
                this.loadProfile();
            };
            reader.readAsDataURL(file);
        }
    },

    loadProfile: function() {
        if(!this.state.user) return;
        const img = localStorage.getItem(`v_img_${this.state.user}`);
        if(img) {
            document.getElementById('userAvatar').src = img;
            document.getElementById('modalAvatar').src = img;
        }
    },

    modal: function(id) { document.getElementById(`${id}Modal`).classList.remove('hidden'); },
    closeModals: function() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); },

    animate: function() {
        const obs = new IntersectionObserver(ents => {
            ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }
};

ACUS.init();
