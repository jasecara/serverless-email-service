const { send } = require("../lib/mail");
const { validationSchema, rules } = require("../lib/validate");
const { putDocument } = require("../lib/dynamoDb");

const handler = async (event, context, callback) => {
  try {
    // Parse Request JSON
    const request = JSON.parse(event.body);

    // Validate Request
    validateRequest({ request });

    // Get Email Instructions
    const emailInstructions = await buildEmailInstructions({
      request,
      requestId: event.requestContext.requestId,
      requestedAt: event.requestContext.requestTimeEpoch,
    });

    // Send Email
    const providerJobId = (
      await send({
        ...emailInstructions,
        ses: {
          ConfigurationSetName: process.env.SES_NOTIFICATION_CONFIGURATION_SET,
        },
      })
    ).response;

    // Create Email Record for tracking
    await putDocument({
      tableName: process.env.RECORD_TABLE,
      conditionExpression: "attribute_not_exists(emailServiceId)",
      document: {
        emailServiceId: emailInstructions.emailServiceId,
        provider: "ses",
        providerJobId,
        status: "requested",
        requestedAt: new Date().toISOString(),
        sentAt: false,
        lifecycleExpiresAt: calculateLifecycleExpiration({
          date: new Date(),
          daysToExpiration: process.env.RECORD_LIFECYCLE_EXPIRATION_DAYS,
        }),
      },
    });

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

// Outputs date in future
const calculateLifecycleExpiration = ({ date, daysToExpiration }) =>
  Math.ceil(
    new Date(
      date.getTime() + daysToExpiration * 24 * 60 * 60 * 1000
    ).getTime() / 1000
  );

// structure response sent to api gateway callback
const response = async ({ callback, statusCode, body }) =>
  callback(null, {
    isBase64Encoded: false,
    statusCode,
    body: JSON.stringify(body),
  });

// Build Instructions From Request to send email
const buildEmailInstructions = async ({ request, requestId, requestedAt }) => ({
  emailServiceId: requestId,
  requestedAt: new Date(requestedAt).toISOString(),
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
  headers: {
    ...request.headers,
    "x-email-service-id": requestId,
  },
});

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
