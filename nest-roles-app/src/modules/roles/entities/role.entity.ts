export class Role {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public readonly permissions: string[],
        public readonly isActive: boolean,
        public readonly createdAt: string,
        public readonly updatedAt: string
    ) {}

    static create(data: {
        id: string
        name: string
        description: string
        permissions?: string[]
        isActive?: boolean
    }): Role {
        const now = new Date().toISOString()
        return new Role(
            data.id,
            data.name,
            data.description,
            data.permissions || [],
            data.isActive !== undefined ? data.isActive : true,
            now,
            now
        )
    }

    update(data: {
        name?: string
        description?: string
        permissions?: string[]
        isActive?: boolean
    }): Role {
        return new Role(
            this.id,
            data.name !== undefined ? data.name : this.name,
            data.description !== undefined
                ? data.description
                : this.description,
            data.permissions !== undefined
                ? data.permissions
                : this.permissions,
            data.isActive !== undefined ? data.isActive : this.isActive,
            this.createdAt,
            new Date().toISOString()
        )
    }

    deactivate(): Role {
        return this.update({ isActive: false })
    }

    activate(): Role {
        return this.update({ isActive: true })
    }

    toJSON() {
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
