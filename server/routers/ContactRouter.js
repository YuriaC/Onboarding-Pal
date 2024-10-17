
const express = require('express')
const { addContact } = require('../controllers/ContactController')

const contactRouter = express.Router()



// NOTE : ADD MIDDLEWARES

contactRouter.post('/', addContact)

module.exports = contactRouter
