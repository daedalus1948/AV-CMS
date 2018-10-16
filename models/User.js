const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const { Error400 } = require('../errors/errors.js');

module.exports = (sequelize) => {
    const User = sequelize.define('User', { 
            Id: {
                type:Sequelize.BIGINT, 
                primaryKey: true,
                autoIncrement: true,
            },
            UserName: {
                type:Sequelize.STRING, 
                allowNull:false,
                unique: true, 
                validate: {
                    isAlphanumeric: true
                }
            },
            Password: {
                type:Sequelize.STRING, 
                allowNull:false,
                validate: {
                    isAlphanumeric: true
                }
            },
            Email: {
                type: Sequelize.STRING, 
                allowNull:false,
                unique: true,
                validate: {
                    isEmail: true
                }
            }
        },
        {   
            indexes: [
                {
                    fields: ['UserName']
                }
            ],
            timestamps: false,
            freezeTableName: true,
            hooks: {
                beforeCreate: (User, options) => {
                    return bcrypt.hash(User.Password, 10)
                        .then(hashedPassword => {
                            User.Password = hashedPassword;
                        })
                        .catch(error => {
                            console.log(error);
                        })
                }
            }
        }
    );

    User.prototype.authenticate = function (suppliedPassword) {
        return bcrypt.compare(suppliedPassword, this.Password)
            .then((status) => {
                if (status==false) {
                    throw new Error400([{message:"password does not match"}]);
                }
                return this; // returns the User instance
            })
            .catch((error) => {
                throw error;
            });
    };

    return User;
}