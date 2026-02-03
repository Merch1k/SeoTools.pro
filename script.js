const CONFIG = {
    botToken: "8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA",
    adminId: "5683927471",
    wallet: "0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB"
};

// Премиум-карточки и переводы
const products = [
    { 
        id: 1, 
        name: "Parser Ultra", 
        price: 1500, 
        img: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1000",
        desc: { ru: "Профессиональный инструмент для анализа данных нейросетями.", en: "Professional AI-driven data analysis tool." }
    },
    { 
        id: 2, 
        name: "SEO Neural", 
        price: 2500, 
        img: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=1000",
        desc: { ru: "Автоматическое продвижение в топ через поведенческие факторы.", en: "Automatic TOP ranking via behavioral factor simulation." }
    },
    { 
        id: 3, 
        name: "Data Cyber Guard", 
        price: 3500, 
        img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000",
        desc: { ru: "Криптографическая защита ваших рабочих сессий и данных.", en: "Cryptographic protection for your work sessions and data." }
    }
];

const UI_TEXT = {
    ru: {
        heroTitle: "Premium <span>Utility</span>",
        heroSub: "Профессиональный софт. Синхронизация между всеми вашими устройствами.",
        loginLabel: "Войти",
        authTitle: "Авторизация",
        authDesc: "Используйте один ник на всех устройствах для синхронизации.",
        loginBtn: "Войти",
        logout: "Выход",
        owned: "Приобретено",
        payInstr: "Отправьте <b>TON</b> на адрес:",
        btnPay: "Я оплатил",
        wait: "Заявка #ID отправлена! Ждите подтверждения админом.",
        done: "✅ Оплата подтверждена! Доступ открыт.",
        lib: "Ваши покупки: ",
        libEmpty: "У вас пока нет покупок."
    },
    en: {
        heroTitle: "Premium <span>Utility</span>",
        heroSub: "Professional software. Sync across all your devices.",
        loginLabel: "Login",
        authTitle: "Authentication",
        authDesc: "Use the same nickname on all devices to sync purchases.",
        loginBtn: "Login",
        logout: "Logout",
        owned: "Owned",
        payInstr: "Send <b>TON</b> to this address:",
        btnPay: "I have paid",
        wait: "Order #ID sent! Wait for admin confirmation.",
        done: "✅ Payment confirmed! Access granted.",
        lib: "Your purchases: ",
        libEmpty: "You have no purchases yet."
    }
};

let currentLang = localStorage.getItem('lang') || 'ru';
let user = localStorage.getItem('user');
// Загружаем библиотеку, привязанную к никнейму
let lib = JSON.parse(localStorage.getItem(`lib_${user}`) || '[]');
let currentProd = null;

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    renderUI();
}

function renderUI() {
    // Перевод текстов
    const t = UI_TEXT[currentLang];
    document.getElementById('heroTitle').innerHTML = t.heroTitle;
    document.getElementById('heroSub').textContent = t.heroSub;
    document.getElementById('loginLabel').textContent = user ? `${user} (${t.logout})` : t.loginLabel;
    document.getElementById('authTitleText').textContent = t.authTitle;
    document.getElementById('authDesc').textContent = t.authDesc;
    document.getElementById('loginBtnAction').textContent = t.loginBtn;
    document.getElementById('payInstrText').innerHTML = t.payInstr;
    document.getElementById('payBtn').textContent = t.btnPay;

    document.getElementById('btn-ru').classList.toggle('active', currentLang === 'ru');
    document.getElementById('btn-en').classList.toggle('active', currentLang === 'en');

    // Отрисовка карточек
    const grid = document.getElementById('grid');
    grid.innerHTML = products.map(p => {
        const isOwned = lib.includes(p.id);
        return `
        <div class="card">
            <div class="card-img" style="background-image: url('${p.img}')"></div>
            <div class="card-content">
                <h3>${p.name}</h3>
                <p>${p.desc[currentLang]}</p>
                <button class="btn-buy ${isOwned ? 'owned' : ''}" onclick="${isOwned ? '' : `openPay(${p.id})`}">
                    ${isOwned ? t.owned : p.price + ' ADI'}
                </button>
            </div>
        </div>`;
    }).join('');

    if(user) {
        document.getElementById('authZone').innerHTML = `<div class="user-pill" onclick="logout()">${user} (${t.logout})</div>`;
    }
    
    document.getElementById('walletDisplay').textContent = CONFIG.wallet.slice(0,8) + '...' + CONFIG.wallet.slice(-4);
}

window.openPay = (id) => {
    if(!user) return openModal('authModal');
    currentProd = products.find(p => p.id === id);
    document.getElementById('pTitle').textContent = currentProd.name;
    document.getElementById('pPrice').textContent = currentProd.price + ' ADI';
    openModal('payModal');
};

window.sendOrder = async () => {
    const hash = document.getElementById('txHash').value;
    const btn = document.getElementById('payBtn');
    const status = document.getElementById('statusMsg');
    if(hash.length < 5) return alert('Error Hash!');

    const orderId = Math.floor(10000 + Math.random() * 90000);
    btn.disabled = true;
    btn.textContent = "...";

    // Отправляем админу никнейм пользователя для синхронизации
    const text = `💰 НОВЫЙ ЗАКАЗ #${orderId}\nЮзер: ${user}\nТовар: ${currentProd.name}\nHash: ${hash}\n\nЧтобы одобрить, напиши: ОК ${orderId}`;
    
    await fetch(`https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ chat_id: CONFIG.adminId, text })
    });

    status.className = "status-box wait";
    status.innerHTML = UI_TEXT[currentLang].wait.replace('#ID', orderId);
    status.classList.remove('hidden');

    const poller = setInterval(async () => {
        const res = await fetch(`https://api.telegram.org/bot${CONFIG.botToken}/getUpdates?offset=-1`);
        const data = await res.json();
        const lastMsg = data.result[0]?.message?.text || "";

        if(lastMsg.includes(`ОК ${orderId}`)) {
            clearInterval(poller);
            lib.push(currentProd.id);
            // Сохраняем покупку именно для этого пользователя
            localStorage.setItem(`lib_${user}`, JSON.stringify(lib));
            status.className = "status-box done";
            status.textContent = UI_TEXT[currentLang].done;
            setTimeout(() => location.reload(), 2000);
        }
    }, 4000);
};

window.login = () => {
    const name = document.getElementById('username').value.trim();
    if(name) { 
        localStorage.setItem('user', name); 
        // При логине подгружаем данные этого пользователя
        lib = JSON.parse(localStorage.getItem(`lib_${name}`) || '[]');
        location.reload(); 
    }
};

window.logout = () => { 
    localStorage.removeItem('user'); 
    location.reload(); 
};

window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModals = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
window.copyAddr = () => { navigator.clipboard.writeText(CONFIG.wallet); alert('Copied!'); };

window.showLib = () => {
    const t = UI_TEXT[currentLang];
    const names = products.filter(p => lib.includes(p.id)).map(p => p.name).join(', ');
    alert(lib.length ? t.lib + names : t.libEmpty);
};

renderUI();
