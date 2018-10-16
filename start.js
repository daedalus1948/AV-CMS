require('dotenv').config();  // populate process.env with .env file variables
const app = require('./app.js');
const DAO = require('./models/core.js');

DAO.sequelize.authenticate()
    .then(() => {
        console.log("connected to db");
        return DAO.sequelize.sync();
    })
    .then(() => {
        console.log("all tables synced");
        app.listen(process.env.DEV_PORT, function(){
            console.log('Example app listening on port - ' + process.env.DEV_PORT);
        });
    })
    .catch((error) => {
        console.log(error);
    })
