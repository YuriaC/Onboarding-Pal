const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/UserController');
const { authenticateJWT, isHR } = require('../middlewares/AuthMiddleware');
const { AWSCredentialsMiddleware } = require('../middlewares/AWSMiddleware')


// NOTE : ADD MIDDLEWARES 
const userValidator = require("../middlewares/UserValidator");


userRouter.post('/register', userController.register)
    .post('/logout', userController.logout)
    .get('/register/:token', userController.checkRegister)
    .post('/send-registration-link', userController.sendRegistrationLink)
    .post('/login', userController.login)
    .get('/onboardstatus', userController.getOnboardingStatus)
    .post('/onboardstatus', userController.setOnboardingStatus)
    .get('/email', userController.getEmail)
    .get('/house', userController.getHouse)
    .post('/applicationinput', authenticateJWT, AWSCredentialsMiddleware, userController.setApplicationInput)
    .post('/contactinput', userController.setContactInput)
    .get('/personalinfo', userController.getPersonalinfo)
    .get('/userinfo', authenticateJWT, userController.getUserInfo)
    .get('/userinfo/:userId', authenticateJWT, AWSCredentialsMiddleware, userController.getUserInfoById)
    .get('/registration-history', authenticateJWT,isHR, userController.getRegistrationHistory)
    .get('/applications', authenticateJWT, isHR, userController.getApplications)
    .put('/updateappstatus/:employeeId', authenticateJWT, userController.updateAppStatus)
    .get('/getuserdocs', authenticateJWT, AWSCredentialsMiddleware, userController.getUserDocs)
    .get('/getuserdocs/:employeeId', authenticateJWT, AWSCredentialsMiddleware, userController.getUserDocsById)
    .post('/updateworkauthdoc', userController.updateWorkauthdoc)
    .post('/updateworkauthStatus', userController.updateWorkauthStatus)
    .get('/employeesprofile', userController.getEmpolyeesProfileForHR) //only HR can access this controller, HR auth required
    .get('/personalinfobyid', isHR, userController.getPersonalinfoById)//only HR can access this controller, HR auth required
    .get('/alluser',userController.getAllUser)
    .post('/emailNotify',userController.sendEmailNotification)
    .post('/postVisaDecision',userController.postVisaDecision)
    .put('/uploadworkdoc/:employeeId', authenticateJWT, AWSCredentialsMiddleware, userController.uploadNewWorkDoc)
    .put('/updateworkauthstatus/:employeeId', authenticateJWT, isHR, userController.updateWorkAuthStatus)
    .post('/updateProfile', authenticateJWT, AWSCredentialsMiddleware, userController.updateUserProfile)  // for Personal Page
module.exports = userRouter;