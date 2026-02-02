document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // ⚙️ НАСТРОЙКИ (ВВЕДИТЕ СВОИ ДАННЫЕ)
    // ==========================================
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; // Например: '700123456:AAHi...'
    const TG_CHAT_ID = '5683927471';     // Например: '987654321'
    const MY_CRYPTO_WALLET = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB'; // Вставьте свой адрес

    const SUBSCRIPTION_DURATION = 60000; // 1 минута теста
    const isMobile = window.matchMedia("(hover: none)").matches;

    const products = [
        { id: 1, title: "Parser Pro", price: 1500, description: "Сбор данных с любых сайтов в пару кликов.", image: "https://placehold.co/600x400/1e293b/4ade80?text=PARSER+PRO" },
        { id: 2, title: "Rank Tracker", price: 2500, description: "Точный мониторинг позиций в Google и Яндекс.", image: "https://placehold.co/600x400/1e293b/00ffff?text=RANK+TRACKER" },
        { id: 3, title: "SEO Audit", price: 3500, description: "Полный технический аудит вашего сайта.", image: "https://placehold.co/600x400/1e293b/ff00ff?text=SEO+AUDIT" },
        { id: 4, title: "Unlimited", price: 9990, description: "Доступ ко всем инструментам без ограничений.", image: "https://placehold.co/600x400/1e293b/ffff66?text=UNLIMITED" }
    ];

    let currentUser = localStorage.getItem('acus_user');
    let userPurchases = [];

    // ==========================================
    // 🛠 СИСТЕМНАЯ ЛОГИКА
    // ==========================================

    function loadData() {
        if (!currentUser) return;
        let data = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
        userPurchases = data.filter(p => p.expires > Date.now());
        localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
    }

    function renderProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        
        products.forEach(p => {
            const isOwned = userPurchases.some(up => up.id === p.id);
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-img-wrapper"><img src="${p.image}"></div>
                    <div class="card-info-block">
                        <h3>${p.title}</h3>
                        <p>${p.description}</p>
                    </div>
                    <button class="price-button" ${isOwned ? '' : `onclick="openCryptoPayment(${p.id})"`}>
                        ${isOwned ? "В библиотеке" : "Купить: " + p.price + " ₽"}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

        if (!isMobile) init3DEffects();
    }

    // ==========================================
    // 💰 CRYPTO PAYMENT SYSTEM
    // ==========================================

    window.openCryptoPayment = (productId) => {
        if (!currentUser) {
            alert("Сначала авторизуйтесь!");
            document.getElementById('authModal').classList.remove('hidden');
            return;
        }

        const product = products.find(p => p.id === productId);
        
        // Показываем окно
        document.getElementById('cryptoProductName').textContent = product.title + " — " + product.price + " руб.";
        document.getElementById('walletAddr').textContent = MY_CRYPTO_WALLET;
        document.getElementById('cryptoModal').classList.remove('hidden');

        // Отправляем уведомление владельцу
        const msg = `💎 <b>ЗАПРОС НА ОПЛАТУ КРИПТОЙ</b>\n👤 Пользователь: ${currentUser}\n📦 Товар: ${product.title}\n💰 Сумма: ${product.price} руб.`;
        
        fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CHAT_ID, text: msg, parse_mode: 'HTML' })
        });
    };

    // ==========================================
    // 💎 ЭФФЕКТЫ И ИНТЕРФЕЙС
    // ==========================================

    function init3DEffects() {
        const aurora1 = document.querySelector('.aurora.one');
        const aurora2 = document.querySelector('.aurora.two');
        
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 80;
            const y = (e.clientY / window.innerHeight - 0.5) * 80;
            if(aurora1) aurora1.style.transform = `translate(${x}px, ${y}px)`;
            if(aurora2) aurora2.style.transform = `translate(${-x}px, ${-y}px)`;
        });

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `rotateX(${-y * 20}deg) rotateY(${x * 20}deg) scale(1.05)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `rotateX(0) rotateY(0) scale(1)`;
            });
        });
    }

    // Обработка входа
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('loginEmail').value;
        localStorage.setItem('acus_user', user);
        location.reload();
    });

    // Бургер
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainMenu = document.getElementById('mainMenu');
    hamburgerBtn.onclick = (e) => {
        e.stopPropagation();
        mainMenu.classList.toggle('hidden');
    };

    // Закрытие модалок
    document.querySelector('.close').onclick = () => document.getElementById('authModal').classList.add('hidden');
    document.querySelector('.close-crypto').onclick = () => document.getElementById('cryptoModal').classList.add('hidden');
    
    document.getElementById('menuLoginBtn').onclick = () => {
        document.getElementById('authModal').classList.remove('hidden');
        mainMenu.classList.add('hidden');
    };

    if (currentUser) {
        document.getElementById('userNav').classList.remove('hidden');
        document.getElementById('guestNav').classList.add('hidden');
        document.getElementById('menuUserName').textContent = currentUser;
        loadData();
    }
    
    renderProducts();
});
