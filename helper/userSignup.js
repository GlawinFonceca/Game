const validate = require('validator');
//user's crendial validation
async function isValidSignup(name,email,password,phone) {
    try{
    const userName = validate.isAlpha(name);
    const userEmail = validate.isEmail(email);
    const userPassword = validate.isStrongPassword(password,
        { minLength: 6, minUppercase: 1, minSymbols: 1, returnScore: false, minNumbers: 1 });
    const userPhone =validate.isLength(phone, { min: 10, max: 10 }) && validate.isNumeric(phone)
    
    if (userName === true && userEmail === true && userPassword === true && userPhone === true) {
        return { status: true }
    }
    else if (userName !== true) {
        return { status: false, message: "Please enter alphabets" }
    }
    else if (userEmail !== true) {
        return { status: false, message: "Please enter valid email" }
    }
    else if (userPassword !== true) {
        return { status: false, message: "Password should contain one symbol,one uppercase letter, one number and minimum 6 characters" }
    }
    else if (userPhone !== true) {
        return { status: false, message: "Please enter valid number" }
    }
}
catch (e) {
    console.log("signupValidation:", e.message);
}

}
module.exports = isValidSignup;