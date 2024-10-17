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

  const token = jwt.sign(payload, secretKey, { expiresIn: "60m" });
  return token;
}

function validateUserToken(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}

module.exports = {
  createTokenForUser,
  validateUserToken,
};
