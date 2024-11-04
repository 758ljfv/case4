document.addEventListener('DOMContentLoaded', async () => {
    const surveyContainer = document.getElementById('surveyContainer');

    // Получаем ID анкеты из URL
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');

    if (!surveyId) {
        surveyContainer.innerHTML = '<p class="text-danger">Анкета не найдена.</p>';
        return;
    }

    // Проверяем наличие токена
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/login';
        return;
    }

    // Загружаем анкету по ID
    try {
        const response = await fetch(`/api/surveys/${surveyId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Не удалось загрузить анкету.');
        }

        const survey = await response.json();

        // Отображаем заголовок анкеты
        surveyContainer.innerHTML = `<h2 class="text-center mb-4">${survey.title}</h2>`;

        survey.questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question mb-3';
            questionDiv.innerHTML = `
                <p><strong>Вопрос ${index + 1}:</strong> ${question.text}</p>
            `;

            // Добавляем варианты ответа, если есть
            if (question.type === 'multiple-choice' || question.type === 'radio') {
                const optionsContainer = document.createElement('div');
                question.options.forEach(option => {
                    const optionInput = document.createElement('input');
                    optionInput.type = question.type === 'radio' ? 'radio' : 'checkbox';
                    optionInput.name = `question_${index}`;
                    optionInput.value = option;
                    optionInput.className = 'mr-2'; // Отступы

                    const optionLabel = document.createElement('label');
                    optionLabel.textContent = option;
                    optionLabel.className = 'mr-4'; // Отступы

                    optionsContainer.appendChild(optionInput);
                    optionsContainer.appendChild(optionLabel);
                });
                questionDiv.appendChild(optionsContainer);
            } else {
                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.className = 'form-control';
                textInput.name = `question_${index}`;
                textInput.placeholder = 'Введите ваш ответ...';
                questionDiv.appendChild(textInput);
            }

            surveyContainer.appendChild(questionDiv);
        });

        // Добавляем кнопку для отправки ответов
        const submitButton = document.createElement('button');
        submitButton.className = 'btn btn-primary btn-block';
        submitButton.textContent = 'Отправить ответы';
        submitButton.addEventListener('click', submitSurvey);
        surveyContainer.appendChild(submitButton);

    } catch (error) {
        console.error('Ошибка при загрузке анкеты:', error);
        surveyContainer.innerHTML = '<p class="text-danger">Ошибка при загрузке анкеты.</p>';
    }
});

// Функция для отправки ответов
async function submitSurvey() {
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');
    const token = localStorage.getItem('token');

    const answers = Array.from(document.querySelectorAll('.question')).map(questionDiv => {
        const questionText = questionDiv.querySelector('p').textContent;
        const inputs = questionDiv.querySelectorAll('input');

        let answer;
        if (inputs[0].type === 'radio') {
            const selectedOption = Array.from(inputs).find(input => input.checked);
            answer = selectedOption ? selectedOption.value : null;
        } else if (inputs[0].type === 'checkbox') {
            answer = Array.from(inputs).filter(input => input.checked).map(input => input.value);
        } else {
            answer = inputs[0].value;
        }

        return { question: questionText, answer };
    });

    try {
        const response = await fetch(`/api/surveys/${surveyId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ answers })
        });

        if (response.ok) {
            localStorage.setItem('surveyResponseSuccess', 'Ваши ответы успешно отправлены, вы можете проверить их в профиле!');
            window.location.href = '/';
        } else {
            const errorData = await response.json();
            alert(`Ошибка: ${errorData.msg}`);
        }
    } catch (error) {
        console.error('Ошибка при отправке ответов:', error);
        alert('Ошибка при отправке ответов.');
    }
}
