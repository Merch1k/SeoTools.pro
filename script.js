document.addEventListener('DOMContentLoaded', () => {

    const TG_CONFIG = {
        token: '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA',
        chatId: '5683927471'
    };

    const langData = {
        ru: {
            heroTitle: "Spatial Intelligence", heroSub: "Будущее SEO-инструментов в дополненной реальности.",
            profile: "Профиль", userLabel: "Пользователь:", upload: "Сменить фото",
            confirm: "Подтвердить", authTitle: "Вход в систему", authBtn: "Войти", buy: "Купить"
        },
        en: {
            heroTitle: "Spatial Intelligence", heroSub: "The future of SEO tools in augmented reality.",
            profile: "Profile", userLabel: "User:", upload: "Upload Photo",
            confirm: "Verify", authTitle: "Sign In", authBtn: "Enter", buy: "Get Access"
        }
    };

    let curLang = localStorage.getItem('p_lang') || 'ru';
    let currentUser = localStorage.getItem('p_user');
    let products = [];

    // --- ИНИЦИАЛИЗАЦИЯ ---
    async function init() {
        try {
            const res = await fetch('db.json');
            products = await res.json();
            updateLangUI();
            renderCards();
            checkUser();
            loadAvatar();
        } catch (e) { console.error("Data error", e); }
    }

    function renderCards() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        products.forEach((p, i) => {
            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.transitionDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <h3>${p.title}</h3>
                <div class="price">${p.price}</div>
                <button class="action-btn" onclick="openPay('${p.title}', '${p.price}')" style="margin-top:15px">
                    ${langData[curLang].buy}
                </button>
            `;
            grid.appendChild(card);
        });
        setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('active')), 100);
    }

    // --- ЯЗЫК ---
    document.getElementById('langBtn').onclick = () => {
        curLang = curLang === 'ru' ? 'en' : 'ru';
        localStorage.setItem('p_lang', curLang);
        updateLangUI();
        renderCards();
    };

    function updateLangUI() {
        document.getElementById('langBtn').innerText = curLang.toUpperCase();
        document.getElementById('txt-hero-title').innerText = langData[curLang].heroTitle;
        document.getElementById('txt-hero-sub').innerText = langData[curLang].heroSub;
        document.getElementById('txt-profile-title').innerText = langData[curLang].profile;
        document.getElementById('txt-user-label').innerText = langData[curLang].userLabel;
        document.getElementById('txt-upload').innerText = langData[curLang].upload;
        document.getElementById('txt-confirm').innerText = langData[curLang].confirm;
        document.getElementById('txt-auth-title').innerText = langData[curLang].authTitle;
        document.getElementById('txt-auth-btn').innerText = langData[curLang].authBtn;
    }

    // --- ПРОФИЛЬ И АВАТАР ---
    document.getElementById('profileTrigger').onclick = () => {
        if (!currentUser) return document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('profileModal').classList.remove('hidden');
    };

    document.getElementById('avatarInput').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                localStorage.setItem(`p_avatar_${currentUser}`, base64);
                loadAvatar();
            };
            reader.readAsDataURL(file);
        }
    };

    function loadAvatar() {
        if (!currentUser) return;
        const saved = localStorage.getItem(`p_avatar_${currentUser}`);
        if (saved) {
            document.getElementById('userAvatar').src = saved;
            document.getElementById('modalAvatar').src = saved;
        }
    }

    // --- AUTH & PAY ---
    window.openPay = (title, price) => {
        if (!currentUser) return document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('payName').innerText = title;
        document.getElementById('payAmount').innerText = price;
        document.getElementById('paymentModal').classList.remove('hidden');
    };

    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        currentUser = document.getElementById('loginUser').value;
        localStorage.setItem('p_user', currentUser);
        location.reload();
    };

    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('p_user');
        location.reload();
    };

    function checkUser() {
        if (currentUser) document.getElementById('displayUserName').innerText = currentUser;
    }

    // Отправка в ТГ
    document.getElementById('payForm').onsubmit = async (e) => {
        e.preventDefault();
        const msg = `💎 ОПЛАТА\nUser: ${currentUser}\nItem: ${document.getElementById('payName').innerText}\nTX: ${document.getElementById('txHash').value}`;
        await fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text: msg })
        });
        alert("Wait for admin verify!");
        location.reload();
    };

    // Закрытие модалок
    document.querySelectorAll('.close-modal, .modal-backdrop').forEach(el => {
        el.onclick = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    });

    init();
});
