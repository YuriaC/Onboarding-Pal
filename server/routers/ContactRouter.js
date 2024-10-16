
const express = require('express')
const { addContact } = require('../controllers/ContactController')

const contactRouter = express.Router()

contactRouter.post('/', addContact)

module.exports = contactRouter
