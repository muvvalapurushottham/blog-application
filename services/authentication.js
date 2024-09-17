const jwt = require('jsonwebtoken');

const secretKey = "I@mB@tM@an!";

function createTokenForUser(user) {
    const payload = {
        _id: user._id,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
    }

    const token = jwt.sign(payload, secretKey);
    return token;
}

function validateUserToken(token) {
    
    if(!token){
        return null;
    }

    const payload = jwt.verify(token, secretKey);
    return payload; 
}

module.exports = {
    createTokenForUser,
    validateUserToken
}