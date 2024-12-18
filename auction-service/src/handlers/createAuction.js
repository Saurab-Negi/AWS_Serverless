import { v4 as uuid } from 'uuid'
import AWS from 'aws-sdk'
import commonMiddleware from '../../lib/commonMiddleware';
import createError from 'http-errors'

const dynamodb= new AWS.DynamoDB.DocumentClient();

const createAuction = async (event) => {
  const { title }= event.body;
  const now= new Date();
  const endDate= new Date();
  endDate.setHours(now.getHours() +1);

  const auction= {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    }
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
export const handler = commonMiddleware(createAuction);