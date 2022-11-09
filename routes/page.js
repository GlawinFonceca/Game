const pageRouter = require('express').Router();
const getConnection = require('../database/connection');

const jwtdecode = require('../helper/jwtDecode');
const auth = require('../middleware/auth');


pageRouter.get('/home', async (req, res) => {
    try {
        const userToken = req.cookies['userToken'];
        const connection = await getConnection();
        if (!userToken) {
            res.render('home', {
                title: 'Home page',
                message1: 'Please signup or Login'
            })
        }
        else {
            const userId = jwtdecode(userToken);
            if (!userId) {
                res.render('home', {
                    title: 'Home Page',
                    message1: 'Please signup or Login'
                })
            }
            else {
                const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
                if (!userData) {
                    res.render('home', {
                        title: 'Home Page',
                        message1: 'Please signup or Login'
                    })
                }
                else {
                    if (userData.access_token === userToken) {
                        res.render('views', {
                            title: 'Welcome'
                        })
                    }
                }
            }
        }
    }
    catch (e) {
        console.log("home:", e);
        res.send({
            message: 'failed',
        })
    }
})

pageRouter.get('/pageSignup', async (req, res) => {
    try {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        if (!userToken) {
            res.render('signup', {
                title: 'Signup page',
            })
        }
        else {
            const userId = jwtdecode(userToken);
            if (!userId) {
                res.render('login', {
                    title: 'Login Page'
                })
            }
            else {
                const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
                if (!userData) {
                    res.render('signup', {
                        title: 'Signup page',
                    })
                }
                else {
                    if (userData.access_token === userToken) {
                        res.render('views', {
                            title: 'Welcome'
                        })
                    }
                }
            }
        }
    }
    catch (e) {
        console.log("signup:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

pageRouter.get('/pageLogin', auth, async (req, res) => {
    try {
        const connection = await getConnection();
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
        if (!userData) {
            res.render('login', {
                title: 'Login Page'
            })
        }
        else {
            if (userData.access_token === req.userToken) {
                res.render('views', {
                    title: 'Welcome'
                })
            }
            else {
                res.render('home', {
                    title: 'Home page'
                })
            }
        }
    }
    catch (e) {
        console.log("login:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

pageRouter.get('/pageGame', auth, async (req, res) => {
    try {
        console.log(req.query.permissionGranted);
        if (!req.query.permissionGranted) {
            return res.render('game', {
                title: 'Game',
                Status: 'USER',
                permissionGranted: false,
            })
        }
        else if (req.query.permissionGranted == 1) {
            const connection = await getConnection();
            const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
            if (userData.access_token === req.userToken) {
                if (userData.points >= 50) {
                    await connection.execute(`UPDATE user SET points=points-50,total_game_played=total_game_played+1 WHERE email = '${userData.email}'`);
                    res.render('game', {
                        title: 'Game',
                        Status: 'USER',
                        permissionGranted: true,
                    })
                }
                else {
                    return res.render('views', {
                        title: 'Welcome',
                        message: 'Insufficient Points '
                    })
                }
            }
        }
        else {
            res.render('game', {
                title: 'Game',
                Status: 'USER',
                permissionGranted: true
            })

        }
    }
    catch (e) {
        console.log("game:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

pageRouter.get('/editProfile', auth, async (req, res) => {
    try {
        const connection = await getConnection();
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${req.userId}'`))[0][0];
        if (userData.access_token === req.userToken) {
            res.render('editProfile', {
                title: 'Edit Page'
            })
        }
        else {
            res.render('home', {
                title: 'Home page'
            })
        }
    }
    catch (e) {
        console.log("editprofile:", e.message);
        res.send({
            message: 'failed',
            data: e.message
        })
    }
})

pageRouter.get('/pageLogout', async (req, res) => {
    try {
        res.clearCookie('userToken');
        res.render('home', {
            title: 'Home page',
            message1: 'Please signup or Login'
        })
    }
    catch (e) {
        console.log('Page Logout =>', e)
    }

})

module.exports = pageRouter;