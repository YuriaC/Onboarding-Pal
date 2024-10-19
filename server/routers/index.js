
const commentRouter = require("./CommentRouter.js");
const contactRouter = require("./ContactRouter.js");
const houseRouter = require("./HouseRouter.js");
const ReportRouter = require('./ReportRouter.js');
const userRouter = require('./UserRouter.js');

module.exports = (app) => {
  app.use("/api/houses", houseRouter);
  app.use('/api/reports', ReportRouter)
  app.use('/api/comments', commentRouter)
  app.use('/api/contacts', contactRouter)
  app.use('/api/users', userRouter)

  // test api to front-end;
  app.get('/api/test', (req, res) => {
    res.json({'users': ['u1','u2','u3']});
  })

  app.post('/api/testPost', (req, res) => {
    console.log(req.body);
    console.log(req.body.form);
    const {credential, password} = req.body.form;
    res.status(200).json('data received at the backend.');
  })
};