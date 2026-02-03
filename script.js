/**
 * ACUS CORE ENGINE v2.0
 * Features: OOP Architecture, Mock Cloud Sync, Multi-language
 */

const CONFIG = {
    // ЗАМЕНИ НА СВОИ ДАННЫЕ
    adminId: "5683927471",
    botToken: "8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA",
    wallet: "0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB",
    
    // В реальном проекте здесь должен быть URL твоего JSON-сервера.
    // Если оставить null, работает LocalStorage (симуляция).
    apiUrl: null 
};

// --- DATA: TRANSLATIONS & PRODUCTS ---
const I18N = {
    ru: {
        login_btn: "Аккаунт",
        hero_title: "Premium <span>Utility</span>",
        hero_desc: "Профессиональный софт. Моментальная активация. Единая подписка на всех устройствах.",
        btn_buy: "Купить",
        btn_owned: "Приобретено",
        auth_title: "Вход / Синхронизация",
        auth_desc: "Введите ваш Secret Key чтобы объединить подписки на Телефоне и ПК.",
        label_secret: "Ваш Secret Key",
        btn_sync: "Синхронизировать",
        btn_new_acc: "Я новый пользователь",
        pay_instruction: "Отправьте точную сумму на кошелек:",
        label_tx: "Хэш транзакции (TXID)",
        btn_confirm_pay: "Подтвердить оплату",
        status_check: "Проверка блокчейна...",
        status_success: "Оплата успешна! Доступ открыт.",
        alert_copy: "Адрес скопирован в буфер!"
    },
    en: {
        login_btn: "Account",
        hero_title: "Premium <span>Access</span>",
        hero_desc: "Pro-grade software. Instant activation. Unified subscription across all devices.",
        btn_buy: "Purchase",
        btn_owned: "Owned",
        auth_title: "Login / Sync",
        auth_desc: "Enter your Secret Key to sync purchases between Phone and PC.",
        label_secret: "Your Secret Key",
        btn_sync: "Sync Device",
        btn_new_acc: "I'm a new user",
        pay_instruction: "Send exact amount to TON wallet:",
        label_tx: "Transaction Hash (TXID)",
        btn_confirm_pay: "Confirm Payment",
        status_check: "Verifying blockchain...",
        status_success: "Payment Success! Access Granted.",
        alert_copy: "Wallet copied to clipboard!"
    }
};

const PRODUCTS = [
    { 
        id: "p_parser", 
        name: "Parser Pro", 
        price: 1500, 
        desc: { ru: "Сбор данных в многопоточном режиме.", en: "Multi-threaded data scraping tool." },
        img: "https://images.unsplash.com/photo-1558494949-ef526b01201b?q=80&w=1000&auto=format&fit=crop" 
    },
    { 
        id: "p_seo", 
        name: "SEO Core", 
        price: 2500, 
        desc: { ru: "Автоматизация вывода в ТОП-10.", en: "Automated ranking booster engine." },
        img: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop" 
    },
    { 
        id: "p_guard", 
        name: "Data Guard", 
        price: 3500, 
        desc: { ru: "AES-256 шифрование и защита трафика.", en: "AES-256 encryption & traffic shield." },
        img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" 
    }
];

// --- CLASS: AUTH MANAGER (Cloud Sync Logic) ---
class AuthManager {
    constructor() {
        this.userKey = localStorage.getItem('acus_key');
        this.library = JSON.parse(localStorage.getItem('acus_lib') || '[]');
        this.init();
    }

    init() {
        if (this.userKey) {
            document.getElementById('userBtnLabel').innerText = this.userKey.substring(0, 8) + '...';
            // В реальном проекте: this.fetchCloudData();
        }
    }

    generateNew() {
        // Генерируем красивый "API ключ"
        const key = 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
        this.setKey(key);
    }

    login() {
        const input = document.getElementById('authKey').value.trim();
        if (input.length < 5) return alert('Invalid Key');
        this.setKey(input);
    }

    setKey(key) {
        this.userKey = key;
        localStorage.setItem('acus_key', key);
        // При "логине" мы как бы подтягиваем данные. 
        // Без сервера мы доверяем локальному, но делаем вид синхронизации.
        ui.modals.closeAll();
        location.reload();
    }

    addPurchase(productId) {
        if (!this.library.includes(productId)) {
            this.library.push(productId);
            this.saveData();
        }
    }

    has(productId) {
        return this.library.includes(productId);
    }

    saveData() {
        localStorage.setItem('acus_lib', JSON.stringify(this.library));
        // TODO: Если есть CONFIG.apiUrl, отправляем POST запрос сюда
        // fetch(CONFIG.apiUrl, { method: 'POST', body: JSON.stringify({ key: this.userKey, lib: this.library }) })
    }
}

// --- CLASS: UI MANAGER ---
class UIManager {
    constructor() {
        this.currentLang = localStorage.getItem('acus_lang') || 'ru';
        this.modals = {
            open: (id) => {
                document.getElementById(id).classList.add('active');
            },
            closeAll: () => {
                document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            }
        };
        this.render();
        this.updateLangUI();
    }

    setLang(lang) {
        this.currentLang = lang;
        localStorage.setItem('acus_lang', lang);
        this.updateLangUI();
        this.render(); // Перерисовка карточек с новым языком
    }

    updateLangUI() {
        // Обновляем переключатель
        document.querySelectorAll('.lang-opt').forEach(el => {
            el.classList.toggle('active', el.dataset.lang === this.currentLang);
        });

        // Обновляем тексты data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (I18N[this.currentLang][key]) {
                el.innerHTML = I18N[this.currentLang][key];
            }
        });
    }

    render() {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = PRODUCTS.map(p => {
            const isOwned = auth.has(p.id);
            const desc = p.desc[this.currentLang];
            const btnText = isOwned ? I18N[this.currentLang].btn_owned : I18N[this.currentLang].btn_buy;
            const priceDisplay = isOwned ? `<i class="fa fa-check"></i>` : `${p.price} <span class="currency">ADI</span>`;
            
            return `
            <div class="card" onmousemove="ui.handleTilt(event, this)" onmouseleave="ui.resetTilt(this)">
                <div class="badge-premium">Premium</div>
                <div class="card-img-wrap">
                    <img src="${p.img}" class="card-img" alt="${p.name}">
                </div>
                <div class="card-content">
                    <h3>${p.name}</h3>
                    <p>${desc}</p>
                    <div class="price-row">
                        <div class="price">${priceDisplay}</div>
                        <button class="btn-action ${isOwned ? 'owned' : ''}" onclick="shop.openBuy('${p.id}')">
                            ${btnText}
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
        
        document.getElementById('walletDisplay').innerText = CONFIG.wallet;
    }

    // 3D Tilt Effect для карточек
    handleTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    }
    resetTilt(card) {
        card.style.setProperty('--mouse-x', `50%`);
        card.style.setProperty('--mouse-y', `50%`);
    }

    copyWallet() {
        navigator.clipboard.writeText(CONFIG.wallet);
        alert(I18N[this.currentLang].alert_copy);
    }
}

// --- CLASS: SHOP MANAGER (Telegram Integration) ---
class ShopManager {
    constructor() {
        this.pendingProduct = null;
    }

    openBuy(id) {
        if (auth.has(id)) return; // Уже куплено
        if (!auth.userKey) {
            ui.modals.open('authModal');
            return;
        }
        
        this.pendingProduct = PRODUCTS.find(p => p.id === id);
        document.getElementById('payTitle').innerText = this.pendingProduct.name;
        document.getElementById('payPrice').innerText = this.pendingProduct.price;
        document.getElementById('payStatus').className = 'status-msg hidden';
        document.getElementById('txHash').value = '';
        document.getElementById('confirmPayBtn').disabled = false;
        document.getElementById('confirmPayBtn').innerText = I18N[ui.currentLang].btn_confirm_pay;
        
        ui.modals.open('payModal');
    }

    async processPayment() {
        const hash = document.getElementById('txHash').value;
        const btn = document.getElementById('confirmPayBtn');
        const statusEl = document.getElementById('payStatus');

        if (hash.length < 5) return;

        btn.disabled = true;
        btn.innerText = "Processing...";
        
        statusEl.className = "status-msg wait show";
        statusEl.innerHTML = `<i class="fa fa-circle-notch fa-spin"></i> ${I18N[ui.currentLang].status_check}`;

        // 1. Уникальный ID заявки
        const orderId = Math.floor(1000 + Math.random() * 9000);

        // 2. Отправка в Telegram Admin
        const msg = `
💸 <b>NEW ORDER #${orderId}</b>
👤 User: <code>${auth.userKey}</code>
📦 Item: <b>${this.pendingProduct.name}</b>
💰 Price: ${this.pendingProduct.price} ADI
🔗 TXID: <code>${hash}</code>

To approve reply: <code>OK ${orderId}</code>
        `;

        try {
            await fetch(`https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    chat_id: CONFIG.adminId, 
                    text: msg, 
                    parse_mode: 'HTML' 
                })
            });

            // 3. Запуск Long Polling для ожидания ответа Админа
            this.startPolling(orderId, statusEl);

        } catch (e) {
            console.error(e);
            btn.disabled = false;
            alert("Error connecting to server.");
        }
    }

    async startPolling(orderId, statusEl) {
        const checkInterval = setInterval(async () => {
            try {
                // ВАЖНО: Мы получаем обновления бота. 
                // offset=-1 берет только последнее сообщение.
                const res = await fetch(`https://api.telegram.org/bot${CONFIG.botToken}/getUpdates?offset=-1`);
                const data = await res.json();
                
                if (data.result && data.result.length > 0) {
                    const text = data.result[0].message.text || "";
                    
                    // Если админ написал "OK 1234"
                    if (text.trim().toUpperCase() === `OK ${orderId}`) {
                        clearInterval(checkInterval);
                        this.completePurchase(statusEl);
                    }
                }
            } catch (e) {
                // Silent fail on polling error
            }
        }, 3000);
    }

    completePurchase(statusEl) {
        auth.addPurchase(this.pendingProduct.id);
        
        statusEl.className = "status-msg success show";
        statusEl.innerHTML = `<i class="fa fa-check-circle"></i> ${I18N[ui.currentLang].status_success}`;
        
        setTimeout(() => {
            ui.modals.closeAll();
            ui.render(); // Обновляем кнопки на "Owned"
        }, 2000);
    }
}

// --- INIT APP ---
const auth = new AuthManager();
const ui = new UIManager();
const shop = new ShopManager();
