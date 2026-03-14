const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const transactionController = require('../controllers/transaction.controller');
const transactionRoutes = express.Router();

/**
 * Post /api/transaction/
 * create a new transaction
 */
transactionRoutes.post('/',authMiddleware.userRegisterMiddle,transactionController.createTransaction)
/**
 * Post /api/transaction/
 * funds created
 */
transactionRoutes.post('/system/initialFunds',authMiddleware.authSystemUserMiddleware,transactionController.initialTransactionFunds)
module.exports = transactionRoutes;