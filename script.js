document.addEventListener('DOMContentLoaded', () => {

    const TG_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471'
    };
    
    const CRYPTO_WALLET = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB';

    const translations = {
        ru: { headerTitle: "Премиальная Экосистема", loginBtn: "Войти", logoutBtn: "Выход", checkBtn: "Подтвердить", authTitle: "Авторизация", buy: "Купить" },
        en: { headerTitle: "Premium Ecosystem", loginBtn: "Login", logoutBtn: "Logout", checkBtn: "Verify TX", authTitle: "Authorization", buy: "Buy Now" }
    };

    let currentLang = 'ru';
    let currentUser = localStorage.getItem('p_user');
    let products = [];

    // --- FETCH DATA & RENDER ---
    async function init() {
        try {
            const response = await fetch('db.json');
            products = await response.json();
            render();
            setupAuthUI();
            setupAnimations();
        } catch (e) {
            console.error("Ошибка загрузки данных:", e);
        }
    }

    function render() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        products.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.transitionDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-image"><img src="${p.image}" alt=""></div>
                    <div class="card-info">
                        <span class="card-term">${p.term}</span>
                        <h3>${p.title}</h3>
                        <p>${p.description}</p>
                        <div class="price-row">
                            <span class="price">${p.price}</span>
                        </div>
                    </div>
                    <button class="premium-btn" onclick="startPay(${p.id})">
                        ${translations[currentLang].buy}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // --- ANIMATIONS ---
    function setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Parallax for Hero Video
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const video = document.querySelector('.hero-video');
            if (video) video.style.transform = `translateY(${scrolled * 0.4}px)`;
        });
    }

    // --- PAY LOGIC ---
    window.startPay = (id) => {
        if (!currentUser) return openModal('auth');
        const p = products.find(x => x.id === id);
        document.getElementById('payName').textContent = p.title;
        document.getElementById('payAmount').textContent = p.price;
        window.activePayId = id;
        openModal('payment');
    };

    document.getElementById('cryptoCheckForm').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = products.find(x => x.id === window.activePayId);
        
        const msg = `💎 <b>НОВАЯ ЗАЯВКА</b>\nUser: ${currentUser}\nТариф: ${p.title}\nЦена: ${p.price}\nTX: <code>${hash}</code>`;
        
        try {
            await fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text: msg, parse_mode: 'HTML' })
            });
            alert('Заявка отправлена! Ожидайте подтверждения.');
            closeModals();
        } catch (err) {
            alert('Ошибка сети.');
        }
    };

    // --- AUTH & UI ---
    function setupAuthUI() {
        const guestNav = document.getElementById('guestNav');
        const userNav = document.getElementById('userNav');
        const menuUserName = document.getElementById('menuUserName');

        if (currentUser) {
            guestNav.classList.add('hidden');
            userNav.classList.remove('hidden');
            menuUserName.textContent = currentUser;
        }
    }

    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        currentUser = document.getElementById('loginEmail').value;
        localStorage.setItem('p_user', currentUser);
        location.reload();
    };

    document.getElementById('menuLogoutBtn').onclick = () => {
        localStorage.removeItem('p_user');
        location.reload();
    };

    // --- MODAL CONTROLS ---
    function openModal(id) {
        closeModals();
        document.getElementById(`${id}Modal`).classList.remove('hidden');
    }

    function closeModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        document.getElementById('mainMenu').classList.remove('active');
    }

    document.getElementById('hamburgerBtn').onclick = () => document.getElementById('mainMenu').classList.add('active');
    document.querySelector('.close-menu-btn').onclick = closeModals;
    document.querySelectorAll('.close-modal').forEach(b => b.onclick = closeModals);
    document.getElementById('menuLoginBtn').onclick = () => openModal('auth');

    document.getElementById('walletCopyBtn').onclick = () => {
        navigator.clipboard.writeText(CRYPTO_WALLET);
        alert('Адрес скопирован!');
    };

    init();
});
