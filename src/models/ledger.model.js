const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "Ledger must be associated with an account"],
      index: true,
      immutable: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required for creating a ledger entry"],
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
      required: [true, "Ledger must be associated with a transaction"],
      index: true,
      immutable: true,
    },
    type: {
      type: String,
      enum: {
        values: ["CREDIT", "DEBIT"],
        message: "Type can be either Credit or debit",
      },
      required: [true, "Ledger type is required"],
      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);
function preLedgerModification() {
  throw new Error(
    "Once ledger entries are created can't be created or deleted",
  );
}
ledgerSchema.pre("findOneAndUpdate", preLedgerModification);
ledgerSchema.pre("updateOne", preLedgerModification);
ledgerSchema.pre("deleteOne", preLedgerModification);
ledgerSchema.pre("remove", preLedgerModification);
ledgerSchema.pre("deleteMany", preLedgerModification);
ledgerSchema.pre("findOneAndReplace", preLedgerModification);
ledgerSchema.pre("updateMany", preLedgerModification);
ledgerSchema.pre("findOneAndDelete", preLedgerModification);
const ledgerModel = mongoose.model("ledger", ledgerSchema);
module.exports = ledgerModel;
