const { Error404 } = require('../errors/errors.js');

module.exports = class userService {

    constructor(DAO, SessionService) {
        this.DAO = DAO;
        this.sessionService = SessionService;
    }

    _buildPermissionTree (permissionData) { // builds a hashtable datastructure to help identify user permissions
        let permissionTree = {};
        for (let i = 0; i<permissionData.length; i++) {
            if (!permissionTree[permissionData[i]["Action"]]) { // if custom actions present
                permissionTree[permissionData[i]["Action"]] = {};
            }
            permissionTree[permissionData[i]["Action"]][permissionData[i]["TableName"]] = 1;
        }
        return permissionTree;
    }

    checkPermission(context) { // a helper function which checks if user has permission based on supplied action, resource
        return (action, resource) => {
            if (context[action] && context[action][resource]) {
                return true;
            }
            return false;
        };
    }

    buildUser(User, UserPermissions, login) { // build a user representation for buildReqeustUser middleware
        
        let permissionTree = this._buildPermissionTree(UserPermissions);
        
        return { 
            id: User.Id || null,
            email: User.Email || null,
            username: User.UserName || null,
            permissions: permissionTree, // returns {} if no permissions
            loggedIn: login || false,
            checkPermission: this.checkPermission(permissionTree) // returns false if no permission tree
        };
    }

    getUserPermissions(userID) {
        return this.DAO.sequelize.query(`
            SELECT Username, Rolename, Action, TableName
            FROM RolePermission
            JOIN UserRole ON RolePermission.RoleId=UserRole.RoleId
            JOIN Permission ON RolePermission.PermissionId=Permission.Id
            JOIN User ON UserRole.UserId=User.Id
            JOIN Role ON UserRole.RoleId=Role.Id
            WHERE UserId=:userID`,
            { replacements: { userID: userID}}
        )
        .then((info) => {
            let userPermissions = info[0]; // info == [data, metadata]
            if (userPermissions.length == 0) { 
                return [];
            }
            return userPermissions;
        });
    }

    getUser(userId) {
        let User; // use closure to keep state from previous promises in chain (and maintain chain)
        return this.DAO.User
        .findOne({ where: {Id: userId}})
        .then((UserData) => {
            if (!UserData) {
                throw new Error404([{message:'User not found'}]);
            }
            User = UserData;
            return this.getUserPermissions(UserData.Id);
        })
        .then((UserPerms)=>{
            return this.buildUser(User, UserPerms, true);
        });
    }

    createUser(username, password, email) { // we first need an existing role before we can create a user (foreign key contrainst UserRole)
        return this.DAO.sequelize.transaction((t)=>{
            let User;
            return this.DAO.User.create(
                {   
                    UserName: username,
                    Password: password,
                    Email: email
                },
                {
                    transaction: t
                })
                .then((UserData)=>{
                    User = UserData;
                    return this.DAO.UserRole.create({UserId: User.Id, RoleId:1}, {transaction: t})
                })
                .then((result)=>{
                    return User;
                })
        });
    }

    loginUser(username, password) {
        return this.DAO.User
            .findOne({ where: {Username: username}})
            .then((User) => {
                if (!User) {
                    throw new Error404([{message:'User not found'}]);
                }
                return User.authenticate(password);
            })
            .then((User) => {
                return this.sessionService.createSession(User.Id); // returns the Session Object
            });
    }
        
    logoutUser(sessionID) { // you are actually deleting/invalidating session from the request
        return this.sessionService.deleteSession(sessionID);
    }
    
}
