document.addEventListener('DOMContentLoaded', () => {

    const TG_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471'
    };

    // 1. Загрузка товаров из db.json
    async function loadProducts() {
        try {
            const res = await fetch('db.json');
            const data = await res.json();
            const grid = document.getElementById('products-grid');
            
            grid.innerHTML = '';
            data.forEach((p, i) => {
                const card = document.createElement('div');
                card.className = 'spatial-card reveal';
                card.style.transitionDelay = `${i * 0.1}s`;
                card.innerHTML = `
                    <div class="card-glass-glow"></div>
                    <h3>${p.title}</h3>
                    <div class="price">${p.price}</div>
                    <p style="opacity:0.5; font-size:0.85rem; margin: 15px 0;">${p.description}</p>
                    <button class="action-btn" onclick="openPay('${p.title}', '${p.price}')">Get Access</button>
                `;
                grid.appendChild(card);
            });
            initSpatialEffects();
        } catch (e) { console.error("Error loading products", e); }
    }

    // 2. Эффекты visionOS (Параллакс окон)
    function initSpatialEffects() {
        // Плавное появление
        const observer = new IntersectionObserver(entries => {
            entries.forEach(en => { if(en.isIntersecting) en.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Параллакс при движении мыши (для Hero окна)
        const hero = document.querySelector('.hero-window');
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.pageX) / 50;
            const y = (window.innerHeight / 2 - e.pageY) / 50;
            if(hero) hero.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
        });
    }

    // 3. Логика оплаты
    window.openPay = (name, price) => {
        if(!localStorage.getItem('p_user')) {
            document.getElementById('authModal').classList.remove('hidden');
            return;
        }
        document.getElementById('payName').innerText = name;
        document.getElementById('payAmount').innerText = price;
        document.getElementById('paymentModal').classList.remove('hidden');
    };

    // Отправка в Telegram
    document.getElementById('cryptoForm').onsubmit = async (e) => {
        e.preventDefault();
        const user = localStorage.getItem('p_user');
        const hash = document.getElementById('txHash').value;
        const product = document.getElementById('payName').innerText;

        const text = `🛸 **SPATIAL ORDER**\nUser: ${user}\nProduct: ${product}\nTX Hash: ${hash}`;

        await fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text, parse_mode: 'Markdown' })
        });

        alert("Запрос на верификацию отправлен в систему!");
        closeModals();
    };

    // 4. UI Helpers
    function closeModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }

    document.querySelectorAll('.close-modal, .modal-backdrop').forEach(el => el.onclick = closeModals);
    document.getElementById('authBtn').onclick = () => document.getElementById('authModal').classList.remove('hidden');

    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('p_user', document.getElementById('loginEmail').value);
        location.reload();
    };

    document.getElementById('copyBtn').onclick = () => {
        navigator.clipboard.writeText("0xb472f207cac89DFC64A518d97535D3BbfEaf2FEB");
        alert("Wallet address copied!");
    };

    loadProducts();
});
