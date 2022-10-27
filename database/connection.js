const mysql = require('mysql');
const con = mysql.createConnection({
    host: 'localhost',
    user: process.env.user,
    password: process.env.password,
    database: 'game'
})
con.connect(function (err) {
    if (err) return new Error(err.message);
    console.log('database created');

})
module.exports = con