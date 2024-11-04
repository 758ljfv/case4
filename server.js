require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const auth = require('./middleware/auth');
const admin = require('./middleware/admin');
const Survey = require('./models/Survey');
const answers = require('./routes/answers');

const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/surveys', require('./routes/surveys'));
app.use('/api/answers', answers);
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile', 'index.html'));
});


// Обработчик для страницы создания анкеты (только для администраторов)
app.get('/admin/create', [auth, admin], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'create.html'));
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
