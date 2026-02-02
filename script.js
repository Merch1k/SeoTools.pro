document.addEventListener('DOMContentLoaded', () => {

    const TG_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471'
    };
    
    const CRYPTO_WALLET = '0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB';

    const translations = {
        ru: { headerTitle: "Премиальная Экосистема", loginBtn: "Войти", registerBtn: "Регистрация", logoutBtn: "Выход", languageBtn: "Язык", myPurchases: "Мои покупки", checkBtn: "Подтвердить оплату", authTitle: "Авторизация", buy: "Купить" },
        en: { headerTitle: "Premium Ecosystem", loginBtn: "Login", registerBtn: "Join", logoutBtn: "Logout", languageBtn: "Language", myPurchases: "My Library", checkBtn: "Verify TX", authTitle: "Authorization", buy: "Get Access" }
    };

    let currentLang = 'ru';
    let currentUser = localStorage.getItem('p_user');
    let purchases = JSON.parse(localStorage.getItem(`p_buy_${currentUser}`)) || [];

    const products = [
        { id: 1, name: "Parser X", desc: "Ultimate data extraction tool for enterprise needs.", price: 1500, img: "https://placehold.co/600x400/020203/00ff88?text=PARSER" },
        { id: 2, name: "Neural Rank", desc: "AI-driven position tracking and analytics.", price: 2500, img: "https://placehold.co/600x400/020203/bf00ff?text=NEURAL" },
        { id: 3, name: "Audit Core", desc: "Deep technical scanning for modern web apps.", price: 3500, img: "https://placehold.co/600x400/020203/00ff88?text=AUDIT" },
        { id: 4, name: "VIP Stack", desc: "All-in-one digital arsenal with lifetime updates.", price: 9990, img: "https://placehold.co/600x400/020203/bf00ff?text=VIP" }
    ];

    // --- RENDER ---
    function render() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        products.forEach(p => {
            const isOwned = purchases.some(x => x.id === p.id);
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-image"><img src="${p.img}" alt=""></div>
                    <div class="card-info">
                        <h3>${p.name}</h3>
                        <p>${p.desc}</p>
                    </div>
                    <button class="premium-btn ${isOwned?'owned':''}" ${isOwned?'':`onclick="startPay(${p.id})"`}>
                        ${isOwned ? 'OWNED' : `${p.price} ADI`}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
        
        // Tilt Effect for PC
        if (window.innerWidth > 1024) {
            document.querySelectorAll('.card').forEach(c => {
                c.onmousemove = (e) => {
                    const r = c.getBoundingClientRect();
                    c.style.transform = `perspective(1000px) rotateX(${(e.clientY - r.top - r.height/2)/10}deg) rotateY(${(e.clientX - r.left - r.width/2)/-10}deg)`;
                };
                c.onmouseleave = () => c.style.transform = '';
            });
        }
    }

    // --- PAY LOGIC ---
    window.startPay = (id) => {
        if (!currentUser) return openModal('auth');
        const p = products.find(x => x.id === id);
        document.getElementById('payName').textContent = p.name;
        document.getElementById('payAmount').textContent = p.price + ' ADI';
        window.activePayId = id;
        openModal('payment');
    };

    document.getElementById('cryptoCheckForm').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('txHash').value;
        const p = products.find(x => x.id === window.activePayId);
        
        const msg = `💎 <b>NEW PAYMENT</b>\nUser: ${currentUser}\nSum: ${p.price} ADI\nTX: <code>${hash}</code>`;
        
        await fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text: msg, parse_mode: 'HTML' })
        });

        purchases.push({ id: p.id });
        localStorage.setItem(`p_buy_${currentUser}`, JSON.stringify(purchases));
        alert('Verification request sent to Admin!');
        closeModals();
        render();
    };

    // --- UI HELPERS ---
    function openModal(id) { 
        closeModals();
        if(id === 'payment') document.getElementById('paymentModal').classList.remove('hidden');
        if(id === 'auth') document.getElementById('authModal').classList.remove('hidden');
    }
    
    function closeModals() { 
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); 
        document.getElementById('mainMenu').classList.remove('active');
    }

    document.getElementById('hamburgerBtn').onclick = () => document.getElementById('mainMenu').classList.add('active');
    document.querySelector('.close-menu-btn').onclick = closeModals;
    document.querySelector('.menu-blur').onclick = closeModals;
    document.querySelectorAll('.close-modal').forEach(b => b.onclick = closeModals);

    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        currentUser = document.getElementById('loginEmail').value;
        localStorage.setItem('p_user', currentUser);
        purchases = JSON.parse(localStorage.getItem(`p_buy_${currentUser}`)) || [];
        closeModals();
        render();
        location.reload();
    };

    document.getElementById('menuLogoutBtn').onclick = () => {
        localStorage.removeItem('p_user');
        location.reload();
    };

    document.getElementById('walletCopyBtn').onclick = () => {
        navigator.clipboard.writeText(CRYPTO_WALLET);
        alert('Wallet Copied!');
    };

    // Language
    document.querySelectorAll('.l-btn').forEach(b => {
        b.onclick = () => {
            currentLang = b.dataset.lang;
            document.querySelectorAll('.l-btn').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            updateLang();
        };
    });

    function updateLang() {
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.textContent = translations[currentLang][el.dataset.lang-key];
        });
        render();
    }

    render();
});
