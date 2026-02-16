const APP = {
    config: {
        tg_token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        tg_chat: '5683927471'
    },
    
    dict: {
        ru: { buy: "Купить", pending: "Ожидание", owned: "Активно", libT: "Мои покупки" },
        en: { buy: "Purchase", pending: "Verifying", owned: "Owned", libT: "Library" }
    },

    state: {
        lang: localStorage.getItem('acus_lang') || 'ru',
        user: localStorage.getItem('acus_user') || null,
        products: [],
        purchases: [], // Купленные (одобренные)
        pending: []    // На проверке
    },

    init: async function() {
        try {
            const res = await fetch('db.json');
            this.state.products = await res.json();
            
            if(this.state.user) {
                // Загружаем покупки и ожидания из памяти
                this.state.purchases = JSON.parse(localStorage.getItem(`acus_buy_${this.state.user}`)) || [];
                this.state.pending = JSON.parse(localStorage.getItem(`acus_pending_${this.state.user}`)) || [];
            }
        } catch (e) { console.error(e); }

        this.render();
        this.setupEvents();
        this.loadProfile();
        this.initAnimations();
    },

    render: function() {
        const t = this.dict[this.state.lang];
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        this.state.products.forEach((p, i) => {
            const isOwned = this.state.purchases.some(x => x.id === p.id);
            const isPending = this.state.pending.some(x => x.id === p.id);
            
            let btnText = t.buy;
            let btnClass = "";
            let btnAction = `APP.openPay(${p.id})`;

            if (isOwned) {
                btnText = t.owned;
                btnClass = "owned";
                btnAction = "";
            } else if (isPending) {
                btnText = t.pending;
                btnClass = "pending";
                btnAction = "alert('Ваша оплата проверяется администратором...')";
            }

            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.transitionDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <div style="font-size:0.6rem; letter-spacing:2px; color:rgba(255,255,255,0.3); margin-bottom:10px;">ID-00${p.id}</div>
                <h3>${p.title}</h3>
                <div style="font-size:1.4rem; font-weight:800; color:#fff; margin:10px 0;">${p.price}</div>
                <button class="action-prime ${btnClass}" onclick="${btnAction}">
                    ${btnText}
                </button>
            `;
            grid.appendChild(card);
        });
        
        // (Остальной рендер текста шапки из прошлого кода...)
    },

    handlePayment: async function(e) {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = this.state.products.find(x => x.id === this.state.activeId);
        
        // 1. Отправляем в телеграм админу
        const msg = `⚠️ **NEW PAYMENT VERIFICATION**\n\n` +
                    `Client: ${this.state.user}\n` +
                    `Product: ${p.title}\n` +
                    `Hash: \`${hash}\`\n\n` +
                    `Чтобы одобрить, используйте панель управления.`;
        
        try {
            await fetch(`https://api.telegram.org/bot${this.config.tg_token}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: this.config.tg_chat, text: msg, parse_mode: 'Markdown' })
            });

            // 2. Добавляем в список ОЖИДАНИЯ
            this.state.pending.push({ id: p.id, title: p.title, hash: hash });
            localStorage.setItem(`acus_pending_${this.state.user}`, JSON.stringify(this.state.pending));
            
            alert("Hash принят. Ожидайте ручной проверки администратором.");
            location.reload();
        } catch(err) { alert("Error"); }
    },

    // (Остальные функции: SetupEvents, LoadProfile, OpenModal - остаются из прошлого кода)
};

APP.init();
