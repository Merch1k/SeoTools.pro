document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const CFG = {
        tgBot: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        tgChat: '5683927471',
        wallet: 'UQBKg4_q8x5v2J1z...YOUR_WALLET'
    };

    const DICT = {
        ru: { headerTitle: "Цифровой Суверенитет", headerDesc: "Инструменты для профессионального доминирования.", loginBtn: "Вход", registerBtn: "Регистрация", logoutBtn: "Выход", myPurchases: "Арсенал", authBtn: "Авторизация", checkBtn: "Подтвердить", buy: "Доступ" },
        en: { headerTitle: "Digital Sovereignty", headerDesc: "Tools for professional dominance.", loginBtn: "Entry", registerBtn: "Join", logoutBtn: "Exit", myPurchases: "Arsenal", authBtn: "Authenticate", checkBtn: "Confirm", buy: "Access" }
    };

    let lang = localStorage.getItem('lang') || 'ru';
    let currentUser = localStorage.getItem('user');

    const items = [
        { id: 1, title: "Parser Pro", desc: "Data extraction architecture.", price: 1500, img: "https://placehold.co/600x400/000/fff?text=PARSER" },
        { id: 2, name: "Neural Rank", desc: "AI-powered global tracking.", price: 2500, img: "https://placehold.co/600x400/000/fff?text=NEURAL" },
        { id: 3, name: "Audit Core", desc: "Infrastructure vulnerability scan.", price: 3500, img: "https://placehold.co/600x400/000/fff?text=AUDIT" },
        { id: 4, name: "Sovereign", desc: "Full ecosystem access.", price: 9990, img: "https://placehold.co/600x400/000/fff?text=VIP" }
    ];

    // --- RENDER ENGINE ---
    function render() {
        const grid = document.getElementById('mainGrid');
        const purchases = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
        grid.innerHTML = '';

        items.forEach(item => {
            const isBought = purchases.some(p => p.id === item.id);
            const el = document.createElement('div');
            el.className = 'card-unit';
            el.innerHTML = `
                <div class="card-padding">
                    <div class="card-visual"><img src="${item.img}" alt=""></div>
                    <div class="card-head">
                        <h3>${item.name || item.title}</h3>
                        <p>${item.desc}</p>
                    </div>
                    <button class="btn-purchase ${isBought ? 'active' : ''}" ${!isBought ? `onclick="sysPay(${item.id})"` : ''}>
                        ${isBought ? 'AUTHORIZED' : `${DICT[lang].buy} — ${item.price} ADI`}
                    </button>
                </div>
            `;
            grid.appendChild(el);
        });

        // Initialize Ray Tracing
        if(window.innerWidth > 1024) initRayTracing();
    }

    function initRayTracing() {
        document.querySelectorAll('.card-unit').forEach(card => {
            card.onmousemove = e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                
                // Subtle Tilt
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rotateX = ((y - cy) / cy) * -2; // Очень тонкий наклон
                const rotateY = ((x - cx) / cx) * 2;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            };
            card.onmouseleave = () => {
                card.style.transform = '';
            };
        });
    }

    function sync() {
        currentUser = localStorage.getItem('user');
        document.getElementById('guestState').classList.toggle('hidden', !!currentUser);
        document.getElementById('userState').classList.toggle('hidden', !currentUser);
        if(currentUser) document.getElementById('displayUser').innerText = currentUser;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            el.innerText = DICT[lang][el.dataset.langKey];
        });
        
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });
        
        render();
    }

    // --- ACTIONS ---
    window.sysPay = (id) => {
        if(!currentUser) return openModal('authOverlay');
        const item = items.find(i => i.id === id);
        document.getElementById('payLabel').innerText = (item.name || item.title).toUpperCase();
        document.getElementById('payValue').innerText = item.price + ' ADI';
        window.tempId = id;
        openModal('payOverlay');
    };

    document.getElementById('formPay').onsubmit = async (e) => {
        e.preventDefault();
        const hash = document.getElementById('inHash').value;
        const item = items.find(i => i.id === window.tempId);
        
        await fetch(`https://api.telegram.org/bot${CFG.tgBot}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: CFG.tgChat, text: `🏛 VAULT: ${currentUser}\nItem: ${item.name}\nTX: ${hash}` })
        });

        let list = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
        list.push({ id: item.id });
        localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(list));
        
        closeAll();
        render();
        alert('Transaction verified.');
    };

    document.getElementById('formAuth').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('user', document.getElementById('inUser').value);
        sync();
        closeAll();
    };

    document.getElementById('lnkOut').onclick = () => {
        localStorage.removeItem('user');
        sync();
        closeAll();
    };

    // --- UX ---
    function openModal(id) { document.getElementById(id).classList.add('active'); }
    function closeAll() { 
        document.querySelectorAll('.modal-overlay, .drawer').forEach(el => el.classList.remove('active', 'open')); 
    }

    document.getElementById('triggerMenu').onclick = () => document.getElementById('appDrawer').classList.add('open');
    document.querySelectorAll('.close-icon, .drawer-backdrop, .modal-backdrop').forEach(b => b.onclick = closeAll);
    document.querySelectorAll('.lang-btn').forEach(b => b.onclick = () => {
        lang = b.dataset.lang;
        localStorage.setItem('lang', lang);
        sync();
    });
    
    document.getElementById('lnkLogin').onclick = () => { closeAll(); openModal('authOverlay'); };
    document.getElementById('lnkReg').onclick = () => { closeAll(); openModal('authOverlay'); };
    
    document.getElementById('btnCopy').onclick = () => {
        navigator.clipboard.writeText(CFG.wallet);
        alert('Secure clipboard copy.');
    };

    sync();
});
