
const express = require('express')
const { addReport, getReports } = require('../controllers/ReportController')

const reportRouter = express.Router()

reportRouter.post('/', addReport)
    .get('/', getReports)

module.exports = reportRouter
