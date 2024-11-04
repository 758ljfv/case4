const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true }, // Текст вопроса
    type: { type: String, required: true }, // Тип вопроса
    options: { type: [String] } // Массив вариантов (если это множественный выбор или радиокнопки)
});

const surveySchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [questionSchema], // Массив вопросов
    createdAt: { type: Date, default: Date.now }, // Дата создания
    totalQuestions: { type: Number, default: 0 }, // Количество вопросов
});

module.exports = mongoose.model('Survey', surveySchema);
