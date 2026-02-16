document.addEventListener('DOMContentLoaded', () => {

    const TG_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471'
    };

    // Рендер карточек из твоего db.json
    async function loadProducts() {
        try {
            const response = await fetch('db.json');
            const data = await response.json();
            const grid = document.getElementById('products-grid');
            
            grid.innerHTML = '';
            data.forEach((p, i) => {
                const card = document.createElement('div');
                card.className = 'vision-card reveal';
                card.style.transitionDelay = `${i * 0.1}s`;
                card.innerHTML = `
                    <h3>${p.title}</h3>
                    <span class="price">${p.price}</span>
                    <p style="color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 25px;">${p.description}</p>
                    <button class="glass-btn" style="width: 100%" onclick="openPay('${p.title}', '${p.price}')">Купить</button>
                `;
                grid.appendChild(card);
            });
            initAnimate();
        } catch (e) { console.error(e); }
    }

    function initAnimate() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(en => { if(en.isIntersecting) en.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    window.openPay = (name, price) => {
        if(!localStorage.getItem('p_user')) {
            document.getElementById('authModal').classList.remove('hidden');
            return;
        }
        document.getElementById('payName').innerText = name;
        document.getElementById('payAmount').innerText = price;
        document.getElementById('paymentModal').classList.remove('hidden');
    };

    // Обработка форм
    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('p_user', document.getElementById('loginEmail').value);
        location.reload();
    };

    document.getElementById('cryptoCheckForm').onsubmit = async (e) => {
        e.preventDefault();
        const user = localStorage.getItem('p_user');
        const name = document.getElementById('payName').innerText;
        const tx = document.getElementById('txHash').value;
        
        const text = `💎 НОВАЯ ОПЛАТА\nUser: ${user}\nProduct: ${name}\nTX: ${tx}`;
        
        await fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text })
        });
        
        alert("Заявка отправлена администратору!");
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    };

    // UI Helpers
    document.getElementById('hamburgerBtn').onclick = () => document.getElementById('mainMenu').classList.add('active');
    document.querySelectorAll('.close-modal, .modal-backdrop, .menu-blur').forEach(el => {
        el.onclick = () => {
            document.querySelectorAll('.modal, .side-menu-overlay').forEach(m => m.classList.add('hidden', 'active'));
            location.reload(); // для простоты сброса классов
        }
    });

    loadProducts();
});
