const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Регистрация нового пользователя
exports.register = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Проверка, существует ли пользователь с таким email
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Пользователь с таким email уже существует' });
        }

        user = new User({ email, password, role });

        // Хэширование пароля
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Генерация токена
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ошибка сервера' });
    }
};

// Авторизация пользователя
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Неверные учетные данные' });
        }

        // Сравнение паролей
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Неверные учетные данные' });
        }

        // Генерация токена
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ошибка сервера' });
    }
};
