
const commentRouter = require("./CommentRouter.js");
const contactRouter = require("./ContactRouter.js");
const houseRouter = require("./HouseRouter.js");
const ReportRouter = require('./ReportRouter.js');
const userRouter = require('./UserRouter.js');
const testRouter = require('./testRouter.js');  // for unit testing

module.exports = (app) => {
  app.use("/api/houses", houseRouter);
  app.use('/api/reports', ReportRouter)
  app.use('/api/comments', commentRouter)
  app.use('/api/contacts', contactRouter)
  app.use('/api/users', userRouter)
  app.use('/api/tests', testRouter)  // for unit testing
};