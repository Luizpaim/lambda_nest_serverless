import { Role } from '../entities/role.entity'
import { CreateRoleDto } from '../dto/create-role.dto'
import { UpdateRoleDto } from '../dto/update-role.dto'

export interface IRoleService {
    create(createRoleDto: CreateRoleDto): Promise<Role>
    findAll(options?: { limit?: number; lastEvaluatedKey?: string }): Promise<{
        items: Role[]
        count: number
        lastEvaluatedKey?: any
        timestamp: string
    }>
    findById(id: string): Promise<Role>
    findActiveRoles(): Promise<{
        items: Role[]
        count: number
        timestamp: string
    }>
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role>
    activate(id: string): Promise<Role>
    deactivate(id: string): Promise<Role>
    delete(id: string): Promise<void>
}

export const ROLE_SERVICE_TOKEN = 'IRoleService'
