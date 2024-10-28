import AWS from 'aws-sdk'
import commonMiddleware from '../../lib/commonMiddleware';
import createError from 'http-errors'

const dynamodb= new AWS.DynamoDB.DocumentClient();

const getAuctions = async (event) => {
  const { status }= event.queryStringParameters;
  let auctions;
  
  const params= {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status =:status',
    ExpressionAttributeValues: {
      ':status': status,
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };

  try {
    const result= await dynamodb.query(params).promise();

    auctions= result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

    return {
      statusCode: 200,
      body: JSON.stringify(auctions),
    };
  };

// Wrap the createAuction function with middy and attach middlewares
export const handler = commonMiddleware(getAuctions);