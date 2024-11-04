const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ msg: 'Нет доступа, требуется роль администратора.' });
};

module.exports = admin;
