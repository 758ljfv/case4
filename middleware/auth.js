const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token:', token);

    if (!token) {
        return res.status(401).json({ msg: 'Нет токена, авторизация отклонена' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.error('Ошибка токена: ', error);
        return res.status(401).json({ msg: 'Недействительный токен' });
    }
};

module.exports = auth;
