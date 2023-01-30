import { Module } from '@nestjs/common'
import { UpdateImpactsController } from './updateImpacts.controller'
import { UpdateImpactsService } from './updateImpacts.service'

@Module({
    imports: [],
    controllers: [UpdateImpactsController],
    providers: [UpdateImpactsService],
})
export class UpdateImpactsModule {}