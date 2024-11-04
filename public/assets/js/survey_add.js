document.addEventListener('DOMContentLoaded', () => {
    console.log('survey_add.js загружен и готов');

    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionButton = document.getElementById('addQuestion');
    const surveyForm = document.getElementById('surveyForm');
    const surveyTitleInput = document.getElementById('surveyTitle'); // Поле для названия анкеты

    // Добавление нового вопроса
    addQuestionButton.addEventListener('click', () => {
        console.log('Кнопка "Добавить вопрос" нажата');

        const questionDiv = document.createElement('div');
        questionDiv.className = 'question mb-3 border p-3 rounded bg-light'; // Добавляем стили

        questionDiv.innerHTML = `
            <div class="form-group">
                <label for="questionText">Текст вопроса</label>
                <input type="text" class="form-control" placeholder="Введите текст вопроса" required />
            </div>
            <div class="form-group">
                <label for="questionType">Тип вопроса</label>
                <select class="form-control question-type">
                    <option value="text">Текст</option>
                    <option value="multiple-choice">Множественный выбор</option>
                    <option value="radio">Радиокнопки</option>
                </select>
            </div>
            <div class="options-container"></div>
            <button type="button" class="btn btn-secondary add-option" style="display: none;">Добавить вариант</button>
            <button type="button" class="btn btn-danger remove-question">Удалить вопрос</button>
        `;

        questionsContainer.appendChild(questionDiv);

        const questionTypeSelect = questionDiv.querySelector('.question-type');
        const addOptionButton = questionDiv.querySelector('.add-option');
        const optionsContainer = questionDiv.querySelector('.options-container');

        // Удаление вопроса
        const removeQuestionButton = questionDiv.querySelector('.remove-question');
        removeQuestionButton.addEventListener('click', () => {
            questionDiv.remove(); // Удаляем вопрос
        });

        // Показываем или скрываем кнопку Добавить вариант в зависимости от выбранного типа вопроса
        questionTypeSelect.addEventListener('change', () => {
            if (questionTypeSelect.value === 'text') {
                addOptionButton.style.display = 'none';
                optionsContainer.innerHTML = ''; // Очищаем варианты для типа "текст"
            } else {
                addOptionButton.style.display = 'inline-block';
            }
        });

        // Обработчик для добавления вариантов ответа
        addOptionButton.addEventListener('click', () => {
            const optionInput = document.createElement('div');
            optionInput.className = 'option-container input-group mb-2'; // Добавляем стили для варианта
            optionInput.innerHTML = `
                <input type="text" class="form-control" placeholder="Вариант ответа" required />
                <div class="input-group-append">
                    <button type="button" class="btn btn-danger remove-option">Удалить</button>
                </div>
            `;
            optionsContainer.appendChild(optionInput);

            // Удаление варианта ответа
            const removeOptionButton = optionInput.querySelector('.remove-option');
            removeOptionButton.addEventListener('click', () => {
                optionInput.remove(); // Удаляем вариант
            });
            console.log('Добавлен вариант ответа');
        });
    });

    // Отправка анкеты на сервер
    surveyForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Форма отправлена, предотвращение перезагрузки');

        const surveyTitle = surveyTitleInput.value; // Получаем название анкеты
        if (!surveyTitle) {
            alert('Пожалуйста, введите название анкеты.');
            return;
        }

        const questions = Array.from(document.querySelectorAll('.question')).map(question => {
            const questionText = question.querySelector('input[type="text"]').value;
            const questionType = question.querySelector('select').value;
            const options = Array.from(question.querySelectorAll('.options-container .option-container input')).map(input => input.value).filter(value => value !== '');

            // Проверка на пустой вопрос
            if (!questionText) {
                alert('Вопрос не может быть пустым.');
                return null;
            }

            // Проверка для типов "multiple" и "radio" на наличие вариантов
            if ((questionType === 'multiple-choice' || questionType === 'radio') && options.length === 0) {
                alert('Пожалуйста, добавьте хотя бы один вариант ответа.');
                return null; // Возвращаем null для вопроса без вариантов
            }

            return {
                text: questionText,
                type: questionType,
                options: options.length > 0 ? options : undefined
            };
        }).filter(question => question !== null); // Убираем пустые вопросы из массива

        if (questions.length === 0) {
            alert('Пожалуйста, добавьте хотя бы один вопрос.');
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/surveys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title: surveyTitle, questions }),
            });

            if (response.ok) {
                localStorage.setItem('surveyAddSuccess', 'Анкета успешно создана!');
                window.location.href = '/admin';
            } else {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.msg}`);
            }
        } catch (error) {
            console.error('Ошибка при создании анкеты:', error);
            alert('Ошибка при создании анкеты.');
        }
    });
});
