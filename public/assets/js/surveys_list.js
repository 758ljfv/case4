document.addEventListener('DOMContentLoaded', async () => {

    const successMessage = localStorage.getItem('surveyAddSuccess');
    if (successMessage) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'alert alert-success';
        messageDiv.textContent = successMessage;
        const container = document.querySelector('.message');
        container.insertBefore(messageDiv, container.firstChild);
        localStorage.removeItem('surveyAddSuccess');
    }


    const surveysTableBody = document.getElementById('surveysTableBody');

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/surveys', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Не удалось получить анкеты.');
        }

        const surveys = await response.json();
        if (surveys.length === 0) {
            surveysTableBody.innerHTML = '<tr><td colspan="3">Нет анкет</td></tr>';
            return;
        }

        surveys.forEach(survey => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${survey.title}</td>
                <td>${new Date(survey.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editSurvey('${survey._id}')">Редактировать</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSurvey('${survey._id}')">Удалить</button>
                </td>
            `;
            surveysTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при получении анкет:', error);
        alert('Ошибка при получении анкет.');
    }
});

// Функция для редактирования анкеты
function editSurvey(surveyId) {
    // Перенаправляем на страницу редактирования с ID анкеты
    window.location.href = `/admin/edit/?id=${surveyId}`;
}

// Функция для удаления анкеты
async function deleteSurvey(surveyId) {
    if (!confirm('Вы уверены, что хотите удалить эту анкету?')) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/surveys/${surveyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            alert('Анкета успешно удалена.');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Ошибка: ${errorData.msg}`);
        }
    } catch (error) {
        console.error('Ошибка при удалении анкеты:', error);
        alert('Ошибка при удалении анкеты.');
    }
}
