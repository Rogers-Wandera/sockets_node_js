const ejs = require("ejs");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const retry = require("retry");

const directory = path.join(__dirname, "templates", "verify.ejs");
const emailTemplate = fs.readFileSync(directory, "utf-8");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "rogerrisha@gmail.com",
    pass: "apwovlbnuspgdghk",
  },
  from: "Test@gmail.com",
});

const mailoptions = {
  from: "Test@gmail.com",
  to: "roger@gmail.com",
  subject: "Verify your email",
};

const emaildata = {
  recipientName: "Rogers Wandera",
  serverData: "Hello from the server",
  senderName: "RC TECH",
};

const emailHtml = ejs.render(emailTemplate, emaildata);
mailoptions.html = emailHtml;

const sendEmail = () => {
  const operation = retry.operation({
    retries: 2,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 600000,
  });
  operation.attempt((currentAttempt) => {
    transporter.sendMail(mailoptions, (error, data) => {
      if (error) {
        console.log(
          `Error sending mail: (attempt ${currentAttempt}): ` + error
        );
        if (operation.retry(error)) {
          return;
        }
      } else {
        console.log("Email sent: " + data.response);
      }
    });
  });
};
sendEmail();
