import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
    IsBoolean,
} from 'class-validator'

export class CreateRoleDto implements Record<string, unknown> {
    [key: string]: unknown
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    description: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[]

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}
