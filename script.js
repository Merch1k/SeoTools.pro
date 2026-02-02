// === КОНФИГУРАЦИЯ И ДАННЫЕ ===
const products = [
    {
        id: 1,
        title: "SEO Parser Pro",
        desc: "Автоматический сбор данных и анализ конкурентов.",
        price: 2500,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=80",
        file: "parser_pro_setup.exe"
    },
    {
        id: 2,
        title: "Rank Tracker AI",
        desc: "Мониторинг позиций с использованием нейросетей.",
        price: 3900,
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=500&q=80",
        file: "rank_tracker_v2.zip"
    },
    {
        id: 3,
        title: "Backlink Manager",
        desc: "Управление ссылочной массой и аудит.",
        price: 1990,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80",
        file: "backlink_manager.dmg"
    },
    {
        id: 4,
        title: "Complete Suite",
        desc: "Полный доступ ко всем инструментам (VIP).",
        price: 7500,
        image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=500&q=80",
        file: "nexus_suite_full.rar"
    }
];

// Глобальное состояние
let state = {
    user: localStorage.getItem('nexus_user') || null,
    library: JSON.parse(localStorage.getItem('nexus_library')) || [] // Массив ID купленных товаров
};

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    renderProducts();
    renderLibrary();
});

// === РЕНДЕРИНГ ТОВАРОВ ===
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    products.forEach(product => {
        const isOwned = state.library.includes(product.id);
        
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-img">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="card-info">
                <h3>${product.title}</h3>
                <p>${product.desc}</p>
                ${getButtonHtml(product, isOwned)}
            </div>
        `;
        grid.appendChild(card);
    });
}

function getButtonHtml(product, isOwned) {
    if (isOwned) {
        return `<button class="price-btn download" onclick="downloadFile('${product.file}')">
                    <i class="fa fa-download"></i> Скачать
                </button>`;
    } else {
        return `<button class="price-btn" onclick="initiatePurchase(${product.id})">
                    Купить за ${product.price} ₽
                </button>`;
    }
}

// === ЛОГИКА АВТОРИЗАЦИИ ===
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    
    // Имитация входа
    state.user = username;
    localStorage.setItem('nexus_user', username);
    
    closeModal('loginModal');
    updateAuthUI();
    showToast(`Добро пожаловать, ${username}`);
});

function logout() {
    state.user = null;
    localStorage.removeItem('nexus_user');
    updateAuthUI();
    showToast('Вы вышли из системы');
}

function updateAuthUI() {
    const authBtns = document.getElementById('authButtons');
    const userBtns = document.getElementById('userButtons');
    const libSection = document.getElementById('librarySection');
    const usernameDisplay = document.getElementById('displayUsername');

    if (state.user) {
        authBtns.classList.add('hidden');
        userBtns.classList.remove('hidden');
        libSection.classList.remove('hidden');
        usernameDisplay.textContent = state.user;
    } else {
        authBtns.classList.remove('hidden');
        userBtns.classList.add('hidden');
        libSection.classList.add('hidden');
    }
}

// === ЛОГИКА ПОКУПКИ ===
let currentProcessingId = null;

function initiatePurchase(id) {
    if (!state.user) {
        openModal('loginModal');
        showToast('Сначала войдите в аккаунт');
        return;
    }

    currentProcessingId = id;
    const product = products.find(p => p.id === id);
    
    // Заполняем модалку оплаты
    document.getElementById('paymentItemName').textContent = `Товар: ${product.title}`;
    document.getElementById('paymentItemPrice').textContent = `${product.price} ₽`;
    
    openModal('paymentModal');
}

// Обработка формы оплаты
document.getElementById('paymentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const btnText = document.getElementById('payBtnText');
    const spinner = document.getElementById('paySpinner');
    
    // Анимация загрузки
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    setTimeout(() => {
        // Успешная оплата
        completePurchase();
        
        // Сброс кнопки
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        closeModal('paymentModal');
        document.getElementById('paymentForm').reset();
    }, 2000); // 2 секунды задержка
});

function completePurchase() {
    if (!state.library.includes(currentProcessingId)) {
        state.library.push(currentProcessingId);
        localStorage.setItem('nexus_library', JSON.stringify(state.library));
        
        renderProducts(); // Обновить кнопки на "Скачать"
        renderLibrary();  // Добавить в список
        showToast('Оплата прошла успешно!');
        scrollToLibrary();
    }
}

// === ЛИЧНЫЙ КАБИНЕТ (БИБЛИОТЕКА) ===
function renderLibrary() {
    const libGrid = document.getElementById('libraryGrid');
    libGrid.innerHTML = '';

    if (state.library.length === 0) {
        libGrid.innerHTML = '<p class="empty-text" style="color:#666">Библиотека пуста.</p>';
        return;
    }

    state.library.forEach(id => {
        const product = products.find(p => p.id === id);
        if (product) {
            const item = document.createElement('div');
            item.className = 'lib-item';
            item.innerHTML = `
                <div>
                    <strong style="color:white">${product.title}</strong>
                    <div style="font-size:0.8rem; color:#666">Лицензия активна</div>
                </div>
                <a href="#" class="download-link" onclick="downloadFile('${product.file}')">
                    <i class="fa fa-cloud-download-alt"></i> Скачать
                </a>
            `;
            libGrid.appendChild(item);
        }
    });
}

// === УТИЛИТЫ ===
function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function scrollToLibrary() {
    document.getElementById('librarySection').scrollIntoView({ behavior: 'smooth' });
}

function downloadFile(filename) {
    showToast(`Началась загрузка: ${filename}`);
    // Здесь реальная логика скачивания, для демо просто алерт
}

// Закрытие по клику вне окна
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.add('hidden');
    }
}
