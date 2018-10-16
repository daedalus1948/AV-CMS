function actionInjector(actionString) {
    return (req, res, next) => {
        if (!actionString) {
            throw new Error('action not specified');
        }
        req.action = actionString;
        return next();
    }
}

module.exports = actionInjector;