import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    Logger,
    Inject,
} from '@nestjs/common'
import { CreateRoleDto } from '../dto/create-role.dto'
import { UpdateRoleDto } from '../dto/update-role.dto'
import {
    IRoleService,
    ROLE_SERVICE_TOKEN,
} from '../interfaces/role-service.interface'

@Controller('roles')
export class RolesController {
    private readonly logger = new Logger(RolesController.name)

    constructor(
        @Inject(ROLE_SERVICE_TOKEN)
        private readonly rolesService: IRoleService
    ) {
        this.logger.log('RolesController initialized')
    }

    @Get('health')
    health() {
        return {
            status: 'ok',
            service: 'Nest Roles API',
            timestamp: new Date().toISOString(),
        }
    }

    @Get()
    async findAll(
        @Query('limit') limit?: number,
        @Query('lastEvaluatedKey') lastEvaluatedKey?: string
    ) {
        return this.rolesService.findAll({ limit, lastEvaluatedKey })
    }

    @Get('active')
    async findActiveRoles() {
        return this.rolesService.findActiveRoles()
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.rolesService.findById(id)
    }

    @Post()
    async create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto)
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto
    ) {
        return this.rolesService.update(id, updateRoleDto)
    }

    @Patch(':id/activate')
    async activate(@Param('id') id: string) {
        return this.rolesService.activate(id)
    }

    @Patch(':id/deactivate')
    async deactivate(@Param('id') id: string) {
        return this.rolesService.deactivate(id)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        return this.rolesService.delete(id)
    }
}
