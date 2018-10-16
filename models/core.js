const Sequelize = require('sequelize'); // ORM for postgres
const config = require('./config.js');

// create the DAO Sequelize object connection
const sequelize = new Sequelize(config[(process.env.ENVIRONMENT)]);

// create the tables
const Audio = require('./Audio.js')(sequelize);
const Video = require('./Video.js')(sequelize);
const Permission = require('./Permission.js')(sequelize);
const User = require('./User.js')(sequelize);
const Role = require('./Role.js')(sequelize);
const UserRole = require('./UserRole.js')(sequelize);
const RolePermission = require('./RolePermission.js')(sequelize);
const Session = require('./Session.js')(sequelize);

// associations
User.belongsToMany(Role, {through: UserRole});
Role.belongsToMany(User, {through: UserRole});
Role.belongsToMany(Permission, {through: RolePermission});
Permission.belongsToMany(Role, {through: RolePermission});
User.hasMany(Audio);
Audio.belongsTo(User);
User.hasMany(Video);
Video.belongsTo(User);

Session.belongsTo(User);

module.exports = {
    sequelize,
    Audio,
    Video,
    Permission,
    User,
    Role,
    UserRole,
    RolePermission,
    Session
};
