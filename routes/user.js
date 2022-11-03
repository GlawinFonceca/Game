const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const getConnection = require('../database/connection');
const updateValidation = require('../helper/userUpdate');
const isValidSignup = require('../helper/userSignup');
const jwtEncryption = require('../helper/jwtencrypt');
const jwtdecode = require('../helper/jwtdecode');


router.post('/userSignup', async (req, res) => {
    try {
        let { name, email, password, phone } = req.body;
        const connection = await getConnection();
        const isValid = await isValidSignup(name, email, password, phone);
        if (isValid.status === true) {
            const userData = (await connection.execute(`SELECT * FROM user WHERE email='${email}'`))[0];
            if (userData) {
                res.render('signup', {
                    message: 'Email is already saved. Please login'
                })
            }
            else {
                //encrypting password 
                const saltRounds = 10;
                password = bcrypt.hashSync(password, saltRounds);
                await connection.execute(`INSERT INTO user(name,email,password,phone)VALUES('${name}','${email}','${password}','${phone}')`);
                const user = (await connection.execute(`SELECT user_id FROM user WHERE email='${email}'`))[0][0];
                const accessToken = jwtEncryption(user.user_id);
                const updateToken = await connection.execute(`UPDATE user SET access_token='${accessToken}' WHERE email='${email}'`)
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
                const updateToken = await connection.execute(`UPDATE user SET access_token='${accessToken}' WHERE email='${email}'`)
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

router.get('/userProfile', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const token = (await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`))[0][0];
        if (!token) {
            res.render('login', {
                title: 'Login Page'
            })
        }
        else if (token.access_token === userToken) {
            const userId = jwtdecode(userToken);
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
                    title: 'Login Page',
                    message: 'User not found please login'
                })
            }
        }
        else {
            res.render('home', {
                title: 'Home Page',
                message1: 'Please signup or Login'
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

router.post('/editProfile', async (req, res) => {
    try {
        const { name, phone } = req.body;
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwtdecode(userToken);
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            //sending user, name and phone number to userUpdate function
            const result = await updateValidation(userData, name, phone);
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

router.get('/pageLeaderboard', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const token = (await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`))[0][0];
        if (!token) {
            res.render('login', {
                title: 'Login Page'
            })
        }
        else if (token.access_token === userToken) {
            const userId = jwtdecode(userToken);
            const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
            if (userData.access_token === userToken) {
                const userLeaderboard = (await connection.execute('SELECT name,points,DENSE_RANK() OVER(ORDER BY points DESC) as ranking FROM user'))[0];
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

router.post('/pageAsc', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const token = (await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`))[0][0];
        if (!token) {
            res.render('login', {
                title: 'Login Page'
            })
        }
        else if (token.access_token === userToken) {
            const userId = jwtdecode(userToken);
            const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
            if (userData.access_token === userToken) {
                const userLeaderboard = (await connection.execute('SELECT name,points,DENSE_RANK() OVER(ORDER BY points DESC) as ranking FROM user ORDER BY points ASC'))[0];
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
        } else {
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

router.post('/pageDesc', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const token = (await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`))[0][0];
        if (!token) {
            res.render('login', {
                title: 'Login Page'
            })
        }
        else if (token.access_token === userToken) {
            const userId = jwtdecode(userToken);
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
            else {
                res.render('login', {
                    title: 'Login Page',
                    message: 'Please Login',
                })
            }
        } else {
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

router.post('/averageLeaderboard', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const token = (await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`))[0][0];
        if (!token) {
            res.render('login', {
                title: 'Login Page'
            })
        }
        else if (token.access_token === userToken) {
            const userId = jwtdecode(userToken);
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
            else {
                res.render('login', {
                    title: 'Login Page',
                    message: 'Please Login',
                })
            }
        } else {
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

router.post('/pageAscAverage', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const token = (await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`))[0][0];
        if (!token) {
            res.render('login', {
                title: 'Login Page'
            })
        }
        else if (token.access_token === userToken) {
            const userId = jwtdecode(userToken);
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
            else {
                res.render('login', {
                    title: 'Login Page',
                    message: 'Please Login',
                })
            }
        } else {
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

router.post('/pageDescAverage', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const token = (await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`))[0][0];
        if (!token) {
            res.render('login', {
                title: 'Login Page'
            })
        }
        else if (token.access_token === userToken) {
            const userId = jwtdecode(userToken);
            const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
            if (userData.access_token === userToken) {
                const userLeaderboard = (await connection.execute('SELECT name,CONCAT(ROUND(win_games/total_game_played*100),"%") as points, DENSE_RANK() OVER(ORDER BY win_games/total_game_played*100 DESC) as ranking  FROM user ORDER BY win_games/total_game_played*100 DESC'))[0];
                res.render('view', {
                    title: 'LeaderBoard',
                    titlel: 'Average',
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
        } else {
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

