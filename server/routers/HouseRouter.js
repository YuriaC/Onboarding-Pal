const houseRouter = require("express").Router();
const { addHouse, getHouses, deleteHouse } = require('../controllers/HouseController')

//  Sample router
houseRouter
    .get('/', getHouses)
    .post('/', addHouse)
    .delete('/delete/:houseId', deleteHouse)

// code gen
module.exports = houseRouter;