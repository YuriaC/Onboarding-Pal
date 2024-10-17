
const express = require('express')
const reportController = require('../controllers/ReportController')

const reportRouter = express.Router()

reportRouter.post('/', reportController.addReport)
    .get('/', reportController.getReports)

module.exports = reportRouter
