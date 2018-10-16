const path = require('path');

module.exports = {
    "PRODUCTION": {
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSSWORD,
        database: "",
        host: "",
        dialect: "postgres",
        define: {raw: true}
    },
    "DEV": {
        username: "",
        password: "",
        database: "",
        host: "localhost",
        dialect: "sqlite",
        storage: path.join(process.cwd(), 'dev', 'development.db'),
        define: {raw: true}
    },
    "TEST": {
        username: "",
        password: "",
        database: "",
        host: "localhost",
        dialect: "sqlite",
        storage: ':memory:',
        define: {raw: true},
        logging: false
    }
  }