const CONFIG = {
    botToken: "8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA",
    adminId: "5683927471",
    wallet: "0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB"
};

// Продукты из твоего db.json (подгружаем или используем структуру)
const products = [
    { id: 1, name: "Неделя", price: "990 руб.", desc: "Лицензия на 7 дней. Полный функционал SEO Tools Pro.", img: "Pins.png" },
    { id: 2, name: "Месяц", price: "2990 руб.", desc: "Лицензия на 30 дней. Оптимальный выбор для профи.", img: "Pins.png" },
    { id: 3, name: "Год", price: "14900 руб.", desc: "Лицензия на 365 дней. Экономия более 50%.", img: "Pins.png" },
    { id: 4, name: "Безлимит", price: "24990 руб.", desc: "Пожизненный доступ. Все будущие обновления бесплатно.", img: "Pins.png" }
];

let currentUser = localStorage.getItem('user');
let currentProd = null;

// Функция для получения "библиотеки" пользователя. 
// В идеале тут должен быть fetch(`api/getLib?user=${user}`)
function getUserLibrary() {
    const allLibs = JSON.parse(localStorage.getItem('cloud_libs') || '{}');
    return allLibs[currentUser] || [];
}

function saveToUserLibrary(prodId) {
    const allLibs = JSON.parse(localStorage.getItem('cloud_libs') || '{}');
    if(!allLibs[currentUser]) allLibs[currentUser] = [];
    if(!allLibs[currentUser].includes(prodId)) {
        allLibs[currentUser].push(prodId);
    }
    localStorage.setItem('cloud_libs', JSON.stringify(allLibs));
}

function init() {
    const grid = document.getElementById('grid');
    const lib = currentUser ? getUserLibrary() : [];
    
    grid.innerHTML = products.map(p => {
        const isOwned = lib.includes(p.id);
        return `
        <div class="card">
            <div class="card-img-container">
                <div class="card-img" style="background-image: url('${p.img}')"></div>
            </div>
            <div class="card-content">
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
                <div class="card-footer">
                    <div class="price-box">${p.price}</div>
                    <button class="btn-buy ${isOwned ? 'owned' : ''}" onclick="${isOwned ? '' : `openPay(${p.id})`}">
                        ${isOwned ? 'Активировано' : 'Купить лицензию'}
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
    
    if(currentUser) {
        document.getElementById('authZone').innerHTML = `
            <div class="user-pill" onclick="logout()">
                <i class="fa-solid fa-user-check" style="margin-right:8px; color:var(--accent-bright)"></i>
                ${currentUser}
            </div>`;
    }
    
    document.getElementById('walletDisplay').textContent = CONFIG.wallet.slice(0,10) + '...' + CONFIG.wallet.slice(-6);
}

// Модалки
window.openModal = (id) => {
    const el = document.getElementById(id);
    el.classList.remove('hidden');
    el.style.display = 'flex';
};

window.closeModals = () => {
    document.querySelectorAll('.modal').forEach(m => {
        m.classList.add('hidden');
        m.style.display = 'none';
    });
};

window.openPay = (id) => {
    if(!currentUser) return openModal('authModal');
    currentProd = products.find(p => p.id === id);
    document.getElementById('pTitle').textContent = `Тариф: ${currentProd.name}`;
    document.getElementById('pPrice').textContent = currentProd.price;
    openModal('payModal');
};

// Логика оплаты
window.sendOrder = async () => {
    const hash = document.getElementById('txHash').value;
    const btn = document.getElementById('payBtn');
    const status = document.getElementById('statusMsg');
    
    if(hash.length < 10) return alert('Пожалуйста, введите корректный TXID транзакции');

    const orderId = Math.floor(100000 + Math.random() * 900000);
    btn.disabled = true;
    btn.textContent = "Проверка транзакции...";

    const text = `🚀 ЗАКАЗ #${orderId}\n👤 Юзер: ${currentUser}\n📦 Тариф: ${currentProd.name}\n🔗 Hash: ${hash}\n\nКоманда: OK ${orderId}`;
    
    try {
        await fetch(`https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: CONFIG.adminId, text })
        });

        status.className = "status-box wait";
        status.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Заявка #${orderId} на проверке. Не закрывайте страницу.`;
        status.classList.remove('hidden');

        // Опрос обновлений (Short Polling)
        const poller = setInterval(async () => {
            const res = await fetch(`https://api.telegram.org/bot${CONFIG.botToken}/getUpdates?offset=-1`);
            const data = await res.json();
            const lastMsg = data.result[0]?.message?.text || "";

            if(lastMsg.includes(`OK ${orderId}`)) {
                clearInterval(poller);
                saveToUserLibrary(currentProd.id);
                status.className = "status-box done";
                status.textContent = "✅ Доступ успешно активирован!";
                setTimeout(() => location.reload(), 2500);
            }
        }, 5000);
    } catch (e) {
        alert("Ошибка сети. Попробуйте позже.");
        btn.disabled = false;
    }
};

window.login = () => {
    const name = document.getElementById('username').value.trim();
    if(name.length > 2) { 
        localStorage.setItem('user', name); 
        location.reload(); 
    } else {
        alert("Введите валидный никнейм");
    }
};

window.logout = () => {
    if(confirm("Выйти из аккаунта?")) {
        localStorage.removeItem('user');
        location.reload();
    }
};

window.copyAddr = () => {
    navigator.clipboard.writeText(CONFIG.wallet);
    const box = document.querySelector('.wallet-box');
    box.style.borderColor = '#10b981';
    setTimeout(() => box.style.borderColor = '', 1000);
};

// Запуск
document.addEventListener('DOMContentLoaded', init);
