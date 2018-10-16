const validator = require('validator');

module.exports = function formSanitizer (req, res, next) {
    Object.keys(req.body).forEach((key)=>req.body[key] = validator.escape(req.body[key]));
    return next();
}


