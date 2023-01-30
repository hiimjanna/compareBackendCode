import {Module} from '@nestjs/common'
import {CompetitorRetrievalController} from './competitorRetrieval.controller'
import { CompetitorRetrievalService } from './competitorRetrieval.service'

@Module({
    imports:[],
    controllers:[CompetitorRetrievalController],
    providers:[CompetitorRetrievalService],
})
export class CompetitorRetrievalModule{}