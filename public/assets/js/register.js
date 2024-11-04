document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(registerForm);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role')
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                localStorage.setItem('registrationSuccess', 'Вы успешно прошли регистрацию.');
                window.location.href = '/auth/login';
            } else {
                const errorData = await response.json();
                alert(errorData.msg || 'Произошла ошибка при регистрации.');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при отправке данных на сервер.');
        }
    });
});
