module.exports = (req, res, next) => {
    req.csrfToken = ()=>{};
    return next();
};
