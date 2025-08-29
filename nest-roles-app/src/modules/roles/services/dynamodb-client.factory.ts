import { Injectable } from '@nestjs/common'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    DynamoDBDocumentClient,
    ScanCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import {
    IDatabaseClient,
    IDatabaseClientFactory,
} from '../interfaces/database-client.interface'

export class DynamoDBClientAdapter implements IDatabaseClient {
    constructor(private readonly docClient: DynamoDBDocumentClient) {}

    async scan(params: any): Promise<any> {
        const command = new ScanCommand(params)
        return await this.docClient.send(command)
    }

    async get(params: any): Promise<any> {
        const command = new GetCommand(params)
        return await this.docClient.send(command)
    }

    async put(params: any): Promise<any> {
        const command = new PutCommand(params)
        return await this.docClient.send(command)
    }

    async update(params: any): Promise<any> {
        const command = new UpdateCommand(params)
        return await this.docClient.send(command)
    }

    async delete(params: any): Promise<any> {
        const command = new DeleteCommand(params)
        return await this.docClient.send(command)
    }
}

@Injectable()
export class DynamoDBClientFactory implements IDatabaseClientFactory {
    async createClient(): Promise<IDatabaseClient> {
        const client = new DynamoDBClient({
            region:
                process.env.AWS_REGION ||
                process.env.APP_AWS_REGION ||
                'sa-east-1',
            ...(process.env.DYNAMODB_ENDPOINT && {
                endpoint: process.env.DYNAMODB_ENDPOINT,
            }),
            ...(process.env.AWS_LAMBDA_FUNCTION_NAME
                ? {}
                : {
                      credentials:
                          process.env.AWS_ACCESS_KEY_ID &&
                          process.env.AWS_SECRET_ACCESS_KEY
                              ? {
                                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                                    secretAccessKey:
                                        process.env.AWS_SECRET_ACCESS_KEY,
                                }
                              : undefined,
                  }),
        })

        const docClient = DynamoDBDocumentClient.from(client)
        return new DynamoDBClientAdapter(docClient)
    }
}
