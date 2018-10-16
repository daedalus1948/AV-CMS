// authorization service is dependent upon request.user
// should run only after login check
const { Error403 } = require('../errors/errors.js');

function userAuthCheck(req, res, next) {
    if (req.user.checkPermission(req.action, req.resource)) {
        return next(); // USER AUTHORIZATION SUCCESSFUL
    }
    return next(new Error403([{message:'Authorization failure'}])); // UUSER AUTH FAILURE
}


module.exports = userAuthCheck;