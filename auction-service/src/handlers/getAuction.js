import AWS from 'aws-sdk'
import commonMiddleware from '../../lib/commonMiddleware';
import createError from 'http-errors'

const dynamodb= new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id){
  let auction;

  try {
    const result= await dynamodb.get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
    }).promise();

    auction= result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if(!auction){
    throw new createError.NotFound(`Auction with ID: "${id}" not found!`);
  }

  return auction;
}

const getAuction = async (event) => {
  const { id }= event.pathParameters;
  const auction= await getAuctionById(id);

    return {
      statusCode: 200,
      body: JSON.stringify(auction),
    };
  };

// Wrap the createAuction function with middy and attach middlewares
export const handler = commonMiddleware(getAuction);