document.addEventListener('DOMContentLoaded', () => {

    // --- ДАННЫЕ (4 ТОВАРА) ---
    // Используем надежные ссылки для картинок (цвета в стиле ACUS)
    const products = [
        { 
            id: 1, 
            title: "Parser Pro", 
            description: "Сбор данных с любых сайтов в пару кликов.", 
            price: 1500, 
            image: "https://placehold.co/600x400/1e293b/4ade80?text=PARSER+PRO",
            file: "parser_setup.exe"
        },
        { 
            id: 2, 
            title: "Rank Tracker", 
            description: "Точный мониторинг позиций в Google и Яндекс.", 
            price: 2500, 
            image: "https://placehold.co/600x400/1e293b/00ffff?text=RANK+TRACKER",
            file: "rank_tracker.zip"
        },
        { 
            id: 3, 
            title: "SEO Audit", 
            description: "Полный технический аудит вашего сайта.", 
            price: 3500, 
            image: "https://placehold.co/600x400/1e293b/ff00ff?text=SEO+AUDIT",
            file: "audit_tool.dmg"
        },
        { 
            id: 4, 
            title: "Unlimited", 
            description: "Доступ ко всем инструментам без ограничений.", 
            price: 9990, 
            image: "https://placehold.co/600x400/1e293b/ffff66?text=UNLIMITED+VIP",
            file: "acus_full_pack.rar"
        }
    ];

    // --- СОСТОЯНИЕ (LOCALSTORAGE) ---
    // Проверяем, кто зашел
    let currentUser = localStorage.getItem('acus_user');
    // Загружаем покупки для этого пользователя
    let userPurchases = currentUser ? JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [] : [];
    
    let currentProductToBuy = null;

    // --- DOM ЭЛЕМЕНТЫ ---
    const grid = document.getElementById('products-grid');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainMenu = document.getElementById('mainMenu');
    
    // Панели меню
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const menuUserName = document.getElementById('menuUserName');
    
    // Кнопки меню
    const menuLoginBtn = document.getElementById('menuLoginBtn');
    const menuRegisterBtn = document.getElementById('menuRegisterBtn');
    const menuLogoutBtn = document.getElementById('menuLogoutBtn');
    const menuLibraryBtn = document.getElementById('menuLibraryBtn');

    // Модальные окна
    const authModal = document.getElementById('authModal');
    const regModal = document.getElementById('regModal');
    const paymentModal = document.getElementById('paymentModal');
    const libraryModal = document.getElementById('libraryModal');

    // --- ФУНКЦИЯ ОТРИСОВКИ ТОВАРОВ ---
    function renderProducts() {
        grid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Проверка на покупку
            const isOwned = userPurchases.includes(product.id);
            
            // Настройка кнопки
            let btnClass = isOwned ? 'price-button owned' : 'price-button';
            let btnText = isOwned ? '<i class="fa fa-check"></i> В библиотеке' : `Купить за ${product.price} ₽`;
            let clickAttr = isOwned ? '' : `onclick="buyProduct(${product.id})"`;

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="card-info-block">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                </div>
                <button class="${btnClass}" ${clickAttr}>
                    ${btnText}
                </button>
            `;
            grid.appendChild(card);
        });
    }

    // --- ЛОГИКА ПОКУПКИ ---
    // Глобальная функция, чтобы работала из HTML onclick
    window.buyProduct = (id) => {
        if (!currentUser) {
            alert('Сначала войдите в аккаунт!');
            authModal.classList.remove('hidden');
            return;
        }
        currentProductToBuy = products.find(p => p.id === id);
        if(currentProductToBuy) {
            document.getElementById('payName').textContent = currentProductToBuy.title;
            document.getElementById('payAmount').textContent = currentProductToBuy.price + ' ₽';
            paymentModal.classList.remove('hidden');
        }
    };

    // Обработка формы оплаты
    document.getElementById('paymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        
        btn.textContent = 'Обработка...';
        btn.disabled = true;

        setTimeout(() => {
            // Сохраняем покупку
            if(currentProductToBuy) {
                userPurchases.push(currentProductToBuy.id);
                localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
                
                alert('Оплата прошла успешно!');
                paymentModal.classList.add('hidden');
                e.target.reset();
                renderProducts(); // Обновляем кнопки
            }
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1500);
    });

    // --- БИБЛИОТЕКА ---
    if(menuLibraryBtn) {
        menuLibraryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mainMenu.classList.add('hidden');
            renderLibrary();
            libraryModal.classList.remove('hidden');
        });
    }

    function renderLibrary() {
        const list = document.getElementById('libraryList');
        list.innerHTML = '';
        if(userPurchases.length === 0) {
            list.innerHTML = '<p style="color:#aaa">У вас пока нет купленных программ.</p>';
        } else {
            userPurchases.forEach(id => {
                const p = products.find(prod => prod.id === id);
                if(p) {
                    list.innerHTML += `
                        <div class="lib-item">
                            <span>${p.title}</span>
                            <a href="#" class="download-link" onclick="alert('Скачивание файла: ${p.file}')">
                                <i class="fa fa-download"></i> Скачать
                            </a>
                        </div>
                    `;
                }
            });
        }
    }

    // --- АВТОРИЗАЦИЯ ---
    function updateAuthUI() {
        if(currentUser) {
            guestNav.classList.add('hidden');
            userNav.classList.remove('hidden');
            menuUserName.textContent = currentUser;
        } else {
            guestNav.classList.remove('hidden');
            userNav.classList.add('hidden');
        }
        renderProducts(); // Перерисовать, т.к. статус покупок зависит от юзера
    }

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const login = document.getElementById('loginEmail').value;
        if(login) {
            currentUser = login;
            localStorage.setItem('acus_user', login);
            // Подгружаем покупки этого юзера
            userPurchases = JSON.parse(localStorage.getItem(`purchases_${login}`)) || [];
            
            updateAuthUI();
            authModal.classList.add('hidden');
            alert(`Добро пожаловать, ${login}!`);
        }
    });

    if(menuLogoutBtn) {
        menuLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('acus_user');
            currentUser = null;
            userPurchases = [];
            updateAuthUI();
            mainMenu.classList.add('hidden');
        });
    }

    // --- УПРАВЛЕНИЕ МЕНЮ И МОДАЛКАМИ ---
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainMenu.classList.toggle('hidden');
    });

    if(menuLoginBtn) menuLoginBtn.addEventListener('click', () => { authModal.classList.remove('hidden'); mainMenu.classList.add('hidden'); });
    if(menuRegisterBtn) menuRegisterBtn.addEventListener('click', () => { regModal.classList.remove('hidden'); mainMenu.classList.add('hidden'); });

    // Закрытие (крестики)
    document.querySelectorAll('.close, .close-reg, .close-payment, .close-library').forEach(btn => {
        btn.addEventListener('click', () => {
            authModal.classList.add('hidden');
            regModal.classList.add('hidden');
            paymentModal.classList.add('hidden');
            libraryModal.classList.add('hidden');
        });
    });

    // Инициализация
    updateAuthUI();
});
