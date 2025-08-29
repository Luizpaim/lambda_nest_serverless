import { Module } from '@nestjs/common'
import { RolesController } from './controllers/roles.controller'
import { RolesService } from './services/roles.service'
import { RolesRepository } from './repository/roles.repository'
import { DynamoDBClientFactory } from './services/dynamodb-client.factory'
import { ROLE_SERVICE_TOKEN } from './interfaces/role-service.interface'
import { ROLE_REPOSITORY_TOKEN } from './interfaces/role-repository.interface'
import { DATABASE_CLIENT_FACTORY_TOKEN } from './interfaces/database-client.interface'

@Module({
    controllers: [RolesController],
    providers: [
        {
            provide: ROLE_SERVICE_TOKEN,
            useClass: RolesService,
        },
        {
            provide: ROLE_REPOSITORY_TOKEN,
            useClass: RolesRepository,
        },
        {
            provide: DATABASE_CLIENT_FACTORY_TOKEN,
            useClass: DynamoDBClientFactory,
        },
    ],
    exports: [ROLE_SERVICE_TOKEN, ROLE_REPOSITORY_TOKEN],
})
export class RolesModule {}
