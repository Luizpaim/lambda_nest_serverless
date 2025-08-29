import {
    Context,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from 'aws-lambda'

import { CallbackHandler } from '@fastify/aws-lambda'
import { bootstrapLambdaApp } from './shared/config/bootstrap/bootstrap-lambda'
import { AppModule } from './app.module'

let proxy: CallbackHandler

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    if (!proxy) {
        proxy = await bootstrapLambdaApp(AppModule)
    }
    return new Promise((resolve, reject) => {
        proxy(event, context, (err, result) => {
            if (err) return reject(err)
            resolve(result as APIGatewayProxyResult)
        })
    })
}
