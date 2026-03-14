const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const accountController = require("../controllers/account.controller");
const router = express.Router();
/**
 * Post - Get the Account
 */
router.post(
  "/",
  authMiddleware.userRegisterMiddle,
  accountController.createAccountController,
);
/** 
 * Get - Fetched all the accounts
 */
router.get(
  "/",
  authMiddleware.authSystemUserMiddleware,
  accountController.getAccountController,
);
/**
 * Get - user bank balance fetched
 */
router.get('/balance/:accountId',authMiddleware.authSystemUserMiddleware,accountController.getAccountBalanceController)
module.exports = router;
