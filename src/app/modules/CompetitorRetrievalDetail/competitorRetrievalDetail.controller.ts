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
import { CompetitorRetrievalDetailService } from './competitorRetrievalDetail.service';
//import dto
import { GetEvaluationDataReqDTO, GetEvaluationDataRespDTO } from './dto/getEvaluationData';
import { GetComparisonDataReqDTO, GetComparisonDataRespDTO } from './dto/getComparisonData';
import { GetGameBasicInfoReqDTO, GetGameBasicInfoRespDTO } from './dto/getGameBasicInfo';
import { GetUserRetentionRateReqDTO, GetUserRetentionRateRespDTO } from './dto/getUserRetentionRate';
import { GetVersionGameInfoReqDTO, GetVersionGameInfoRespDTO } from './dto/getVersionGameInfo';
import { GetUpdateImpactsListRespDTO } from '../UpdateImpacts/dto/getUpdateImpactsList';
import { GetVersionInfoReqDTO, GetVersionInfoRespDTO } from './dto/getVersionInfo';
import { GetVersionListReqDTO, GetVersionListRespDTO } from './dto/getVersionList';
import { GetFunctionListReqDTO, GetFunctionListRespDTO } from './dto/getFunctionList';
import { GetAllFunctionNameReqDTO, GetAllFunctionNameRespDTO} from './dto/getAllFunctionName';
import { GetDownloadAndRevenueDataReqDTO, GetDownloadAndRevenueDataRespDTO} from './dto/getDownloadAndRevenueData';
import { GetRevenueAndRankReqDTO, GetRevenueAndRankRespDTO } from './dto/getRevenueAndRank';

@Controller('/competitorRetrievalDetail')
@ApiTags('CompetitorRetrievalDetail - 競品檢索(概況、補充資料、歷史更新、收入與下載)')

export class CompetitorRetrievalDetailController{
    constructor(private readonly competitorRetrievalDetailService: CompetitorRetrievalDetailService) {}
    
    @Post('/getComparisonData')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        '\tex: 0\n\n' +
        'VersionDate (String)       \/ 版本更新日期\n\n' +
        '\tex: 1626192000000\n\n' +
        'Version (String)           \/ 遊戲更新版本\n\n' +
        '\tex: "3.80"\n\n' +
        'GameName (String)          \/ 該款APP的名稱\n\n' +
        '\tex: "House of Fun™ - Casino Slots"\n\n' + 
        'CompanyName (String)       \/ 遊戲發布公司名稱\n\n' +
        '\tex: ”Playtika”\n\n' +
        'GameType (Array_of_String)   \/ 遊戲類型標籤\n\n' +
        '\tex: [”卡牌”,”博弈”]\n\n' +
        'Device (String)            \/ 遊戲發布裝置\n\n' +
        '\tex: ”iOS”\n\n' + 
        'AppID (String)             \/ 辨認該款遊戲的ID\n\n' +
        '\tex: "586634331"\n\n' +  
        'Income (Object)            \/ 收入及收入量更新\n\n' +
        '\tValue (number) ex: 27.43\n\n' +  
        '\tValueChange (number) ex: 26.19\n\n' +  
        'Downloads (Object)         \/ 下載及下載量更新\n\n' +
        '\tValue (number) ex: 27.43\n\n' +  
        '\tValueChange (number) ex: 26.19\n\n' + 
        'Income_Downloads (Object)  \/ 收入下載及收入下載量更新\n\n' +
        '\tValue (number) ex: 27.43\n\n' +  
        '\tValueChange (number) ex: 26.19\n\n' +   
        'Features (Object)          \/ 遊戲特色\n\n' +
        '\tex: 待更新(目前暫無資料)\n\n' +
        'CustomFeatures (Object)    \/ 該遊戲主要特色\n\n' +
        '\tid (String) ex: "6139cce0c875dbed274113a6"\n\n' +
        '\tCustomFeatures (String) ex: "test723123132"',
        type: GetComparisonDataRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n'+
        'tags (Array_of_String)       \/ 用於篩選的Tag\n\n' +
        '\tex: [”內容”,”活動”]\n\n'+
        'country (String)           \/ 用於篩選的遊戲發布國家\n\n' +
        '\tex: "Taiwan"\n\n'+
        'days (number)              \/ 圖表基準日數\n\n' +
        '\tex: 7\n\n',
        type: GetComparisonDataReqDTO,
        required: false
    })
    async getComparisonData(@Headers() headers, @Body() body: GetComparisonDataReqDTO, @Req() req){
        //找資料
        let result = this.competitorRetrievalDetailService.fetchComparisonData(body)
        
        // let resp: GetUpdateImpactsListRespDTO = await this.competitorRetrievalDetailService.formatUpdateInfluence(result, body.country)
        return result
    }
    
    @Post('/getGameBasicInfo')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        '\tex: 0\n\n' +
        'appID (String)             \/ 辨認該款遊戲的ID\n\n' +
        '\tex: "586634331"\n\n' + 
        'appName (String)           \/ 該款APP的名稱\n\n' +
        '\tex: "House of Fun™ - Casino Slots"\n\n' + 
        'appType (Array_of_String)    \/ 遊戲類型標籤\n\n' +
        '\tex: [”卡牌”,”博弈”]\n\n' + 
        'companyName (String)       \/ 遊戲發布公司名稱\n\n' +
        '\tex: ”Playtika”\n\n' + 
        'platform (String)          \/ 遊戲發布平台\n\n' +
        '\tex: ”iOS”\n\n' + 
        'countries (Array_of_String)  \/ 遊戲有發布的國家\n\n' +
        '\tex: ["Japan","United States", "Taiwan"]\n\n' + 
        'publishDate (Date)         \/ 遊戲發布日期\n\n' +
        '\tex: 1361664000000\n\n' +
        'updateDate (Date)          \/ 上次更新日期\n\n'+
        '\tex: 1656374400000\n\n' +
        'headquarter (String)       \/ 總部\n\n' +
        '\tex: ”United Kingdom”\n\n' +
        'equipment (String)         \/ 所需設備\n\n' +
        '\tex: 待更新\n\n' +
        'requirement (String)       \/ 需求\n\n' +
        '\tex: “Nécessite iOS 9.0 ou une version ultérieure. Compatible avec l’iPhone, l’iPad et l’iPod touch.”\n\n' + 
        'version (String)         \/ 遊戲版本\n\n' +
        '\tex: "1.2.3"\n\n',
        type: GetGameBasicInfoRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n',
        type: GetGameBasicInfoReqDTO,
        required: false
    })
    async getGameBasicInfo(@Headers() headers, @Body() body: GetGameBasicInfoReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchGameBasicInfo(body.appid)
    }

    @Post('/getVersionGameInfo')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        '\tex: 0\n\n' +
        'appID (String)             \/ 辨認該款遊戲的ID\n\n' +
        '\tex: "586634331"\n\n' + 
        'appName (String)           \/ 該款APP的名稱\n\n' +
        '\tex: "House of Fun™ - Casino Slots"\n\n' + 
        'appType (Array_of_String)    \/ 遊戲類型標籤\n\n' +
        '\tex: [”卡牌”,”博弈”]\n\n' + 
        'companyName (String)       \/ 遊戲發布公司名稱\n\n' +
        '\tex: ”Playtika”\n\n' + 
        'platform (String)          \/ 遊戲發布平台\n\n' +
        '\tex: ”iOS”\n\n' + 
        'countries (Array_of_String)  \/ 遊戲有發布的國家\n\n' +
        '\tex: ["Japan","United States", "Taiwan"]\n\n' +
        'version (String)           \/ 版本更新號\n\n' +
        '\tex: "1.1"\n\n' +
        'versionDate (number)       \/ 版本更新日期\n\n' +
        '\tex: "1361664000000"\n\n' +
        'description (String)       \/ 版本更新描述\n\n' +
        '\tex: "180+ Free Slots. 100 Free Spins for new players. Multiple ways to get Free Coins - Welcome Bonus, hourly coin gifts ......"\n\n' + 
        'income (Object)            \/ 收入及收入量更新\n\n' +
        '\tvalue (number) ex: 27.43\n\n' +  
        '\tvalueChange (number) ex: 26.19\n\n' +  
        'downloads (Object)         \/ 下載及下載量更新\n\n' +
        '\tvalue (number) ex: 27.43\n\n' +  
        '\tvalueChange (number) ex: 26.19\n\n' , 
        type: GetVersionGameInfoRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n',
        type: GetVersionGameInfoReqDTO,
        required: false
    })
    async getLatestVersionGameInfo(@Headers() headers, @Body() body: GetVersionGameInfoReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchVersionGameInfo(body)
    }

    @Post('/getEvaluationData')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        '\tex: 0\n\n' +
        'appID (String)             \/ 辨認該款遊戲的ID\n\n' +
        '\tex: "586634331"\n\n' + 
        'appName (String)           \/ 該款APP的名稱\n\n' +
        '\tex: "House of Fun™ - Casino Slots"\n\n' + 
        'appType (Array_of_String)    \/ 遊戲類型標籤\n\n' +
        '\tex: [”卡牌”,”博弈”]\n\n' + 
        'companyName (String)       \/ 遊戲發布公司名稱\n\n' +
        '\tex: ”Playtika”\n\n' + 
        'platform (String)          \/ 遊戲發布平台\n\n' +
        '\tex: ”iOS”\n\n' + 
        'countries (Array_of_String)  \/ 遊戲有發布的國家\n\n' +
        '\tex: ["Japan","United States", "Taiwan"]\n\n' + 
        'chartData (Array_of_Object)  \/ 圖表資料\n\n' +
        '\tDate (Date) ex:  1648339200000\n\n' +
        '\tValue (number) ex:  3\n\n' + 
        '\tisUpdated (boolean) ex:  false\n\n' + 
        'chartData_iOS (Array_of_Object)  \/ 圖表資料\n\n' +
        '\tDate (Date) ex:  1648339200000\n\n' +
        '\tValue (number) ex:  3\n\n' + 
        '\tisUpdated (boolean) ex:  false\n\n' + 
        'chartData_Android (Array_of_Object)  \/ 圖表資料\n\n' +
        '\tDate (Date) ex:  1648339200000\n\n' +
        '\tValue (number) ex:  3\n\n' + 
        '\tisUpdated (boolean) ex:  false\n\n' + 
        'chartData_AllCountries (Array_of_Object)  \/ 圖表資料\n\n' +
        '\tcountry (String) ex:  Taiwan\n\n' +
        '\tchartData (chartData) ex:  { Date: 1648339200000, Value: 3, isUpdated: true }\n\n',
        type:GetEvaluationDataRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n'+
        'country (String)           \/ 欲取得預覽內容的國家名稱(英文)\n\n' +
        '\tex: "Taiwan"\n\n'+
        'platform (String)          \/ 欲取得預覽內容的遊戲平台(英文)\n\n' +
        '\tex: "iOS"\n\n'+
        'startDate (String)         \/ 欲取得預覽內容的起始日期\n\n' +
        '\tex: "2022-03-27"\n\n'+
        'endDate (String)           \/ 欲取得預覽內容的結束日期\n\n' +
        '\tex: "2022-06-27"\n\n' +
        'dataType (String)          \/ 欲取得預覽內容的類別  (Rank, Revenue, Downloads)\n\n' +
        '\tex: "Downloads"\n\n',
        type: GetEvaluationDataReqDTO,
        required: false
    })
    async getEvaluationData(@Headers() headers, @Body() body: GetEvaluationDataReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchEvaluationData(body)
    }

    @Post('/getVersionInfo')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        '\tex: 0\n\n' +
        'content (String)           \/ 該版本的更新內容\n\n' +
        '\tex: "* New exciting game - Africa!\n\t* Improved stability\n\t* Reduced app size\n\t* Bug fixes"\n\n' + 
        'description (String)       \/ 更新描述\n\n' +
        '\tex: "180+ Free Slots. 100 Free Spins for new players. Multiple ways to get Free Coins - Welcome Bonus, hourly coin gifts ......"\n\n' + 
        'file_Size (String)         \/ 檔案大小\n\n' +
        '\tex: 166.48 mb\n\n' + 
        'publisher (Array_of_String)         \/ 發售商及網址\n\n' +
        '\tex: ["獅子科技","https://www.data.ai/apps/ios/publisher/1233117904"]\n\n' + 
        'screenshot (Array_of_String) \/ 該版本的廣告圖片\n\n' +
        '\tex: ["https://static-s.aa-cdn.net/img/ios/586634331/dc70103e144307c7d7a7a64cd7a46948_h250"]\n\n',
        type: GetVersionInfoRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n'+
        'version (String)           \/ 欲取得內容的遊戲版本號\n\n' +
        '\tex: "3.8"\n\n',
        type: GetVersionInfoReqDTO,
        required: false
    })
    async getVersionInfo(@Headers() headers, @Body() body: GetVersionInfoReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchVersionInfo(body);
    }

    @Post('/getVersionList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        '\tex: 0\n\n' +
        'versionAndDate (Array_of_Object)  \/ 該遊戲更新所有的版本及對應日期\n\n' +
        '\tversion (String) ex: "1.1"\n\n' +
        '\tdate (Date) ex: "2013-02-12T00:00:00.000Z"\n\n',
        type: GetVersionListRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n',
        type: GetVersionListReqDTO,
        required: false
    })
    async getVersionList(@Headers() headers, @Body() body: GetVersionListReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchVersionList(body.appid)
    }

    @Post('/getRevenueAndRank')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'revenue (Array_of_Object)   \/ 該遊戲的所有收入資料，Object包含當作基準的中間日期、更新日期、收入差異、前後七天資料\n\n' +
        'rank (Array_of_Object)      \/ 該遊戲的所有排名資料，Object包含更新日期、台灣、美國、日本、中國的排名及排名變化\n\n',
        type: GetRevenueAndRankRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n',
        type: GetRevenueAndRankReqDTO,
        required: false
    })
    async getRevenueAndRank(@Headers() headers, @Body() body: GetRevenueAndRankReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchRevenueAndRank(body)
    }

    @Post('/getUserRetentionRate')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'retentionRate (Array_of_Object)   \/ 該遊戲的所有使用者留存率\n\n' +
        '\tex: { "date": 1654041600000, "retention_1": 34.6, "retention_3": 34.6, "retention_7": 34.6, "retention_14": 34.6, "retention_30": 34.6 }\n\n',
        type: GetUserRetentionRateRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n',
        type: GetUserRetentionRateReqDTO,
        required: false
    })
    async getUserRetentionRate(@Headers() headers, @Body() body: GetUserRetentionRateReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchUserRetentionRate(body)
    }

    @Post('/getFunctionList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        '\tex: 0\n\n' +
        'functionList (Array_of_Object)  \/ Object包含功能名稱、tags、編輯者、編輯時間、版本日期、主要特色、圖片、流程\n\n' +
        '\tappId (String) ex: "586634331"\n\n' +
        '\tversion (String) ex: "3.80"\n\n' +
        '\ttags (Array_of_String) ex: [“限時活動”,”卡片”]\n\n' +
        '\tnewTag (Array_of_String) ex:  [“衝等活動”,"區域限定"]\n\n' +
        '\tfeatureName (String) ex: "限時活動_Board Trip"\n\n' +
        '\teditor (String) ex: "jingyuhuang"\n\n' +
        '\tversionDate (Date) ex: "2021-03-25T00:00:00.000Z"\n\n'+
        '\tlatestUpdateDate (Date) ex: "2021-07-02T06:32:17.931Z"\n\n',
        type: GetFunctionListRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n',
        type: GetFunctionListReqDTO,
        required: false
    })
    async getFunctionList(@Headers() headers, @Body() body: GetFunctionListReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchAllFeatures(body)
    }

    @Post('/getAllFunctionName')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        '\tex: 0\n\n' +
        'functionName (Array_of_String)  \/ 該遊戲的所有功能名稱\n\n' +
        '\tex: ["限時活動_Board Trip", "功能_HOF Album"]\n\n',
        type: GetAllFunctionNameRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n',
        type: GetAllFunctionNameReqDTO,
        required: false
    })
    async getAllFunctionName(@Headers() headers, @Body() body: GetAllFunctionNameReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchAllFeatureNames(body)
    }

    @Post('/getDownloadAndRevenueData')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description:'Response的資料包含:\n\n' +
        'status (number)   \/ 0為成功運行，1為有尋找到重複資料，-1為其他錯誤\n\n' +
        '\tex: 0\n\n' +
        'downloadAndRevenueList (Array_of_Object)  \/ Object包含國家及其對應的營收、均營收、下載、平均下載\n\n' +
        '\tcountry (String) ex: "Japan"\n\n' +
        '\trevenueSum (number) ex: 8769252\n\n' +
        '\trevenueAvg (number) ex: 109615.65\n\n' +
        '\tdownloadSum (number) ex: 42756\n\n' +
        '\tdownloadAvg (number) ex: 534.45\n\n',
        type: GetDownloadAndRevenueDataRespDTO
    })
    @ApiBody({
        description: '該填入的資料包含:\n\n' +
        'appid (String)             \/ 欲取得內容的App的id名稱\n\n' +
        '\tex: "586634331"\n\n'+
        'startDate (Date)         \/ 欲取得預覽內容的起始日期\n\n' +
        '\tex: 1649591918927\n\n'+
        'endDate (Date)           \/ 欲取得預覽內容的結束日期\n\n' +
        '\tex: 1657367918927\n\n',
        type: GetDownloadAndRevenueDataReqDTO,
        required: false
    })
    async getDownloadAndRevenueData(@Headers() headers, @Body() body: GetDownloadAndRevenueDataReqDTO, @Req() req){
        //找資料
        return this.competitorRetrievalDetailService.fetchDownloadAndRevenueData(body)
    }
}