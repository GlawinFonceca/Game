const jwt = require('jsonwebtoken');

function jwtDeode(userToken){
 const userId = jwt.verify(userToken, process.env.secretToken);
 return userId.userId;
}
 module.exports=jwtDeode;