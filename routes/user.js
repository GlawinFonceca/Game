const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const getConnection = require('../database/connection')
const updateValidation = require('../helper/userUpdate')
const isValidSignup = require('../helper/userSignup');


router.get('/home', async (req, res) => {
    try {
        const cookie = req.cookies['userToken'];
        const connection = await getConnection();
        const userData = await connection.execute(`SELECT * FROM user WHERE access_token='${cookie}'`);
        const user = JSON.parse(JSON.stringify(userData[0][0]));
        if (user.length !== 0) {
            res.render('views', {
                title: 'Welcome'
            })
        }
        else {
            res.render('home', {
                title: 'Home Page',
                message1: 'Please signup or Login'
            })
        }

    }
    catch (e) {
        console.log("home:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

router.get('/pageSignup', (req, res) => {
    try {
        res.render('signup', {
            title: 'Signup Page'
        })
    }
    catch (e) {
        console.log("signup:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

router.get('/pageLogin', (req, res) => {
    try {
        res.render('login', {
            title: 'Login Page'
        })
    }
    catch (e) {
        console.log("login:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

router.get('/pageGame', (req, res) => {
    try {
        res.render('game', {
            title: 'Game'
        })
    }
    catch (e) {
        console.log("game:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

router.get('/editProfile', (req, res) => {
    try {
        res.render('editProfile', {
            title: 'Edit Page'
        })
    }
    catch (e) {
        console.log("editprofile:", e.message);
        res.send({
            message: 'failed',
            data: e.message
        })
    }
})

router.post('/userSignup', async (req, res) => {
    try {
        const connection = await getConnection();
        const isValid = await isValidSignup(req.body.name, req.body.email, req.body.password, req.body.phone);
        if (isValid.status === true) {
            const userData = await connection.execute(`SELECT * FROM user WHERE email='${req.body.email}'`);
            const user = JSON.parse(JSON.stringify(userData[0][0]));
            if (user.length !== 0) {
                res.render('signup', {
                    message: 'email is already saved'
                })
            }
            else {
                const saltRounds = 10;
                //encrypting password 
                req.body.password = await bcrypt.hash(req.body.password, saltRounds);
                await connection.execute(`INSERT INTO user(name,email,password,phone)VALUES('${req.body.name}','${req.body.email}','${req.body.password}','${req.body.phone}')`);
                const userId = await connection.execute(`SELECT user_id FROM user WHERE email='${req.body.email}'`);
                const user = JSON.parse(JSON.stringify(userId[0][0]));
                const accessToken = jwt.sign(user.user_id, process.env.jwtToken);
                const updateToken = await connection.execute(`UPDATE user SET access_token='${accessToken}' WHERE email='${req.body.email}'`)
                res.cookie('userToken', accessToken, { maxAge: 86400000, httpOnly: true })
                res.render('view', {
                    title: 'Welcome'
                })
            }
        }
        else {
            res.render('signup', {
                message: isValid.message
            })
        }
    }
    catch (e) {
        console.log("userSignup:", e.message);
        res.send({
            message: 'failed',
            data: e.message
        })
    }
})

router.post('/userLogin', async (req, res) => {
    try {
        const connection = await getConnection();
        const userData = await connection.execute(`SELECT * FROM user WHERE email='${req.body.email}'`)
        const user = JSON.parse(JSON.stringify(userData[0][0]));
        if (user.length === 0) {
            res.render('login', {
                title: 'Login Page',
                message: 'Invalid Email'
            })
        }
        else {
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (validPassword) {
                res.cookie('userToken', user.access_token, { maxAge: 86400000, httpOnly: true })
                res.render('views', {
                    title: 'Welcome'
                })
            }
            else {
                res.render('login', {
                    title: 'Login Page',
                    message: 'Invalid Password'
                })
            }
        }
    }
    catch (e) {
        console.log('userLogin', e.message);
        res.status(404).send({
            message: 'failed',
            data: e.message
        })
    }
})

router.get('/userProfile', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwt.verify(userToken,process.env.jwtToken);
        const userData = await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`);
        const user = JSON.parse(JSON.stringify(userData[0][0]));
        if (user.access_token === userToken) {
            res.render('profile', {
                title: 'User Profile',
                message1: user.name,
                message2: user.email,
                message3: user.phone
            })
        }
        else {
            res.render('login', {
                message: 'User not found please login'
            })
        }

    }
    catch (e) {
        console.log('userProfile', e.message);
        res.status(404).send({
            message: 'failed',
            data: e.message
        })
    }
})

router.post('/editProfile', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwt.verify(userToken,process.env.jwtToken)
        const userData = await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`);
        const user = JSON.parse(JSON.stringify(userData[0][0]));
        if (user.access_token === userToken)  {
            //sending user, name and phone number to userUpdate function
            const result = await updateValidation(user, req.body.name, req.body.phone);
            if (result.status === true) {
                res.render('home', {
                    message: result.message,
                })
            }
            else {
                res.render('editProfile', {
                    message: result.message
                })
            }
        }
        else {
            res.render('home', {
                message: 'User not found. Please signup',
            })
        }
    }
    catch (e) {
        console.log('editProfile', e.message);
        res.render('profile', {
            message: e.message
        })
    }
})

router.get('/pageLeaderboard', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwt.verify(userToken,process.env.jwtToken)
        const userData = await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`)
        const user = JSON.parse(JSON.stringify(userData[0][0]));
        if (user.access_token === userToken) {
          const userLeaderboard = await connection.execute('SELECT name,points,win_games/total_game_played*100 as average FROM user');
          const userBoard = JSON.parse(JSON.stringify(userLeaderboard[0]));
          res.render('view',{
            title:'LeaderBoard',
            user:userBoard
          }
          )
        }
       
    }
    catch (e) {
        console.log('leaderboard:', e.message);
        res.render('view', {
            message: e.message
        })
    }
})

module.exports = router;

