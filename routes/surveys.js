const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const SurveyResponse = require('../models/SurveyResponse');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');


// POST /api/surveys — создание новой анкеты (только для администраторов)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { title, questions } = req.body;

        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ msg: 'Название анкеты и хотя бы один вопрос обязательны.' });
        }

        const totalQuestions = questions.length; // Подсчитываем количество вопросов

        const survey = new Survey({
            title,
            questions,
            totalQuestions // Устанавливаем количество вопросов
        });

        await survey.save();
        res.status(201).json({ msg: 'Анкета успешно создана.' });
    } catch (error) {
        console.error('Ошибка при создании анкеты:', error);
        res.status(500).json({ msg: 'Ошибка сервера.' });
    }
});

// PUT /api/surveys/:id — редактирование анкеты (только для администраторов)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { title, questions } = req.body;

        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ msg: 'Название анкеты и хотя бы один вопрос обязательны.' });
        }

        const totalQuestions = questions.length; // Подсчитываем количество вопросов

        const survey = await Survey.findByIdAndUpdate(req.params.id, { title, questions, totalQuestions }, { new: true });

        if (!survey) {
            return res.status(404).json({ msg: 'Анкета не найдена.' });
        }

        res.status(200).json({ msg: 'Анкета успешно обновлена.' });
    } catch (error) {
        console.error('Ошибка при обновлении анкеты:', error);
        res.status(500).json({ msg: 'Ошибка сервера.' });
    }
});



// Получение всех анкет
router.get('/', async (req, res) => {
    try {
        const surveys = await Survey.find(); // Получаем все анкеты
        res.json(surveys);
    } catch (error) {
        console.error('Ошибка при получении анкет:', error);
        res.status(500).json({ msg: 'Ошибка сервера.' });
    }
});


// Получение анкеты по ID
router.get('/:id', async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) {
            return res.status(404).json({ msg: 'Анкета не найдена.' });
        }
        res.json(survey);
    } catch (error) {
        console.error('Ошибка при получении анкеты:', error);
        res.status(500).json({ msg: 'Ошибка сервера.' });
    }
});


// DELETE /api/surveys/:id — удаление анкеты (только для администраторов)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const survey = await Survey.findByIdAndDelete(req.params.id);

        if (!survey) {
            return res.status(404).json({ msg: 'Анкета не найдена.' });
        }

        res.status(200).json({ msg: 'Анкета успешно удалена.' });
    } catch (error) {
        console.error('Ошибка при удалении анкеты:', error);
        res.status(500).json({ msg: 'Ошибка сервера.' });
    }
});

// POST /api/surveys/:id/submit — отправка ответов на анкету
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const { answers } = req.body;
        const surveyId = req.params.id;
        const userId = req.user.id;

        if (!answers || answers.length === 0) {
            return res.status(400).json({ msg: 'Ответы обязательны.' });
        }

        const survey = await Survey.findById(surveyId);
        if (!survey) {
            return res.status(404).json({ msg: 'Анкета не найдена.' });
        }

        const surveyResponse = new SurveyResponse({
            surveyId: surveyId,
            surveyTitle: survey.title,
            totalQuestions: survey.totalQuestions,
            userId: userId,
            answers: answers
        });

        await surveyResponse.save();

        res.status(200).json({ msg: 'Ответы успешно сохранены.' });
    } catch (error) {
        console.error('Ошибка при отправке ответов:', error);
        res.status(500).json({ msg: 'Ошибка сервера.' });
    }
});




module.exports = router;
