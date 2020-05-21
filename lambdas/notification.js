const { updateDocument } = require("../lib/dynamoDb");

const handler = async (event, context) => {
  try {
    // Parse Notification Body JSON
    const notificationBody = JSON.parse(event.Records[0].body);

    // Get Email Service ID From Notification
    const emailServiceId =
      notificationBody.mail.headers.find(
        (header) => header.name === "X-Email-Service-ID"
      ).value || false;

    // Update Email Service Record Delivery Status
    const emailServiceRecord = await updateDocument({
      tableName: process.env.RECORD_TABLE,
      key: {
        emailServiceId,
      },
      conditionExpression:
        "attribute_exists(emailServiceId) AND #status = :statusCurrent",
      updateExpression: "SET #status = :statusNew, #sentAt = :sentAt",
      expressionAttributeNames: {
        "#status": "status",
        "#sentAt": "sentAt",
      },
      expressionAttributeValues: {
        ":statusCurrent": "requested",
        ":statusNew": "delivered",
        ":sentAt": new Date().toISOString(),
      },
    });

    console.info("emailServiceRecord", emailServiceRecord);
  } catch (e) {
    console.error("Error Processing Email Status Notification", e);
  }
};

module.exports = {
  handler,
};
