import { Role } from '../entities/role.entity'

export interface IRoleRepository {
    findAll(options?: { limit?: number; lastEvaluatedKey?: string }): Promise<{
        items: Role[]
        count: number
        lastEvaluatedKey?: any
    }>
    findById(id: string): Promise<Role | null>
    findByName(name: string): Promise<Role | null>
    findActiveRoles(): Promise<Role[]>
    save(role: Role): Promise<Role>
    delete(id: string): Promise<void>
    exists(id: string): Promise<boolean>
}

export const ROLE_REPOSITORY_TOKEN = 'IRoleRepository'
