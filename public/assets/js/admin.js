document.addEventListener('DOMContentLoaded', async () => {
    console.log('admin.js подключен');
    // Получение токена из LocalStorage
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Вы не авторизованы. Пожалуйста, войдите в систему.');
        window.location.href = '/auth/login'; // Перенаправляем на страницу логина
        return;
    }

    try {
        // Проверяем роль пользователя
        const response = await fetch('/api/auth/verifyRole', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Нет доступа, требуется роль администратора.');
        }

        const data = await response.json();
        if (data.role !== 'admin') {
            window.location.href = '/auth/login'; // Перенаправляем на страницу логина
        } else {
            console.log('Я администратор')
        }

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка доступа.');
        window.location.href = '/auth/login'; // Перенаправляем на страницу логина
    }
});
