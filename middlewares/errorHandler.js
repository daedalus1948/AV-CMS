const { Error400, Error500} = require('../errors/errors.js');

function errorHandler (error, req, res, next) {
    let customError;
    if (error.custom) { // if it is already a custom error of this application
        customError = error;
    } 
    else if (error.name=='SequelizeValidationError' || error.name=='SequelizeUniqueConstraintError') { // render form with errors LATER, now return 400 generic
        customError = new Error400(error.errors); // .errors is from Sequelize.ValidationError
    }
    else { // if not a custom error or the sequelize validation error, handle like generic 500
        customError = new Error500();
    }
    let templateContex = {template:'error.ejs', templateData: {"error": customError, user: req.user}};
    res.status(customError.statusCode).render('index.ejs', templateContex);
};

module.exports = errorHandler;
