const houseRouter = require("express").Router();
const houseController = require('../controllers/HouseController');
const { isHR } = require("../middlewares/AuthMiddleware");


//  Sample router

// NOTE : ADD MIDDLEWARES
houseRouter
    .get('/', isHR, houseController.getHouses)
    .get('/details/:houseId', houseController.getHouseById)
    .post('/', isHR, houseController.addHouse)
    .delete('/delete/:houseId', isHR, houseController.deleteHouse)

// code gen
module.exports = houseRouter;
