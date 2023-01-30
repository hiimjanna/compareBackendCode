import {Module} from '@nestjs/common'
import { CompetitorRetrievalDetailController } from './competitorRetrievalDetail.controller'
import { CompetitorRetrievalDetailService } from './competitorRetrievalDetail.service'
@Module({
    imports:[],
    controllers:[CompetitorRetrievalDetailController],
    providers:[CompetitorRetrievalDetailService],
})
export class CompetitorRetrievalDetailModule{}