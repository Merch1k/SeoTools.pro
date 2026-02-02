document.addEventListener('DOMContentLoaded', () => {

    // === ⚙️ НАСТРОЙКИ ===
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; 
    const TG_CHAT_ID = '5683927471'; 
    const CRYPTO_WALLET = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB'; 
    const ADI_RATE = 180; // 1 ADI = 1 Рубль (для примера)

    // Проверка устройства
    const isMobile = window.innerWidth <= 1024;

    // === ДАННЫЕ ===
    const products = [ 
        { id: 1, title: "Parser Pro", description: "Мощный парсер данных. Собирает всё.", price: 1500, image: "https://placehold.co/600x400/09090b/10b981?text=PARSER", file: "parser.exe" }, 
        { id: 2, title: "Rank Tracker", description: "Топ-1 в отслеживании позиций Google.", price: 2500, image: "https://placehold.co/600x400/09090b/8b5cf6?text=TRACKER", file: "tracker.zip" }, 
        { id: 3, title: "SEO Audit", description: "Технический аудит сайта за 1 минуту.", price: 3500, image: "https://placehold.co/600x400/09090b/06b6d4?text=AUDIT", file: "audit.dmg" }, 
        { id: 4, title: "VIP Access", description: "Безлимитный доступ ко всем тулзам.", price: 9990, image: "https://placehold.co/600x400/09090b/ec4899?text=VIP", file: "vip.rar" },
        { id: 5, title: "Indexer", description: "Быстрая индексация страниц в поисковиках.", price: 1200, image: "https://placehold.co/600x400/09090b/eab308?text=INDEXER", file: "indexer.exe" },
        { id: 6, title: "Keywords", description: "Подбор ключевых слов с AI анализом.", price: 1800, image: "https://placehold.co/600x400/09090b/ef4444?text=KEYS", file: "keys.zip" }
    ];

    let currentUser = localStorage.getItem('acus_user');
    let userPurchases = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
    let currentProduct = null;

    // === DOM ЭЛЕМЕНТЫ ===
    const grid = document.getElementById('products-grid');
    const mainMenu = document.getElementById('mainMenu');
    const modals = {
        auth: document.getElementById('authModal'),
        reg: document.getElementById('regModal'),
        pay: document.getElementById('paymentModal'),
        lib: document.getElementById('libraryModal')
    };

    // === 🛠 ФУНКЦИИ ===
    
    function init() {
        if(document.getElementById('walletAddress')) 
            document.getElementById('walletAddress').textContent = CRYPTO_WALLET.substring(0, 10) + '...';
        
        updateAuthUI();
        renderProducts();
        
        // Включаем 3D эффект только если не мобильный
        if (!isMobile) {
            init3DEffect();
        }
    }

    function renderProducts() {
        grid.innerHTML = '';
        products.forEach(p => {
            const isOwned = userPurchases.some(x => x.id === p.id);
            const btnClass = isOwned ? 'neon-btn owned' : 'neon-btn';
            const btnText = isOwned ? '<i class="fa fa-check"></i> КУПЛЕНО' : `${p.price} ADI`;
            const onClick = isOwned ? '' : `onclick="buy(${p.id})"`;

            const card = document.createElement('div');
            card.className = 'card';
            // Атрибуты для 3D эффекта
            card.setAttribute('data-tilt', '');
            
            card.innerHTML = `
                <div class="card-image"><img src="${p.image}" alt="${p.title}"></div>
                <div class="card-body">
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-desc">${p.description}</p>
                    <button class="${btnClass}" ${onClick}>${btnText}</button>
                </div>
            `;
            grid.appendChild(card);
        });
        
        if (!isMobile) init3DEffect(); // Обновляем листенеры
    }

    // === 🎮 ЛОГИКА 3D (DESKTOP) ===
    function init3DEffect() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Переменные для CSS градиента
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);

                // Поворот
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }

    // === 💰 ОПЛАТА ===
    window.buy = (id) => {
        if (!currentUser) return openModal('auth');
        currentProduct = products.find(p => p.id === id);
        document.getElementById('payName').textContent = currentProduct.title;
        document.getElementById('payAmount').textContent = `${currentProduct.price} ADI`;
        openModal('pay');
    };

    document.getElementById('cryptoCheckForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const txHash = document.getElementById('txHash').value;
        
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Checking...';
        
        // Отправка в TG
        const msg = `💎 <b>PAYMENT CHECK</b>\nUser: ${currentUser}\nItem: ${currentProduct.title}\nSum: ${currentProduct.price} ADI\nTX: <code>${txHash}</code>`;
        
        try {
            await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: TG_CHAT_ID, text: msg, parse_mode: 'HTML' })
            });
            
            // Демо-активация
            userPurchases.push({ id: currentProduct.id, date: Date.now() });
            localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
            
            alert('Заявка отправлена администратору! Доступ открыт (Демо).');
            closeModals();
            renderProducts();
        } catch(err) {
            alert('Ошибка сети');
        } finally {
            btn.innerHTML = 'Я ОПЛАТИЛ';
            e.target.reset();
        }
    });

    document.getElementById('walletCopyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(CRYPTO_WALLET);
        alert('Кошелек скопирован!');
    });

    // === 👤 UI & AUTH ===
    function updateAuthUI() {
        const guest = document.getElementById('guestNav');
        const user = document.getElementById('userNav');
        if(currentUser) {
            guest.classList.add('hidden');
            user.classList.remove('hidden');
            document.getElementById('menuUserName').textContent = currentUser;
        } else {
            guest.classList.remove('hidden');
            user.classList.add('hidden');
        }
    }

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser = document.getElementById('loginEmail').value;
        localStorage.setItem('acus_user', currentUser);
        userPurchases = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
        updateAuthUI();
        renderProducts();
        closeModals();
    });

    document.getElementById('regFormRequest').addEventListener('submit', (e) => {
        e.preventDefault();
        // В реале тут отправка в TG
        alert('Заявка на регистрацию отправлена!');
        closeModals();
    });

    document.getElementById('menuLibraryBtn').addEventListener('click', () => {
        const list = document.getElementById('libraryList');
        list.innerHTML = '';
        if(userPurchases.length === 0) list.innerHTML = '<p style="color:#666">Пусто...</p>';
        else {
            userPurchases.forEach(pur => {
                const p = products.find(prod => prod.id === pur.id);
                if(p) list.innerHTML += `<div style="padding:10px; border-bottom:1px solid #333; display:flex; justify-content:space-between"><span>${p.title}</span><a href="#" style="color:var(--accent)">Скачать</a></div>`;
            });
        }
        openModal('lib');
    });

    document.getElementById('menuLogoutBtn').addEventListener('click', () => {
        localStorage.removeItem('acus_user');
        currentUser = null;
        userPurchases = [];
        updateAuthUI();
        renderProducts();
        toggleMenu(false);
    });

    // === MENU ===
    function toggleMenu(state) {
        if(state) mainMenu.classList.add('active');
        else mainMenu.classList.remove('active');
    }
    
    document.getElementById('hamburgerBtn').addEventListener('click', () => toggleMenu(true));
    document.querySelector('.close-menu').addEventListener('click', () => toggleMenu(false));
    document.querySelector('.menu-backdrop').addEventListener('click', () => toggleMenu(false));
    
    // === MODALS HELPERS ===
    function openModal(name) { toggleMenu(false); closeModals(); modals[name].classList.remove('hidden'); }
    function closeModals() { Object.values(modals).forEach(m => m.classList.add('hidden')); }
    document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', closeModals));

    init();
});
