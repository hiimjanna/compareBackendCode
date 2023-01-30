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
import { HomePageService } from './homePage.service';
//import dtos
import { GetNewestAdditionalInfoReqDTO, GetNewestAdditionalInfoRespDTO } from './dto/getNewestAdditionalInfo';
import { GetNewestCloudFileReqDTO, GetNewestCloudFileRespDTO } from './dto/getNewestCloudFile';
import { GetNewestDiscourseArticleReqDTO, GetNewestDiscourseArticleRespDTO } from './dto/getNewestDiscourseArticle';
import { GetNewestVersionUpdateReqDTO, GetNewestVersionUpdateRespDTO } from './dto/getNewestVersionUpdate';
import { GetPopularAdditionalInfoReqDTO, GetPopularAdditionalInfoRespDTO } from './dto/getPopularAdditionalInfo';
import { GetRevenueTop3ReqDTO, GetRevenueTop3RespDTO } from './dto/getRevenueTop3';

@Controller('/homePage')
@ApiTags('HomePage - 首頁')

export class HomePageController{

    constructor(private readonly homePageService: HomePageService) {}
    
    @Post('/getNewestAdditionalInfo')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (Number)                          \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n' +
        'additionInfoList (Array_of_Object)       \/ Object包含appId、app的更新版本、文章圖片、補充資料標題、補充資料的ObjectID、編輯者、最後編輯時間(順序由日期最近到最遠)\n\n' + 
        '\tappId (String) ex: "586634331"\n\n' + 
        '\tversion (String) ex: "1.2.0"\n\n' + 
        '\tscreenshot (String) ex: "https://static-s.aa-cdn.net/img/ios..."\n\n' + 
        '\tfeatureName (String) ex: "限時活動_Board Trip"\n\n' + 
        '\tfeatureId (String) ex: "6333dd6f68fa93001cec40eb"\n\n' + 
        '\teditor (String) ex: "jingyuhuang"\n\n' + 
        '\tlatestUpdateDate (String) ex: "2021-07-02T06:32:17.931Z"' ,
        type:GetNewestAdditionalInfoRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'count (Number)           \/ 輸入獲取最近的幾筆資料(預設為12筆)\n\n' +
        '\tex: 12\n\n',
        type: GetNewestAdditionalInfoReqDTO,
        required: false
    })
    async GetNewestAdditionalInfo(@Headers() headers, @Body() body: GetNewestAdditionalInfoReqDTO, @Req() req){
        //找資料
        return this.homePageService.fetchNewestAdditionalInfo(body)
    }

    @Post('/getRevenueTop3')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (Number)                          \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n' +
        'date (Number)           \/ 更新日期\n\n' +
        '\tex: 16571520000000\n\n' + 
        'days (Number)           \/ 選擇數據比對區間 7/14/30 天 (預設為 7 天)\n\n' +
        '\tex: 7\n\n' +
        'revenueTop3List (Array_of_Object)        \/ Object包含app名稱、appId、開發商、遊戲類型、國家、平台、營收數值(順序由營收高到營收低，分別有數值及幅度%)\n\n' + 
        '\tappName (String) ex: "House of Fun™ - Casino Slots"\n\n' + 
        '\tappId (String) ex: "586634331"\n\n' + 
        '\tappType (Array_of_String) ex: ["卡牌","博弈"]\n\n' + 
        '\tcompanyName (String) ex: "Playtika"\n\n' + 
        '\tplatform (String) ex: "iOS"\n\n' + 
        '\tcountry (String) ex: "Japan"\n\n' +
        '\trevenueCount (Number) ex: 33.7\n\n' +
        '\trevenueDiff (Number) ex: 1500' ,
        type: GetRevenueTop3RespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'count (Number)           \/ 輸入獲取最近的幾筆資料(預設為3筆)\n\n' +
        '\tex: 3\n\n',
        type: GetRevenueTop3ReqDTO,
        required: false
    })
    async GetRevenueTop3(@Headers() headers, @Body() body: GetRevenueTop3ReqDTO, @Req() req){
        //找資料
        return this.homePageService.fetchRevenueTop3(body)
    }

    @Post('/getNewestVersionUpdate')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:  '回傳的資料包含:\n\n' +
        'status (Number)                          \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n' +
        'versionUpdateList (Array_of_Object)      \/ Object包含版本更新日期、app名稱、appId、開發商、遊戲類型、國家、平台(順序由日期最近到最遠)\n\n' + 
        '\tversionDate (String) ex: "2013-02-12T00:00:00.000Z"\n\n' +
        '\tversion (String) ex: "3.8.6"\n\n' +
        '\tappName (String) ex: "House of Fun™ - Casino Slots"\n\n' + 
        '\tappId (String) ex: "586634331"\n\n' + 
        '\tappType (Array_of_String) ex: ["卡牌","博弈"]\n\n' + 
        '\tcompanyName (String) ex: "Playtika"\n\n' + 
        '\tplatform (String) ex: "iOS"\n\n' + 
        '\tcountry (String) ex: "Japan"' ,
        type:GetNewestVersionUpdateRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'count (Number)           \/ 輸入獲取最近的幾筆資料(預設為4筆)\n\n' +
        '\tex: 4\n\n',
        type: GetNewestVersionUpdateReqDTO,
        required: false
    })
    async GetNewestVersionUpdate(@Headers() headers, @Body() body: GetNewestVersionUpdateReqDTO, @Req() req){
        //找資料
        return this.homePageService.fetchNewestVersionUpdate(body)
    }

    @Post('/getPopularAdditionalInfo')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'回傳的資料包含:\n\n' +
        'status (Number)                           \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n' +
        'popularAdditionInfoList (Array_of_Object) \/ Object包含appId、app的更新版本、國家、平台、補充資料標題、補充資料的ObjectID、編輯者、最後編輯時間、瀏覽次數(順序由瀏覽次數高至低)\n\n' + 
        '\tappId (String) ex: "586634331"\n\n' + 
        '\tversion (String) ex: "1.2.0"\n\n' + 
        '\tplatform (String) ex: "iOS"\n\n' + 
        '\tcountry (String) ex: "Japan"\n\n' +
        '\tfeatureName (String) ex: "限時活動_Board Trip"\n\n' + 
        '\tfeatureId (String) ex: "6333dd6f68fa93001cec40eb"\n\n' + 
        '\teditor (String) ex: "jingyuhuang"\n\n' + 
        '\tlatestUpdateDate (String) ex: "2021-07-02T06:32:17.931Z"\n\n' + 
        '\tviews (Number) ex: 1000' ,
        type: GetPopularAdditionalInfoRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'count (Number)           \/ 輸入獲取最近的幾筆資料(預設為5筆)\n\n' +
        '\tex: 5\n\n'+
        'filter (String)          \/ 選擇瀏覽次數篩選區間(共提供三種區間可選:yearly, lastQuarter, currentQuarter) 若不輸入，則會採計至今的總瀏覽次數\n\n' +
        '\tex: "yearly"\n\n',
        type: GetPopularAdditionalInfoReqDTO,
        required: false
    })
    async GetPopularAdditionalInfo(@Headers() headers, @Body() body: GetPopularAdditionalInfoReqDTO, @Req() req){
        //找資料
        return this.homePageService.fetchPopularAdditionalInfo(body)
    }

    @Post('/getNewestDiscourseArticle')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (Number)                           \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 \n\n' +
        'discourseArticleList (Array_of_Object)    \/ Object包含文章標題、作者、文章連結(順序由日期最近到最遠)\n\n' + 
        '\tarticleName (String) ex: "[新聞]微軟最大收購案..."\n\n' + 
        '\tauthor (String) ex: "lakyfang"\n\n' +
        '\tarticleUrl (String) ex: "https://discourse.i17game.net/t/topic/1339"',
        type: GetNewestDiscourseArticleRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'count (Number)           \/ 輸入獲取最近的幾筆資料(預設為6筆)\n\n' +
        '\tex: 6\n\n',
        type: GetNewestDiscourseArticleReqDTO,
        required: false
    })
    async GetNewestDiscourseArticle(@Headers() headers, @Body() body: GetNewestDiscourseArticleReqDTO, @Req() req){
        //找資料
        return this.homePageService.fetchNewestDiscourseArticle(body)
    }

    //無法由產學合作開發
    @Post('/getNewestCloudFile')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '回傳的資料包含:\n\n' +
        'status (Number)                           \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n'+
        '\tex: 0 ',
        type: GetNewestCloudFileRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'count (Number)           \/ 輸入獲取最近的幾筆資料(預設為6筆)\n\n' +
        '\tex: 6\n\n',
        type: GetNewestCloudFileReqDTO,
        required: false
    })
    async getText6(){
        //找資料
        return this.homePageService.getText('1')
    }
}