const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    role: user.role,
  };

  const token = jwt.sign(payload, secretKey);
  return token;
}

function validateUserToken(token) {
  if (!token) {
    return null;
  }

  const payload = jwt.verify(token, secretKey, { expiresIn: "30m" });
  return payload;
}

module.exports = {
  createTokenForUser,
  validateUserToken,
};
