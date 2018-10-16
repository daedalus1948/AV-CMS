const express = require('express');

const userRouter = require('./userRouter.js');
const audioRouter = require('./audioRouter.js');
const videoRouter = require('./videoRouter.js');
const mainRouter = require('./mainRouter.js');

const router = express.Router(); 

router.use('/', audioRouter);
router.use('/', videoRouter);
router.use('/', userRouter);
router.use('/', mainRouter); // has to be the last, contains 404 error handler

module.exports = router;
