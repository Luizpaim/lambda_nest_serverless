import { NestFactory } from '@nestjs/core'
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify'
import fastifyLambda from '@fastify/aws-lambda'

export async function bootstrapLambdaApp(module: any) {
    const app = await NestFactory.create<NestFastifyApplication>(
        module,
        new FastifyAdapter()
    )

    app.enableCors()
    await app.init()

    const fastifyInstance = app.getHttpAdapter().getInstance()
    return fastifyLambda(fastifyInstance)
}
