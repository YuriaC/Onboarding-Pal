
const HouseRouter = require("./HouseRouter.js");


module.exports = (app) => {
  app.use("/api/houses", HouseRouter);

};