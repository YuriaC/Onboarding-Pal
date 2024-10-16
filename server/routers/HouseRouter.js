const houseRouter = require("express").Router();
const houseController = require('../controllers/HouseController')


//  Sample router

// NOTE : ADD MIDDLEWARES
houseRouter
    .get('/', houseController.getHouses)
    .post('/', houseController.addHouse)
    .delete('/delete/:houseId', houseController.deleteHouse)

// code gen
module.exports = houseRouter;