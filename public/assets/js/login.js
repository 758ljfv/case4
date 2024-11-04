document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // Проверяем наличие сообщения о регистрации
    const successMessage = localStorage.getItem('registrationSuccess');

    if (successMessage) {
        // Создаем элемент для отображения сообщения
        const messageDiv = document.createElement('div');
        messageDiv.className = 'alert alert-success'; // Используем bootstrap для оформления
        messageDiv.textContent = successMessage;

        // Вставляем сообщение в начало страницы
        const container = document.querySelector('.container'); // Обёртка для содержимого страницы
        container.insertBefore(messageDiv, container.firstChild);

        // Удаляем сообщение из localStorage после отображения
        localStorage.removeItem('registrationSuccess');
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token); // Сохранение токена в localStorage
                window.location.href = '/';
            } else {
                alert(data.msg);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при входе.');
        }
    });
});
