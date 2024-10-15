const app = require('./app.js');
// const db = require('./config/connection.js');
const PORT = process.env.PORT || 3000;


// db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}/api`);
    // console.log(`Client server running on http://localhost:${PORT}/`);
  });
// });
