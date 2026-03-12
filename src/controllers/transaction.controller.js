const transactionModel = require("../models/transcation.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const userModel = require("../models/user.model");
const mongoose = require('mongoose');
/**
 * 1. Validate Request
 * 2. validate idempotency key
 * 3. check account status
 * 4. derive sender balance from ledger
 * 5. create transaction(pending)
 * 6. create debit ledger entry
 * 7. create credit ledger entry
 * 8. mark transaction completed
 * 9. commit mongodb session
 * 10. send email notification
 */
async function createTransaction(req, res) {
  const { formAccount, toAccount, idempotencyKey, account } = req.body;
  if (!formAccount || !toAccount || !idempotencyKey || !account) {
    return res.status(400).json({
      message: "fromAccount, toAccount, idempotencyKey and account all are required!",
    });
  }
  const formUserAccount = await accountModel.findOne({
    _id: formAccount,
  });
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!formUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid form user account or to user account",
    });
  }

  /**
   * 2. Validate Idempotency key
   */

  
}
async function initialTransactionFunds(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toaccount,amount or idempotency key anything are missing",
    });
  }

  const touserAccount = await accountModel.findOne({
    _id: toAccount,
  });
  if (!touserAccount) {
    return res.status(400).json({
      message: "user account cannot exists",
    });
  }
  const formUserAccount = await accountModel.findOne({
    user: req.user._id,
  });
  if (!formUserAccount) {
    return res.status(400).json({
      message: "From User Account not exists",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: formUserAccount._id,
    amount,
    toAccount,
    idempotencyKey,
    status: "PENDING",
  });
  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: formUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );
  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: touserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );
  transaction.status = "COMPLETED";
  await transaction.save({ session });
  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
  });
}
module.exports = { createTransaction, initialTransactionFunds };
