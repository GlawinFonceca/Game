const validate = require('validator');
//user's credential validation


function lettersAndSpaceCheck(name)
{
var regEx = /^[a-z][a-z\s]*$/;
if(name.match(regEx))
{
return true;
}
else
{
return false;
}
}

async function isValidSignup(name, email, password, phone) {
    try {
        const isValidUserName = lettersAndSpaceCheck(name);
        const isValidUserEmail = validate.isEmail(email);
        const isValidUserPassword = validate.isStrongPassword(password,
            { minLength: 6, minUppercase: 1, minSymbols: 1, returnScore: false, minNumbers: 1 });
        const isValidPhoneNumber = validate.isLength(phone, { min: 10, max: 10 }) && validate.isNumeric(phone)

        if (isValidUserName === true && isValidUserEmail === true && isValidUserPassword === true && isValidPhoneNumber === true) {
            return { status: true }
        }
        else if (isValidUserName !== true) {
            return { status: false, message: "Please enter alphabets" }
        }
        else if (isValidUserEmail !== true) {
            return { status: false, message: "Please enter valid email" }
        }
        else if (isValidUserPassword !== true) {
            return { status: false, message: "Password should contain one symbol,one uppercase letter, one number and minimum 6 characters" }
        }
        else if (isValidPhoneNumber !== true) {
            return { status: false, message: "Please enter valid number" }
        }
    }
    catch (e) {
        console.log("signupValidation =>", e);
    }

}
module.exports = isValidSignup;