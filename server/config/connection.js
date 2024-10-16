require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch(error => console.log('Error connecting to MongoDB:', error))

const db = mongoose.connection;

module.exports = db;
