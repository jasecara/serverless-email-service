const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

// Create a new document with passed properties, must have id
const putDocument = async function ({
  tableName,
  document,
  conditionExpression,
}) {
  try {
    const timestamp = new Date();
    const preparedDocument = {
      ...document,
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
    };
    const params = {
      TableName: tableName,
      Item: preparedDocument,
      ConditionExpression: conditionExpression,
    };
    await docClient.put(params).promise();
    return preparedDocument;
  } catch (e) {
    console.error(`Could Not Put Document:  ${tableName} ${e}`);
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
}) {
  try {
    const params = {
      TableName: tableName,
      Key: key,
      ConditionExpression: conditionExpression,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };
    return (await docClient.update(params).promise()).Attributes;
  } catch (e) {
    console.log("ERROR", `Could Not Update Document  ${tableName} ${e}`);
    throw e;
  }
};

// Query a dynamo table or index
const query = async function ({
  tableName,
  indexName = false,
  select = "ALL_ATTRIBUTES",
  attributesToGet,
  consistentRead = true,
  limit = 10,
  keyConditions,
  queryFilter,
  conditionalOperator,
  scanIndexForward,
  exclusiveStartKey,
  keyConditionExpression,
  expressionAttributeValues,
  projectionExpression,
  filterExpression,
  expressionAttributeNames,
  returnConsumedCapacity = "TOTAL",
}) {
  try {
    const params = {
      TableName: tableName,
      IndexName: indexName,
      Select: select,
      AttributesToGet: attributesToGet,
      Limit: limit,
      ConsistentRead: consistentRead,
      KeyConditions: keyConditions,
      QueryFilter: queryFilter,
      ConditionalOperator: conditionalOperator,
      ScanIndexForward: scanIndexForward,
      ExclusiveStartKey: exclusiveStartKey,
      ReturnConsumedCapacity: returnConsumedCapacity,
      ProjectionExpression: projectionExpression,
      FilterExpression: filterExpression,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };
    return await docClient.query(params).promise();
  } catch (e) {
    console.error("ERROR", `Could Not Query  ${tableName} ${indexName} ${e}`);
    throw e;
  }
};

module.exports = {
  putDocument,
  updateDocument,
  query,
};
