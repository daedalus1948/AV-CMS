const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Video', {
            Id: {
                type:Sequelize.BIGINT, 
                primaryKey: true,
                autoIncrement: true,
            }, 
            VideoName: {
                type:Sequelize.STRING,
                unique: true, 
                allowNull:false,
                validate: {
                    isAlphanumeric: true
                }
            },
            VideoFilePath: {
                type:Sequelize.STRING, 
                allowNull:false,
                validate: {
                    isAlphanumeric: true
                }
            }
        },
        {   
            indexes: [
                {
                    unique: true,
                    fields: ['VideoName']
                }
            ],
            timestamps: false,
            freezeTableName: true,
        }
    );
}
