const express = require('express');
const testRouter = express.Router();

const testUser = { // for testing employeeVisaPage
  username: "TestEmployee",
  optStatus: 'Approved',  // OPT receipt status
  eadStatus: 'Approved',
  i983Status: 'Not Started',
  i20Status: 'Not Started',
  optUrl: "https://via.placeholder.com/600/24f355",  // OPT receipt file URL
  eadUrl: "https://via.placeholder.com/600/24f355",
  i983Url: '',
  i20Url: '',
  hrVisaFeedBack: '',
}


testRouter
  // for testing employeeVisaPage
  .get('/visa', (_req, res) => {
      res.status(200).json(testUser);
  })

  .post('/postVisa', (req, res) => {
      const visaInfo = req.body
      try {
          // const testUser = {
          //     optStatus: visaInfo.optStatus,  // OPT receipt status
          //     eadStatus: visaInfo.eadStatus,
          //     i983Status: visaInfo.i983Status,
          //     i20Status: visaInfo.i20Status,
          //     optUrl: visaInfo.optUrl,  // OPT receipt file URL
          //     eadUrl: visaInfo.eadUrl,
          //     i983Url: visaInfo.i983Url,
          //     i20Url: visaInfo.i20Url,
          //     hrVisaFeedback: visaInfo.hrVisaFeedback
          // }
          console.log(visaInfo);
          res.status(200).json({
              data: visaInfo,
              message: "visa info updated."
          })
      } catch (e) {
          console.log(e.error)
      }
  })

module.exports = testRouter;