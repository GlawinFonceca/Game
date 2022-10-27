const router = require('express').Router();
const bcrypt = require('bcrypt');

const con = require('../database/connection')
const updateValidation = require('../helper/userUpdate')
const signupValidation = require('../helper/userSignup')

router.get('', (req, res) => {
try{
    res.render('home', {
        title: 'Home Page'
    })
}
catch (e) {
    console.log("server:", e.message);
    res.send({
        message: 'failed',
    })
}
})

router.get('/pageHome', (req, res) => {
    try{
    res.render('home', {
        title: 'Home Page'
    })
}
catch (e) {
        console.log("home:", e.message);
        res.send({
            message: 'failed',
        })
}
})

router.get('/pageSignup', (req, res) => {
    try{
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
    try{
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

router.get('/editProfile', (req, res) => {
    try{
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
        const isValid = await signupValidation(req.body.name, req.body.email, req.body.password, req.body.phone);
        if (isValid.status === true) {
            con.query(`SELECT * FROM user WHERE email='${req.body.email}'`, async(err, result) => {
                if (err) return new Error(err.message);
                //result is array so checking length of the array
                if (!result.length) {
                    const saltRounds = 10;
                    //encrypting password 
                    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
                    con.query(`INSERT INTO user(name,email,password,phone) VALUES('${req.body.name}','${req.body.email}','${req.body.password}','${req.body.phone}')`)
                    res.render('login', {
                        title: 'Login Page'
                    })
                }
                else {
                    res.render('signup', {
                        message: 'Email is already saved'
                    })
                }
            })
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
        con.query(`SELECT * FROM user WHERE email='${req.body.email}'`, async (err, result) => {
            if (err) return new Error(err.message);
            if (result.length) {
                const validPassword = await bcrypt.compare(req.body.password, result[0].password);
                if (validPassword) {
                    res.cookie('UserLogin', req.body.email, { maxAge: 900000, httpOnly: true })
                    res.render('viewProfile', {
                        message: `Hello ${result[0].name}`
                    })
                }
                else {
                    res.render('login', {
                        title: 'Login Page',
                        message: 'Invalid Password'
                    })
                }
            }
            else {
                res.render('login', {
                    title: 'Login Page',
                    message: 'Invalid Email'
                })
            }
        })
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
        const userEmail = req.cookies['UserLogin'];
        con.query(`SELECT * FROM user WHERE email='${userEmail}'`, async (err, result) => {
            if (err) return new Error(err.message);
            if (result.length) {
                res.render('profile', {
                    title: 'User Profile',
                    message1: result[0].name,
                    message2: result[0].email,
                    message3: result[0].phone
                })
            }
            else {
                res.render('login', {
                    message: 'User not found please login'
                })
            }
        })
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
        const userEmail = req.cookies['UserLogin'];
        con.query(`SELECT * FROM user WHERE email='${userEmail}'`, async (err, result) => {
            if (err) return new Error(err.message);
            //sending user, name and phone number to userUpdate function
            const data = await updateValidation(result[0], req.body.name, req.body.phone);
            if (data.status === true) {
                res.render('home', {
                    message: data.message,
                })
            }
            else {
                res.render('editProfile', {
                    message: data.message
                })
            }
        })
    }
    catch (e) {
        console.log('editProfile', e.message);
        res.render('profile', {
            message: e.message
        })
    }
})

module.exports = router;