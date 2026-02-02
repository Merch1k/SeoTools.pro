document.addEventListener('DOMContentLoaded', () => {

    // --- !!! НАСТРОЙКИ TELEGRAM !!! ---
    // Вставьте сюда токен, который дал @BotFather
    const TG_BOT_TOKEN = '8295559037:AAHQquYCqOdD9nGofg65ibGOmvLjYlR4QiA'; 
    // Вставьте сюда цифры вашего ID (от @userinfobot)
    const TG_CHAT_ID = '5683927471'; 

    // --- МОКОВЫЕ ДАННЫЕ ТОВАРОВ (Если db.json недоступен) ---
    const mockProducts = [
        { id: 1, title: "Parser Pro", description: "Сбор данных с сайтов", price: "1500 ₽", image: "https://via.placeholder.com/300/000000/FFFFFF/?text=Parser", file: "parser_setup.exe" },
        { id: 2, title: "Rank Tracker", description: "Проверка позиций", price: "2500 ₽", image: "https://via.placeholder.com/300/000000/FFFFFF/?text=Rank", file: "tracker_setup.zip" },
        { id: 3, title: "SEO Audit", description: "Технический аудит", price: "3000 ₽", image: "https://via.placeholder.com/300/000000/FFFFFF/?text=Audit", file: "audit_tool.dmg" }
    ];

    // --- ПЕРЕМЕННЫЕ СОСТОЯНИЯ ---
    let currentUser = localStorage.getItem('user'); // Текущий логин
    // Загружаем покупки из памяти браузера (ключ: purchases_ЛОГИН)
    let userPurchases = currentUser ? JSON.parse(localStorage.getItem(`purchases_${currentUser}`)) || [] : [];
    
    // Товар, который сейчас пытаются купить
    let currentProductToBuy = null;

    // --- ЭЛЕМЕНТЫ DOM ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainMenu = document.getElementById('mainMenu');
    
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const menuUserName = document.getElementById('menuUserName');
    
    // Кнопки меню
    const menuLoginBtn = document.getElementById('menuLoginBtn');
    const menuRegisterBtn = document.getElementById('menuRegisterBtn');
    const menuLogoutBtn = document.getElementById('menuLogoutBtn');
    const menuLibraryBtn = document.getElementById('menuLibraryBtn'); // НОВАЯ КНОПКА

    // Модальные окна
    const authModal = document.getElementById('authModal');
    const regModal = document.getElementById('regModal');
    const paymentModal = document.getElementById('paymentModal');
    const libraryModal = document.getElementById('libraryModal');
    
    // Элементы оплаты
    const paymentForm = document.getElementById('paymentForm');
    const paymentProductName = document.getElementById('paymentProductName');
    const paymentProductPrice = document.getElementById('paymentProductPrice');

    // Кнопки закрытия
    document.querySelectorAll('.close, .close-reg, .close-payment, .close-library').forEach(btn => {
        btn.addEventListener('click', () => {
            authModal.classList.add('hidden');
            regModal.classList.add('hidden');
            paymentModal.classList.add('hidden');
            libraryModal.classList.add('hidden');
        });
    });

    // --- ФУНКЦИИ ИНТЕРФЕЙСА ---

    // Обновление шапки (показать/скрыть меню юзера)
    function updateAuthUI(user) {
        if(user) {
            guestNav.classList.add('hidden');
            userNav.classList.remove('hidden');
            menuUserName.textContent = user;
            // Подгружаем покупки для конкретного юзера
            userPurchases = JSON.parse(localStorage.getItem(`purchases_${user}`)) || [];
        } else {
            guestNav.classList.remove('hidden');
            userNav.classList.add('hidden');
            userPurchases = [];
        }
        // Перерисовываем товары, чтобы обновить кнопки (Купить/Куплено)
        renderProducts(mockProducts);
    }

    // Рендеринг карточек
    function renderProducts(products) {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Проверяем, куплен ли товар
            const isPurchased = userPurchases.includes(product.id);

            // Текст и стиль кнопки в зависимости от статуса
            let btnText = isPurchased ? 'Куплено' : 'Купить';
            let btnClass = isPurchased ? 'price-button owned-btn' : 'price-button';
            let clickAction = isPurchased ? '' : `onclick="initiateBuy(${product.id})"`;

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="card-info-block">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                </div>
                <button class="${btnClass}" ${clickAction}>
                    ${isPurchased ? '<i class="fa fa-check"></i> ' : ''} 
                    ${isPurchased ? 'В библиотеке' : product.price}
                </button>
            `;
            grid.appendChild(card);
        });
    }

    // --- ЛОГИКА ПОКУПКИ ---

    // 1. Нажатие на кнопку "Купить"
    window.initiateBuy = (productId) => {
        if (!currentUser) {
            alert("Сначала войдите в аккаунт!");
            authModal.classList.remove('hidden');
            return;
        }

        const product = mockProducts.find(p => p.id === productId);
        if (product) {
            currentProductToBuy = product;
            paymentProductName.textContent = product.title;
            paymentProductPrice.textContent = product.price;
            paymentModal.classList.remove('hidden');
        }
    };

    // 2. Обработка формы оплаты
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btn = paymentForm.querySelector('button');
            const originalText = btn.textContent;
            
            // Имитация обработки (крутилка)
            btn.textContent = 'Обработка...';
            btn.disabled = true;

            setTimeout(() => {
                // УСПЕШНАЯ ОПЛАТА
                if (currentProductToBuy) {
                    // Добавляем ID товара в массив покупок
                    userPurchases.push(currentProductToBuy.id);
                    // Сохраняем в память браузера
                    localStorage.setItem(`purchases_${currentUser}`, JSON.stringify(userPurchases));
                    
                    alert('Оплата прошла успешно! Товар добавлен в библиотеку.');
                    
                    paymentModal.classList.add('hidden');
                    paymentForm.reset();
                    
                    // Обновляем вид товаров (кнопка станет "Куплено")
                    renderProducts(mockProducts);
                }
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000); // 2 секунды задержки
        });
    }

    // --- ЛОГИКА БИБЛИОТЕКИ (СКАЧИВАНИЕ) ---

    // Открытие окна библиотеки
    if (menuLibraryBtn) {
        menuLibraryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mainMenu.classList.add('hidden'); // Закрыть меню
            renderLibrary();
            libraryModal.classList.remove('hidden');
        });
    }

    function renderLibrary() {
        const listContainer = document.getElementById('libraryList');
        listContainer.innerHTML = '';

        if (userPurchases.length === 0) {
            listContainer.innerHTML = '<p style="color: #ccc; text-align: center;">У вас пока нет покупок.</p>';
            return;
        }

        // Проходим по купленным ID и ищем товары
        userPurchases.forEach(id => {
            const product = mockProducts.find(p => p.id === id);
            if (product) {
                const item = document.createElement('div');
                item.className = 'library-item';
                item.innerHTML = `
                    <span class="library-item-title">${product.title}</span>
                    <a href="#" class="download-btn" onclick="downloadFile('${product.file}')">
                        <i class="fa fa-download"></i> Скачать
                    </a>
                `;
                listContainer.appendChild(item);
            }
        });
    }

    // Функция скачивания (Имитация)
    window.downloadFile = (fileName) => {
        alert(`Начинается скачивание файла: ${fileName}\n(Это демо-режим)`);
    };


    // --- СТАНДАРТНАЯ ЛОГИКА (ВХОД / МЕНЮ) ---
    
    // Бургер меню
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainMenu.classList.toggle('hidden');
    });

    // Открытие модалок из меню
    menuLoginBtn.addEventListener('click', () => { authModal.classList.remove('hidden'); mainMenu.classList.add('hidden'); });
    menuRegisterBtn.addEventListener('click', () => { regModal.classList.remove('hidden'); mainMenu.classList.add('hidden'); });

    // ВХОД (Упрощенный)
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const login = document.getElementById('loginEmail').value;
        // Просто сохраняем логин
        localStorage.setItem('user', login);
        currentUser = login;
        updateAuthUI(login);
        authModal.classList.add('hidden');
        alert(`Добро пожаловать, ${login}!`);
    });

    // ВЫХОД
    menuLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        currentUser = null;
        updateAuthUI(null);
        mainMenu.classList.add('hidden');
    });

    // Инициализация при загрузке
    updateAuthUI(currentUser);
});


