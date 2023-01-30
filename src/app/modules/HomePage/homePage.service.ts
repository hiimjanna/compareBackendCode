import * as mongodb from 'mongodb';
import { Inject, Logger, Injectable } from '@nestjs/common';
import { MongoService } from '../../../core/database/mongo/mongo.service';
import {
    IMongoClient,
    MongoDB,
    IMongoCollection,
} from '../../../core/database/mongo/mongoclient';
import { LOG4JS_SYSTEM_LOGGER } from '../../../core/constants/system.constant';

//import dtos
import { GetNewestAdditionalInfoReqDTO, GetNewestAdditionalInfoRespDTO, AdditionalInfo } from './dto/getNewestAdditionalInfo';
import { GetNewestCloudFileReqDTO, GetNewestCloudFileRespDTO } from './dto/getNewestCloudFile';
import { GetNewestDiscourseArticleReqDTO, GetNewestDiscourseArticleRespDTO, DiscourseArticle } from './dto/getNewestDiscourseArticle';
import { GetNewestVersionUpdateReqDTO, GetNewestVersionUpdateRespDTO, VersionUpdate } from './dto/getNewestVersionUpdate';
import { GetPopularAdditionalInfoReqDTO, GetPopularAdditionalInfoRespDTO, PopularAdditionalInfo } from './dto/getPopularAdditionalInfo';
import { GetRevenueTop3ReqDTO, GetRevenueTop3RespDTO, RevenueTop } from './dto/getRevenueTop3';
import { listenerCount, version } from 'process';
import { KeyObject } from 'crypto';


@Injectable()
export class HomePageService {
    // declaration of Mongo Clients
    private mongoClient: IMongoClient;
    private mongoLogClient: IMongoClient;
    private mongoUserClient: IMongoClient;
    // declaration of collections
    private GameType: IMongoCollection;
    private UpdateInfluence: IMongoCollection;
    private DownloadAndRevenue: IMongoCollection;
    private UserRetention: IMongoCollection;
    private UserStatus: IMongoCollection;
    private GameRetrieval: IMongoCollection;
    private FeatureContent: IMongoCollection;
    private FeatureContentChangeHistory: IMongoCollection;
    private FeatureView: IMongoCollection;
    private AppSummaryAbout: IMongoCollection;
    private AppTimelineVersion: IMongoCollection;
    private PlanningClubTopic: IMongoCollection;
    private TopThreeRevenue: IMongoCollection;


    // Initialization
    constructor(@Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger : Logger,
                private readonly mongoService: MongoService) {
        this.mongoClient = this.mongoService.getMongo();
        this.mongoLogClient = this.mongoService.getMongo('log');
        this.mongoUserClient = this.mongoService.getMongo('user');
        this.initDB();
    }
    private async initDB() {
        // Connect to mongo clients
        const db: MongoDB = await this.mongoClient.db();
        const logDB: MongoDB = await this.mongoLogClient.db();
        const userDB: MongoDB = await this.mongoUserClient.db();

        // Connect to mongo collections
        this.GameType = db.collection('GameType')
        this.UpdateInfluence = db.collection('UpdateInfluence')
        this.DownloadAndRevenue = db.collection('DownloadAndRevenue')
        this.UserRetention = db.collection('UserRetention')
        this.GameRetrieval = db.collection('GameRetrieval')
        this.UserStatus = userDB.collection('UserStatus')
        this.FeatureContent = db.collection('FeatureContent')
        this.FeatureContentChangeHistory = db.collection('FeatureContentChangeHistory')
        this.FeatureView = db.collection('FeatureView');
        this.AppSummaryAbout = db.collection('AppSummaryAbout')
        this.AppTimelineVersion = db.collection('AppTimelineVersion')
        this.PlanningClubTopic = db.collection('PlanningClubTopic')
        this.TopThreeRevenue = db.collection('TopThreeRevenue')
        
        // Create indices
        this.GameType.createIndex({ 'AppType': 1, 'AppID': 1 })
        this.UpdateInfluence.createIndex({ 'Date': -1, 'AppID': 1 })
        this.DownloadAndRevenue.createIndex({ 'Date': -1 })
        this.UserRetention.createIndex({ 'AppID': 1, 'StartDate': -1 })
        this.UserStatus.createIndex({ 'Account': 1 }, true)
        this.GameRetrieval.createIndex({ 'AppID': 1 })
        this.FeatureContent.createIndex({ 'appId': 1, 'version': 1, 'featureName': 1, 'expireTime': 1 }, true)
        this.FeatureContent.createIndex({ 'expireTime': 1 }, false, 0)
        this.FeatureContentChangeHistory.createIndex({ 'appId': 1, 'version': 1, 'featureName': 1 })
        this.FeatureView.createIndex({ 'FeatureId': 1, 'inteval': 1 })
        this.AppSummaryAbout.createIndex({ 'AppID': 1 })
        this.AppTimelineVersion.createIndex({ 'AppID': 1, 'Version': 1, 'Date': -1 })
        this.PlanningClubTopic.createIndex({ 'Date': -1 })
    }

    public async fetchNewestAdditionalInfo(body) {
        let returnData = new GetNewestAdditionalInfoRespDTO()
        let limit = body.count ? body.count : 12  //default is 12
        returnData.status = 0
        let queryResult = await this.FeatureContentFind({}, {appId: 1, version: 1, featureName: 1, contentFeature: 1, editor: 1, createTime: 1}, 0, limit, {createTime: -1})
        let list : Array<AdditionalInfo> = []
        for(let res of queryResult) {
            let additionalInfo = new AdditionalInfo()
            additionalInfo.appid = res.appId
            additionalInfo.version = res.version
            additionalInfo.editor = res.editor
            additionalInfo.featureName = res.featureName
            additionalInfo.featureId = res['_id'].toString()
            additionalInfo.latestUpdateDate = res.createTime.getTime()  //Not sure
            // let screenshotList = await this.AppTimelineVersionFindOne({AppID: res.appId, Version: res.version}, {_id: 0, Screenshot: 1})
            // if(screenshotList && screenshotList.Screenshot !== null && screenshotList.Screenshot.length > 0) additionalInfo.screenshot = screenshotList.Screenshot[0]
            // else additionalInfo.screenshot = null  

            // Searching for url in feature Content
            let content = res.contentFeature
            if(content && content.includes("img src=")) {
                let tmp = content.substring(content.indexOf("img src=") + 9)
                additionalInfo.screenshot = tmp.substring(0, tmp.indexOf("\""))
                console.log(additionalInfo.screenshot)
            } else additionalInfo.screenshot = null  

            list.push(additionalInfo)
        }
        returnData.additionInfoList = list
        return returnData
    }

    public async fetchRevenueTop3(body) {
        let returnData = new GetRevenueTop3RespDTO()
        returnData.status = 0
        let revenueTop3Package = await this.TopThreeRevenueFindOne({}, {}, {Date: -1})
        if(!revenueTop3Package) {
            returnData.status = -1
            let rt_null = new RevenueTop()
            returnData.revenueTop3List = [rt_null, rt_null, rt_null]
            return returnData
        }
        
        let list : Array<RevenueTop> = []
        for(let i = 0;i < 3; i++) {
            const obj = revenueTop3Package[i.toString()]
            let revenuePackage = null
            let countryName = null
            Object.entries(obj).forEach(([key, value], index) => {
                if (key.startsWith('difference_')) {
                    revenuePackage = value
                    countryName = key.substring(key.indexOf('_') + 1, key.lastIndexOf('_'))
                }
            });
            if(revenuePackage == null) {
                returnData.status = -1
                return returnData
            }
            
            let gameInfo = await this.GameTypeFindOne({AppID: obj.AppID})
            let revenueTop = new RevenueTop()
            revenueTop.appid = obj.AppID
            revenueTop.appType = gameInfo ? gameInfo.AppType : []
            revenueTop.appName = gameInfo ? gameInfo.AppName : null
            revenueTop.companyName = gameInfo ? gameInfo.CompanyName : null
            // find the country
            revenueTop.country = countryName ? countryName : gameInfo ? gameInfo.ReleaseCountry : null
            revenueTop.platform = obj.Platform
            revenueTop.revenueCount = revenuePackage.revenue_share // in percentage
            revenueTop.revenueDiff = revenuePackage.revenue
            list.push(revenueTop)
        }
        returnData.revenueTop3List = list
        returnData.date = revenueTop3Package['Date'] ? revenueTop3Package['Date'].getTime() : null
        returnData.days = revenueTop3Package['Day'] ? revenueTop3Package['Day'] : null
        return returnData
        
        /*
        let limit = body.count ? body.count : 3  //default is 3
        returnData.status = 0
        // Data collection
        let revenueList : Array<Object> = []
        let countryList = ["Worldwide", "Taiwan", "United States", "Japan", "China", "Vietnam", "Thailand", "India"]
        for(let country of countryList) {
            let projection = {_id: 0, AppID: 1, Platform: 1}
            projection["difference_" + country + "_7.revenue"] = 1
            projection["difference_" + country + "_7.revenue_share"] = 1
            let sort = {}
            // Choosing sorting attribute => either revenue or revenue_share
            sort["difference_" + country + "_7.revenue"] = -1
            let queryResult = await this.formatUpdateInfluence(country, projection, limit, sort)
            if(queryResult === null || queryResult === undefined) continue
            revenueList.push({country: country, list: queryResult, index: 0})
        }

        // Collating data
        let list : Array<RevenueTop> = []
        for(let i = 0; i < limit; i++) {
            // Comparing revenues between countries
            let bestIdx = 0
            for(let j = 1; j < revenueList.length; j++) {
                let index1 = revenueList[j]['index']
                let index2 = revenueList[bestIdx]['index']
                if(revenueList[j]['list'][index1]['revenue_share'] > revenueList[bestIdx]['list'][index2]['revenue_share']) bestIdx = j  // not sure is it revenue or revenue_share
            }

            if(!revenueList[bestIdx]) break;

            let gameInfo = await this.GameTypeFindOne({AppID: (revenueList[bestIdx]['list'][revenueList[bestIdx]['index']])['AppID']})
            let revenueTop = new RevenueTop()
            revenueTop.appid = (revenueList[bestIdx]['list'][revenueList[bestIdx]['index']])['AppID']
            revenueTop.appType = gameInfo ? gameInfo.AppType : []
            revenueTop.appName = gameInfo ? gameInfo.AppName : null
            revenueTop.companyName = gameInfo ? gameInfo.CompanyName : null
            revenueTop.country = revenueList[bestIdx]['country']
            revenueTop.platform = (revenueList[bestIdx]['list'][revenueList[bestIdx]['index']])['Platform']
            // revenueTop.revenueCount = (revenueList[bestIdx]['list'][revenueList[bestIdx]['index']])['revenue_share'] // in percentage
            // revenueTop.revenueDiff = (revenueList[bestIdx]['list'][revenueList[bestIdx]['index']])['revenue']
            console.log((revenueList[bestIdx]['list'][revenueList[bestIdx]['index']]))
            list.push(revenueTop)
            revenueList[bestIdx]['index']++
        }
        returnData.revenueTop3List = list
        return returnData
        */
    }

    public async formatUpdateInfluence(country, projection, limit, sort) {
        return await (await this.UpdateInfluenceFind({}, projection, 0, limit, sort)).map(doc => {
            doc['revenue'] = doc["difference_" + country + "_7"]["revenue"]
            doc['revenue_share'] = doc["difference_" + country + "_7"]["revenue_share"]
            delete doc["difference_" + country + "_7"]
            return doc
        })
    }

    public async fetchNewestVersionUpdate(body) {
        let returnData = new GetNewestVersionUpdateRespDTO()
        let limit = body.count ? body.count : 4  //default is 4
        returnData.status = 0
        let list : Array<VersionUpdate> = []
        let queryResult = await this.AppTimelineVersionFind({}, {_id: 0, Date: 1, Version: 1, AppID: 1}, 0, limit, {Date: -1})
        for(let res of queryResult) {
            let gameInfo = await this.GameTypeFindOne({AppID: res.AppID})
            let versionUpdate = new VersionUpdate()
            versionUpdate.appid = res.AppID
            versionUpdate.appName = gameInfo ? gameInfo.AppName : null
            versionUpdate.appType = gameInfo ? gameInfo.AppType : []
            versionUpdate.companyName = gameInfo ? gameInfo.CompanyName : null
            versionUpdate.country = gameInfo ? gameInfo.ReleaseCountry : null
            versionUpdate.platform = gameInfo ? gameInfo.Platform : null
            versionUpdate.versionDate = res.Date.getTime()
            versionUpdate.version = res.Version
            list.push(versionUpdate)
        }
        returnData.versionUpdateList = list
        return returnData
    }

    public GetQuarter(date: Date) {
        if(date.getMonth() < 4) {
            return {year: date.getFullYear(), quarter: 1}
        } else if (date.getMonth() < 7) {
            return {year: date.getFullYear(), quarter: 2}
        } else if (date.getMonth() < 10) {
            return {year: date.getFullYear(), quarter: 3}
        } else {
            return {year: date.getFullYear(), quarter: 4}
        }
    }
    public GetLastQuarter(quarter) {
        if(quarter.quarter === 1) {
            return {year: quarter.year - 1, quarter: 4}
        } else {
            return {year: quarter.year, quarter: quarter.quarter - 1}
        }
    }
    
    public async fetchPopularAdditionalInfo(body) {
        let returnData = new GetPopularAdditionalInfoRespDTO()
        let limit = body.count ? body.count : 5  //default is 5
        returnData.status = 0
        if(body.filter) {
            let filter = []
            let currentQuarter = this.GetQuarter(new Date())
            if(body.filter === 'yearly') {
                filter.push(currentQuarter)
                for (var i = 0;i < 3; i += 1) {
                    currentQuarter = this.GetLastQuarter(currentQuarter)
                    filter.push(currentQuarter)
                }
            } else if (body.filter === 'lastQuarter') {
                filter.push(this.GetLastQuarter(currentQuarter))
            } else if (body.filter === 'currentQuarter') {
                filter.push(currentQuarter)
            }
            // Sorted by quarterly view count
            let queryResult = await this.FeatureView.aggregate(
                [
                    {
                        $match: { inteval: { $in: filter } }
                    },
                    {
                        $group: 
                        {   
                            _id: { FeatureId: "$FeatureId" },
                            views: { $sum: "$views" }
                        }
                    }, 
                    { $sort: { views: -1 } },
                    { $limit: limit }
                ]
            )
            let list : Array<PopularAdditionalInfo> = []
            for(let res of await queryResult.toArray()) {
                let popularAdditionalInfo = new PopularAdditionalInfo()
                let featureInfo = await this.FeatureContentFindOne({_id: new mongodb.ObjectID(res['_id'].FeatureId)})
                if(!featureInfo) continue
                let gameInfo = await this.GameTypeFindOne({AppID: featureInfo.appId})
                popularAdditionalInfo.appid = featureInfo.appId
                popularAdditionalInfo.version = featureInfo.version
                popularAdditionalInfo.country = gameInfo ? gameInfo.ReleaseCountry : null
                popularAdditionalInfo.editor = featureInfo.editor
                popularAdditionalInfo.featureName = featureInfo.featureName
                popularAdditionalInfo.featureId = featureInfo['_id']
                let latestUpdateDate = await this.FeatureContentChangeHistoryFindOneSort({appId: featureInfo.appId, version: featureInfo.version, editVersion: featureInfo.editVersion}, {createTime: 1}, {createTime: -1})
                popularAdditionalInfo.latestUpdateDate = null  // not finished
                if(latestUpdateDate && latestUpdateDate.createTime && latestUpdateDate.createTime.toString() !== "NaN") popularAdditionalInfo.latestUpdateDate = latestUpdateDate.createTime
                popularAdditionalInfo.platform = gameInfo ? gameInfo.Platform : null
                popularAdditionalInfo.views = res.views
                list.push(popularAdditionalInfo)
            }
            returnData.popularAdditionInfoList = list
        } else {
            // Sorted by historical view count
            let queryResult = await this.FeatureContentFind({}, {appId: 1, version: 1, featureName: 1, editor: 1, editVersion: 1, views: 1}, 0, limit, {views: -1})
            let list : Array<PopularAdditionalInfo> = []
            for(let res of queryResult) {
                let popularAdditionalInfo = new PopularAdditionalInfo()
                let gameInfo = await this.GameTypeFindOne({AppID: res.appId})
                popularAdditionalInfo.appid = res.appId
                popularAdditionalInfo.version = res.version
                popularAdditionalInfo.country = gameInfo.ReleaseCountry
                popularAdditionalInfo.editor = res.editor
                popularAdditionalInfo.featureName = res.featureName
                popularAdditionalInfo.featureId = res['_id']
                let latestUpdateDate = await this.FeatureContentChangeHistoryFindOneSort({appId: res.appId, version: res.version, editVersion: res.editVersion}, {createTime: 1}, {createTime: -1})
                popularAdditionalInfo.latestUpdateDate = null  // not finished
                if(latestUpdateDate && latestUpdateDate.createTime && latestUpdateDate.createTime.toString() !== "NaN") popularAdditionalInfo.latestUpdateDate = latestUpdateDate.createTime
                popularAdditionalInfo.platform = gameInfo.Platform
                popularAdditionalInfo.views = res.views
                list.push(popularAdditionalInfo)
            }
            returnData.popularAdditionInfoList = list
        }
        return returnData
    }

    public async fetchNewestDiscourseArticle(body) {
        let returnData = new GetNewestDiscourseArticleRespDTO()
        let limit = body.count ? body.count : 6  //default is 6
        returnData.status = 0
        let clubTopic = await this.PlanningClubTopicFindOneSort({}, {Date: 1, Topics: 1}, {Date: -1})
        let list : Array<DiscourseArticle> = []
        for(let topic of clubTopic.Topics) {
            let discourseArticle = new DiscourseArticle()
            discourseArticle.articleName = topic.title
            discourseArticle.author = topic.poster_username
            discourseArticle.articleUrl = topic.topic_url
            list.push(discourseArticle)
        }
        returnData.discourseArticleList = list
        return returnData
    }

    // Helper functions
    public async getText(input: string) {
        return input + 'test';
    }
    
    
    // MongoDB access functions
    public async GameTypeFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.GameType.find(query, projection, skip, limit, sort) } else if (projection) { return await this.GameType.find(query, projection) } else { return await this.GameType.find(query) } }
    public async GameTypeFindOne(query, projection = null) { if (projection) { return await this.GameType.findOne(query, projection) } else { return await this.GameType.findOne(query) } }
    
    public async UpdateInfluenceFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.UpdateInfluence.find(query, projection, skip, limit, sort) } else if (projection) { return await this.UpdateInfluence.find(query, projection) } else { return await this.UpdateInfluence.find(query) } }
    public async UpdateInfluenceFindOne(query, projection = null) { if (projection) { return await this.UpdateInfluence.findOne(query, projection) } else { return await this.UpdateInfluence.findOne(query) } }

    public async DownloadAndRevenueFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.DownloadAndRevenue.find(query, projection, skip, limit, sort) } else if (projection) { return await this.DownloadAndRevenue.find(query, projection) } else { return await this.DownloadAndRevenue.find(query) } }
    public async DownloadAndRevenueFindOne(query, projection = null) { if (projection) { return await this.DownloadAndRevenue.findOne(query, projection) } else { return await this.DownloadAndRevenue.findOne(query) } }

    public async FeatureContentFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.FeatureContent.find(query, projection, skip, limit, sort) } else if (projection) { return await this.FeatureContent.find(query, projection) } else { return await this.FeatureContent.find(query) } }
    public async FeatureContentFindOne(query, projection = null) { if (projection) { return await this.FeatureContent.findOne(query, projection) } else { return await this.FeatureContent.findOne(query) } }
    
    public async FeatureContentChangeHistoryFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.FeatureContentChangeHistory.find(query, projection, skip, limit, sort) } else if (projection) { return await this.FeatureContentChangeHistory.find(query, projection) } else { return await this.FeatureContentChangeHistory.find(query) } }
    public async FeatureContentChangeHistoryFindOne(query, projection = null) { if (projection) { return await this.FeatureContentChangeHistory.findOne(query, projection) } else { return await this.FeatureContentChangeHistory.findOne(query) } }
    public async FeatureContentChangeHistoryFindOneSort(query, projection, sort) { return await this.FeatureContentChangeHistory.findOne(query, projection, sort) }

    public async AppSummaryAboutFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.AppSummaryAbout.find(query, projection, skip, limit, sort) } else if (projection) { return await this.AppSummaryAbout.find(query, projection) } else { return await this.AppSummaryAbout.find(query) } }
    public async AppSummaryAboutFindOne(query, projection = null) { if (projection) { return await this.AppSummaryAbout.findOne(query, projection) } else { return await this.AppSummaryAbout.findOne(query) } }
    
    public async AppTimelineVersionFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.AppTimelineVersion.find(query, projection, skip, limit, sort) } else if (projection) { return await this.AppTimelineVersion.find(query, projection) } else { return await this.AppTimelineVersion.find(query) } }
    public async AppTimelineVersionFindOne(query, projection = null) { if (projection) { return await this.AppTimelineVersion.findOne(query, projection) } else { return await this.AppTimelineVersion.findOne(query) } }
    
    public async UserRetentionFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.UserRetention.find(query, projection, skip, limit, sort) } else if (projection) { return await this.UserRetention.find(query, projection) } else { return await this.UserRetention.find(query) } }
    public async UserRetentionFindOne(query, projection = null) { if (projection) { return await this.UserRetention.findOne(query, projection) } else { return await this.GameType.findOne(query) } }

    public async PlanningClubTopicFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.PlanningClubTopic.find(query, projection, skip, limit, sort) } else if (projection) { return await this.PlanningClubTopic.find(query, projection) } else { return await this.PlanningClubTopic.find(query) } }
    public async PlanningClubTopicFindOne(query, projection = null) { if (projection) { return await this.PlanningClubTopic.findOne(query, projection) } else { return await this.GameType.findOne(query) } }
    public async PlanningClubTopicFindOneSort(query, projection, sort) { return await this.PlanningClubTopic.findOne(query, projection, sort) }

    public async TopThreeRevenueFindOne(query, projection, sort) { return await this.TopThreeRevenue.findOne(query, projection, sort) }
}