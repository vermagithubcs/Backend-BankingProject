const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function userRegisterMiddle(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.user);
    req.user = user;
    return next();
  } catch (err) {
    console.error("Error found", err);
  }
}
async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access,token is missing",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.user).select("+systemUser");
    if (!user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, not a system user",
      });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(403).json({
      message: "Unauthorized access, token is invalid! Try again!",
    });
  }
}
module.exports = { userRegisterMiddle, authSystemUserMiddleware };
