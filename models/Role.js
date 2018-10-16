const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Role', { 
            Id: {
                type:Sequelize.BIGINT, 
                primaryKey: true,
                autoIncrement: true,
            },
            RoleName: {
                type:Sequelize.STRING, 
                allowNull:false,
                unique: true, 
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