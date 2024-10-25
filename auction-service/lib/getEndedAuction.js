import AWS from 'aws-sdk'

const dynamodb= new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions(){
    const now= new Date();

    const params= {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate', // Ensure this index exists and is properly configured
        KeyConditionExpression: '#status = :status AND #endingAt <= :now',
        ExpressionAttributeValues: {
            ':status': 'OPEN',
            ':now': now.toISOString(),
        },
        ExpressionAttributeNames: {
            '#status': 'status',
            '#endingAt': 'endingAt'
        },
    }

    try {
        const result = await dynamodb.query(params).promise();
        return result.Items;
    } catch (error) {
        console.error('Error querying ended auctions:', error);
        throw new Error('Could not retrieve ended auctions');
    }
}