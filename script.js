// === НАСТРОЙКИ (ЗАМЕНИ НА СВОИ) ===
const CONFIG = {
    botToken: "8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA", // Токен бота
    adminId: "5683927471", // Твой ID
    wallet: "0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB" // Полный адрес кошелька
};

const products = [
    { id: 1, name: "Parser Pro", price: 1500, desc: "Профессиональный софт для сбора данных.", img: "https://i.ibb.co/V99969z/1.jpg" },
    { id: 2, name: "SEO Optimizer", price: 2500, desc: "Инструмент для вывода сайтов в топ.", img: "https://i.ibb.co/L8f3m9D/2.jpg" },
    { id: 3, name: "Data Guard", price: 3500, desc: "Защита и шифрование ваших данных.", img: "https://i.ibb.co/PZ99m6q/3.jpg" }
];

let user = localStorage.getItem('user');
let lib = JSON.parse(localStorage.getItem('lib') || '[]');
let currentProd = null;

function init() {
    const grid = document.getElementById('grid');
    grid.innerHTML = products.map(p => {
        const isOwned = lib.includes(p.id);
        return `
        <div class="card">
            <div class="card-img" style="background-image: url('${p.img}')"></div>
            <div class="card-content">
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
                <button class="btn-buy ${isOwned ? 'owned' : ''}" onclick="${isOwned ? '' : `openPay(${p.id})`}">
                    ${isOwned ? 'Приобретено' : p.price + ' ADI'}
                </button>
            </div>
        </div>`;
    }).join('');
    
    if(user) document.getElementById('authZone').innerHTML = `<div class="user-pill" onclick="logout()">${user} (Выход)</div>`;
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
    if(hash.length < 5) return alert('Введите хэш!');

    const orderId = Math.floor(10000 + Math.random() * 90000);
    btn.disabled = true;
    btn.textContent = "Ожидание проверки...";

    // 1. Шлем тебе в Телеграм
    const text = `💰 НОВЫЙ ЗАКАЗ #${orderId}\nЮзер: ${user}\nТовар: ${currentProd.name}\nHash: ${hash}\n\nЧтобы одобрить, напиши: ОК ${orderId}`;
    await fetch(`https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ chat_id: CONFIG.adminId, text })
    });

    status.className = "status-box wait";
    status.innerHTML = `Заявка #${orderId} отправлена! Ждите подтверждения админом прямо здесь.`;
    status.classList.remove('hidden');

    // 2. Начинаем "слушать" твой бот
    const poller = setInterval(async () => {
        const res = await fetch(`https://api.telegram.org/bot${CONFIG.botToken}/getUpdates?offset=-1`);
        const data = await res.json();
        const lastMsg = data.result[0]?.message?.text || "";

        // Если ты написал: ОК 12345
        if(lastMsg.includes(`ОК ${orderId}`)) {
            clearInterval(poller);
            lib.push(currentProd.id);
            localStorage.setItem('lib', JSON.stringify(lib));
            status.className = "status-box done";
            status.textContent = "✅ Оплата подтверждена! Доступ открыт.";
            setTimeout(() => location.reload(), 2000);
        }
    }, 4000);
};

window.login = () => {
    const name = document.getElementById('username').value;
    if(name) { localStorage.setItem('user', name); location.reload(); }
};

window.logout = () => { localStorage.clear(); location.reload(); };
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModals = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
window.copyAddr = () => { navigator.clipboard.writeText(CONFIG.wallet); alert('Адрес скопирован!'); };
window.showLib = () => alert('Ваши покупки: ' + (lib.length ? products.filter(p=>lib.includes(p.id)).map(p=>p.name).join(', ') : 'пусто'));

init();
