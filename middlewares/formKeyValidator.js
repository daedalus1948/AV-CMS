const { Error400 } = require('../errors/errors.js');

// checks if submitted form has keys specified in the formKeySet argument present in its body

module.exports = function formKeyValidator(formKeySet) {
    return (req, res, next) => {
        for (let key in formKeySet) {
            if (req.body[key]==undefined)  { // req.body is always defined due to bodyParser middleware
                return next(new Error400()); // skip to error handlers
            }
        }
        return next();
    }
}