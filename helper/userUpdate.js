const getConnection = require('../database/connection')
const validate = require('validator');

async function isValidUpdate(user, name, phone) {
    try {
        const connection = await getConnection();
        //updating user name and phone nuumber
        if (user) {
            if (!name && !phone) {
                return { status: false, message: 'Please enter name or phone number' }
            }
            else if (!phone) {
                const userName = validate.isAlpha(name);
                if (userName === true) {
                    await connection.execute(`UPDATE user SET name='${name}' WHERE email = '${user.email}'`)
                    return { status: true, message: 'Successfully updated' }
                }
                else {
                    return { status: false, message: 'Please enter alphabets only' }
                }
            }
            else if (!name) {
                const userPhone = validate.isLength(phone, { min: 10, max: 10 }) && validate.isNumeric(phone)
                if (userPhone === true) {
                    await connection.execute(`UPDATE user SET phone='${phone}' WHERE email = '${user.email}'`)
                    return { status: true, message: 'Successfully updated' }
                }
                else {
                    return { status: false, message: 'Please valid phone number' }
                }
            }
            else {
                const userName = validate.isAlpha(name);
                const userPhone = validate.isLength(phone, { min: 10, max: 10 }) && validate.isNumeric(phone)
                if (userName === true && userPhone === true) {
                    await connection.execute(`UPDATE user SET name = '${name}',phone='${phone}' WHERE email = '${user.email}'`)
                    return { status: true, message: 'Successfully updated' }
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
        console.log("updateVlidation:", e.message);
    }
}
module.exports = isValidUpdate;
