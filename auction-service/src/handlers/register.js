import AWS from 'aws-sdk';
import commonMiddleware from '../../lib/commonMiddleware';
import createError from 'http-errors';

const cognito = new AWS.CognitoIdentityServiceProvider();

const register = async (event) => {
    try {
        // Check if event.body is a string and parse it
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        // Ensure body has email and password
        const { email, password } = body; 
        if (!email || !password) {
            throw new createError.BadRequest("Email and password are required");
        }

        const USER_POOL = process.env.USER_POOL;

        // Create the user in Cognito
        const result = await cognito.adminCreateUser({
            UserPoolId: USER_POOL,
            Username: email,
            UserAttributes: [
                {
                    Name: "email",
                    Value: email,
                },
            ],
            MessageAction: "SUPPRESS", // Suppress the welcome email
        }).promise();

        // Optionally, set the user's password
        if (result.User) {
            await cognito.adminSetUserPassword({
                UserPoolId: USER_POOL,
                Username: email,
                Password: password,
                Permanent: true,
            }).promise();
        }

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "User registered successfully" }),
        };
    } catch (error) {
        console.error(error);

        // Prepare the error response
        const statusCode = error.statusCode || 500;
        const message = error.message || 'An error occurred during registration';

        return {
            statusCode,
            body: JSON.stringify({ error: message }),
        };
    }
};

export const handler = commonMiddleware(register);