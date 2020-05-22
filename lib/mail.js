const AWS = require("aws-sdk");
const nodemailer = require("nodemailer");
const nodemailerSESTransport = nodemailer.createTransport({
  SES: new AWS.SES({
    apiVersion: "2010-12-01",
  }),
});

// Sends An Email via SES
const send = async ({
  to = [],
  from = undefined,
  cc = [],
  bcc = [],
  subject = "",
  html = "",
  text = "",
  attachments = undefined,
  headers,
  ses,
}) => {
  return await nodemailerSESTransport.sendMail({
    from,
    to,
    cc,
    bcc,
    subject,
    html,
    text,
    attachments,
    headers,
    ses,
  });
};

module.exports = {
  send,
};
