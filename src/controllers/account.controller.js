const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
  try {
    const user = req.user;
    const account = await accountModel.create({
      user: user._id,
    });
    res.status(201).json({
      account,
    });
  } catch (err) {
    console.error(err);
  }
}
async function getAccountController(req,res){
  const user = req.user;
  const account = await accountModel.find({user:user._id});
  res.status(200).json({
    account
  })
}
async function getAccountBalanceController(req,res){
  const {accountId} = req.params;
  const {user} = req.user;
  const account = await accountModel.findOne({
    _id: accountId,
    user:req.user._id
  })
}
module.exports = {
  createAccountController,
  getAccountController,
  getAccountBalanceController
};
