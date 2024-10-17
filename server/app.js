// app.js

require("dotenv").config(); // Load environment variables at the very beginning

const express = require("express");
const path = require("path");
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

// Initialize Express appjwt
const app = express();

// Use environment variables
app.use(cors())
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Parse PUT bodies
app.use(bodyParser.json())

app.use(morgan(':method :url :status :response-time ms'));


// Routers (prefix API routes with /api)
const Routes = require("./routers/index.js");
Routes(app);

// // Frontend Routes


// Start the server
module.exports = app;
