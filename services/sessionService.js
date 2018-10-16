const crypto = require('crypto');
const { Error404 } = require('../errors/errors.js');

module.exports = class sessionService {
    
    constructor(DAO) {
        this.DAO = DAO;
    }

    getSession(sessionID) {
        return this.DAO.Session
            .findOne({where: {Id: sessionID}, include: [{model:this.DAO.User, attributes: ['Username']}], raw: true})
            .then((SessionInstance) => {
                // Session may be empty and not found, handle in middleware
                return SessionInstance;
            });
    }

    createSession(userID) {
        return this.DAO.Session // returns the Session Object
            .create({Id: crypto.randomBytes(12).toString('hex'), UserId:userID,
                    Creation: Date.now(), Expiration: Date.now() + process.env.SESSION_DURATION}
            );   
    }

    deleteSession(sessionID) {
        return this.DAO.Session
            .findOne({ where: {Id: sessionID}})
            .then(Session => {
                if (!Session) {
                    throw new Error404([{message:'Session does not exist'}]);
                }
                return Session.destroy();
            });
    }

};


