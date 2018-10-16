const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Session', 
        { 
            Id: {
                    type:Sequelize.STRING, 
                    primaryKey: true
                }
            ,
            Creation: Sequelize.BIGINT,
            Expiration: Sequelize.BIGINT
        },
        {
            timestamps: false,
            freezeTableName: true
        }
    );
}