// app.js

require("dotenv").config(); // Load environment variables at the very beginning

const express = require("express");
const path = require("path");
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer');
const cookieParser = require('cookie-parser');

// Initialize Express appjwt
const app = express();

// Use environment variables
app.use(cors({
    origin: true,
    credentials: true
}))
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

//get cookies
app.use(cookieParser());

// Parse PUT bodies
app.use(bodyParser.json())

app.use(morgan(':method :url :status :response-time ms'));

// Multer
const upload = multer()
app.use(upload.any())


// Routers (prefix API routes with /api)
const Routes = require("./routers/index.js");
Routes(app);

// // Frontend Routes


// Start the server
module.exports = app;
