// header.js
function createHeader() {
    const header = document.createElement('nav');
    header.className = 'navbar navbar-expand-lg navbar-light bg-light';

    header.innerHTML = `
        <div class="container">
            <a class="navbar-brand" href="/">Анкетирование</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/profile/">Профиль</a>
                    </li>
                    <li class="nav-item" id="adminLink" style="display: none;">
                        <a class="nav-link" href="/admin/">Администрирование</a>
                    </li>
                </ul>
                <span class="navbar-text" id="welcomeMessage"></span>
                <a class="btn btn-outline-danger ml-3" href="/auth/login" onclick="logout()">Выйти</a>
            </div>
        </div>
    `;

    document.body.prepend(header);
}

// Функция для выхода из системы
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login'; // Перенаправление на страницу входа
}

// Функция для инициализации заголовка
function initializeHeader() {
    createHeader();
    const token = localStorage.getItem('token');

    if (token) {
        // Декодируем токен, чтобы получить информацию о пользователе
        const payload = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('welcomeMessage').textContent = `Добро пожаловать, ${payload.email}!`;

        // Проверяем роль пользователя
        if (payload.role === 'admin') {
            document.getElementById('adminLink').style.display = 'block'; // Показываем ссылку на администрирование
        }
    }
}
