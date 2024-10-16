
const commentRouter = require("./CommentRouter.js");
const contactRouter = require("./ContactRouter.js");
const houseRouter = require("./HouseRouter.js");
const ReportRouter = require('./ReportRouter.js')

module.exports = (app) => {
  app.use("/api/houses", houseRouter);
  app.use('/api/reports', ReportRouter)
  app.use('/api/comments', commentRouter)
  app.use('/api/contacts', contactRouter)
};