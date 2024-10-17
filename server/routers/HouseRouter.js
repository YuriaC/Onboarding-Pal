const houseRouter = require("express").Router();
const houseController = require('../controllers/HouseController');
const { authenticateJWT, isHR } = require("../middlewares/AuthMiddleware");

houseRouter
    .get('/', authenticateJWT, isHR, houseController.getHouses)
    .get('/details/:houseId', houseController.getHouseById)
    .post('/', authenticateJWT, isHR, houseController.addHouse)
    .delete('/delete/:houseId', authenticateJWT, isHR, houseController.deleteHouse)

module.exports = houseRouter;
