function buildRequestUser(sessionService, userService) {
    return (req, res, next) => {
        if (!req.cookies['session_id']) { // cookie doesnt exist
            req.user = userService.buildUser(User={}, [], login=false); // no user, login false
            //console.log(req.user);
            //console.log(req.user.checkPermission());
            return next();
        }
        sessionService.getSession(req.cookies['session_id'])
            .then((Session)=>{

                if (!Session || Date.now() > Session.Expiration) { // session doesnt exist or session expired
                    console.log(req.cookies['session_id']);
                    console.log(Session);
                    console.log(Date.now());
                    console.log(Session.Expiration);
                    throw new Error;
                }
                return userService.getUser(Session.UserId); // session found and session valid - you are logged in
            })
            .then((User)=>{ // User Object with permissions returned, assign to req.user for future use
                req.user = User; // user built login true (called buildUser with data internally)
                //console.log(User);
                return next();
            })
            .catch((error)=>{
                req.user = userService.buildUser(User={}, [], login=false); // no user, login false
                return next(); 
            }) 
    }
}

module.exports = buildRequestUser;


