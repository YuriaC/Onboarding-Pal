const houseRouter = require("express").Router();
const { addHouse, getHouses } = require('../controllers/HouseController')

//  Sample router
houseRouter
    .get('/', getHouses)
    .post('/', addHouse)

// code gen
module.exports = houseRouter;