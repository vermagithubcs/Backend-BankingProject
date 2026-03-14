const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();
/**
 * Register Route
 */
router.post("/register", authController.registerUser);
/**
 * Login Route
 */
router.post("/login", authController.loginUser);
/**
 * Data Route
 */
router.get('/data',authController.getData);
/**
 * logout Route
 */
router.post('/logout',authController.userlogoutController)
module.exports = router;
