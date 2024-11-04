const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SurveyResponse = require('../models/SurveyResponse');

// Получение всех анкет и ответов для конкретного пользователя
router.get('/user', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("userId из токена:", userId);

        const userResponses = await SurveyResponse.find({ userId: userId }).populate('surveyId');
        console.log("Найденные ответы:", userResponses);

        if (!userResponses || userResponses.length === 0) {
            return res.status(404).json({ msg: 'Вы еще не прошли ни одной анкеты.' });
        }

        res.json(userResponses);
    } catch (error) {
        console.error('Ошибка при получении ответов пользователя:', error);
        res.status(500).json({ msg: 'Ошибка сервера.' });
    }
});


module.exports = router;
