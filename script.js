document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // ⚙️ НАСТРОЙКИ (ВВЕДИТЕ СВОИ ДАННЫЕ)
    // ==========================================
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; // Например: '700123456:AAHi...'
    const TG_CHAT_ID = '5683927471';     // Например: '987654321'

    const SUBSCRIPTION_DURATION = 60000; // Для теста 1 мин
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    const translations = {
        ru: { buy: "Купить за", owned: "В библиотеке", payTitle: "Оплата через QIWI" },
        en: { buy: "Buy for", owned: "In Library", payTitle: "Payment via QIWI" }
    };

    const products = [
        { id: 1, title: "Parser Pro", price: 1500, description: "Сбор данных с любых сайтов в пару кликов.", image: "https://placehold.co/600x400/1e293b/4ade80?text=PARSER+PRO" },
        { id: 2, title: "Rank Tracker", price: 2500, description: "Точный мониторинг позиций в Google и Яндекс.", image: "https://placehold.co/600x400/1e293b/00ffff?text=RANK+TRACKER" },
        { id: 3, title: "SEO Audit", price: 3500, description: "Полный технический аудит вашего сайта.", image: "https://placehold.co/600x400/1e293b/ff00ff?text=SEO+AUDIT" },
        { id: 4, title: "Unlimited", price: 9990, description: "Доступ ко всем инструментам без ограничений.", image: "https://placehold.co/600x400/1e293b/ffff66?text=UNLIMITED" }
    ];

    let currentUser = localStorage.getItem('acus_user');
    let userPurchases = [];

    const grid = document.getElementById('products-grid');

    // --- ИНИЦИАЛИЗАЦИЯ ---
    function init() {
        if (currentUser) {
            let data = JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [];
            userPurchases = data.filter(p => p.expires > Date.now());
            document.getElementById('userNav').classList.remove('hidden');
            document.getElementById('guestNav').classList.add('hidden');
            document.getElementById('menuUserName').textContent = currentUser;
        }
        renderProducts();
    }

    function renderProducts() {
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
                    <button class="price-button" ${isOwned ? '' : `onclick="openPayment(${p.id})"`}>
                        ${isOwned ? translations.ru.owned : translations.ru.buy + ' ' + p.price + ' ₽'}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
        if (!isMobile) apply3D();
    }

    // --- ОПЛАТА QIWI ---
    window.openPayment = (id) => {
        if (!currentUser) return alert("Войдите в аккаунт!");
        const product = products.find(p => p.id === id);
        
        // Генерация ссылки на перевод QIWI
        const comment = `Оплата ${product.title} для ${currentUser}`;
        const qiwiUrl = `https://qiwi.com/payment/form/99?extra['account']=${QIWI_NUMBER}&amount=${product.price}&extra['comment']=${comment}&blocked[0]=account&blocked[1]=comment`;

        // Уведомление в Телеграм
        const tgMsg = `⚠️ <b>Ожидание оплаты!</b>\n👤 Юзер: ${currentUser}\n📦 Товар: ${product.title}\n💰 Сумма: ${product.price} руб.\n\nПроверьте кошелек!`;
        fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(tgMsg)}&parse_mode=HTML`);

        // Открываем QIWI в новой вкладке
        window.open(qiwiUrl, '_blank');

        // Показываем окно подтверждения
        if(confirm("Вы перешли на страницу оплаты. Нажмите ОК после оплаты, чтобы отправить запрос на активацию.")){
            alert("Ваш запрос отправлен. Администратор активирует подписку после проверки транзакции.");
        }
    };

    // --- 3D ЭФФЕКТ ---
    function apply3D() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `rotateX(${-y * 20}deg) rotateY(${x * 20}deg) scale(1.03)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `rotateX(0) rotateY(0) scale(1)`;
            });
        });
    }

    // --- МЕНЮ ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainMenu = document.getElementById('mainMenu');
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainMenu.classList.toggle('hidden');
    });

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('loginEmail').value;
        localStorage.setItem('acus_user', user);
        location.reload();
    });

    init();
});
