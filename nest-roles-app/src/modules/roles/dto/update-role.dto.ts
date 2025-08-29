import {
    IsOptional,
    IsString,
    IsArray,
    IsBoolean,
    MaxLength,
    MinLength,
} from 'class-validator'

export class UpdateRoleDto implements Record<string, unknown> {
    [key: string]: unknown
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name?: string

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(500)
    description?: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[]

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}
