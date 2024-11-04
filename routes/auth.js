const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    // Проверка наличия email и password
    if (!email || !password) {
        return res.status(400).json({ msg: 'Укажите пожалуйста email и пароль' });
    }

    try {
        // Проверка на существование пользователя с таким email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Пользователь с таким email уже существует' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role });

        await user.save();
        res.status(201).json({ msg: 'Регистрация успешна' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ошибка при регистрации' });
    }
});

// Маршрут для авторизации
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Проверка наличия email и password
    if (!email || !password) {
        return res.status(400).json({ msg: 'Укажите пожалуйста email и пароль' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Неверные учетные данные' });
        }

        // Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Неверные учетные данные' });
        }

        // Генерация токена
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Токен будет действителен 1 час
        });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ошибка при входе' });
    }
});

// Проверка роли пользователя
router.get('/verifyRole', auth, (req, res) => {
    res.json({ role: req.user.role });
});

module.exports = router;
