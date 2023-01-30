import {Module} from '@nestjs/common'
import { HomePageService } from './homePage.service'
import { HomePageController } from './homePage.controller'

@Module({
    imports:[],
    controllers:[HomePageController],
    providers:[HomePageService],
})
export class HomePageModule{}