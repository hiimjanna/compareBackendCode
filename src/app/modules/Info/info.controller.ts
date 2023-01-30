import {
    Controller,
    HttpCode,
    Get
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('/info')
@ApiTags('Info - 版本資訊')

export class InfoController {
    @Get()
    @HttpCode(200)
    @ApiOkResponse({
        description: '版本資訊',
        type: String
    })
    async info() {   //, @Request() res
        const config = require('../../../../info.json')
        let version = config['version'];
        let env = config['environment'];
        return `Hello i17GameRefinery API! version:${version} Env:${env}`
    }
}