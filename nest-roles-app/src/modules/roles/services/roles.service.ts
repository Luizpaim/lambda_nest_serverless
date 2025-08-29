import { Injectable, Inject, Logger } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { Role } from '../entities/role.entity'
import { CreateRoleDto } from '../dto/create-role.dto'
import { UpdateRoleDto } from '../dto/update-role.dto'
import {
    IRoleRepository,
    ROLE_REPOSITORY_TOKEN,
} from '../interfaces/role-repository.interface'
import { IRoleService } from '../interfaces/role-service.interface'

@Injectable()
export class RolesService implements IRoleService {
    private readonly logger = new Logger(RolesService.name)

    constructor(
        @Inject(ROLE_REPOSITORY_TOKEN)
        private readonly rolesRepository: IRoleRepository
    ) {
        this.logger.log('RolesService initialized')
    }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        try {
            // Verificar se já existe role com o mesmo nome
            const existingRole = await this.rolesRepository.findByName(
                createRoleDto.name
            )
            if (existingRole) {
                throw new Error(
                    `Role with name '${createRoleDto.name}' already exists`
                )
            }

            const role = Role.create({
                id: uuidv4(),
                name: createRoleDto.name,
                description: createRoleDto.description,
                permissions: createRoleDto.permissions,
                isActive: createRoleDto.isActive,
            })

            return await this.rolesRepository.save(role)
        } catch (error) {
            this.logger.error('Failed to create role:', error)
            throw new Error(`Failed to create role: ${error.message}`)
        }
    }

    async findAll(options?: {
        limit?: number
        lastEvaluatedKey?: string
    }): Promise<{
        items: Role[]
        count: number
        lastEvaluatedKey?: any
        timestamp: string
    }> {
        try {
            const result = await this.rolesRepository.findAll(options)
            return {
                ...result,
                timestamp: new Date().toISOString(),
            }
        } catch (error) {
            this.logger.error('Failed to get roles:', error)
            throw new Error(`Failed to retrieve roles: ${error.message}`)
        }
    }

    async findById(id: string): Promise<Role> {
        try {
            const role = await this.rolesRepository.findById(id)
            if (!role) {
                throw new Error(`Role with id ${id} not found`)
            }
            return role
        } catch (error) {
            this.logger.error('Failed to get role:', error)
            throw new Error(`Failed to retrieve role: ${error.message}`)
        }
    }

    async findActiveRoles(): Promise<{
        items: Role[]
        count: number
        timestamp: string
    }> {
        try {
            const items = await this.rolesRepository.findActiveRoles()
            return {
                items,
                count: items.length,
                timestamp: new Date().toISOString(),
            }
        } catch (error) {
            this.logger.error('Failed to get active roles:', error)
            throw new Error(`Failed to retrieve active roles: ${error.message}`)
        }
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
        try {
            const existingRole = await this.rolesRepository.findById(id)
            if (!existingRole) {
                throw new Error(`Role with id ${id} not found`)
            }

            // Verificar se o novo nome já existe (se fornecido)
            if (
                updateRoleDto.name &&
                updateRoleDto.name !== existingRole.name
            ) {
                const roleWithSameName = await this.rolesRepository.findByName(
                    updateRoleDto.name
                )
                if (roleWithSameName) {
                    throw new Error(
                        `Role with name '${updateRoleDto.name}' already exists`
                    )
                }
            }

            const updatedRole = existingRole.update({
                name: updateRoleDto.name,
                description: updateRoleDto.description,
                permissions: updateRoleDto.permissions,
                isActive: updateRoleDto.isActive,
            })

            return await this.rolesRepository.save(updatedRole)
        } catch (error) {
            this.logger.error('Failed to update role:', error)
            throw new Error(`Failed to update role: ${error.message}`)
        }
    }

    async activate(id: string): Promise<Role> {
        return this.update(id, { isActive: true })
    }

    async deactivate(id: string): Promise<Role> {
        return this.update(id, { isActive: false })
    }

    async delete(id: string): Promise<void> {
        try {
            const exists = await this.rolesRepository.exists(id)
            if (!exists) {
                throw new Error(`Role with id ${id} not found`)
            }

            await this.rolesRepository.delete(id)
        } catch (error) {
            this.logger.error('Failed to delete role:', error)
            throw new Error(`Failed to delete role: ${error.message}`)
        }
    }
}
