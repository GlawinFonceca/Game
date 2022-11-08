const jwt = require('jsonwebtoken');

function jwtDeode(userToken) {
    try {
        const userId = jwt.verify(userToken, process.env.secretToken);
        if(userId){
            return userId.userId;
        }
        else {
            return undefined;
        }
       
    }
    catch (e) {
        console.log('JwtDecryption Error =>', e);
    }
}
module.exports = jwtDeode;