const getConnection = require('../database/connection');

async function cookieValidation(userToken) {
    const connection = await getConnection();
    const data = await connection.execute(`SELECT ${userToken} FROM user`);
    if(data[0]){
        return true
    }
    else {
        return false
    }
}

module.exports =cookieValidation();