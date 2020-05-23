const { updateDocument } = require("../lib/dynamoDb");

// Maps SES Email status to name used in email service record
const EMAIL_STATUS_MAP = {
  ses: {
    Send: "sent",
    Delivery: "delivered",
    Bounce: "bounced",
    Open: "opened",
  },
};

const handler = async (event, context) => {
  try {
    // Parse Notification Body JSON
    const notificationBody = JSON.parse(event.Records[0].body);

    // Get Email Service ID From Notification
    const emailServiceId =
      notificationBody.mail.headers.find(
        (header) => header.name === "X-Email-Service-ID"
      ).value || false;

    // Update Record with event status if valid and status not already updated
    return EMAIL_STATUS_MAP.ses.hasOwnProperty(notificationBody.eventType)
      ? await updateDocument({
          tableName: process.env.RECORD_TABLE,
          key: {
            emailServiceId,
          },
          conditionExpression:
            "attribute_exists(emailServiceId) AND #status <> :statusNew",
          updateExpression: "SET #status = :statusNew, #sentAt = :sentAt",
          expressionAttributeNames: {
            "#status": "status",
            "#sentAt": "sentAt",
          },
          expressionAttributeValues: {
            ":statusNew": EMAIL_STATUS_MAP[notificationBody.eventType],
            ":sentAt": new Date().toISOString(),
          },
        })
      : true;
  } catch (e) {
    console.error("Error Processing Email Status Notification", e);
  }
};

module.exports = {
  handler,
};
