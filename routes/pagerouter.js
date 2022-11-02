const pageRouter = require('express').Router();
const getConnection = require('../database/connection')


pageRouter.get('/home', async (req, res) => {
    try {
        const cookie = req.cookies['userToken'];
        const connection = await getConnection();
        const userData = await connection.execute(`SELECT * FROM user WHERE access_token='${cookie}'`);
        if (userData[0].length !== 0) {
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

pageRouter.get('/pageSignup', (req, res) => {
    try {console.log(process.env.saltRounds);
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

pageRouter.get('/pageLogin', (req, res) => {
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

pageRouter.get('/pageGame', (req, res) => {
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

pageRouter.get('/editProfile', (req, res) => {
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







module.exports=pageRouter;