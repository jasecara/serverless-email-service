const { send } = require("../lib/mail");
const { validationSchema, rules } = require("../lib/validate");

const handler = async (event, context, callback) => {
  try {
    // Parse Request
    const request = JSON.parse(event.body);

    // Validate Request
    validateRequest({ request });

    // Get Email Instructions
    const emailInstructions = await buildEmailInstructions(request);

    // Send Email
    await send(emailInstructions);

    // Return Response
    await response({
      callback,
      statusCode: 200,
      body: {
        success: true,
        message: "Email Send Completed Successfully",
      },
    });
  } catch (e) {
    // Return Validation Errors, but otherwise return general error; Always Log
    console.error(e);
    const message =
      e.name === "ValidationError"
        ? e.message
        : "General Error: Could Not Send Email";
    await response({
      callback,
      statusCode: 500,
      body: {
        success: false,
        message,
      },
    });
  }
};

// structure response sent to api gateway callback
const response = async ({ callback, statusCode, body }) =>
  callback(null, {
    isBase64Encoded: false,
    statusCode,
    body: JSON.stringify(body),
  });

// Build Instructions From Request to send email
const buildEmailInstructions = async (request) => {
  const attachments = request.attachments
    ? request.attachments.map((attachment) => ({
        filename: attachment.name,
        content: Buffer.from(attachment.content, "base64"),
      }))
    : [];

  return {
    from: request.from,
    subject: request.subject,
    html: request.content.html,
    text: request.content.text,
    to: request.recipients.to.map((recipient) => ({
      address: recipient.email,
      name: recipient.name,
    })),
    cc: request.recipients.cc.map((recipient) => ({
      address: recipient.email,
      name: recipient.name,
    })),
    bcc: request.recipients.bcc.map((recipient) => ({
      address: recipient.email,
      name: recipient.name,
    })),
    attachments: attachments.length > 0 ? attachments : undefined,
  };
};

// Validate Request confirms to api request specification
const validateRequest = ({ request }) => {
  const requestValidator = validationSchema({
    subject: rules.STRING.required(),
    from: rules.STRING.required(),
    content: rules
      .OBJECT({
        html: rules.ANY,
        text: rules.ANY,
      })
      .required(),
    recipients: rules
      .OBJECT({
        to: rules.ARRAY.items(
          rules.OBJECT({
            email: rules.EMAIL,
            name: rules.STRING,
          })
        ).required(),
        cc: rules.ARRAY.items(
          rules.OBJECT({
            email: rules.EMAIL,
            name: rules.STRING,
          })
        ).optional(),
        bcc: rules.ARRAY.items(
          rules.OBJECT({
            email: rules.EMAIL,
            name: rules.STRING,
          })
        ).optional(),
      })
      .required(),
    attachments: rules.ARRAY.optional(),
  });

  const { value, error } = requestValidator.validate(request);

  if (error) {
    throw error;
  }

  return value;
};

module.exports = {
  handler,
};
