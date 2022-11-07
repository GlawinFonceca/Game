const GLB = require('../constant/constant');

function jwtEncryption(userId) {
    try {
        const jwt = require('jsonwebtoken');
        const access_token = jwt.sign({ userId }, 'thisisnodejs', { expiresIn: GLB.JWT_EXPIRE_TIME });
        return access_token
    }
    catch (e) {
        console.log('JwtEncryption Error =>', e);
    }

}
module.exports = jwtEncryption