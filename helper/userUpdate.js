const getConnection = require('../database/connection')
const validate = require('validator');


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

async function isValidUpdate(user, name, phone) {
    try {
        const connection = await getConnection();
        //updating user name and phone nuumber
        if (user) {
            if (!name && !phone) {
                return { status: false, message: 'Please enter name or phone number' }
            }
            else if (!phone) {
                const isValiduserName = lettersAndSpaceCheck(name)
                if (isValiduserName === true) {
                    await connection.execute(`UPDATE user SET name='${name}' WHERE email = '${user.email}'`)
                    return { status: true, message: 'Successfully updated' }
                }
                else {
                    return { status: false, message: 'Please enter alphabets only' }
                }
            }
            else if (!name) {
                const isValidPhoneNumber = validate.isLength(phone, { min: 10, max: 10 }) && validate.isNumeric(phone)
                if (isValidPhoneNumber === true) {
                    await connection.execute(`UPDATE user SET phone='${phone}' WHERE email = '${user.email}'`)
                    return { status: true, message: 'Successfully updated' }
                }
                else {
                    return { status: false, message: 'Please valid phone number' }
                }
            }
            else {
                const isValiduserName = lettersAndSpaceCheck(name);
                const isValidPhoneNumber = validate.isLength(phone, { min: 10, max: 10 }) && validate.isNumeric(phone)
                if (isValiduserName === true && isValidPhoneNumber === true) {
                    await connection.execute(`UPDATE user SET name = '${name}',phone='${phone}' WHERE email = '${user.email}'`)
                    return { status: true, message: 'Successfully updated' }
                }
                else if (isValiduserName !== true) {
                    return { status: false, message: 'Please enter alphabets only' }
                }
                else if (isValidPhoneNumber !== true) {
                    return { status: false, message: 'Please valid phone number' }
                }
                else {
                    return { status: false, message: 'Please enter name and phone number' }
                }
            }
        }
        else {
            console.log('User not found')
        }
    }
    catch (e) {
        console.log("ERROR isValidUpdate=>", e);
    }
}
module.exports = isValidUpdate;
