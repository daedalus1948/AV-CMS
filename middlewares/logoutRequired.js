const { Error500 } = require('../errors/errors.js');

module.exports =  (req, res, next) => {
    if (!req.user.loggedIn) {
        return next();
    }
    return next(new Error500);
}

