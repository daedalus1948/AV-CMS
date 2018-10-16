class AbstractError extends Error { // use a fake abstract class/interface since ES6 does not provide native support
    constructor(name, statusCode, info) {
      super('custom error');  // call super(message) default constructor()
      this.custom = true; // check if this is custom or error (vs built-in or sequelize error)
      this.name = name; // General Error Name
      this.statusCode = statusCode; // HTTP Status Code
      this.info = info; // optional additional data (eg. invalid form error messages)
    }
}

class Error400 extends AbstractError {
    constructor(info) {
        super('Invalid User Input', '400', info);
    }
}

class Error401 extends AbstractError {
    constructor(info) {
        super('Not Authenticated', '401', info);
    }
}

class Error403 extends AbstractError {
    constructor(info) {
        super('Not Authorized', '403', info);
    }
}

class Error404 extends AbstractError {
    constructor(info) {
        super('Resource Not Found', '404', info);
    }
}

class Error500 extends AbstractError {
    constructor(info) {
        super('Server Error', '500', info);
    }
}

module.exports = {
    AbstractError,
    Error400,
    Error401,
    Error403,
    Error404,
    Error500
};



