const express = require("express");
const cookie = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookie());

/**
 * auth Routes
 */
const authRoutes = require("./routes/auth.route");
/**
 * account Routes
 */
const accountRoutes = require("./routes/account.route");
/**
 * transaction routes
 */
const transactionRoutes = require('./routes/transaction.route');
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/transaction",transactionRoutes)
module.exports = app;
