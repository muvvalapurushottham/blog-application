const { validateUserToken } = require('../services/authentication');

function checkForAuthenticationCookie(cookieName) {

    return (req, res, next) => {
        const cookieTokenValue = req.cookies?.token;

        if (!cookieTokenValue) {
            return next();
        }

        const token = cookieTokenValue;

        try {
            const userPayload = validateUserToken(token);

            req.user = userPayload;
        } catch (error) {}
        return next();
    }

}

module.exports = {
    checkForAuthenticationCookie
}
