const mysql = require('mysql2/promise');

async function getConnection() {
    const con = await mysql.createConnection({
        host: 'localhost',
        user: process.env.user,
        password: process.env.password,
        database:'game'
    })
    return con
}

module.exports = getConnection;
