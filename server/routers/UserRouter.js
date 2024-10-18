const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/UserController');;
const { isHR } = require('../middlewares/UserMiddleware');



// NOTE : ADD MIDDLEWARES 


userRouter.post('/register', userController.register)
    .get('/register/:token', userController.checkRegister)
    .post('/sendlink', userController.sendRegistrationLink)
    .post('/login', userController.login)
    .get('/onboardstatus', userController.getOnboardingStatus)
    .post('/onboardstatus', userController.setOnboardingStatus)
    .get('/email', userController.getEmail)
    .get('/house', userController.getHouse)
    .post('/applicationinput', userController.setApplicationInput)
    .post('/contactinput', userController.setContactInput)
    .get('/personalinfo', userController.getPersonalinfo)
    // .get('/housedetails', userController.getHousedetails)
    // .post('/facilityreport', userController.addFacilityreport)
    // .get('/facilityreport', userController.getFacilityreport)
    // .post('/reportcomment', userController.addReportcomment)
    // .get('/reportcomment', userController.getReportcomment)
    .post('/updateworkauthdoc', userController.updateWorkauthdoc)
    .post('/updateworkauthStatus', userController.updateWorkauthStatus);

module.exports = userRouter;