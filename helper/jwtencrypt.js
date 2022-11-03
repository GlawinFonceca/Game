

function jwtEncryption(userId) {
    try {
        const jwt = require('jsonwebtoken');
        const access_token = jwt.sign({userId}, 'thisisnodejs', { expiresIn: 3600000});
        return access_token
    }
    catch (e) {
        console.log('JwtEncryption Error', e);
    }

}
module.exports = jwtEncryption