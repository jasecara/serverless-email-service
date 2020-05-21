const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

// Create a new document with passed properties, must have id
const putDocument = async function ({
  tableName,
  document,
  conditionExpression,
  returnValues = "ALL_OLD",
}) {
  try {
    const params = {
      TableName: tableName,
      Item: document,
      ConditionExpression: conditionExpression,
      ReturnValues: returnValues,
    };
    return await docClient.put(params).promise();
  } catch (e) {
    console.error(`Could Not Put Document: ${tableName} ${e}`);
    throw e;
  }
};

// Update a document with passed parameters; must include id
const updateDocument = async function ({
  tableName,
  key,
  conditionExpression,
  updateExpression,
  expressionAttributeNames,
  expressionAttributeValues,
  returnValues = "ALL_NEW",
}) {
  try {
    const params = {
      TableName: tableName,
      Key: key,
      ConditionExpression: conditionExpression,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: returnValues,
    };
    return (await docClient.update(params).promise()).Attributes;
  } catch (e) {
    console.log("ERROR", `Could Not Update Document  ${tableName} ${e}`);
    throw e;
  }
};

module.exports = {
  putDocument,
  updateDocument,
};
