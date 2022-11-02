const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const getConnection = require('../database/connection')
const updateValidation = require('../helper/userUpdate')
const isValidSignup = require('../helper/userSignup');


router.post('/userSignup', async (req, res) => {
    try {
       // const {name,email,password,phone} = {req.body.name,req.body.email,req.body.password,req.body.phone}
        const connection = await getConnection();
        const isValid = await isValidSignup(req.body.name, req.body.email, req.body.password, req.body.phone);
        if (isValid.status) {
            const userData = await connection.execute(`SELECT * FROM user WHERE email='${req.body.email}'`)[0];
            if (userData.length) {
                res.render('signup', {
                    message: 'Email is already saved. Please login'
                })
            }
            else {
                
                //encrypting password 
                req.body.password =  bcrypt.hashSync(req.body.password,process.env.saltRounds);
                await connection.execute(`INSERT INTO user(name,email,password,phone)VALUES('${req.body.name}','${req.body.email}','${req.body.password}','${req.body.phone}')`);
                const user = (await connection.execute(`SELECT user_id FROM user WHERE email='${req.body.email}'`))[0][0];
                const accessToken = jwt.sign(user.user_id, process.env.jwtToken);
                const updateToken = await connection.execute(`UPDATE user SET access_token='${accessToken}' WHERE email='${req.body.email}'`)
                res.cookie('userToken', accessToken, { maxAge: process.env.cookieAge, httpOnly: true })
                res.render('views', {
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
        const userData = (await connection.execute(`SELECT * FROM user WHERE email='${req.body.email}'`))[0][0];
        if (userData.length === 0) {
            res.render('login', {
                title: 'Login Page',
                message: 'Invalid Email'
            })
        }
        else {
            const validPassword = await bcrypt.compare(req.body.password, userData.password);
            if (validPassword) {
                //
                res.cookie('userToken', userData.access_token, { maxAge: process.env.cookieAge, httpOnly: true })
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
        const userId = jwt.verify(userToken, process.env.jwtToken);
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            res.render('profile', {
                title: 'User Profile',
                message1: userData.name,
                message2: userData.email,
                message3: userData.phone
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
        const userId = jwt.verify(userToken, process.env.jwtToken)
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            //sending user, name and phone number to userUpdate function
            const result = await updateValidation(userData, req.body.name, req.body.phone);
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
        const userId = jwt.verify(userToken, process.env.jwtToken)
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            const userLeaderboard = (await connection.execute('SELECT name,points,DENSE_RANK() OVER(ORDER BY points DESC) as ranking FROM user'))[0];
            res.render('view', {
                title: 'LeaderBoard',
                titlel: 'Points',
                user: userLeaderboard,
                api1: '/pageAsc',
                api2: '/pageDesc'
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

router.post('/pageAsc', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwt.verify(userToken, process.env.jwtToken)
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            const userLeaderboard = (await connection.execute('SELECT name,points,DENSE_RANK() OVER(ORDER BY points DESC) as ranking FROM user ORDER BY points ASC'))[0];
            res.render('view', {
                title: 'LeaderBoard',
                titlel: 'Points',
                user: userLeaderboard,
                api1: '/pageAsc',
                api2: '/pageDesc'
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

router.post('/pageDesc', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwt.verify(userToken, process.env.jwtToken)
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            const userLeaderboard = (await connection.execute('SELECT name,points,DENSE_RANK() OVER(ORDER BY points DESC) as ranking FROM user ORDER BY points DESC'))[0];
            res.render('view', {
                title: 'LeaderBoard',
                titlel: 'Points',
                user: userLeaderboard,
                api1: '/pageAsc',
                api2: '/pageDesc'
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

router.post('/averageLeaderboard', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwt.verify(userToken, process.env.jwtToken)
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            const userLeaderboard = (await connection.execute('SELECT name,CONCAT(ROUND(win_games/total_game_played*100),"%") as points, DENSE_RANK() OVER(ORDER BY win_games/total_game_played*100 DESC) as ranking  FROM user'))[0];
            res.render('view', {
                title: 'LeaderBoard',
                titlel: 'Average',
                user: userLeaderboard,
                api1: '/pageAscAverage',
                api2: '/pageDescAverage',
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

router.post('/pageAscAverage', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwt.verify(userToken, process.env.jwtToken)
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            const userLeaderboard = (await connection.execute('SELECT name,CONCAT(ROUND(win_games/total_game_played*100),"%") as points, DENSE_RANK() OVER(ORDER BY win_games/total_game_played*100 DESC) as ranking  FROM user ORDER BY win_games/total_game_played*100 ASC'))[0];
            res.render('view', {
                title: 'LeaderBoard',
                titlel: 'Average',
                user: userLeaderboard,
                percentage: '%',
                api1: '/pageAscAverage',
                api2: '/pageDescAverage'

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

router.post('/pageDescAverage', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwt.verify(userToken, process.env.jwtToken)
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            const userLeaderboard = (await connection.execute('SELECT name,CONCAT(ROUND(win_games/total_game_played*100),"%") as points, DENSE_RANK() OVER(ORDER BY win_games/total_game_played*100 DESC) as ranking  FROM user ORDER BY win_games/total_game_played*100 DESC'))[0];
            res.render('view', {
                title: 'LeaderBoard',
                titlel: 'Average',
                user: userLeaderboard,
                api1: '/pageAscAverage',
                api2: '/pageDescAverage'
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





router.post('/gamePage', async function (req, res) {
    console.log(req.body.a0);
    console.log(req.body.a1);
    console.log(req.body.a2);
    console.log(req.body.a3);
    console.log(req.body.a4);
    console.log(req.body.a5);
    console.log(req.body.a6);
    console.log(req.body.a7);
    console.log(req.body.a8);
})
module.exports = router;

