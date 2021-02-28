const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

exports.handler = async (event) => {
  const createTransporter = async () => {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject();
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    return transporter;
  };

  const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter();
    return await emailTransporter.sendMail(emailOptions);
  };

  const data = await sendEmail({
    subject: "New Contact Us Query",
    text: `
    Name: ${event.name}
    Email: ${event.email},
    Query: ${event.query}`,
    to: "hello@iventorsinitiatives.com",
    from: process.env.EMAIL,
  });

  console.log(data);
};
