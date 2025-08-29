export interface Role extends Record<string, unknown> {
    id: string
    name: string
    description: string
    permissions?: string[]
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export class RoleEntity implements Role {
    [key: string]: unknown
    id: string
    name: string
    description: string
    permissions?: string[]
    isActive: boolean
    createdAt: string
    updatedAt: string

    constructor(data: Partial<Role>) {
        this.id = data.id || ''
        this.name = data.name || ''
        this.description = data.description || ''
        this.permissions = data.permissions || []
        this.isActive = data.isActive !== undefined ? data.isActive : true
        this.createdAt = data.createdAt || new Date().toISOString()
        this.updatedAt = data.updatedAt || new Date().toISOString()
    }

    toJSON(): Role {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            permissions: this.permissions,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }
}
