// since express router does not support url constants like "route/::resource/:resourceID"
// being accessible as req.url.constants, inject manually the defined resource

function resourceInjector(resourceString) {
    return (req, res, next) => {
        if (!resourceString) {
            throw new Error('resource not specified');
        }
        req.resource = resourceString;
        return next();
    }
}


module.exports = resourceInjector;