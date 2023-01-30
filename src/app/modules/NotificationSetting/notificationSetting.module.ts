import {Module} from '@nestjs/common'
import { NotificationSettingController } from './notificationSetting.controller'
import { NotificationSettingService } from './notificationSetting.service'

@Module({
    imports:[],
    controllers:[NotificationSettingController],
    providers:[NotificationSettingService],
})
export class NotificationSettingModule{}