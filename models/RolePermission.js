const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('RolePermission', {
            Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            }
        },
        {
            timestamps: false,
            freezeTableName: true
        }
    );
}