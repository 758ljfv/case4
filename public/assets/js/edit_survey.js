document.addEventListener('DOMContentLoaded', async () => {
    const surveyForm = document.getElementById('surveyForm');
    const surveyTitleInput = document.getElementById('surveyTitle');
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionButton = document.getElementById('addQuestion');

    // Получаем ID анкеты из URL
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');

    // Загрузка анкеты по ID
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/surveys/${surveyId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Не удалось загрузить анкету.');
        }

        const surveyData = await response.json();
        surveyTitleInput.value = surveyData.title;

        // Заполнение вопросов анкеты
        surveyData.questions.forEach(question => {
            addQuestion(question.text, question.type, question.options);
        });
    } catch (error) {
        console.error('Ошибка при загрузке анкеты:', error);
        alert('Ошибка при загрузке анкеты.');
    }

    // Функция для добавления нового вопроса
    function addQuestion(text = '', type = 'text', options = []) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question mb-3'; // Добавляем отступ

        questionDiv.innerHTML = `
            <div class="card mb-3 lig">
                <div class="card-header">
                    <input type="text" class="form-control" placeholder="Текст вопроса" value="${text}" required />
                </div>
                <div class="card-body">
                    <div>Тип:</div>
                    <select class="form-control question-type">
                        <option value="text" ${type === 'text' ? 'selected' : ''}>Текст</option>
                        <option value="multiple-choice" ${type === 'multiple-choice' ? 'selected' : ''}>Множественный выбор</option>
                        <option value="radio" ${type === 'radio' ? 'selected' : ''}>Радиокнопки</option>
                    </select>
                    <div class="mt-3">Варианты:</div>
                    <div class="options-container"></div>
                    <button type="button" class="btn btn-secondary add-option mt-3">Добавить вариант</button>
                    <button type="button" class="btn btn-danger remove-question mt-3">Удалить вопрос</button>
                </div>
            </div>
        `;

        questionsContainer.appendChild(questionDiv);

        // Элементы для управления типом вопроса и добавлением вариантов
        const questionTypeSelect = questionDiv.querySelector('.question-type');
        const addOptionButton = questionDiv.querySelector('.add-option');
        const optionsContainer = questionDiv.querySelector('.options-container');
        const removeQuestionButton = questionDiv.querySelector('.remove-question');

        // Функция для обновления видимости кнопки "Добавить вариант"
        function updateAddOptionButtonVisibility() {
            if (questionTypeSelect.value === 'text') {
                addOptionButton.style.display = 'none';
                optionsContainer.innerHTML = ''; // Очистка вариантов для типа "текст"
            } else {
                addOptionButton.style.display = 'inline-block';
            }
        }

        // Инициализация видимости кнопки при создании вопроса
        updateAddOptionButtonVisibility();

        // Слушатель изменения типа вопроса
        questionTypeSelect.addEventListener('change', updateAddOptionButtonVisibility);

        // Заполнение вариантов, если они уже заданы
        options.forEach(option => {
            addOption(option);
        });

        // Функция для добавления нового варианта
        function addOption(optionValue = '') {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-container mb-2';
            optionDiv.innerHTML = `
                <input type="text" class="form-control" placeholder="Вариант ответа" value="${optionValue}" />
                <button type="button" class="btn btn-danger remove-option mt-2">Удалить вариант</button>
            `;
            optionsContainer.appendChild(optionDiv);

            // Обработчик для удаления варианта
            optionDiv.querySelector('.remove-option').addEventListener('click', () => {
                optionDiv.remove(); // Удаляем вариант
            });
        }

        // Обработчик для добавления нового варианта
        addOptionButton.addEventListener('click', () => {
            addOption(); // Вызываем функцию для добавления нового варианта
        });

        // Обработчик для удаления вопроса
        removeQuestionButton.addEventListener('click', () => {
            questionDiv.remove(); // Удаляем вопрос
        });
    }

    // Обработчик для добавления нового вопроса
    addQuestionButton.addEventListener('click', () => {
        addQuestion(); // Вызываем функцию без параметров для создания нового вопроса
    });

    // Отправка обновленных данных анкеты на сервер
    surveyForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const surveyTitle = surveyTitleInput.value.trim(); // Убираем пробелы
        if (!surveyTitle) {
            alert('Пожалуйста, введите название анкеты.'); // Проверка на пустое название
            return;
        }

        const questions = Array.from(document.querySelectorAll('.question')).map(question => {
            const questionText = question.querySelector('input[type="text"]').value.trim(); // Убираем пробелы
            const questionType = question.querySelector('select').value;
            const options = Array.from(question.querySelectorAll('.options-container input'))
                .map(input => input.value.trim())
                .filter(value => value); // Убираем пустые варианты

            if (!questionText) {
                alert('Вопрос не может быть пустым.'); // Проверка на пустой вопрос
                return null;
            }

            if (questionType !== 'text' && options.length === 0) {
                alert('Для вопросов с выбором необходимо добавить хотя бы один вариант.'); // Проверка на отсутствие вариантов
                return null;
            }

            return {
                text: questionText,
                type: questionType,
                options: options.length > 0 ? options : undefined
            };
        }).filter(question => question !== null); // Убираем пустые вопросы из массива

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/api/surveys/${surveyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title: surveyTitle, questions }),
            });

            if (response.ok) {
                window.location.href = '/admin/';
            } else {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.msg}`);
            }
        } catch (error) {
            console.error('Ошибка при обновлении анкеты:', error);
            alert('Ошибка при обновлении анкеты.');
        }
    });
});
