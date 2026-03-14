const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendEmail = require("../services/email.service");
const blacklistModel = require('../models/blacklist.model');
/**
 * - user register controller
 * - Post /api/auth/register
 */
async function registerUser(req, res) {
  const { email, password, name } = req.body;
  const isExists = await userModel.findOne({
    email: email,
  });
  if (isExists) {
    return res.status(409).json({ message: "user already exists" });
  }
  const user = await userModel.create({
    email,
    password,
    name,
  });
  const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2d",
  });
  res.cookie("token", token);
  res.status(201).json({
    message: "Successfully registerd",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
  });
  await sendEmail.sendRegistrationEmail(user.email, user.name);
}
/**
 * - login controller
 * - Post /api/auth/login
 */
async function loginUser(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({
    email,
  });
  if (!user) {
    return res.status(409).json({
      message: "Email or password is invalid",
    });
  }
  const isPassword = await user.comparePassword(password, this.password);
  if (!isPassword) {
    return res.status(409).json({
      message: "Email or password is invalid",
    });
  }
  const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "3d",
  });
  res.cookie("token", token);
  res.status(200).json({
    message: "Successfully login the account",
    user: {
      name: user.name,
      email: user.email,
      _id: user._id,
    },
  });
}
async function getData(req, res) {
  const { email } = req.body;
  const user = await userModel.findOne({
    email: email,
  });
  if (!user) {
    return res.status(409).json({
      message: "user cannot exists",
    });
  }
  const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "3d",
  });
  res.cookie("token", token);
  res.status(200).json({
    message: "successfully data fetched",
    user: {
      _id: user._id,
      email: user.email,
    },
  });
}
/**
 * - UserLogout Controller
 * - Post /api/auth/logout
 */
async function userlogoutController(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.status(200).json({
      message:"User successfully logout!"
    })
  }
  res.clearCookie("token","");
  await blacklistModel.create({
    token: token
  })
  return res.status(200).json({
    message:"Successfully logout"
  })
}
module.exports = { registerUser, loginUser, getData, userlogoutController };
