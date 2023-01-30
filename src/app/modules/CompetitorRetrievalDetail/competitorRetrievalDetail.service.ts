import * as mongodb from 'mongodb';
import { Inject, Logger, Injectable } from '@nestjs/common';
import { MongoService } from '../../../core/database/mongo/mongo.service';
import {
    IMongoClient,
    MongoDB,
    IMongoCollection,
} from '../../../core/database/mongo/mongoclient';
import { LOG4JS_SYSTEM_LOGGER } from '../../../core/constants/system.constant';
import { GetEvaluationDataReqDTO, GetEvaluationDataRespDTO } from './dto/getEvaluationData';
import { GetComparisonDataReqDTO, GetComparisonDataRespDTO } from './dto/getComparisonData';
import { GetGameBasicInfoReqDTO, GetGameBasicInfoRespDTO } from './dto/getGameBasicInfo';
import { GetUserRetentionRateReqDTO, GetUserRetentionRateRespDTO } from './dto/getUserRetentionRate';
import { GetVersionGameInfoReqDTO, GetVersionGameInfoRespDTO } from './dto/getVersionGameInfo';
import { GetVersionInfoReqDTO, GetVersionInfoRespDTO } from './dto/getVersionInfo';
import { GetVersionListReqDTO, GetVersionListRespDTO } from './dto/getVersionList';
import { GetAllFunctionNameReqDTO, GetAllFunctionNameRespDTO} from './dto/getAllFunctionName';
import { GetDownloadAndRevenueDataReqDTO, GetDownloadAndRevenueDataRespDTO} from './dto/getDownloadAndRevenueData';
import { GetRevenueAndRankRespDTO } from './dto/getRevenueAndRank';
import { Income_DownloadsObj } from './dto/getComparisonData';
import { ChartData } from './dto/getEvaluationData';
// import from Update impact
import {
    UpdateImpactsResultObj, FeatureObj, ValueCangeObj,
    GetUpdateImpactsListRespDTO, GetUpdateImpactsListReqDTO,
    UpdateImpactsQueryResult as QueryUpdateImpactsResultDTO,
    CustomFeatureObj
} from '../UpdateImpacts/dto/getUpdateImpactsList';
import { sleep } from 'src/core/util/asyncTool';
import { GetFunctionListReqDTO, GetFunctionListRespDTO } from './dto/getFunctionList';



@Injectable()
export class CompetitorRetrievalDetailService {
    // declaration of Mongo Clients
    private mongoClient: IMongoClient;
    private mongoLogClient: IMongoClient;
    // declaration of collections
    private GameType: IMongoCollection;
    private UpdateInfluence: IMongoCollection;
    private FeatureContent: IMongoCollection;
    private FeatureContentChangeHistory: IMongoCollection;
    private DownloadAndRevenue: IMongoCollection;
    private AppSummaryAbout: IMongoCollection;
    private AppTimelineVersion: IMongoCollection;
    private UserRetention: IMongoCollection;
    private GameRetrieval: IMongoCollection;


    // Initialization
    constructor(@Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger : Logger,
                private readonly mongoService: MongoService) {
        this.mongoClient = this.mongoService.getMongo();
        this.mongoLogClient = this.mongoService.getMongo('log');
        this.initDB();
    }
    private async initDB() {
        // Connect to mongo clients
        const db: MongoDB = await this.mongoClient.db();
        const logDB: MongoDB = await this.mongoLogClient.db();

        // Connect to mongo collections
        this.GameType = db.collection('GameType')
        this.UpdateInfluence = db.collection('UpdateInfluence')
        this.FeatureContent = db.collection('FeatureContent')
        this.FeatureContentChangeHistory = db.collection('FeatureContentChangeHistory')
        this.DownloadAndRevenue = db.collection('DownloadAndRevenue')
        this.AppSummaryAbout = db.collection('AppSummaryAbout')
        this.AppTimelineVersion = db.collection('AppTimelineVersion')
        this.UserRetention = db.collection('UserRetention')
        this.GameRetrieval = db.collection('GameRetrieval')
        
        // Create indices
        this.GameType.createIndex({ 'AppType': 1, 'AppID': 1 })
        this.UpdateInfluence.createIndex({ 'Date': -1, 'AppID': 1 })
        this.FeatureContent.createIndex({ 'appId': 1, 'version': 1, 'featureName': 1, 'expireTime': 1 }, true)
        this.FeatureContent.createIndex({ 'expireTime': 1 }, false, 0)
        this.FeatureContentChangeHistory.createIndex({ 'appId': 1, 'version': 1, 'featureName': 1 })
        this.DownloadAndRevenue.createIndex({ 'Date': -1 })
        this.AppSummaryAbout.createIndex({ 'AppID': 1 })
        this.AppTimelineVersion.createIndex({ 'AppID': 1, 'Version': 1, 'Date': -1 })
        this.UserRetention.createIndex({ 'AppID': 1, 'StartDate': -1 })
        this.GameRetrieval.createIndex({ 'AppID': 1 })

        // //test
        // let queryResult = await this.GameType.find({}, {AppID: 1})
        // let appidList = []
        // for(let res of queryResult) {
        //     appidList.push(res.AppID)
        // }
        // for(let appid of appidList) {
        //     let country = null
        //     let app = await this.AppSummaryAbout.findOne({AppID: appid})
        //     if(app && app['Company HQ']) {
        //         country = app['Company HQ']
        //     }
        //     console.log(country)
        //     //update
        // }
    }

    public async fetchComparisonData(body: GetComparisonDataReqDTO) {
        let query = {
            AppID: body.appid
        }
        let projection = {
            '_id': -1, 'Date': 1, 'Version': 1, 'Tags': 1, 'Platform': 1, 'AppName': 1,
            'AppID': 1, 'CompanyName': 1, 'AppCategoryName': 1, 'FeatureChanges': 1
        }
        let country = body.country
        if(body.country == 'All') {
            let gameInfo = await this.GameTypeFindOne({AppID: body.appid}, {ReleaseCountry: 1})
            if(gameInfo) country = gameInfo.ReleaseCountry
            console.log(body.country, country)
        }
        projection['difference_' + country + '_7'] = 1
        projection['difference_' + country + '_14'] = 1
        projection['difference_' + country + '_30'] = 1

        let sort = { 'Date': -1 }
        if (body.days === undefined) body.days = 7;
        if (body.tags !== undefined && body.tags.length > 0) query['Tags'] = { '$in': body.tags }
        
        let result = await this.queryUpdateInfluenceWithFeatureContent(query, projection, sort)

        for (let i of result) {
            let customFeatures = []
            for (let j of i.custom_features) {
                let customFeatureObj = new CustomFeatureObj()
                customFeatureObj.Id = j._id
                customFeatureObj.CustomFeatures = j.featureName
                customFeatures.push(customFeatureObj)
            }
            i.CustomFeatures = customFeatures
        }

        let field_name = 'difference_' + country + '_' + body.days
        return await this.formatUpdateInfluence(result, field_name)
    }

    private async queryUpdateInfluenceWithFeatureContent(query, projection, sort) {
        let aggregate = [
            { $match: query },
            { $project: projection },
            { $sort: sort },
            {
                $lookup:
                {
                    from: 'FeatureContent',
                    let: {
                        ui_appId: "$AppID",
                        ui_version: "$Version"
                    },
                    pipeline: [
                        {
                            $match: {
                                expireTime: { $exists: 0 },
                                $expr: {
                                    $and: [
                                        { $eq: ["$appId", "$$ui_appId"] },
                                        { $eq: ["$version", "$$ui_version"] }
                                    ]
                                }
                            }
                        },
                        { $project: { featureName: 1 } },
                        { $match: { expireTime: { $exists: 0 } } }
                    ],
                    as: 'custom_features',
                }
            }
        ]

        let queryResult = await this.UpdateInfluence.aggregate(aggregate)
        let arr = await queryResult.toArray();

        return queryResult.toArray()
    }

    public async formatUpdateInfluence(dbResult, field_name) {
        let gameTypes = await this.getAllGameTypes()
        let resultObj = new GetUpdateImpactsListRespDTO();
        resultObj.Status = 0;
        resultObj.Result = [];
        resultObj.Total = dbResult.length
        for (let i of dbResult) {
            if(i['Date'] === undefined) continue;
            let resuleData = new UpdateImpactsResultObj();
            resuleData.VersionDate = Math.round(i['Date'].getTime()) - (60 * 60 * 8 * 1000);
            resuleData.Version = i['Version'];
            resuleData.UpdateType = i['Tags'];
            resuleData.GameName = i['AppName'];
            resuleData.CompanyName = gameTypes['CompanyName'][i['AppID']] || i['CompanyName'];
            resuleData.GameType = gameTypes['AppType'][i['AppID']] || [i['AppCategoryName']];
            resuleData.Device = i['Platform'];
            resuleData.AppID = i['AppID'];

            let difference = i[field_name];

            let incomeObj = new ValueCangeObj();
            if (difference != undefined) {
                incomeObj.Value = difference['revenue'];
                incomeObj.ValueChange = difference['revenue_share'];
            }
            resuleData.Income = incomeObj;

            let downloadsObj = new ValueCangeObj();
            if (difference != undefined) {
                downloadsObj.Value = difference['downloads'];
                downloadsObj.ValueChange = difference['downloads_share'];
            }
            resuleData.Downloads = downloadsObj;

            let incomeDownloadsObj = new ValueCangeObj();
            if (difference != undefined) {
                incomeDownloadsObj.Value = parseFloat((difference['revenue'] / difference['downloads']).toFixed(2));
                incomeDownloadsObj.ValueChange = parseFloat((difference['revenue_share'] / difference['downloads_share']).toFixed(2));
            }
            resuleData.Income_Downloads = incomeDownloadsObj;

            if (!incomeObj.Value || incomeObj.Value.toString() === 'NaN') resuleData.Income.Value = null;
            if (!incomeObj.Value || incomeObj.ValueChange.toString() === 'NaN') resuleData.Income.ValueChange = null;
            if (!downloadsObj.Value || downloadsObj.Value.toString() === 'NaN') resuleData.Downloads.Value = null;
            if (!downloadsObj.Value || downloadsObj.ValueChange.toString() === 'NaN') resuleData.Downloads.ValueChange = null;
            if (!incomeDownloadsObj.Value || incomeDownloadsObj.Value.toString() === 'NaN') resuleData.Income_Downloads.Value = null;
            if (!incomeDownloadsObj.Value || incomeDownloadsObj.ValueChange.toString() === 'NaN') resuleData.Income_Downloads.ValueChange = null;

            let features: Array<FeatureObj> = new Array<FeatureObj>();
            let id = 0
            if (i['FeatureChanges'] !== undefined) {
                for (let key of Object.keys(i['FeatureChanges'])) {
                    let feature: FeatureObj = new FeatureObj();
                    feature.Id = id;
                    feature.Title = key;
                    feature.Classfication = i['FeatureChanges'][key]['classfication'];
                    feature.BeforeUpdate = i['FeatureChanges'][key]['Original'];
                    feature.AfterUpdate = i['FeatureChanges'][key]['Last'];
                    features.push(feature);
                }
            }
            resuleData.Features = features
            resuleData.CustomFeatures = i['CustomFeatures']
            resultObj.Result.push(resuleData);
        }

        return resultObj;
    }

    public async fetchVersionGameInfo(body) {
        let returnData = new GetVersionGameInfoRespDTO();
        if (!body.appid || !body.country) {
            returnData.status = -1
            return returnData
        }
        const appid = body.appid
        let country = body.country
        
        if(body.country == 'All') {
            let gameInfo = await this.GameTypeFindOne({AppID: body.appid}, {ReleaseCountry: 1})
            if(gameInfo) country = gameInfo.ReleaseCountry
        }

        let version = null
        if(body.version) version = body.version
        else if(body.latest && body.latest === true) {
            let app = await this.AppSummaryAboutFindOne({'AppID': appid})
            version = app.Version
        } else {
            returnData.status = -1
            return returnData
        }
        let gameType = await this.GameTypeFindOne({'AppID': appid})
        if(gameType === undefined || gameType === null) {
            returnData.status = -1
            return returnData
        }
        returnData.status = 0
        returnData.appid = appid
        returnData.appName = gameType.AppName
        returnData.appType = gameType.AppType
        returnData.companyName = gameType.CompanyName
        returnData.platform = gameType.Platform
        returnData.countries = gameType.Countries
        returnData.version = version

        let query = {AppID: appid, Version: version}
        if(body.versionDate) {
            query['Date'] = new Date(body.versionDate)
        }
        
        let versionInfo = await this.AppTimelineVersionFindOne(query, {Date: 1, Description: 1, Content: 1})
        if(versionInfo === undefined || versionInfo === null) {
            returnData.status = -1
            return returnData
        }
        if(versionInfo.Date) returnData.versionDate = versionInfo.Date.getTime()
        else returnData.versionDate = null
        //returnData.description = versionInfo.Description
        returnData.description = versionInfo.Content

        const field_name = "difference_" + country + "_7"
        let updateInfluenceInfo = await this.UpdateInfluenceFindOne({AppID: appid, Version: version})
        if(updateInfluenceInfo === undefined || updateInfluenceInfo === null) {
            let blank_income_downloadsObj = new Income_DownloadsObj();
            blank_income_downloadsObj.value = null;
            blank_income_downloadsObj.valueChange = null;
            returnData.income = blank_income_downloadsObj;
            returnData.downloads = blank_income_downloadsObj;
            returnData.income_downloads = blank_income_downloadsObj;
            return returnData
        }
    
        let difference = updateInfluenceInfo[field_name];
        let incomeObj = new Income_DownloadsObj();
        if (difference != undefined) {
            incomeObj.value = difference['revenue'];
            incomeObj.valueChange = difference['revenue_share'];
        }
        returnData.income = incomeObj;

        let downloadsObj = new Income_DownloadsObj();
        if (difference != undefined) {
            downloadsObj.value = difference['downloads'];
            downloadsObj.valueChange = difference['downloads_share'];
        }
        returnData.downloads = downloadsObj;

        let incomeDownloadsObj = new Income_DownloadsObj();
        if (difference != undefined) {
            incomeDownloadsObj.value = parseFloat((difference['revenue'] / difference['downloads']).toFixed(2));
            incomeDownloadsObj.valueChange = parseFloat((difference['revenue_share'] / difference['downloads_share']).toFixed(2));
        }
        returnData.income_downloads = incomeDownloadsObj;

        if (!incomeObj.value || incomeObj.value.toString() === 'NaN') returnData.income.value = null;
        if (!incomeObj.valueChange || incomeObj.valueChange.toString() === 'NaN') returnData.income.valueChange = null;
        if (!downloadsObj.value || downloadsObj.value.toString() === 'NaN') returnData.downloads.value = null;
        if (!downloadsObj.valueChange || downloadsObj.valueChange.toString() === 'NaN') returnData.downloads.valueChange = null;
        if (!incomeDownloadsObj.value || incomeDownloadsObj.value.toString() === 'NaN') returnData.income_downloads.value = null;
        if (!incomeDownloadsObj.valueChange || incomeDownloadsObj.valueChange.toString() === 'NaN') returnData.income_downloads.valueChange = null;

        return returnData
    }

    public async fetchEvaluationData(body: GetEvaluationDataReqDTO) {
        let returnData = new GetEvaluationDataRespDTO()
        let gameType = await this.GameTypeFindOne({'AppID': body.appid})
        if(gameType === undefined || gameType === null) { returnData.status = -1; return returnData; }
        returnData.status = 0
        returnData.appid = body.appid
        returnData.appName = gameType.AppName
        returnData.appType = gameType.AppType
        returnData.companyName = gameType.CompanyName
        returnData.platform = gameType.Platform
        returnData.countries = gameType.Countries

        //Fetching appid on both iOS and Android
        let appid_iOS = null
        let appid_Android = null
        if(gameType.Platform === 'iOS') {
            appid_iOS = gameType.AppID
            if(gameType.PairingAppID) appid_Android = gameType.PairingAppID
        } else { //Android
            if(gameType.PairingAppID) appid_iOS = gameType.PairingAppID
            appid_Android = gameType.AppID
        }

        // -----  Fetching all countries data independently  -----
        if(body.country === 'All') {
            let resultList = []
            for(let country of gameType.Countries) {
                let res = {country: country}
                let query = { $and: [{AppID: body.appid}, {CountryName: country}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}] }
                let projection = {
                    _id: 0,
                    Date: 1
                }
                
                if(body.dataType === 'Rank') body.dataType = 'Download_Games' // Assume Download_Games is the ranking we need
                projection[body.dataType] = 1
                let updateDateQueryResult = await this.AppTimelineVersionFind({AppID: body.appid}, { _id: 0, Date: 1, Version: 1 })
                let updateDateList = []
                for(let i of updateDateQueryResult) {
                    if(i.Date !== null) updateDateList.push({Date: i.Date.getTime(), Version: i.Version})
                }

                if(body.platform && body.platform === 'All') {
                    let query_iOS = {$and: [{AppID: appid_iOS}, {CountryName: country}, {Platform: 'iOS'}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}]}
                    let query_Android = {$and: [{AppID: appid_Android}, {CountryName: country}, {Platform: 'Android'}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}]}
                    let dataResult_iOS = await this.DownloadAndRevenueFind(query_iOS, projection)
                    let chartResult_iOS : Array<ChartData> = []
                    for(let i of dataResult_iOS) {
                        let c = new ChartData()
                        if(i.Date !== null) i.Date = i.Date.getTime()
                        if (!i[body.dataType] || i[body.dataType].toString() === 'NaN' ||  i[body.dataType].toString() === ' -') i[body.dataType] = null
                        c.Date = i.Date
                        c.Value = i[body.dataType]
                        if (updateDateList.includes(i.Date)) c.isUpdated = true
                        else c.isUpdated = false
                        chartResult_iOS.push(c)
                    }
                    res['chartData_iOS'] = chartResult_iOS
                    let dataResult_Android = await this.DownloadAndRevenueFind(query_Android, projection)
                    let chartResult_Android : Array<ChartData> = []
                    for(let i of dataResult_Android) {
                        let c = new ChartData()
                        if(i.Date !== null) i.Date = i.Date.getTime()
                        if (!i[body.dataType] || i[body.dataType].toString() === 'NaN' ||  i[body.dataType].toString() === ' -') i[body.dataType] = null
                        c.Date = i.Date
                        c.Value = i[body.dataType]
                        c.isUpdated = false
                        c.version = null
                        for(let u of updateDateList) {
                            if(u.Date === i.Date) {
                                c.isUpdated = true
                                c.version = u.Version
                            }
                        }
                        chartResult_Android.push(c)
                    }
                    res['chartData_Android'] = chartResult_Android
                } else {
                    if(body.platform) {
                        if(body.platform === 'iOS') {
                            query = {$and: [{AppID: appid_iOS}, {CountryName: country}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}]}
                            query['Platform'] = 'iOS'
                        }
                        else if(body.platform === 'Android') {
                            query = {$and: [{AppID: appid_Android}, {CountryName: country}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}]}
                            query['Platform'] = 'Android'
                        }
                    }
                    let dataResult = await this.DownloadAndRevenueFind(query, projection)
                    let chartResult : Array<ChartData> = []
                    for(let i of dataResult) {
                        let c = new ChartData()
                        if(i.Date !== null) i.Date = i.Date.getTime()
                        if (!i[body.dataType] || i[body.dataType].toString() === 'NaN' ||  i[body.dataType].toString() === ' -') i[body.dataType] = null
                        c.Date = i.Date
                        c.Value = i[body.dataType]
                        c.isUpdated = false
                        c.version = null
                        for(let u of updateDateList) {
                            if(u.Date === i.Date) {
                                c.isUpdated = true
                                c.version = u.Version
                            }
                        }
                        chartResult.push(c)
                    }
                    res['chartData'] = chartResult
                }
                resultList.push(res)
            }
            returnData.chartData_AllCountries = resultList
            return returnData
        }

        //  -----  Normal query (without country to be 'All')  -----
        let query = { $and: [{AppID: body.appid}, {CountryName: body.country}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}] }
        let projection = {
            _id: 0,
            Date: 1
        }
        
        if(body.dataType === 'Rank') body.dataType = 'Download_Games' // Assume Download_Games is the ranking we need
        projection[body.dataType] = 1
        let updateDateQueryResult = await this.AppTimelineVersionFind({AppID: body.appid}, { _id: 0, Date: 1, Version: 1 })
        let updateDateList = []
        for(let i of updateDateQueryResult) {
            if(i.Date !== null) updateDateList.push({Date: i.Date.getTime(), Version: i.Version})
        }

        if(body.platform && body.platform === 'All') {
            let query_iOS = {$and: [{AppID: appid_iOS}, {CountryName: body.country}, {Platform: 'iOS'}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}]}
            let query_Android = {$and: [{AppID: appid_Android}, {CountryName: body.country}, {Platform: 'Android'}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}]}
            let dataResult_iOS = await this.DownloadAndRevenueFind(query_iOS, projection)
            let chartResult_iOS : Array<ChartData> = []
            for(let i of dataResult_iOS) {
                let c = new ChartData()
                if(i.Date !== null) i.Date = i.Date.getTime()
                if (!i[body.dataType] || i[body.dataType].toString() === 'NaN' ||  i[body.dataType].toString() === ' -') i[body.dataType] = null
                c.Date = i.Date
                c.Value = i[body.dataType]
                c.isUpdated = false
                c.version = null
                for(let u of updateDateList) {
                    if(u.Date === i.Date) {
                        c.isUpdated = true
                        c.version = u.Version
                    }
                }
                chartResult_iOS.push(c)
            }
            returnData.chartData_iOS = chartResult_iOS
            let dataResult_Android = await this.DownloadAndRevenueFind(query_Android, projection)
            let chartResult_Android : Array<ChartData> = []
            for(let i of dataResult_Android) {
                let c = new ChartData()
                if(i.Date !== null) i.Date = i.Date.getTime()
                if (!i[body.dataType] || i[body.dataType].toString() === 'NaN' ||  i[body.dataType].toString() === ' -') i[body.dataType] = null
                c.Date = i.Date
                c.Value = i[body.dataType]
                c.isUpdated = false
                c.version = null
                for(let u of updateDateList) {
                    if(u.Date === i.Date) {
                        c.isUpdated = true
                        c.version = u.Version
                    }
                }
                chartResult_Android.push(c)
            }
            returnData.chartData_Android = chartResult_Android
        } else {
            if(body.platform) {
                if(body.platform === 'iOS') {
                    query = {$and: [{AppID: appid_iOS}, {CountryName: body.country}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}]}
                    query['Platform'] = 'iOS'
                }
                else if(body.platform === 'Android') {
                    query = {$and: [{AppID: appid_Android}, {CountryName: body.country}, {Date: {$gte: new Date(body.startDate)}}, {Date: {$lte: new Date(body.endDate)}}]}
                    query['Platform'] = 'Android'
                }
            }
            let dataResult = await this.DownloadAndRevenueFind(query, projection)
            let chartResult : Array<ChartData> = []
            for(let i of dataResult) {
                let c = new ChartData()
                if(i.Date !== null) i.Date = i.Date.getTime()
                if (!i[body.dataType] || i[body.dataType].toString() === 'NaN' ||  i[body.dataType].toString() === ' -') i[body.dataType] = null
                c.Date = i.Date
                c.Value = i[body.dataType]
                c.isUpdated = false
                c.version = null
                for(let u of updateDateList) {
                    if(u.Date === i.Date) {
                        c.isUpdated = true
                        c.version = u.Version
                    }
                }
                chartResult.push(c)
            }
            returnData.chartData = chartResult
        }
        return returnData
    }

    public async fetchGameBasicInfo(appid: string) {
        let returnData = new GetGameBasicInfoRespDTO()
        let gameType = await this.GameTypeFindOne({'AppID': appid})
        if(gameType === undefined || gameType === null) {
            returnData.status = -1
            return returnData
        }
        returnData.status = 0
        returnData.appid = appid
        returnData.appName = gameType.AppName
        returnData.appType = gameType.AppType
        returnData.companyName = gameType.CompanyName
        returnData.platform = gameType.Platform
        returnData.countries = gameType.Countries
        
        let gameSummaryAbout = await this.AppSummaryAboutFindOne({'AppID': appid})
        if(gameSummaryAbout === undefined || gameSummaryAbout === null) {
            returnData.status = -1
            return returnData
        }
        if(gameSummaryAbout['Initial Release Date']) returnData.publishDate = gameSummaryAbout['Initial Release Date'].getTime()
        else returnData.publishDate = null
        if(gameSummaryAbout['Last Updated Time']) returnData.updateDate = gameSummaryAbout['Last Updated Time'].getTime()
        else returnData.updateDate = null
        if(gameSummaryAbout['Version']) returnData.version = gameSummaryAbout['Version']
        else returnData.version = null
        if(gameSummaryAbout['Company HQ']) returnData.headquarter = gameSummaryAbout['Company HQ']
        else returnData.headquarter = null
        if(gameSummaryAbout['Required Devices']) returnData.equipment = gameSummaryAbout['Required Devices']
        else returnData.equipment = null
        if(gameSummaryAbout['Requirement']) returnData.requirement = gameSummaryAbout['Requirement']
        else returnData.requirement = null
        return returnData
    }

    public async fetchVersionInfo(body: GetVersionInfoReqDTO) {
        let result = new GetVersionInfoRespDTO
        result.status = 0
        let query = { AppID: body.appid, Version: body.version }
        let projection = { _id: 0, Content: 1, Description: 1, Screenshot: 1, 'File Size': 1, Publisher: 1 }
        let queryResult = await this.AppTimelineVersionFindOne(query, projection)
        
        if (!queryResult) {
            result.status = -1
            return result
        }

        result.content = queryResult.Content
        result.description = queryResult.Description
        result.file_Size = queryResult['File Size']
        result.publisher = queryResult.Publisher
        result.screenshot = queryResult.Screenshot
        if(result.screenshot == undefined || result.screenshot == null) {
            let data = await this.AppSummaryAboutFindOne({AppID: body.appid}, {Screenshot: 1})
            result.screenshot = data.Screenshot
        }

        return result
    }

    public async fetchVersionList(appid: string) {
        let result = new GetVersionListRespDTO();
        result.status = 0
        let query = { AppID: appid }
        let projection = { _id: 0, Date: 1, Version: 1 }
        let queryResult = await this.AppTimelineVersionFind(query, projection)
        
        await queryResult.map(el => {
            el['version'] = el['Version']
            delete el['Version']
            el['date'] = el['Date']
            delete el['Date']
        })
        result.versionAndDate = await queryResult
        
        return result
    }

    public async fetchRevenueAndRank(body) {
        let returnData = new GetRevenueAndRankRespDTO()
        returnData.status = 0

        if(!body.appid) {
            returnData.status = -1
            return returnData
        }

        //Check if cached
        let cacheData = await this.GameRetrieval.findOne({AppID: body.appid})
        if(cacheData) {
            returnData.rank = cacheData.Rank
            returnData.revenue = cacheData.Revenue
            return returnData
        }

        // Fetch dates
        let mostRecentUpdateInfluence = await this.UpdateInfluenceFind5Params({'AppID': body.appid}, {'Date': 1, 'difference_Taiwan_7': 1}, 0, 2, {'Date': -1})
        const dayLength = 24 * 60 * 60 * 1000
        if(mostRecentUpdateInfluence.length === 0 || !mostRecentUpdateInfluence[0] || !mostRecentUpdateInfluence[0]['Date']) { // Data not found in UpdateInfluence
            let current = new Date()
            returnData.revenue = { mid_date: current, difference: {value: null, valueChange: null}, revenueWeek1: { startDate: current, endDate: current, revenue : null}, revenueWeek2: { startDate: current, endDate: current, revenue : null} }
            let countryList = ['Taiwan', 'United States', 'Japan', 'China']
            returnData.rank = { updateDate: current}
            for(let country of countryList) {
                returnData.rank['rank_'+country] = null
                returnData.rank['rank_'+country+'_change'] = null
            }
            returnData.status = -1
            return returnData
        }

        let gameType = await this.GameTypeFindOne({'AppID': body.appid})
        const countryName = gameType.Countries.length > 0 ? gameType.Countries[0] : 'Taiwan'
        const fieldName = 'difference_' + countryName + '_7'

        let mostRecentUpdateInfluenceData = mostRecentUpdateInfluence[0]
        let mostRecentUpdateDate = mostRecentUpdateInfluenceData['Date'].getTime()
        // Revenue
        let mid_date = mostRecentUpdateDate
        let revenue = { mid_date: mid_date, updateDate: mid_date + 7 * dayLength, difference: { value: null, valueChange: null }, 
                        revenueWeek1: { startDate: mid_date - 7 * dayLength, endDate: mid_date - 1 * dayLength, revenue : null },
                        revenueWeek2: { startDate: mid_date + 1 * dayLength, endDate: mid_date + 7 * dayLength, revenue : null }}

        if (mostRecentUpdateInfluenceData[fieldName] !== undefined && mostRecentUpdateInfluenceData[fieldName] !== null) {  //Assuming using data in Taiwan
            revenue.difference.value = mostRecentUpdateInfluenceData[fieldName]['revenue']
            revenue.difference.valueChange = mostRecentUpdateInfluenceData[fieldName]['revenue_share'] 
            revenue.revenueWeek1.revenue = mostRecentUpdateInfluenceData[fieldName]['average_revenue_before_7']
            revenue.revenueWeek2.revenue = mostRecentUpdateInfluenceData[fieldName]['average_revenue_after_7']
        }
        returnData.revenue = revenue

        // Rank
        //let rankAttributes = ['Download_Games']
        let rankAttributes = ['Download_Games', 'Download_GamesAdventure', 'Download_GamesCasual', 'Download_Overall']
        let rankProjection = {}
        for(let rankAtt of rankAttributes) {
            rankProjection[rankAtt] = 1
        }

        let countryList = ['Taiwan', 'United States', 'Japan', 'China']
        let rank = {updateDate: mostRecentUpdateDate}
        for(let country of countryList) {
            let rankCur = null, rankPrev = null
            let res = (await this.DownloadAndRevenueFindOne({'AppID': body.appid, 'Date': {$gte: new Date(mostRecentUpdateDate)}, 'CountryName': country}, rankProjection))
            for(let rankAtt of rankAttributes) {
                if(res && res[rankAtt] && res[rankAtt] !== ' -' && res[rankAtt].toString() !== 'NaN') rankCur = res[rankAtt]
            }
            if(rankCur && mostRecentUpdateInfluence.length >= 2) res = (await this.DownloadAndRevenueFindOne({'AppID': body.appid, 'Date': {$gte: mostRecentUpdateInfluence[1]['Date']}, 'CountryName': country}, rankProjection))
            else res = null
            for(let rankAtt of rankAttributes) {
                if(res && res[rankAtt] && res[rankAtt] !== ' -'&& res[rankAtt].toString() !== 'NaN') rankPrev = res[rankAtt]
            }
            rank['rank_'+country] = rankCur
            if(rankCur !== null && rankPrev !== null) {
                rank['rank_'+country+'_change'] = rankCur - rankPrev
            } else {
                rank['rank_'+country+'_change'] = null
            }
        }
        returnData.rank = rank
        return returnData
    }

    public async fetchUserRetentionRate(body) {
        let returnData = new GetUserRetentionRateRespDTO()
        let list = []
        
        let gameType = await this.GameTypeFindOne({'AppID': body.appid}, {ReleaseCountry: 1})
        let countryName = gameType.ReleaseCountry ? gameType.ReleaseCountry : 'Taiwan'
        
        let startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 13)
        let endDate = new Date()
        endDate.setMonth(endDate.getMonth() - 1)
        let query = {AppID: body.appid, StartDate: {$lte: endDate}, CountryName: countryName, EndDate: {$gte: startDate}}
        if(body.country) query['CountryName'] = body.country

        let queryResult = await this.UserRetentionFind(query, {}, 0, 1000, {StartDate: -1})
        for(let userRetention of queryResult) {
            let data = {
                date: userRetention.StartDate.getTime(),
                retention_1 : null,
                retention_3 : null,
                retention_7 : null,
                retention_14 : null,
                retention_30 : null
            }
            if(userRetention) {
                if(userRetention['Retention1Days'] && userRetention['Retention1Days'].toString() !== 'NaN') data.retention_1 = userRetention['Retention1Days'] * 100
                if(userRetention['Retention3Days'] && userRetention['Retention3Days'].toString() !== 'NaN') data.retention_3 = userRetention['Retention3Days'] * 100
                if(userRetention['Retention7Days'] && userRetention['Retention7Days'].toString() !== 'NaN') data.retention_7 = userRetention['Retention7Days'] * 100
                if(userRetention['Retention14Days'] && userRetention['Retention14Days'].toString() !== 'NaN') data.retention_14 = userRetention['Retention14Days'] * 100
                if(userRetention['Retention30Days'] && userRetention['Retention30Days'].toString() !== 'NaN') data.retention_30 = userRetention['Retention30Days'] * 100
            }
            if(list.length !== 0 && list[list.length - 1].date === data.date) continue
            list.push(data)
        }
        returnData.retentionRate = list
        return returnData
    }

    public async fetchAllFeatures(body: GetFunctionListReqDTO) {
        let result = new GetFunctionListRespDTO()
        result.status = 0
        if(!body.appid) {
            result.status = -1
            return result
        }
        let query = { appId: body.appid, expireTime: { $exists: 0 } }
        // console.log(JSON.stringify(query))
        let projection = { 'appId' : 1, 'featureName': 1, 'tags': 1, 'newTag': 1, 'version': 1, 'editor': 1, 'Id': 1, 'createTime': 1 }
        let queryResult = await this.FeatureContentFind(query, projection)
        let res = await queryResult
        for(let i of res) {   // Need some refineries
            let versionDate = await this.AppTimelineVersionFindOne({AppID: i.appId, Version: i.version}, {Date: 1})
            let latestUpdateDate = await this.FeatureContentChangeHistoryFind({appId: i.appId, version: i.version, Id: i.Id}, {createTime: 1}, 0, 10000000, {createTime: -1})

            if(versionDate && versionDate.Date) i['versionDate'] = versionDate.Date.getTime()
            else i['versionDate'] = null
            if(latestUpdateDate && latestUpdateDate.length > 0 && latestUpdateDate[0].createTime) i['latestUpdateDate'] = latestUpdateDate[0].createTime.getTime()
            else if(i['createTime']) i['latestUpdateDate'] = i['createTime'].getTime() 
            else i['latestUpdateDate'] = null
            i['createTime'] = undefined
        }
        result.functionList = res
        return result
    }

    public async fetchAllFeatureNames(body: GetAllFunctionNameReqDTO) {
        let result = new GetAllFunctionNameRespDTO();
        let query = { appId: body.appid }
        let projection = { 'featureName': 1 }
        let queryResult = await this.FeatureContentFind(query, projection)
        let list = []
        for(let i of queryResult) {
            list.push(i.featureName)
        }
        result.status = 0
        result.functionName = list
        return result
    }

    public async fetchDownloadAndRevenueData(body: GetDownloadAndRevenueDataReqDTO) {
        let result = new GetDownloadAndRevenueDataRespDTO();
        let revenues = await this.DAR_revenueAggregate({appid: body.appid, startDate: body.startDate, endDate: body.endDate})
        let downloads = await this.DAR_downloadsAggregate({appid: body.appid, startDate: body.startDate, endDate: body.endDate})
        const countryList = [ 'United States', 'Malaysia', 'Japan', 'Taiwan', 'China' ]
        let resList = []
        for(let country of countryList) {
            let data = {country: country, revenueSum: null, revenueAvg: null, downloadSum: null, downloadAvg: null}
            let shouldPush = false
            for(let rev of revenues) {
                if(rev._id === country) {
                    data.revenueSum = rev.revenueSum
                    data.revenueAvg = rev.revenueAvg
                    shouldPush = true
                }
            }
            for(let dow of downloads) {
                if(dow._id === country) {
                    data.downloadSum = dow.downloadSum
                    data.downloadAvg = dow.downloadAvg
                    shouldPush = true
                }
            }
            if(shouldPush) {
                resList.push(data)
            }
        }
        result.status = 0
        result.downloadAndRevenueList = resList
        return result
    }

    // helper functions
    private async getAllGameTypes() {
        let projection = {
            '_id': 0, 'AppID': 1, 'AppType': 1, 'CompanyName': 1
        }
        let queryResult = await this.GameType.find({}, projection)
        let gameTypes: Object = { 'AppType': {}, 'CompanyName': {} }
        for (let i of queryResult) {
            gameTypes['AppType'][i.AppID] = i.AppType
            gameTypes['CompanyName'][i.AppID] = i.CompanyName
        }
        return gameTypes
    }
    public async DAR_downloadsAggregate(body) {
        return (await this.DownloadAndRevenue.aggregate([
            { $match:{
                AppID: body.appid,
                Date: {$gte: new Date(body.startDate), $lte: new Date(body.endDate)},
                Downloads: {$nin: [null, NaN]}
            } },
            { $project: { CountryName: 1, Downloads: 1 } },
            {
                $group:
                {
                    _id: "$CountryName",
                    downloadSum: { $sum : "$Downloads" },
                    downloadAvg: { $avg : "$Downloads" },
                }
            }
        ])).toArray()
    }
    public async DAR_revenueAggregate(body){
        return (await this.DownloadAndRevenue.aggregate([
            { $match:{
                AppID: body.appid,
                Date: {$gte: new Date(body.startDate), $lte: new Date(body.endDate)},
                Revenue: {$nin: [null, NaN]}
            } },
            { $project: { CountryName: 1, Revenue: 1 } },
            {
                $group:
                {
                    _id: "$CountryName",
                    revenueSum: { $sum : "$Revenue" },
                    revenueAvg: { $avg : "$Revenue" },
                }
            }
        ])).toArray()
    }

    public async getText(input: string) {
        return input + 'test';
    }

    // MongoDB access functions
    public async GameTypeFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.GameType.find(query, projection, skip, limit, sort) } else if (projection) { return await this.GameType.find(query, projection) } else { return await this.GameType.find(query) } }
    public async GameTypeFindOne(query, projection = null) { if (projection) { return await this.GameType.findOne(query, projection) } else { return await this.GameType.findOne(query) } }
    
    public async UpdateInfluenceFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.UpdateInfluence.find(query, projection, skip, limit, sort) } else if (projection) { return await this.UpdateInfluence.find(query, projection) } else { return await this.UpdateInfluence.find(query) } }
    public async UpdateInfluenceFindOne(query, projection = null) { if (projection) { return await this.UpdateInfluence.findOne(query, projection) } else { return await this.UpdateInfluence.findOne(query) } }
    public async UpdateInfluenceFind5Params(query, projection, skip, limit, sort) { return await this.UpdateInfluence.find(query, projection, skip, limit, sort) }

    public async DownloadAndRevenueFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.DownloadAndRevenue.find(query, projection, skip, limit, sort) } else if (projection) { return await this.DownloadAndRevenue.find(query, projection) } else { return await this.DownloadAndRevenue.find(query) } }
    public async DownloadAndRevenueFindOne(query, projection = null) { if (projection) { return await this.DownloadAndRevenue.findOne(query, projection) } else { return await this.DownloadAndRevenue.findOne(query) } }

    public async FeatureContentFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.FeatureContent.find(query, projection, skip, limit, sort) } else if (projection) { return await this.FeatureContent.find(query, projection) } else { return await this.FeatureContent.find(query) } }
    public async FeatureContentFindOne(query, projection = null) { if (projection) { return await this.FeatureContent.findOne(query, projection) } else { return await this.FeatureContent.findOne(query) } }
    
    public async FeatureContentChangeHistoryFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.FeatureContentChangeHistory.find(query, projection, skip, limit, sort) } else if (projection) { return await this.FeatureContentChangeHistory.find(query, projection) } else { return await this.FeatureContentChangeHistory.find(query) } }
    public async FeatureContentChangeHistoryFindOne(query, projection = null) { if (projection) { return await this.FeatureContentChangeHistory.findOne(query, projection) } else { return await this.FeatureContentChangeHistory.findOne(query) } }
    
    public async AppSummaryAboutFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.AppSummaryAbout.find(query, projection, skip, limit, sort) } else if (projection) { return await this.AppSummaryAbout.find(query, projection) } else { return await this.AppSummaryAbout.find(query) } }
    public async AppSummaryAboutFindOne(query, projection = null) { if (projection) { return await this.AppSummaryAbout.findOne(query, projection) } else { return await this.AppSummaryAbout.findOne(query) } }
    
    public async AppTimelineVersionFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.AppTimelineVersion.find(query, projection, skip, limit, sort) } else if (projection) { return await this.AppTimelineVersion.find(query, projection) } else { return await this.AppTimelineVersion.find(query) } }
    public async AppTimelineVersionFindOne(query, projection = null) { if (projection) { return await this.AppTimelineVersion.findOne(query, projection) } else { return await this.AppTimelineVersion.findOne(query) } }
    
    public async UserRetentionFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.UserRetention.find(query, projection, skip, limit, sort) } else if (projection) { return await this.UserRetention.find(query, projection) } else { return await this.UserRetention.find(query) } }
    public async UserRetentionFindOne(query, projection = null) { if (projection) { return await this.UserRetention.findOne(query, projection) } else { return await this.GameType.findOne(query) } }

}