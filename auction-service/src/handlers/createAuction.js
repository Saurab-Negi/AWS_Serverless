import { v4 as uuid } from 'uuid'
import AWS from 'aws-sdk'
import middy from '@middy/core'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpErrorHandler from '@middy/http-error-handler'
import createError from 'http-errors'

const dynamodb= new AWS.DynamoDB.DocumentClient();

const createAuction = async (event) => {
  const { title }= event.body;
  const now= new Date();

  const auction= {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
  }

  try {
    await dynamodb.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    }).promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

    return {
      statusCode: 201,
      body: JSON.stringify(auction),
    };
  };

// Wrap the createAuction function with middy and attach middlewares
export const handler = middy(createAuction)
  .use(httpJsonBodyParser()) // Automatically parses JSON bodies
  .use(httpEventNormalizer()) // Normalizes HTTP events (e.g., query params, etc.)
  .use(httpErrorHandler()); // Handles errors and formats responses