const transactionModel = require("../models/transcation.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const userModel = require("../models/user.model");
const mongoose = require("mongoose");
const { TIMEOUT } = require("dns");
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
      message:
        "fromAccount, toAccount, idempotencyKey and account all are required!",
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

  const isTransactionExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });
  if (isTransactionExists) {
    if (isTransactionExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionExists,
      });
    }
    if (isTransactionExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction still processed!",
      });
    }
    if (isTransactionExists.status === "FAILED") {
      return res.status(200).json({
        message: "Transaction Failed, Try again later",
      });
    }
    if (isTransactionExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry!",
      });
    }
  }

  /**
   * 3. Check account status
   */

  if (
    formUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message: "from user account and to user account both must be active!",
    });
  }

  /**
   * 4. Derive balance from sender
   */
  const balance = await formUserAccount.getBalance();
  if (balance < account) {
    return res.status(400).json({
      message: `Insufficient balance! Your current balance is ${balance}`,
    });
  }
  /**
   * 5. Create Transaction(pending)
   */
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = new transactionModel({
    formAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });
  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: formAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );
  await (()=>{
    return new Promise((resolve)=>setTimeout(resolve, 0 * 1000))
  })
  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );
  await transactionModel.findOneAndUpdate(
    { _id: transaction._id },
    { status: "COMPLETED" },
    { session },
  );

  await session.commitTransaction();
  session.endSession();

  /**
   * 10. Email Notification
   */
  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toUserAccount,
  );

  return res.status(201).json({
    message: "Transaction created successfully!",
    transaction: transaction,
  });
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
