const jwt = require('jsonwebtoken');

function jwtDeode(userToken) {
    try {
        const userId = jwt.verify(userToken, process.env.secretToken);
        return userId.userId;
    }
    catch (e) {
        console.log('JwtDecryption Error =>', e);
    }
}
module.exports = jwtDeode;