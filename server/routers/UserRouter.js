const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/UserController');;
const { authenticateJWT } = require('../middlewares/AuthMiddleware');
const { AWSCredentialsMiddleware } = require('../middlewares/AWSMiddleware')



// NOTE : ADD MIDDLEWARES 

userRouter.post('/register', userController.register)
    .get('/register/:token', userController.checkRegister)
    .post('/sendlink', userController.sendRegistrationLink)
    .post('/login', userController.login)
    .get('/onboardstatus', userController.getOnboardingStatus)
    .post('/onboardstatus', userController.setOnboardingStatus)
    .get('/email', userController.getEmail)
    .get('/house', userController.getHouse)
    .post('/applicationinput', AWSCredentialsMiddleware, userController.setApplicationInput)
    .post('/contactinput', userController.setContactInput)
    .get('/personalinfo', userController.getPersonalinfo)
    .get('/userinfo', authenticateJWT, userController.getUserInfo)
    .get('/getuserdocs', authenticateJWT, AWSCredentialsMiddleware, userController.getUserDocs)
    // .get('/housedetails', userController.getHousedetails)
    // .post('/facilityreport', userController.addFacilityreport)
    // .get('/facilityreport', userController.getFacilityreport)
    // .post('/reportcomment', userController.addReportcomment)
    // .get('/reportcomment', userController.getReportcomment)
    .post('/updateworkauthdoc', userController.updateWorkauthdoc)
    .post('/updateworkauthStatus', userController.updateWorkauthStatus)
    .get('/employeesprofile', userController.getEmpolyeesProfileForHR) //only HR can access this controller, HR auth required
    .get('/personalinfobyid', userController.getPersonalinfoById)//only HR can access this controller, HR auth required
    // .get('/checkuserisemployeeorhr', userController.checkUserIsEmployeeOrHr)
    
module.exports = userRouter;