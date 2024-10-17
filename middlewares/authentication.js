const { validateUserToken } = require("../services/authentication");
const { User } = require("../models/user");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const cookieTokenValue = req.cookies?.token;

    if (!cookieTokenValue) {
      return next();
    }

    const token = cookieTokenValue;

    try {
      const userPayload = validateUserToken(token);

      if (userPayload) {
        User.findById(userPayload._id)
          .then((user) => {
            if (user) {
              req.user = user;
            }
            next();
          })
          .catch((err) => {
            console.error("Error fething user: ", err);
            next();
          });
      } else {
        next();
      }
    } catch (error) {
      console.error("Token validation error:", error);
      next();
    }
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
