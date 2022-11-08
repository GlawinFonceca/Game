const jwtDecode = require('../helper/jwtDecode');


const auth = function (req,res,next){
  const userToken = req.cookies['userToken'];
  if (!userToken) {
      res.render('login', {
          title: 'Login Page'
      })
  }
  else {
      const userId = jwtDecode(userToken);
      if (!userId) {
          res.render('login', {
              title: 'Login Page',
              message: 'Please Login',
          })
      }
      else {
        req.userId=userId;
        req.userToken=userToken;
        next()
      }
    }
}



module.exports = auth;