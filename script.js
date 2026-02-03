document.addEventListener('DOMContentLoaded', () => {

    const MY_TON_ADDRESS = 'ВАШ_TON_КОШЕЛЕК'; // <--- ЗАМЕНИТЕ
    const ADI_RATE = 600; // Курс 1 ADI = 600 RUB (примерно)

    let currentUser = localStorage.getItem('acus_user');
    let userPurchases = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
    let currentOrder = null;
    let checkInterval = null;

    const products = [ 
        { id: 1, title: "Parser Pro", description: "Премиум парсинг данных.", price: 1500, image: "https://placehold.co/600x400/1e293b/4ade80?text=PARSER" }, 
        { id: 2, title: "Rank Tracker", description: "Мониторинг позиций 24/7.", price: 2500, image: "https://placehold.co/600x400/1e293b/00ffff?text=RANK" },
        { id: 3, title: "SEO Audit", description: "Полный аудит сайта.", price: 3500, image: "https://placehold.co/600x400/1e293b/ff00ff?text=AUDIT" },
        { id: 4, title: "Unlimited", description: "VIP доступ ко всему.", price: 9990, image: "https://placehold.co/600x400/1e293b/ffff66?text=VIP" }
    ];

    async function checkPayment() {
        if (!currentOrder) return;
        try {
            const res = await fetch(`https://toncenter.com/api/v2/getTransactions?address=${MY_TON_ADDRESS}&limit=10`);
            const data = await res.json();
            if (data.ok && data.result) {
                for (let tx of data.result) {
                    const msg = tx.in_msg.message || "";
                    const val = parseFloat(tx.in_msg.value) / 1000000000;
                    if (msg === currentOrder.memo && val >= (currentOrder.amount * 0.98)) {
                        userPurchases.push({ id: currentOrder.productId, expires: Date.now() + 2592000000 });
                        localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
                        alert("Оплата ADI принята!");
                        location.reload();
                    }
                }
            }
        } catch (e) { console.log("Проверка..."); }
    }

    window.buyProduct = (id) => {
        if (!currentUser) { alert("Войдите в аккаунт!"); return; }
        const p = products.find(x => x.id === id);
        const amount = (p.price / ADI_RATE).toFixed(2);
        const memo = `ADI_${Math.floor(Math.random()*90000+10000)}`;
        currentOrder = { productId: id, amount, memo };

        document.getElementById('payName').textContent = p.title;
        document.getElementById('payAmount').textContent = `${amount} ADI`;
        document.getElementById('walletAddr').value = MY_TON_ADDRESS;
        document.getElementById('payMemo').value = memo;
        document.getElementById('paymentModal').classList.remove('hidden');

        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(checkPayment, 15000);
    };

    function render() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = products.map(p => {
            const owned = userPurchases.some(x => x.id === p.id);
            return `
                <div class="card">
                    <div class="card-content">
                        <div class="card-img-wrapper"><img src="${p.image}"></div>
                        <div class="card-info-block"><h3>${p.title}</h3><p>${p.description}</p></div>
                        <button class="price-button" ${owned ? '' : `onclick="buyProduct(${p.id})"`}>
                            ${owned ? 'В библиотеке' : p.price + ' ₽'}
                        </button>
                    </div>
                </div>`;
        }).join('');
        apply3D();
    }

    function apply3D() {
        document.querySelectorAll('.card').forEach(card => {
            const move = (e) => {
                const rect = card.getBoundingClientRect();
                const cx = e.touches ? e.touches[0].clientX : e.clientX;
                const cy = e.touches ? e.touches[0].clientY : e.clientY;
                const x = (cx - rect.left) / rect.width - 0.5;
                const y = (cy - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(1000px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) scale3d(1.02, 1.02, 1.02)`;
            };
            card.addEventListener('mousemove', move);
            card.addEventListener('touchmove', move);
            card.addEventListener('mouseleave', () => card.style.transform = '');
            card.addEventListener('touchend', () => card.style.transform = '');
        });
    }

    // Меню и Авторизация
    document.getElementById('hamburgerBtn').onclick = (e) => {
        e.stopPropagation();
        document.getElementById('mainMenu').classList.toggle('hidden');
    };
    document.onclick = () => document.getElementById('mainMenu').classList.add('hidden');
    
    document.getElementById('menuLoginBtn').onclick = () => document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('acus_user', document.getElementById('loginEmail').value);
        location.reload();
    };
    document.getElementById('menuLogoutBtn').onclick = () => {
        localStorage.removeItem('acus_user');
        location.reload();
    };

    if(currentUser) {
        document.getElementById('guestNav').classList.add('hidden');
        document.getElementById('userNav').classList.remove('hidden');
        document.getElementById('menuUserName').innerHTML = `<i class="fa fa-user"></i> ${currentUser}`;
    }

    // Аврора
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        document.querySelector('.aurora.one').style.transform = `translate(${x*50}px, ${y*50}px)`;
    });

    render();
});
