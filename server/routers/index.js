
const commentRouter = require("./CommentRouter.js");
const HouseRouter = require("./HouseRouter.js");
const ReportRouter = require('./ReportRouter.js')

module.exports = (app) => {
  app.use("/api/houses", HouseRouter);
  app.use('/api/reports', ReportRouter)
  app.use('/api/comments', commentRouter)
};