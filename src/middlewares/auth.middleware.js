const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackList = require("../models/blacklist.model");
/**
 * user register Middleware
 */
async function userRegisterMiddle(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }
  const isBlockListed = await tokenBlackList.findOne({
    token,
  });
  if (isBlockListed) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid!",
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
/**
 * auth system Middleware
 */
async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  const isBlockListed = await tokenBlackList.findOne({
    token,
  });
  if (isBlockListed) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid!",
    });
  }
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
