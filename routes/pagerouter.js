const pageRouter = require('express').Router();
const getConnection = require('../database/connection');
const jwt = require('jsonwebtoken');

const jwtdecode = require('../helper/jwtdecode');


pageRouter.get('/home', async (req, res) => {
    try {
        const userToken = req.cookies['userToken'];
        const connection = await getConnection();
        const token = (await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`))[0][0];
        if (!token) {
            res.render('home', {
                title: 'Home page',
                message1: 'Please signup or Login'
            })
        }
        else if (token.access_token === userToken) {
            const userId = jwtdecode(userToken);
            const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
            if (userData.access_token === userToken) {
                res.render('views', {
                    title: 'Welcome'
                })
            }
            else {

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
        const token = (await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`))[0][0];
        if (!token) {
            res.render('signup', {
                title: 'Signup page',
            })
        }
        else if (token.access_token === userToken) {
            const userId = jwtdecode(userToken);
            const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
            if (userData.access_token === userToken) {
                res.render('views', {
                    title: 'Welcome'
                })
            }
        }
        else {
            res.render('login', {
                title: 'Login Page'
            })
        }

    }
    catch (e) {
        console.log("signup:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

pageRouter.get('/pageLogin', async (req, res) => {
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
        else {
            res.render('login', {
                title: 'Login Page'
            })
        }
    }
    catch (e) {
        console.log("login:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

pageRouter.get('/pageGame', async (req, res) => {
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
                res.render('game', {
                    title: 'Game',
                    Status:'USER'
                })
            }
        }
        else {
            res.render('login', {
                title: 'Login Page'
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

pageRouter.get('/editProfile', async (req, res) => {
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
        else {
            res.render('login', {
                title: 'Login Page'
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

module.exports = pageRouter;