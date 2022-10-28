const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const getConnection = require('../database/connection')
const updateValidation = require('../helper/userUpdate')
const isValidSignup = require('../helper/userSignup')
const cookieValidation = require('../helper/cookievalid')

//cookie
const timestamp = new Date().getTime(); // current time
const exp = timestamp + (60 * 60 )


router.get('', (req, res) => {
    try {
        res.render('home', {
            title: 'Home Page',
            message1: 'Please signup or Login'
        })
    }
    catch (e) {
        console.log("server:", e.message);
        res.send({
            message: 'failed',
        })
    }
})

router.get('/pageHome', async (req, res) => {
    try {
        const data = cookieValidation(req.cookies['userToken'])
        if (data === true) {
            res.render('viewProfile', {
                title: 'Welcome'
            })
        }
        else {
            res.render('home', {
                title: 'Home Page',
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
            const data = await connection.execute(`SELECT * FROM user WHERE email='${req.body.email}'`);
            if (data[0].length !== 0) {
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
                const accessToken = jwt.sign(userId[0][0].user_id, process.env.jwtToken);
                const updateToken = await connection.execute(`UPDATE user SET access_token='${accessToken}' WHERE email='${req.body.email}'`)
                res.cookie('userToken', accessToken, { maxAge: exp, httpOnly: true })
                res.render('viewProfile', {
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
        const data = await connection.execute(`SELECT * FROM user WHERE email='${req.body.email}'`)
        if (data[0].length === 0) {
            res.render('login', {
                title: 'Login Page',
                message: 'Invalid Email'
            })
        }
        else {
            const validPassword = await bcrypt.compare(req.body.password, data[0][0].password);
            if (validPassword) {
                res.cookie('userToken', data[0][0].access_token, { maxAge: exp, httpOnly: true })
                res.render('viewProfile', {
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
        const data = await connection.execute(`SELECT * FROM user WHERE access_token='${userToken}'`)
        console.log(data[0]);
        if (data[0].length) {
            res.render('profile', {
                title: 'User Profile',
                message1: data[0][0].name,
                message2: data[0][0].email,
                message3: data[0][0].phone
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
        const data = await connection.execute(`SELECT * FROM user WHERE email='${userToken}'`);
        if (data[0][0]) {
            //sending user, name and phone number to userUpdate function
            const result = await updateValidation(data[0][0], req.body.name, req.body.phone);
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


// router.post('/gamePage', async (req, res) => {
//     try {







//     }
//     catch (e) {
//         console.log('gamepage:', e.message);
//         res.render('profile', {
//             message: e.message
//         })
//     }
// })

module.exports = router;

