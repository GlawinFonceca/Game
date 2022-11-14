const mysql = require('mysql2/promise');

async function getConnection() {
    try {
        const con = await mysql.createConnection({
            host: 'localhost',
            user: 'root', //process.env.user,
            password:'password',// process.env.password,
            database: 'game'
        })
        return con
    }
    catch (e) {
        console.log('MysqlConnection Error =>', e);
    }
}

module.exports = getConnection;
