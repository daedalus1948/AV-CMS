const express = require('express');

const router = express.Router(); 

router.get('/', [], function (req, res, next) { // index
    res.render('index.ejs', {templateData: {user: req.user}});
})

router.get('/about', [], function (req, res, next) { // about
    res.render('index.ejs', {template: 'about.ejs', templateData: {user: req.user}});
})

router.use( function(req, res, next){ // 404 handler after all other routes, matching as the last one
    return next(new Error404([{message:"page not found"}])); // push it to the error handling middleware
});


module.exports = router;
