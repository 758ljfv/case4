document.addEventListener('DOMContentLoaded', async () => {
    const surveysContainer = document.getElementById('surveysContainer');

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/login'; // Перенаправляем на логин
        return;
    }

    try {
        const surveysResponse = await fetch('/api/surveys', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!surveysResponse.ok) {
            if (surveysResponse.status === 401) {
                window.location.href = '/auth/login';
                return;
            }
            throw new Error('Не удалось получить анкеты.');
        }

        const surveys = await surveysResponse.json();

        if (surveys.length === 0) {
            surveysContainer.innerHTML = '<p>Нет доступных анкет.</p>';
            return;
        }

        const responsesResponse = await fetch('/api/answers/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        let userResponses = [];
        if (responsesResponse.ok) {
            userResponses = await responsesResponse.json();
        }

        // Добавляем проверку, чтобы исключить null-значения surveyId
        const completedSurveyIds = Array.isArray(userResponses)
            ? userResponses
                .filter(response => response.surveyId) // Исключаем объекты без surveyId
                .map(response => response.surveyId._id)
            : [];

        surveys.forEach(survey => {
            const surveyDiv = document.createElement('div');
            surveyDiv.className = 'card mb-3';

            if (completedSurveyIds.includes(survey._id)) {
                surveyDiv.classList.add('border-danger');
                surveyDiv.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${survey.title}</h5>
                        <p class="text-danger">Вы уже прошли эту анкету.</p>
                    </div>
                `;
            } else {
                surveyDiv.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${survey.title}</h5>
                        <button class="btn btn-primary" onclick="startSurvey('${survey._id}')">Пройти анкету</button>
                    </div>
                `;
            }

            surveysContainer.appendChild(surveyDiv);
        });
    } catch (error) {
        console.error('Ошибка при загрузке анкет:', error);
        surveysContainer.innerHTML = '<p>Ошибка при загрузке анкет.</p>';
    }

    const successMessage = localStorage.getItem('surveyResponseSuccess');
    if (successMessage) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'alert alert-success';
        messageDiv.textContent = successMessage;
        const container = document.querySelector('.message');
        container.insertBefore(messageDiv, container.firstChild);
        localStorage.removeItem('surveyResponseSuccess');
    }
});

function startSurvey(surveyId) {
    window.location.href = `/question/?id=${surveyId}`;
}
