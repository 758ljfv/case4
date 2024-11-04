const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true,
    },
    surveyTitle: {
        type: String,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    answers: [
        {
            question: { type: String, required: true },
            answer: mongoose.Schema.Types.Mixed, // Mixed, т.к. ответы могут быть текстом, массивом или значением
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
