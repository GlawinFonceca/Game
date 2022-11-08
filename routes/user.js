const router = require('express').Router();
const bcrypt = require('bcrypt');
const GLB = require('../constant/constant');


const getConnection = require('../database/connection');
const updateValidation = require('../helper/userUpdate');
const isValidSignup = require('../helper/userSignup');
const jwtEncryption = require('../helper/jwtEncrypt');
const auth = require('../middleware/auth');
const jwtDecode = require('../helper/jwtDecode');



router.post('/userSignup', async (req, res) => {
    try {
        let { name, email, password, phone } = req.body;
        const connection = await getConnection();
        const isValid = await isValidSignup(name, email, password, phone);
        if (isValid.status === true) {
            const userData = (await connection.execute(`SELECT * FROM user WHERE email='${email}'`))[0];
            if (userData.length !== 0) {
                res.render('signup', {
                    message: 'Email is already saved. Please login'
                })
            }
            else {
                //encrypting password 
                const saltRounds = 10;
                password = bcrypt.hashSync(password, saltRounds);
                await connection.execute(`INSERT INTO user(name,email,password,phone,points,status)VALUES('${name}','${email}','${password}','${phone}','${GLB.JOINING_POINTS}','${GLB.STATUS}')`);
                const user = (await connection.execute(`SELECT user_id FROM user WHERE email='${email}'`))[0][0];
                const accessToken = jwtEncryption(user.user_id);
                await connection.execute(`UPDATE user SET access_token='${accessToken}' WHERE email='${email}'`)
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
        console.log("userSignup:", e);
        res.send({
            message: 'failed',
            data: e.message
        })
    }
})

router.post('/userLogin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await getConnection();
        const userData = (await connection.execute(`SELECT * FROM user WHERE email='${email}'`))[0][0];
        if (!userData) {
            res.render('login', {
                title: 'Login Page',
                message: 'Invalid Email'
            })
        }
        else {
            const validPassword = await bcrypt.compare(password, userData.password);
            if (validPassword) {
                const accessToken = jwtEncryption(userData.user_id);
                await connection.execute(`UPDATE user SET access_token='${accessToken}' WHERE email='${email}'`)
                res.cookie('userToken', accessToken, { maxAge: process.env.cookieAge, httpOnly: true })
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
        console.log('userLogin', e);
        res.status(404).send({
            message: 'failed',
            data: e.message
        })
    }
})

router.get('/userProfile', auth, async (req, res) => {
    try {
        const connection = await getConnection();
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
        if (userData.access_token === req.userToken) {
            res.render('profile', {
                title: 'User Profile',
                message1: userData.name,
                message2: userData.email,
                message3: userData.phone
            })
        }
        else {
            res.render('login', {
                title: 'Login Page',
                message: 'User not found please login'
            })
        }
    }
    catch (e) {
        console.log('userProfile', e);
        res.status(404).send({
            message: 'failed',
            data: e.message
        })
    }
})

router.post('/editProfile',auth, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwtDecode(userToken);
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
        if (userData.access_token === req.userToken) {
            //sending user, name and phone number to userUpdate function
            const result = await updateValidation(userData, name, phone);
            if (result.status === true) {
                res.render('views', {
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
            res.render('login', {
                title: 'Login Page',
                message: 'Please Login',
            })
        }
    }
    catch (e) {
        console.log('editProfile', e);
        res.render('profile', {
            message: e.message
        })
    }
})

router.get('/pageLeaderboard',auth, async (req, res) => {
    try {
        const connection = await getConnection();
                const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
                if (userData.access_token === req.userToken) {
                    const userLeaderboard = (await connection.execute('SELECT name,points,DENSE_RANK() OVER(ORDER BY points DESC) as ranking,ROW_NUMBER() OVER(ORDER BY points DESC) as rankings FROM user'))[0];
                    res.render('view', {
                        title: 'LeaderBoard',
                        titlel: 'Points',
                        user: userLeaderboard,
                        api1: '/pageAsc',
                        api2: '/pageDesc'
                    })
                }
                else {
                    res.render('login', {
                        title: 'Login Page',
                        message: 'Please Login',
                    })
                }
            }
    catch (e) {
        console.log('leaderboard:', e.message);
        res.render('view', {
            message: e.message
        })
    }
})

router.post('/pageAsc',auth, async (req, res) => {
    try {
        const connection = await getConnection();
                const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
                if (userData.access_token === req.userToken) {
                    const userLeaderboard = (await connection.execute('SELECT name,points,DENSE_RANK() OVER(ORDER BY points DESC) as ranking,ROW_NUMBER() OVER(ORDER BY points DESC) as rankings FROM user ORDER BY points ASC,user_id DESC'))[0];
                    res.render('view', {
                        title: 'LeaderBoard',
                        titlel: 'Points',
                        user: userLeaderboard,
                        api1: '/pageAsc',
                        api2: '/pageDesc'
                    })
                }
                else {
                    res.render('login', {
                        title: 'Login Page',
                        message: 'Please Login',
                    })
                }
            }
    catch (e) {
        console.log('leaderboard:', e.message);
        res.render('view', {
            message: e.message
        })
    }
})

router.post('/pageDesc',auth, async (req, res) => {
    try {
        const connection = await getConnection();
                const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
                if (userData.access_token === req.userToken) {
                    const userLeaderboard = (await connection.execute('SELECT name,points,DENSE_RANK() OVER(ORDER BY points DESC) as ranking,ROW_NUMBER() OVER(ORDER BY points DESC) as rankings FROM user ORDER BY points DESC,user_id ASC'))[0];
                    res.render('view', {
                        title: 'LeaderBoard',
                        titlel: 'Points',
                        user: userLeaderboard,
                        api1: '/pageAsc',
                        api2: '/pageDesc'
                    }
                    )
                }
                else {
                    res.render('login', {
                        title: 'Login Page',
                        message: 'Please Login',
                    })
                }
            }
    catch (e) {
        console.log('leaderboard:', e.message);
        res.render('view', {
            message: e.message
        })
    }
})

router.post('/averageLeaderboard',auth, async (req, res) => {
    try {
        const connection = await getConnection();
                const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
                if (userData.access_token === req.userToken) {
                    const userLeaderboard = (await connection.execute('SELECT name,CONCAT(ROUND(win_games/total_game_played*100),"%") as points, DENSE_RANK() OVER(ORDER BY win_games/total_game_played*100 DESC) as ranking,ROW_NUMBER() OVER(ORDER BY  win_games/total_game_played*100 DESC) as rankings  FROM user'))[0];
                    res.render('view', {
                        title: 'LeaderBoard',
                        titlel: 'Average Wins',
                        user: userLeaderboard,
                        api1: '/pageAscAverage',
                        api2: '/pageDescAverage',
                    }
                    )
                }
                else {
                    res.render('login', {
                        title: 'Login Page',
                        message: 'Please Login',
                    })
                }
            }
    catch (e) {
        console.log('leaderboard:', e.message);
        res.render('view', {
            message: e.message
        })
    }
})

router.post('/pageAscAverage',auth, async (req, res) => {
    try {
        const connection = await getConnection();
                const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
                if (userData.access_token === req.userToken) {
                    const userLeaderboard = (await connection.execute('SELECT name,CONCAT(ROUND(win_games/total_game_played*100),"%") as points, DENSE_RANK() OVER(ORDER BY win_games/total_game_played*100 DESC) as ranking,ROW_NUMBER() OVER(ORDER BY  win_games/total_game_played*100 DESC) as rankings  FROM user ORDER BY win_games/total_game_played*100 ASC,user_id DESC'))[0];
                    res.render('view', {
                        title: 'LeaderBoard',
                        titlel: 'Average Wins',
                        user: userLeaderboard,
                        percentage: '%',
                        api1: '/pageAscAverage',
                        api2: '/pageDescAverage'

                    }
                    )
                }
                else {
                    res.render('login', {
                        title: 'Login Page',
                        message: 'Please Login',
                    })
                }
            }
    catch (e) {
        console.log('leaderboard:', e.message);
        res.render('view', {
            message: e.message
        })
    }
})

router.post('/pageDescAverage', auth, async (req, res) => {
    try {
        const connection = await getConnection();
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
        if (userData.access_token === req.userToken) {
            const userLeaderboard = (await connection.execute('SELECT name,CONCAT(ROUND(win_games/total_game_played*100),"%") as points, DENSE_RANK() OVER(ORDER BY win_games/total_game_played*100 DESC) as ranking,ROW_NUMBER() OVER(ORDER BY  win_games/total_game_played*100 DESC) as rankings  FROM user ORDER BY win_games/total_game_played*100 DESC,user_id ASC'))[0];
            res.render('view', {
                title: 'LeaderBoard',
                titlel: 'Average Wins',
                user: userLeaderboard,
                api1: '/pageAscAverage',
                api2: '/pageDescAverage'
            })
        }
        else {
            res.render('login', {
                title: 'Login Page',
                message: 'Please Login',
            })
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

