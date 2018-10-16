const express = require ('express');
const morgan = require('morgan');
const bodyParser= require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // automatically sets security HTML headers

const combinedRouter = require('./routes/combinedRouter.js');
const errorHandler = require('./middlewares/errorHandler.js');
const DAO = require('./models/core.js');
const buildRequestUser = require('./middlewares/buildRequestUser.js'); // application wide
const UserService = require('./services/UserService.js');
const SessionService = require('./services/sessionService.js');

const app = express();
// use express static for development only! for production use a proper webserver (nginx as a proxy)
// call express static twice for both public and static folder
app.use(express.static('static')); // check static folder (js, css)
app.use(express.static('public')); // check public folder (user uploaded media)
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(buildRequestUser(new SessionService(DAO), new UserService(DAO))); // uses req.cookie parser
app.use(helmet());
app.set('view engine', 'ejs');
app.use('/', combinedRouter);
app.use(errorHandler); // use error Handler as the VERY LAST MIDDLEWARE (IMPORTANT!!!)

module.exports = app;
