// app.js

require("dotenv").config(); // Load environment variables at the very beginning

const express = require("express");
const path = require("path");

// Initialize Express appjwt
const app = express();

// Use environment variables

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded



// Routers (prefix API routes with /api)
const Routes = require("./routers/index.js");
Routes(app);

// const userRouter = require("./routers/UserRouter.js");
// const prodcutRouter = require("./routers/ProductRouter.js");

// app.use("/api/users", userRouter);
// app.use("/api/products", prodcutRouter);

// // Frontend Routes


// Start the server

module.exports = app;
