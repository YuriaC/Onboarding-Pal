
const express = require('express')
const reportController = require('../controllers/ReportController')
const { authenticateJWT } = require("../middlewares/AuthMiddleware");

const reportRouter = express.Router()

reportRouter
    .post('/', authenticateJWT, reportController.addReport)
    .get('/', reportController.getReports)
    .put('/updatestatus/:reportId', reportController.updateStatus)

module.exports = reportRouter
