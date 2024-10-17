const sgMail = require("@sendgrid/mail");

const sendMail = async (
  param,
  to,
  subject,
  from = "dminhnguyen161@gmail.com",
) => {
  if (!param) {
    return { error: "Cannot send empty email data" };
  }
  try {
    // let html = ejs.render(fs.readFileSync(template, "utf-8"), data);
    let msg = {
      from,
      to,
      subject,
      text: 'Hi there,',
      html: `<strong>Here is your registration link: ${param}, you have 3 hours to activate your account </strong>`,
    };
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    let result = await sgMail.send(msg);
    return result;
  } catch (err) {
    return { error: err };
  }
};





module.exports = {
  sendMail
}