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
import { GetAllListRespDTO } from './dto/getAllList';
import { GetGameNameListRespDTO } from './dto/getGameNameList';
import { TrackingNode } from './dto/getTrackingList';
import { GetTrackingListReqDTO, GetTrackingListRespDTO } from './dto/getTrackingList';
import { RemoveItemFromListReqDTO, RemoveItemFromListRespDTO } from './dto/removeItemFromList';
import { UpdateTrackingListReqDTO, UpdateTrackingListRespDTO } from './dto/updateTrackingList';
import e = require('express');
import { Cron } from '@nestjs/schedule/dist/decorators';


@Injectable()
export class CompetitorRetrievalService {
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
        
        // Create indices
        this.GameType.createIndex({ 'AppType': 1, 'AppID': 1 })
        this.UpdateInfluence.createIndex({ 'Date': -1, 'AppID': 1 })
        this.DownloadAndRevenue.createIndex({ 'Date': -1 })
        this.UserRetention.createIndex({ 'AppID': 1, 'StartDate': -1 })
        this.UserStatus.createIndex({ 'Account': 1 }, true)
        this.GameRetrieval.createIndex({ 'AppID': 1 })
    }

    // functions
    public async formulateTrackingNode(body) {
        const appid = body.appid
        let gameType = await this.GameTypeFindOne({'AppID': appid})
        let data = {
            'AppID': appid,
            'AppName': gameType.AppName,
            'AppType': gameType.AppType,
            'CompanyName': gameType.CompanyName,
            'Platform': gameType.Platform,
            'Country': gameType.ReleaseCountry,
        }
        if(body.mode && body.mode === 'basic') {
            return data
        }

        let countryName = gameType.ReleaseCountry ? gameType.ReleaseCountry : 'Taiwan'
        const fieldName = 'difference_' + countryName + '_7'
        const dayLength = 24 * 60 * 60 * 1000

        // Chart data (revenue) within 3 months
        let appid_iOS = null
        let appid_Android = null
        if(gameType.Platform === 'iOS') {
            appid_iOS = gameType.AppID
            if(gameType.PairingAppID) appid_Android = gameType.PairingAppID
        } else { //Android
            if(gameType.PairingAppID) appid_iOS = gameType.PairingAppID
            appid_Android = gameType.AppID
        }
        let projection = { Date: 1, Revenue: 1 }
        let endDate = new Date()
        let startDate = new Date(endDate.getTime() - 90 * dayLength)
        let dataResult_iOS = await this.DownloadAndRevenueFindProj({$and: [{AppID: appid_iOS}, {Platform: 'iOS'}, {CountryName: countryName}, {Date: {$gte: startDate}}, {Date: {$lte: endDate}}]}, projection)
        let dataResult_Android = await this.DownloadAndRevenueFindProj({$and: [{AppID: appid_Android}, {Platform: 'Android'}, {CountryName: countryName}, {Date: {$gte: startDate}}, {Date: {$lte: endDate}}]}, projection)
        for(let i of dataResult_iOS) {
            i.Date = i.Date.getTime()
            if (!i['Revenue'] || i['Revenue'].toString() === 'NaN' ||  i['Revenue'].toString() === ' -') i['Revenue'] = null
        }
        for(let i of dataResult_Android) {
            i.Date = i.Date.getTime()
            if (!i['Revenue'] || i['Revenue'].toString() === 'NaN' ||  i['Revenue'].toString() === ' -') i['Revenue'] = null
        }
        data['ChartData_iOS'] = dataResult_iOS
        data['ChartData_Android'] = dataResult_Android

        // Fetch dates
        let dateFilter = new Date() // served as a filter, sifting out date after 8 days before the day it was being calculated
        dateFilter = new Date(dateFilter.getTime() - 8 * dayLength)
        let updateInfluenceProjection = {'Date': 1}
        updateInfluenceProjection[fieldName] = 1
        let mostRecentUpdateInfluence = await this.UpdateInfluenceFind5Params({'AppID': appid, 'Date': {$lte: dateFilter}}, updateInfluenceProjection, 0, 2, {'Date': -1})
        if(mostRecentUpdateInfluence.length === 0 || !mostRecentUpdateInfluence[0] || !mostRecentUpdateInfluence[0]['Date']) { // Data not found in UpdateInfluence
            let current = new Date()
            data['Revenue'] = { mid_date: current, difference: {value: null, valueChange: null}, revenueWeek1: { startDate: current, endDate: current, revenue : null}, revenueWeek2: { startDate: current, endDate: current, revenue : null} }
            let countryList = ['Taiwan', 'United States', 'Japan', 'China']
            data['Rank'] = { updateDate: current}
            for(let country of countryList) {
                data['Rank']['rank_'+country] = null
                data['Rank']['rank_'+country+'_change'] = null
            }
            data['Retention'] = { updateDate: current, retention_1 : null, retention_3 : null, retention_7 : null, retention_14 : null, retention_30 : null }
            return data
        }

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
        data['Revenue'] = revenue

        // Retention Rate
        let date = new Date()
        date.setMonth(date.getMonth() - 1)
        let userRetention = await this.UserRetentionFindOne({ $and: [{'AppID': appid}, {'CountryName': countryName}, {'StartDate': {$lte: date}}, {'EndDate': {$gte: date}}] })
        data['Retention'] = {
            updateDate: date.getTime(),
            retention_1 : null,
            retention_3 : null,
            retention_7 : null,
            retention_14 : null,
            retention_30 : null
        }
        if(userRetention) {
            if(userRetention['Retention1Days'] && userRetention['Retention1Days'].toString() !== 'NaN') data['Retention'].retention_1 = userRetention['Retention1Days'] * 100
            if(userRetention['Retention3Days'] && userRetention['Retention3Days'].toString() !== 'NaN') data['Retention'].retention_3 = userRetention['Retention3Days'] * 100
            if(userRetention['Retention7Days'] && userRetention['Retention7Days'].toString() !== 'NaN') data['Retention'].retention_7 = userRetention['Retention7Days'] * 100
            if(userRetention['Retention14Days'] && userRetention['Retention14Days'].toString() !== 'NaN') data['Retention'].retention_14 = userRetention['Retention14Days'] * 100
            if(userRetention['Retention30Days'] && userRetention['Retention30Days'].toString() !== 'NaN') data['Retention'].retention_30 = userRetention['Retention30Days'] * 100
        }

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
            let res = (await this.DownloadAndRevenueFindOneProj({'AppID': appid, 'Date': {$gte: new Date(mostRecentUpdateDate)}, 'CountryName': country}, rankProjection))
            for(let rankAtt of rankAttributes) {
                if(res && res[rankAtt] && res[rankAtt] !== ' -' && res[rankAtt].toString() !== 'NaN') rankCur = res[rankAtt]
            }
            if(rankCur && mostRecentUpdateInfluence.length >= 2) res = (await this.DownloadAndRevenueFindOneProj({'AppID': appid, 'Date': {$gte: mostRecentUpdateInfluence[1]['Date']}, 'CountryName': country}, rankProjection))
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
        data['Rank'] = rank

        return data
    }

    public async preDoGetTrackingList() {  // Pre-do the calculation of getTrackingList
        let returnData = { status: 0, updateCount: 0 }
        // Select all available game appids
        let queryResult = await this.GameTypeFindProj({}, {_id: 0, AppID: 1})
        for(let res of queryResult) {
            const appid = res.AppID
            let data = await this.formulateTrackingNode({appid: appid})
            // Store into cache
            await this.GameRetrieval.deleteOne({AppID: appid})
            if(await this.GameRetrievalCount({AppID: appid}) === 0) this.GameRetrieval.insertOne(data)
            else this.GameRetrievalFindOneAndUpdate({AppID: appid}, {$set: data})
            returnData.updateCount += 1
        }
        return returnData
    }
    
    // provide account, query tracking list by that account
    // mode : ['idOnly', 'basic']
    public async getTrackingList(body) {
        let query = {
            'Account' : body.account
        }
        let queryResult = await this.UserStatusFind(query)
        if(queryResult.length === 0 || queryResult[0].appidList === undefined) return []   // Indicates this username has no record

        let appids : Array<string> = queryResult[0].appidList

        // direct access without checking
        let cache : Array<Object> = []
        if(body.mode && body.mode === 'idOnly') cache = await this.GameRetrievalFind({AppID: {$in: appids}}, {AppID: 1})
        else cache = await this.GameRetrievalFind({AppID: {$in: appids}})
        if(cache.length === appids.length) return cache
        
        // Fetch all Apps with appid that is not in GameRetrievel database collection
        let appidList = []
        for(let id of appids) {
            let found = false
            for(let c of cache) {
                if(c['AppID'] === id) {
                    found = true
                    break
                }
            }
            if(!found) {
                appidList.push(id)
            }
        }
        let trackingList : Array<Object> = cache
        for(let appid of appidList) {
            let data = await this.formulateTrackingNode({appid: appid, mode: body.mode})

            // Store into cache
            if(await this.GameRetrievalCount({AppID: appid}) === 0) this.GameRetrieval.insertOne(data)
            else this.GameRetrievalFindOneAndUpdate({AppID: appid}, {$set: data})
            trackingList.push(data)
        }
        return trackingList
    }

    public async getAllList() {
        return await this.GameTypeFind({});
    }
    
    public async updateTrackingList(body: UpdateTrackingListReqDTO) {
        let result = new UpdateTrackingListRespDTO();
        
        let query = {
            'Account' : body.account
        }
        let isAccoutExist = await this.UserStatusCount(query)
        if(isAccoutExist === 0){
            let newData = {
                'Account' : body.account,
                'appidList' : body.appidList
            }
            await this.UserStatusInsertOne(newData)
            result.status = 0
        }
        else{
            let updateData = { '$set': { appidList: body.appidList } }
            await this.UserStatusFindOneAndUpdate(query, updateData)
            result.status = 0
        }
        
        return result
    }

    public async removeItemFromList(_account: string, _appid: string){
        let result = new RemoveItemFromListRespDTO()

        let query = {
            Account: _account
        }
        var removalCount = 0;
        let queryResult = await this.UserStatusFind(query)

        let appidList : Array<string> = []
        for (let i of queryResult) {
            for  (let j of i.appidList) {
                if(j != _appid){
                    appidList.push(j)
                }
                else{
                    removalCount++;
                }
            }
        }

        result.status = 0
        result.removalCount = removalCount
        if(removalCount === 0) {
            result.status = -1
        } else if(removalCount !== 1) {
            result.status = 1
        }

        let updateData = { '$set': { appidList: appidList } };
        this.UserStatusFindOneAndUpdate(query, updateData);

        return result;
    }

    public async removeItemFromAllUserTrackingList(body){
        if(!body || !body.appid || !body.confirmation) return {status: -1}
        let appid = body.appid, confirmation = body.confirmation
        if(appid != confirmation) return {status: -1}

        let touchedAccounts = []
        let queryResult = await this.UserStatusFindProj({}, {Account: 1, appidList: 1})
        for(let account of queryResult) {
            if(account.appidList != undefined && account.appidList.includes(appid)) {
                touchedAccounts.push(account.Account)
                const newAppidList = account.appidList.filter(item => item !== appid);
                let updateData = { '$set': { appidList: newAppidList } };
                this.UserStatusFindOneAndUpdate({Account: account.Account}, updateData);
            }
        }

        return {status: 0, touchedCount: touchedAccounts.length, touchedAccounts: touchedAccounts}
    }

    public async getGameNameList(){
        let projection = { '_id': 0, 'AppName': 1 };
        let query = {};

        let res = await this.GameTypeFindProj(query, projection);
        let gameNameListSet: Set<string> = new Set();
        for (let gameData of res) {
            gameNameListSet.add(gameData['AppName']);
        }
        let gameNameList: Array<string> = Array.from(gameNameListSet);
        return gameNameList;
    }

    public async getEvaluationData(){
        return ;
    }

    // Helper functions
    public async getText(input: string) {
        return input + 'test';
    }

    // Update game retrival collection on 7am every morning
    @Cron('0 0 7 * * *')
    UpdateGameRetrievalCollection(){
        console.log('開始更新競品追蹤資料庫\n')
        this.preDoGetTrackingList()
        console.log('更新完成競品追蹤資料庫\n')
    }
    
    // MongoDB access functions
    public async GameTypeFind(query) { return await this.GameType.find(query) }
    public async GameTypeFindOne(query) { return await this.GameType.findOne(query) }
    public async GameTypeFindProj(query, projection) { return await this.GameType.find(query, projection) }
    public async GameTypeFindOneProj(query, projection) { return await this.GameType.findOne(query, projection) }

    public async UpdateInfluenceFind(query) { return await this.UpdateInfluence.find(query) }
    public async UpdateInfluenceFindOne(query) { return await this.UpdateInfluence.findOne(query) }
    public async UpdateInfluenceFindProj(query, projection) { return await this.UpdateInfluence.find(query, projection) }
    public async UpdateInfluenceFindOneProj(query, projection) { return await this.UpdateInfluence.findOne(query, projection) }
    public async UpdateInfluenceFind5Params(query, projection, skip, limit, sort) { return await this.UpdateInfluence.find(query, projection, skip, limit, sort) }

    public async DownloadAndRevenueFind(query) { return await this.DownloadAndRevenue.find(query) }
    public async DownloadAndRevenueFindOne(query) { return await this.DownloadAndRevenue.findOne(query) }
    public async DownloadAndRevenueFindProj(query, projection) { return await this.DownloadAndRevenue.find(query, projection) }
    public async DownloadAndRevenueFindOneProj(query, projection) { return await this.DownloadAndRevenue.findOne(query, projection) }

    public async UserRetentionFind(query) { return await this.UserRetention.find(query) }
    public async UserRetentionFindOne(query) { return await this.UserRetention.findOne(query) }
    public async UserRetentionFindProj(query, projection) { return await this.UserRetention.find(query, projection) }
    public async UserRetentionFindOneProj(query, projection) { return await this.UserRetention.findOne(query, projection) }

    public async UserStatusFind(query) { return await this.UserStatus.find(query) }
    public async UserStatusFindOne(query) { return await this.UserStatus.findOne(query) }
    public async UserStatusFindProj(query, projection) { return await this.UserStatus.find(query, projection) }
    public async UserStatusFindOneProj(query, projection) { return await this.UserStatus.findOne(query, projection) }
    public async UserStatusCount(query) { return await this.UserStatus.count(query) }
    public async UserStatusInsertOne(newData) { return await this.UserStatus.insertOne(newData) }
    public async UserStatusFindOneAndUpdate(query, newData) { return await this.UserStatus.findOneAndUpdate(query, newData) }
    
    public async GameRetrievalFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.GameRetrieval.find(query, projection, skip, limit, sort) } else if (projection) { return await this.GameRetrieval.find(query, projection) } else { return await this.GameRetrieval.find(query) } }
    public async GameRetrievalFindOne(query, projection = null) { if (projection) { return await this.GameRetrieval.findOne(query, projection) } else { return await this.GameRetrieval.findOne(query) } }
    public async GameRetrievalCount(query) {return await this.GameRetrieval.count(query)}
    public async GameRetrievalFindOneAndUpdate(query, update) { return await this.GameRetrieval.findOneAndUpdate(query, update) }
}