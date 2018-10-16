const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Permission', { 
            Id: {
                type:Sequelize.BIGINT, 
                primaryKey: true,
                autoIncrement: true,
            },
            Action: {
                type:Sequelize.STRING, 
                allowNull:false,
                validate: {
                    isAlphanumeric: true
                }
            },
            TableName: {
                type:Sequelize.STRING, 
                allowNull:false,
                validate: {
                    isAlphanumeric: true
                }
            }
        },
        {
            timestamps: false,
            freezeTableName: true
        }
    );
}
