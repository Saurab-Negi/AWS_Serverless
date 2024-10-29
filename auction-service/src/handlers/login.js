import AWS from 'aws-sdk';
import commonMiddleware from '../../lib/commonMiddleware';
import createError from 'http-errors';

const cognito = new AWS.CognitoIdentityServiceProvider();

const login = async (event) => {
    try {
        // Check if event.body is a string and parse it
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        // Ensure body has email and password
        const { email, password } = body; 
        if (!email || !password) {
            throw new createError.BadRequest("Email and password are required");
        }

        const USER_POOL = process.env.USER_POOL;
        const USER_CLIENT = process.env.USER_CLIENT;

        // Authenticate the user in Cognito
        const response = await cognito.adminInitiateAuth({
            AuthFlow: "ADMIN_NO_SRP_AUTH",
            UserPoolId: USER_POOL,
            ClientId: USER_CLIENT,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            },
        }).promise();

        // Successful login
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Login successful",
                data: response.AuthenticationResult
            }),
        };
    } catch (error) {
        console.error(error);

        // Prepare the error response
        const statusCode = error.statusCode || 500;
        const message = error.message || 'An error occurred during login';

        return {
            statusCode,
            body: JSON.stringify({ error: message }),
        };
    }
};

export const handler = commonMiddleware(login);