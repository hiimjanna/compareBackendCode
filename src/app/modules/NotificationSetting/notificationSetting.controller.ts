import {
    Controller,
    Post,
    Get,
    Body,
    HttpCode,
    Headers,
    Logger,
    Inject,
    Req
}from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { NotificationSettingService } from './notificationSetting.service';
//import dtos
import { GetNotificationListReqDTO, GetNotificationListRespDTO} from './dto/getNotificationList';
import { GetNotificationSettingReqDTO, GetNotificationSettingRespDTO } from './dto/getNotificationSetting';
import { RemoveItemFromNotificationListReqDTO,  RemoveItemFromNotificationListRespDTO} from './dto/removeItemFromNotificationList';
import { SetEmailNotificationReqDTO, SetEmailNotificationRespDTO } from './dto/setEmailNotification';
import { UpdateNotificationListReqDTO, UpdateNotificationListRespDTO } from './dto/updateNotificationList';
import { UpdateNotificationSettingReqDTO, UpdateNotificationSettingRespDTO } from './dto/updateNotificationSetting';
import { ReadNotificationReqDTO, ReadNotificationRespDTO } from './dto/readNotification';
import { GetNotificationContentListReqDTO, GetNotificationContentListRespDTO } from './dto/getNotificationContentList';
import { GetEvaluationDataReqDTO } from '../CompetitorRetrievalDetail/dto/getEvaluationData';

@Controller('/notificationSetting')
@ApiTags('NotificationSetting - 通知設定')

export class NotificationSettingController{

    constructor(private readonly notificationSettingService: NotificationSettingService) {}
    
    @Post('/getNotificationList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (number)                          \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n' +
        'enableEmailNotification (Boolean)        \/ 是否開啟該帳號的email通知\n\n' +
        '\tex: true \n\n' +
        'notificationSortedBy (String)        \/ 通知設定排序選項("Game"/"Country")與Email是否開啟\n\n' +
        '\tex: "Country" \n\n'  +
        'notificationList (Array_of_Object)       \/ Object包含appId、文章圖片、標題、最後編輯者、最後編輯時間(順序由最近到最遠)\n\n' + 
        '\tappName (String) ex:"House of Fun™ - Casino Slots"\n\n' +
        '\tappID (String) ex: "586634331"\n\n' + 
        '\tappType (Array_of_String) ex: [”卡牌”,”博弈”]\n\n' +
        '\tcompanyName (String) ex:”Playtika”\n\n' +
        '\tplatform (String) ex:”iOS”\n\n' +
        '\tcountry (String) ex: “China”\n\n' +
        '\tversionUpdate (Boolean) ex: true\n\n' +
        '\trevenueList (Array_of_Object)  ex: [{day: 1, value: 10 }]\n\n'+
        '\tdownloadList (Array_of_Object) ex: [{day: 7, value: 15 }]\n\n' +
        '\tenable_versionUpdate (Object)             \/ 版本更新通知的通知開啟設定\n\n' +
        '\t\tenable (Boolean) ex: true\n\n'+
        '\t\tenable_email (Boolean) ex: true\n\n'+
        '\t\tenable_website (Boolean) ex: true\n\n'+
        '\tenable_revenue (Object)                   \/ 營收額通知的通知開啟設定\n\n' +
        '\t\tenable (Boolean) ex: true\n\n'+
        '\t\tenable_email (Boolean) ex: true\n\n'+
        '\t\tenable_website (Boolean) ex: true\n\n'+
        '\tenable_download (Object)                  \/ 下載量通知的通知開啟設定\n\n' +
        '\t\tenable (Boolean) ex: true\n\n'+
        '\t\tenable_email (Boolean) ex: true\n\n'+
        '\t\tenable_website (Boolean) ex: true\n\n',
        type:GetNotificationListRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)           \/ 辨識哪個用戶\n\n' +
        '\tex: "Admin1@igs.com.tw"\n\n' +
        'mode (String)              \/ 取得資料的不同模式(模式共有: default(不須填該項)、idOnly)\n\n' +
        '\tex: "idOnly"\n\n' ,
        type: GetNotificationListReqDTO
    })
    async getNotificationList(@Headers() headers, @Body() body: GetNotificationListReqDTO, @Req() req){
        return this.notificationSettingService.fetchNotificationList(body)
    }

    @Post('/getNotificationSetting')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (number)                          \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n' +
        'versionUpdate (Boolean)                  \/ 版本更新通知的設定有無\n\n' + 
        '\tex: true\n\n' +
        'revenueList (Array_of_Object)            \/ 營收額通知列表，Object包含該通知是前後幾天以及提升幅度比例\n\n' +
        '\tex: [{day: 1, value: 10 }]\n\n'+
        'downloadList (Array_of_Object)           \/ 下載量通知列表，Object包含該通知是前後幾天以及提升幅度比例\n\n' +
        '\tex: [{day: 7, value: 15 }]\n\n'+
        'enable_versionUpdate (Object)            \/ 版本更新通知的通知開啟設定\n\n' +
        '\tenable (Boolean) ex: true\n\n'+
        '\tenable_email (Boolean) ex: true\n\n'+
        '\tenable_website (Boolean) ex: true\n\n'+
        'enable_revenue (Object)                  \/ 營收額通知的通知開啟設定\n\n' +
        '\tenable (Boolean) ex: true\n\n'+
        '\tenable_email (Boolean) ex: true\n\n'+
        '\tenable_website (Boolean) ex: true\n\n'+
        'enable_download (Object)                 \/ 下載量通知的通知開啟設定\n\n' +
        '\tenable (Boolean) ex: true\n\n'+
        '\tenable_email (Boolean) ex: true\n\n'+
        '\tenable_website (Boolean) ex: true\n\n',
        type: GetNotificationSettingRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)           \/ 辨識哪個用戶\n\n' +
        '\tex: "Admin1@igs.com.tw"' +
        'appid (String)             \/ 欲移除App通知的id名稱\n\n' +
        '\tex: "586634331"',
        type: GetNotificationSettingReqDTO,
        required: true
    })
    async getNotificationSetting(@Headers() headers, @Body() body: GetNotificationListReqDTO, @Req() req){
        return this.notificationSettingService.fetchNotificationSetting(body)
    }

    @Post('/removeItemFromNotificationList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:  '回傳的資料包含:\n\n' +
        'status (number)                          \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n' ,
        type:RemoveItemFromNotificationListRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)                         \/ 辨識哪個用戶\n\n' +
        '\tex: "Admin1@igs.com.tw"\n\n' +
        'appid (String)                           \/ 欲移除App通知的id名稱\n\n' +
        '\tex: "586634331"' ,
        type: RemoveItemFromNotificationListReqDTO,
        required: true
    })
    async removeItemFromNotificationList(@Headers() headers, @Body() body: GetNotificationListReqDTO, @Req() req){
        return this.notificationSettingService.removeItemFromNotificationList(body)
    }

    @Post('/setEmailNotification')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'回傳的資料包含:\n\n' +
        'status (number)                          \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n' ,
        type: SetEmailNotificationRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)                         \/ 辨識哪個用戶\n\n' +
        '\tex: "Admin1@igs.com.tw"\n\n' +
        'enableEmailNotification (Boolean)        \/ 是否開啟該帳號的email通知\n\n' +
        '\tex: true \n\n' +
        'notificationSortedBy (String)        \/ 通知設定排序選項("Game"/"Country")與Email是否開啟\n\n' +
        '\tex: "Country" \n\n' ,
        type: SetEmailNotificationReqDTO,
        required: true
    })
    async setEmailNotification(@Headers() headers, @Body() body: GetNotificationListReqDTO, @Req() req){
        return this.notificationSettingService.setEmailNotification(body)
    }

    @Post('/updateNotificationList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (number)                           \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n',
        type: UpdateNotificationListRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)                          \/ 辨識哪個用戶\n\n' +
        '\tex: "Admin1@igs.com.tw"\n\n' +
        'appidList (Array_of_String)               \/ 欲更改追蹤的appid名單\n\n' +
        '\tex: ["1339550728", "805603214", "586634331"]' ,
        type: UpdateNotificationListReqDTO,
        required: true
    })
    async updateNotificationList(@Headers() headers, @Body() body: GetNotificationListReqDTO, @Req() req){
        return this.notificationSettingService.updateNotificationList(body)
    }

    @Post('/updateNotificationSetting')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (number)                           \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 ',
        type: UpdateNotificationSettingRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)                          \/ 辨識哪個用戶\n\n' +
        '\tex: "Admin1@igs.com.tw"\n\n' +
        'appid (String)                            \/ 欲移除App通知的id名稱\n\n' +
        '\tex: "586634331"\n\n'+
        'versionUpdate (Boolean)                   \/ 版本更新通知的設定有無\n\n' + 
        '\tex: true\n\n' +
        'revenueList (Array_of_Object)             \/ 營收額通知列表，Object包含該通知是前後幾天以及提升幅度比例\n\n' +
        '\tex: [{day: 1, value: 10 }]\n\n'+
        'downloadList (Array_of_Object)            \/ 下載量通知列表，Object包含該通知是前後幾天以及提升幅度比例\n\n' +
        '\tex: [{day: 7, value: 15 }]\n\n'+
        'enable_versionUpdate (Object)             \/ 版本更新通知的通知開啟設定\n\n' +
        '\tenable (Boolean) ex: true\n\n'+
        '\tenable_email (Boolean) ex: true\n\n'+
        '\tenable_website (Boolean) ex: true\n\n'+
        'enable_revenue (Object)                   \/ 營收額通知的通知開啟設定\n\n' +
        '\tenable (Boolean) ex: true\n\n'+
        '\tenable_email (Boolean) ex: true\n\n'+
        '\tenable_website (Boolean) ex: true\n\n'+
        'enable_download (Object)                  \/ 下載量通知的通知開啟設定\n\n' +
        '\tenable (Boolean) ex: true\n\n'+
        '\tenable_email (Boolean) ex: true\n\n'+
        '\tenable_website (Boolean) ex: true\n\n',
        type: UpdateNotificationSettingReqDTO,
        required: true
    })
    async updateNotificationSetting(@Headers() headers, @Body() body: GetNotificationListReqDTO, @Req() req){
        return this.notificationSettingService.updateNotificationSetting(body)
    }

    @Post('/readNotification')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (number)                           \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0\n\n',
        type: ReadNotificationRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)                          \/ 辨識哪個用戶\n\n' +
        '\tex: "Admin1@igs.com.tw"\n\n',
        type: ReadNotificationReqDTO,
        required: true
    })
    async readNotification(@Headers() headers, @Body() body: GetEvaluationDataReqDTO, @Req() req){
        return this.notificationSettingService.readNotification(body)
    }

    @Post('/getNotificationContentList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (number)                           \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0\n\n' +
        'numberOfUnread (number)                            \/ 未讀訊息的數量\n\n' +
        '\tex: 3\n\n'+
        'notificationList (Array_of_Object)                   \/ 通知訊息內容\n\n' + 
        '\tex: [{appid: "586634331", platform: "iOS", tag: "Reveune", content: "7天前後，下載量提升幅度大於15%", creationTime: 1361664000000, isRead: true}]\n\n',
        type: GetNotificationContentListRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)                          \/ 辨識哪個用戶\n\n' +
        '\tex: "Admin1@igs.com.tw"\n\n',
        type: GetNotificationContentListReqDTO,
        required: true
    })
    async getNotificationContentList(@Headers() headers, @Body() body: GetNotificationContentListReqDTO, @Req() req){
        return this.notificationSettingService.fetchNotificationContentList(body)
    }

    //For Notification Content Compuatation Testing
    @Post('/UpdateNotificationTestAPI')
    @HttpCode(200)
    async updateNotificationContent(){
        await this.notificationSettingService.updateNotification()
        this.notificationSettingService.fetchNotifications('Admin1@igs.com.tw')
    }

    //For Email Testing
    @Post('/SendingEmailTestAPI')
    @HttpCode(200)
    async sendEmailTest(){
        this.notificationSettingService.sendOutlookMail()
        return ''
    }
}