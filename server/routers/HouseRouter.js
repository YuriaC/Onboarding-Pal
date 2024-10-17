const houseRouter = require("express").Router();
const houseController = require('../controllers/HouseController');
const { authenticateJWT, isHR } = require("../middlewares/AuthMiddleware");


//  Sample router

// NOTE : ADD MIDDLEWARES
houseRouter
    .get('/', authenticateJWT, isHR, houseController.getHouses)
    .get('/details/:houseId', houseController.getHouseById)
    .post('/', authenticateJWT, isHR, houseController.addHouse)
    .delete('/delete/:houseId', authenticateJWT, isHR, houseController.deleteHouse)

// code gen
module.exports = houseRouter;
