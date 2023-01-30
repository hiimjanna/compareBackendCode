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
import { ApiHeader, ApiTags} from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { CompetitorRetrievalService } from './competitorRetrieval.service';
//import dtos
import { GetAllListRespDTO } from './dto/getAllList';
import { GetGameNameListRespDTO } from './dto/getGameNameList';
import { TrackingNode } from './dto/getTrackingList';
import { GetTrackingListReqDTO, GetTrackingListRespDTO } from './dto/getTrackingList';
import { RemoveItemFromListReqDTO, RemoveItemFromListRespDTO, RemoveItemFromAllUserTrackingListReqDTO } from './dto/removeItemFromList';
import { UpdateTrackingListReqDTO, UpdateTrackingListRespDTO } from './dto/updateTrackingList';


@Controller('/competitorRetrieval')
@ApiTags('CompetitorRetrieval - 競品檢索')

export class CompetitorRetrievalController{

    constructor(private readonly competitorRetrievalService: CompetitorRetrievalService) {}
    
    // Helper api
    @Get('/updateGameRetrievalCollection')
    @HttpCode(200)
    @ApiOkResponse({
        description: 'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        'updateCount (number)          \/ 更新的資料比數\n\n',
    })
    async updateGameRetrievalCollection () {
        return this.competitorRetrievalService.preDoGetTrackingList()
    }

    // Remove a game that is no longer used
    @Post('/removeItemFromAllUserTrackingList')
    @HttpCode(200)
    @ApiOkResponse({
        description: 'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        'touchedCount (number)          \/ 更新的帳號數量\n\n' +
        'touchedAccounts (number)          \/ 更新的帳號清單\n\n',
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)           \/ 欲移除的遊戲id (將從所有帳號的追蹤清單中移除)\n\n' +
        'confirmation (String)           \/ 再次輸入欲移除的遊戲id (需與appid一模一樣才會進行移除)\n\n',
        type: RemoveItemFromAllUserTrackingListReqDTO,
        required: false
    })
    async removeItemFromAllUserTrackingList (@Headers() headers, @Body() body, @Req() req) {
        return this.competitorRetrievalService.removeItemFromAllUserTrackingList(body)
    }

    // api receivers
    @Post('/getGameNameList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'gameNameList (Array_of_String)       \/ 所有遊戲的名稱清單\n\n' + 
        '\tex: ["Coin Master", "House of Fun™ - Casino Slots"]',
        type:GetGameNameListRespDTO
    })
    async getGameNameList(){
        //找資料
        return this.competitorRetrievalService.getGameNameList()
        
    }

    @Post('/getTrackingList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'TrackingNode的資料包含:\n\n' +
        'AppName (String)           \/ 該款APP的名稱\n\n' +
        '\tex: "House of Fun™ - Casino Slots"\n\n' + 
        'AppID (String)             \/ 辨認該款遊戲的ID\n\n' +
        '\tex: "586634331"\n\n' + 
        'AppType (Array_of_String)    \/ 遊戲類型標籤\n\n' +
        '\tex: [”卡牌”,”博弈”]\n\n' + 
        'CompanyName (String)       \/ 遊戲發布公司名稱\n\n' +
        '\tex: ”Playtika”\n\n' + 
        'Platform (String)          \/ 遊戲發布平台\n\n' +
        '\tex: ”iOS”\n\n' + 
        'Country (String)  \/ 遊戲發布的國家\n\n' +
        '\tex: ["Japan","United States", "Taiwan"]\n\n' + 
        'Rank (Array_of_Object)       \/ 該遊戲在不同日期的暢銷排名\n\n' +
        '\tex: { ”2022-05-13”: 72,”2022-05-14”: 81 }\n\n' +
        'Download (Array_of_Object)   \/ 該遊戲在不同日期的下載量\n\n'+
        '\tex: { ”2022-05-13”: 14904,”2022-05-14”: 14633 }\n\n' +
        'Revenue (Array_of_Object)    \/ 該遊戲在不同日期的營收\n\n' +
        '\tex: { ”2022-05-13”: 256094, ”2022-05-14”: 295318 }\n\n' +
        'ChartData_iOS (Array_of_Object)           \/ 該遊戲在iOS平台上的營收列表\n\n' +
        '\tex: {Date: 16571520000000, Revenue: 295318}\n\n' + 
        'ChartData_Android (Array_of_Object)           \/ 該遊戲在Android平台上的營收列表\n\n' +
        '\tex: {Date: 16571520000000, Revenue: 295318}\n\n',
        type: GetTrackingListRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)           \/ 欲取得追蹤清單的帳號\n\n' +
        '\tex: "accountname"\n\n',
        type: GetTrackingListReqDTO,
        required: false
    })
    async getTrackingList(@Headers() headers, @Body() body: GetTrackingListReqDTO, @Req() req){
        return this.competitorRetrievalService.getTrackingList(body)
    }

    @Post('/updateTrackingList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: 'Response的資料包含:\n\n' +
        'status (number)  \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n',
        type:UpdateTrackingListRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)           \/ 欲更改追蹤清單的帳號\n\n' +
        '\tex: "accountname"\n\n' + 
        'appList (Array_of_String)    \/ 欲替換的追蹤清單ID\n\n' +
        '\tex: ["1339550728","805603214","586634331"]',
        type: UpdateTrackingListReqDTO,
        required: false
    })
    async updateTrackingList(@Headers() headers, @Body() body: UpdateTrackingListReqDTO, @Req() req){
        return this.competitorRetrievalService.updateTrackingList(body);
    }

    @Post('/getAllList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: 'TrackingNode的資料包含:\n\n' +
        'AppName (String)           \/ 該款APP的名稱\n\n' +
        '\tex: "House of Fun™ - Casino Slots"\n\n' + 
        'AppID (String)             \/ 辨認該款遊戲的ID\n\n' +
        '\tex: "586634331"\n\n' + 
        'AppType (Array_of_String)    \/ 遊戲類型標籤\n\n' +
        '\tex: [”卡牌”,”博弈”]\n\n' + 
        'CompanyName (String)       \/ 遊戲發布公司名稱\n\n' +
        '\tex: ”Playtika”\n\n' + 
        'Platform (String)          \/ 遊戲發布平台\n\n' +
        '\tex: ”iOS”\n\n' + 
        'Countries (Array_of_String)  \/ 遊戲有發布的國家\n\n' +
        '\tex: ["Japan","United States", "Taiwan"]\n\n',
        type: GetAllListRespDTO
    })
    async getAllList(@Headers() headers){
        return this.competitorRetrievalService.getAllList();
    }

    @Post('/removeItemFromList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: 'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        'removalCount (number)          \/ 已刪除幾個trackingNode，0個或1個，判別有沒有刪除成功\n\n' + 
        '刪除成功 : 1\n\n' + 
        '刪除失敗 : 0',
        type: RemoveItemFromListRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'account (String)           \/ 欲移除追蹤項目的帳號\n\n' +
        '\tex: "accountname"\n\n' + 
        'appid (String)             \/ 欲移除的項目ID\n\n' +
        '\tex: "1339550728"',
        type: RemoveItemFromListReqDTO,
        required: true
    })
    async removeItemFromList (@Headers() headers, @Body() body: RemoveItemFromListReqDTO, @Req() req){
        
        return this.competitorRetrievalService.removeItemFromList(body.account,body.appid);
    }

    
}