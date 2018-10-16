const express = require('express');
const csurf = require('csurf');

const userController = require('../controllers/userController.js');
const UserService = require('../services/UserService.js');
const SessionService = require('../services/SessionService.js');
const MailerService = require('../services/MailerService.js');
const formSanitizer = require('../middlewares/formSanitizer.js');
const loginRequired = require('../middlewares/loginRequired.js');
const logoutRequired = require('../middlewares/logoutRequired.js');
const killCSRF = require('../middlewares/killCSRF.js');

const DAO = require('../models/core.js');

const router = express.Router(); 

_csrf = !process.env.ENVIRONMENT=="TEST" ? csurf({cookie: true}) : killCSRF;

router.get('/login', [_csrf, logoutRequired], userController.renderUserForm);
router.get('/logout', [_csrf, loginRequired], userController.renderUserForm);
router.get('/register', [_csrf], userController.renderUserForm);

router.post('/register',[_csrf, formSanitizer], userController.register(new UserService(DAO, new SessionService(DAO)), new MailerService()));
router.post('/login', [_csrf, logoutRequired, formSanitizer], userController.login(new UserService(DAO, new SessionService(DAO))));
router.post('/logout', [_csrf, loginRequired, formSanitizer], userController.logout(new UserService(DAO, new SessionService(DAO))));

module.exports = router;
