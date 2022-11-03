const jwt=require('jsonwebtoken');
const accessToken =jwt.sign({
    data: 'foobar'
  }, 'secret', { expiresIn: 100 }); 
console.log(accessToken);