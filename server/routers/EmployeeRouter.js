const express = require('express');
const router = express.Router;

const employeeController = require('../controllers/EmployeeController');;

router.post('/registration',employeeController.register)
    .post('/login',employeeController.login)
    .get('/onboardstatus',employeeController.getOnboaringStatus)
    .post('/applicationinput',employeeController.ApplicationInput)
    .get('/navinfo',employeeController.getNavinfo)
    .get('/personalinfo',employeeController.getPersonalinfo)
    .get('/housedetails',employeeController.getHousedetails)
    .post('/facilityreport',employeeController.addFacilityreport)
    .get('/facilityreport',employeeController.getFacilityreport)
    .post('/reportcomment',employeeController.addReportcomment)
    .get('/reportcomment',employeeController.getReportcomment)
    .post('/updateworkauthdoc',employeeController.updateWorkauthdoc);

module.exports = router;