
const express = require('express')
const { addReport } = require('../controllers/ReportController')

const reportRouter = express.Router()

reportRouter.post('/', addReport)

module.exports = reportRouter
