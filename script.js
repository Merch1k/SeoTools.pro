document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('products-grid');
    
    // 1. ЗАГРУЗКА ТОВАРОВ ИЗ DB.JSON
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            grid.innerHTML = ''; // Очистить "Загрузка..."
            
            data.forEach(product => {
                const card = document.createElement('div');
                card.className = 'card';
                
                // Проверка: есть ли видео
                let videoHTML = '';
                if(product.video) {
                    videoHTML = `
                        <div class="video-container">
                            <video controls muted>
                                <source src="${product.video}" type="video/mp4">
                                Ваш браузер не поддерживает видео.
                            </video>
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div class="price-label">${product.term}</div>
                    <div class="card-term-badge">${product.term}</div>
                    <img src="${product.image}" alt="${product.title}">
                    <div class="card-content">
                        <h3>${product.title}</h3>
                        <p>${product.description}</p>
                        <button class="price-button">${product.price}</button>
                        ${videoHTML}
                    </div>
                    <div class="button-wrapper">
                         <button class="buy-button">${product.price}</button> <!-- Переименовал класс на buy-button -->
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => {
            grid.innerHTML = '<p style="color:red">Ошибка загрузки товаров. Проверьте db.json</p>';
            console.error(err);
        });

    // 2. ЛОГИКА АВТОРИЗАЦИИ (Имитация)
    const modal = document.getElementById('authModal');
    const authBtn = document.getElementById('authBtn');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const userProfile = document.getElementById('userProfile');
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    // Открыть окно
    authBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    // Закрыть окно
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Вход
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        
        // Здесь можно подключить реальную базу (Firebase), 
        // но пока сохраним вход в LocalStorage браузера
        localStorage.setItem('user', email);
        
        updateAuthUI(email);
        modal.classList.add('hidden');
    });

    // Выход
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        updateAuthUI(null);
    });

    // Проверка при загрузке страницы
    const savedUser = localStorage.getItem('user');
    if(savedUser) {
        updateAuthUI(savedUser);
    }

    function updateAuthUI(user) {
        if(user) {
            authBtn.classList.add('hidden');
            userProfile.classList.remove('hidden');
            userProfile.style.display = 'flex'; // flex для выравнивания
            userNameSpan.textContent = user;
        } else {
            authBtn.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
    }

});












