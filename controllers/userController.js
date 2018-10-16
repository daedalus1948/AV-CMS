function register(userService, mailerService) {
    return (req, res, next) => {
        return userService.createUser(req.body.UserName, req.body.Password, req.body.Email)
            .then((user)=>{
                res.render('index.ejs', {template: 'user/success.ejs', templateData: { user: req.user}});
            })
            .catch((error)=>{
                next(error);
        })
    }
}

function login(userService) {
    return (req, res, next) => {
        return userService.loginUser(req.body.UserName, req.body.Password)
            .then((Session)=>{
                res.cookie("session_id", Session.Id, { httpOnly:true });
                res.redirect('/'); // all ok, get back to index
            })
            .catch((error)=>{
                next(error);
            })
    }
}

function logout(userService) {
    return (req, res, next) => {
        return userService.logoutUser(req.cookies['session_id']) // use cookie to identify which user to logout
            .then(()=>{
                res.clearCookie('session_id'); // kill the cookie
                res.redirect('/'); // all ok, get back to index
            })
            .catch((error)=>{
                next(error);
            })  
    }
}

function renderUserForm(req, res, next) {
    
    let templateForm = {
        "/register": 'user/register.ejs',
        "/login": 'user/login.ejs',
        "/logout": 'user/logout.ejs'
    }[req.url];

    res.render('index.ejs', {template: templateForm, templateData: {user: req.user, _csrf:req.csrfToken()}});
}


module.exports = {
    renderUserForm: renderUserForm,
    register: register,
    login: login,
    logout: logout
};
