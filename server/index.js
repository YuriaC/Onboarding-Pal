const app = require('./app.js');
const db = require('./config/connection.js');
const PORT = process.env.PORT || 3000;
const DEPLOY_URL = process.env.VITE_REACT_APP_BACKEND_BASEURL

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server running on ${DEPLOY_URL}`);
  });
});
