const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Audio', {
            Id: {
                type:Sequelize.BIGINT, 
                primaryKey: true,
                autoIncrement: true,
            }, 
            SongName: {
                type:Sequelize.STRING,
                unique: true, 
                allowNull:false,
                validate: {
                    isAlphanumeric: true
                }
            },
            AudioFilePath: {
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
                    fields: ['SongName']
                }
            ],
            timestamps: false,
            freezeTableName: true,
        }
    );
}
