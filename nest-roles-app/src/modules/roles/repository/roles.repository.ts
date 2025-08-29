import { Injectable, Inject } from '@nestjs/common'
import { Role } from '../entities/role.entity'
import { IRoleRepository } from '../interfaces/role-repository.interface'
import {
    IDatabaseClientFactory,
    DATABASE_CLIENT_FACTORY_TOKEN,
} from '../interfaces/database-client.interface'

@Injectable()
export class RolesRepository implements IRoleRepository {
    private readonly tableName = process.env.DYNAMODB_TABLE_ROLES || 'roles'

    constructor(
        @Inject(DATABASE_CLIENT_FACTORY_TOKEN)
        private readonly clientFactory: IDatabaseClientFactory
    ) {}

    async findAll(options?: {
        limit?: number
        lastEvaluatedKey?: string
    }): Promise<{
        items: Role[]
        count: number
        lastEvaluatedKey?: any
    }> {
        const client = await this.clientFactory.createClient()

        const scanParams: any = {
            TableName: this.tableName,
        }

        if (options?.limit) {
            scanParams.Limit = Number(options.limit)
        }

        if (options?.lastEvaluatedKey) {
            scanParams.ExclusiveStartKey = JSON.parse(options.lastEvaluatedKey)
        }

        const result = await client.scan(scanParams)

        return {
            items: (result.Items || []).map(this.mapToRole),
            count: result.Count || 0,
            lastEvaluatedKey: result.LastEvaluatedKey,
        }
    }

    async findById(id: string): Promise<Role | null> {
        const client = await this.clientFactory.createClient()

        const result = await client.get({
            TableName: this.tableName,
            Key: { id },
        })

        return result.Item ? this.mapToRole(result.Item) : null
    }

    async findByName(name: string): Promise<Role | null> {
        const client = await this.clientFactory.createClient()

        const result = await client.scan({
            TableName: this.tableName,
            FilterExpression: '#name = :name',
            ExpressionAttributeNames: {
                '#name': 'name',
            },
            ExpressionAttributeValues: {
                ':name': name,
            },
        })

        const items = result.Items || []
        return items.length > 0 ? this.mapToRole(items[0]) : null
    }

    async findActiveRoles(): Promise<Role[]> {
        const client = await this.clientFactory.createClient()

        const result = await client.scan({
            TableName: this.tableName,
            FilterExpression: 'isActive = :isActive',
            ExpressionAttributeValues: {
                ':isActive': true,
            },
        })

        return (result.Items || []).map(this.mapToRole)
    }

    async save(role: Role): Promise<Role> {
        const client = await this.clientFactory.createClient()

        await client.put({
            TableName: this.tableName,
            Item: role.toJSON(),
        })

        return role
    }

    async delete(id: string): Promise<void> {
        const client = await this.clientFactory.createClient()

        await client.delete({
            TableName: this.tableName,
            Key: { id },
        })
    }

    async exists(id: string): Promise<boolean> {
        const role = await this.findById(id)
        return role !== null
    }

    private mapToRole(item: any): Role {
        return new Role(
            item.id,
            item.name,
            item.description,
            item.permissions || [],
            item.isActive,
            item.createdAt,
            item.updatedAt
        )
    }
}
