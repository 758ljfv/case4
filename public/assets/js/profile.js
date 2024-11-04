document.addEventListener('DOMContentLoaded', async () => {
    console.log('profile.js add');

    const profileContainer = document.getElementById('profileContainer');
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/auth/login';
        return;
    }

    try {
        const response = await fetch('/api/answers/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                profileContainer.innerHTML = '<p>Вы еще не прошли ни одной анкеты.</p>';
                return;
            }
            throw new Error('Ошибка при получении ответов.');
        }

        const userResponses = await response.json();

        if (userResponses.length === 0) {
            profileContainer.innerHTML = '<p>Вы еще не прошли ни одной анкеты.</p>';
            return;
        }

        userResponses.forEach(response => {
            const surveyDiv = document.createElement('div');
            surveyDiv.className = 'card mb-3';

            const uniqueCanvasId = `chart-${response._id}`; // Используем ID ответа на анкету для уникального графика
            surveyDiv.innerHTML = `
        <div class="card-body row">
            <div class="col-6">
                <h5 class="card-title">Анкета: ${response.surveyTitle}</h5>
                <p><strong>Ваши ответы:</strong></p>
                ${renderAnswers(response.answers)}
            </div>
            <div style="width: 100%; height: auto;" class="col-6">
                <canvas id="${uniqueCanvasId}" width="400" height="200"></canvas>
            </div>
        </div>
    `;
            profileContainer.appendChild(surveyDiv);

            // Подсчет отвеченных вопросов
            const answeredCount = response.answers.filter(answer =>
                answer.answer !== null &&
                answer.answer !== undefined &&
                answer.answer !== '' &&
                (!Array.isArray(answer.answer) || answer.answer.length > 0)
            ).length;

            const totalQuestions = response.totalQuestions;

            console.log(`Создание графика для анкеты: ${response.surveyTitle}`);
            console.log(`Отвеченные: ${answeredCount}, Всего вопросов: ${totalQuestions}`);

            // Создаю график, показывающий количество отвеченных вопросов
            createChart(answeredCount, totalQuestions, uniqueCanvasId); // Используем уникальный ID для каждого ответа
        });
    } catch (error) {
        console.error('Ошибка при загрузке ответов пользователя:', error);
        profileContainer.innerHTML = '<p>Ошибка при загрузке ответов.</p>';
    }
});

// Функция для рендеринга ответов пользователя
function renderAnswers(answers) {
    return answers.map(answer => `
        <div>
            <p><strong>Вопрос:</strong> ${answer.question}</p>
            <p><strong>Ответ:</strong> ${Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}</p>
        </div>
    `).join('');
}

//объект для хранения графиков
const charts = {};

//Функция для создания графика
function createChart(answeredCount, totalQuestions, canvasId) {
    // Проверка, существует ли график с таким ID
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    const ctx = document.getElementById(canvasId).getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ответили', 'Не ответили'],
            datasets: [{
                label: 'Вопросы',
                data: [answeredCount, totalQuestions - answeredCount],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((tooltipItem.raw / total) * 100);
                            return `${tooltipItem.label}: ${tooltipItem.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
