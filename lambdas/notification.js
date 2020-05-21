const { updateDocument } = require("../lib/dynamoDb");

const handler = async (event, context) => {
  try {
    // TODO: get ses id from JSON.parse(event.Records[0].body).messageId
    console.info("event", event);
  } catch (e) {}
};

module.exports = {
  handler,
};
