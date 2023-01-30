import * as mongodb from 'mongodb';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { MongoService } from '../../../core/database/mongo/mongo.service';
import {
    IMongoClient,
    MongoDB,
    IMongoCollection,
} from '../../../core/database/mongo/mongoclient';
import { LOG4JS_SYSTEM_LOGGER } from '../../../core/constants/system.constant';
import {
    UpdateImpactsResultObj, FeatureObj, ValueCangeObj,
    GetUpdateImpactsListRespDTO, GetUpdateImpactsListReqDTO,
    UpdateImpactsQueryResult as QueryUpdateImpactsResultDTO,
    CustomFeatureObj
} from './dto/getUpdateImpactsList';
import { GetFeatureContentReqDTO, GetFeatureContentRespDTO } from './dto/getFeatureContent';
import { RemoveFeatureReqDTO } from './dto/removeFeature';
import { CreateFeatureReqDTO, EditFeatureReqDTO } from './dto/createFeature';
import { GetFeatureEditHistoryReq, VersionContent } from './dto/getFeatureEditHistory';
import { GetSpecificVerFeatureContentReq, SpecificVerFeatureContent } from './dto/getSpecificVerFeatureContent';
import { GetGameNameListReq } from './dto/getGameNameList';

@Injectable()
export class UpdateImpactsService {
    private mongoClient: IMongoClient;
    private mongoLogClient: IMongoClient;
    private UpdateInfluence: IMongoCollection;
    private GameType: IMongoCollection;
    private FeatureTags: IMongoCollection;
    private FeatureContent: IMongoCollection;
    private FeatureView: IMongoCollection;
    private GameRefineryDefinition: IMongoCollection;
    private FeatureContentChangeHistory: IMongoCollection;
    private FeatureDataUseLogColl: IMongoCollection;
    private SnManageColl: IMongoCollection;

    constructor(
        @Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger: Logger,
        private readonly mongoService: MongoService
    ) {
        this.mongoClient = this.mongoService.getMongo();
        this.mongoLogClient = this.mongoService.getMongo('log');
        this.initDB();
    }

    private async initDB() {
        const db: MongoDB = await this.mongoClient.db();
        const logDB: MongoDB = await this.mongoLogClient.db();
        this.UpdateInfluence = db.collection('UpdateInfluence');
        this.GameType = db.collection('GameType');
        this.FeatureTags = db.collection('FeatureTags');
        this.FeatureContent = db.collection('FeatureContent');
        this.FeatureView = db.collection('FeatureView');
        this.GameRefineryDefinition = db.collection('GameRefineryDefinition');
        this.FeatureContentChangeHistory = db.collection('FeatureContentChangeHistory');
        this.FeatureDataUseLogColl = logDB.collection('FeatureDataUseLog');
        this.SnManageColl = logDB.collection('SnManage');

        this.UpdateInfluence.createIndex({ 'Date': -1, 'AppID': 1 })
        this.FeatureTags.createIndex({ 'name': 1 }, true)
        this.GameType.createIndex({ 'AppType': 1, 'AppID': 1 })
        this.FeatureContent.createIndex({ 'appId': 1, 'version': 1, 'featureName': 1, 'expireTime': 1 }, true)
        this.FeatureContent.createIndex({ 'expireTime': 1 }, false, 0)
        this.FeatureView.createIndex({ 'FeatureId': 1, 'inteval': 1 })
        this.GameRefineryDefinition.createIndex({ 'Definition': 1 }, true)
        this.FeatureContentChangeHistory.createIndex(
            { 'Id': 1, 'appId': 1, 'version': 1, 'editVersion': 1 },
            true
        );
        this.FeatureContentChangeHistory.createIndex({ 'expireTime': 1 }, false, 60 * 60 * 24 * 90);
        this.FeatureDataUseLogColl.createIndex({'SN': 1}, true);
        this.FeatureDataUseLogColl.createIndex({'ExpireTime': 1}, false, 60 * 60 * 24 * 90);
        this.SnManageColl.createIndex({'Type': 1}, true);
    }

    public async queryUpdateInfluence(body: GetUpdateImpactsListReqDTO, field_name: string) {
        let query = {}
        if (body.monthOfRange !== undefined) {
            let d = new Date();
            d.setMonth(d.getMonth() - body.monthOfRange);
            query['Date'] = { '$gte': d }
        }
        if (body.days === undefined) body.days = 7;
        if (body.country === undefined) this.logger.error('[updateImpacts.service.queryUpdateInfluence] country is undefined !!!!');
        if (body.platform !== undefined) query['Platform'] = body.platform;
        if (body.tags !== undefined && body.tags.length > 0) query['Tags'] = { '$in': body.tags }

        let gameIds = await this.getGameListByCountry(body.country)

        if (body.types != null && body.types.length > 0) {
            let gameIdsByType = await this.getGameListByGameTypes(body.types)
            gameIds = gameIds.filter(function (val) {
                return gameIdsByType.indexOf(val) != -1;
            });
        }
        query['AppID'] = { '$in': gameIds }

        if (body.name !== undefined) {
            let re = /[!-\/:-@[-`{-~]/g;
            let appName = body.name.trim().replace(re, (match) => {
                return '\\' + match;
            });
            query['AppName'] = new RegExp(appName, 'i')
        }
        // query[field_name] = { '$exists': true }
        let projection = {
            '_id': -1, 'Date': 1, 'Version': 1, 'Tags': 1, 'Platform': 1, 'AppName': 1,
            'AppID': 1, 'CompanyName': 1, 'AppCategoryName': 1, 'FeatureChanges': 1
        }
        projection[field_name] = 1

        let sort = { 'Date': -1 }
        let totalCount = await this.UpdateInfluence.count(query)

        let result = new QueryUpdateImpactsResultDTO();
        let skip = body.pages * body.limit
        result.queryResult = await this.queryUpdateInfluenceWithFeatureContent(query, projection, skip, body.limit, sort);

        //test
        // result.queryResult = await this.GameType.find({}, projection);
        // result.totalCount = result.queryResult.length
     
        for (let i of result.queryResult) {
            let customFeatures = []
            for (let j of i.custom_features) {
                let customFeatureObj = new CustomFeatureObj()
                customFeatureObj.Id = j._id
                customFeatureObj.CustomFeatures = j.featureName
                customFeatures.push(customFeatureObj)
            }
            i.CustomFeatures = customFeatures
        }

        result.totalCount = totalCount
        return result
    }

    private async queryUpdateInfluenceWithFeatureContent(query, projection, skip, limit, sort) {
        let aggregate = [
            { $match: query },
            { $project: projection },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
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
        console.log('aggregate: ', JSON.stringify(aggregate))
        let queryResult = await this.UpdateInfluence.aggregate(aggregate)
        let arr = await queryResult.toArray();
        console.log('queryResult.toArray(): ', arr[0])
        return queryResult.toArray()
    }

    private async getGameListByGameTypes(gameTypes: Array<string>) {
        let query = {
            'AppType': { '$in': gameTypes }
        }
        let projection = {
            '_id': 0, 'AppID': 1
        }
        let queryResult = await this.GameType.find(query, projection)
        let gameIds: Array<string> = []
        for (let i of queryResult) {
            gameIds.push(i.AppID)
        }
        return gameIds
    }

    private async getGameListByCountry(countryName: string) {
        let query = {
            'Countries': { '$in': [countryName] }
        }
        let projection = {
            '_id': 0, 'AppID': 1
        }
        let queryResult = await this.GameType.find(query, projection)

        let gameIds: Array<string> = []
        for (let i of queryResult) {
            gameIds.push(i.AppID)
        }
        return gameIds
    }

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

    public async formatUpdateInfluence(dbResult: QueryUpdateImpactsResultDTO, field_name: string): Promise<GetUpdateImpactsListRespDTO> {
        let gameTypes = await this.getAllGameTypes()
        let resultObj = new GetUpdateImpactsListRespDTO();
        resultObj.Status = 0;
        resultObj.Result = [];
        resultObj.Total = dbResult.totalCount
        for (let i of dbResult.queryResult) {
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

    public getFeatureTags(tagName: string) {
        let query = {}
        if (tagName !== undefined && tagName !== "")
            query = { 'name': new RegExp(tagName) }
        return this.FeatureTags.find(query, { _id: 0, name: 1, type: 1, createTime: 1 })
    }

    public async insertFeatureTags(tagName: string) {
        await this.FeatureTags.insertOne({ 'name': tagName, 'type': 'custom', 'createTime': Math.floor(Date.now() / 1000) })
    }

    public async removeFeatureTag(tagName: string) {
        let updateResult = await this.FeatureContent.updateMany({ tags: { $in: [tagName] } }, { $pull: { tags: { $in: [tagName] } } })
        console.log('updateResult: ', updateResult)
        return this.FeatureTags.deleteOne({ 'name': tagName, 'type': 'custom' })
    }

    public insertFeatureContent(updateInfo: CreateFeatureReqDTO) {
        return this.FeatureContent.insertOne(updateInfo)
    }

    public createFeatureContentChangeRecord(data) {
        return this.FeatureContentChangeHistory.insertOne(data);
    }

    public updateFeatureContent(updateInfo: EditFeatureReqDTO) {
        var o_id = new mongodb.ObjectID(updateInfo.Id);
        let query = {
            _id: o_id,
            appId: updateInfo.appId,
            version: updateInfo.version
        }
        let updateData = { '$set': {} };
        for (let property of Object.getOwnPropertyNames(updateInfo)) {
            updateData['$set'][property] = updateInfo[property];
        }
        updateData['$inc'] = { 'editVersion': 1 };
        let projection = { '_id': 0, 'editVersion': 1 };
        return this.FeatureContent.findOneAndUpdate(query, updateData, projection, true);
    }

    public removeFeature(query: RemoveFeatureReqDTO) {
        console.log('removeFeature: ', query)
        let expireTime = new Date();
        let newDate = expireTime.setDate(expireTime.getDate() + 30);
        expireTime = new Date(newDate);
        return this.FeatureContent.updateOne(query, { $set: { 'expireTime': expireTime } })
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

    public async getFeatureContent(query: GetFeatureContentReqDTO): Promise<GetFeatureContentRespDTO> {
        let result = new GetFeatureContentRespDTO();
        result = await this.FeatureContent.findOne(query, {});
        // Historical view count
        this.FeatureContent.updateOne(query, { $inc : { "views": 1 } })
        // Quarterly view count
        const curQuarter = this.GetQuarter(new Date())
        let viewQuery = { FeatureId: result['_id'].toString(), inteval: curQuarter }
        let doc = { ...viewQuery, views: 1 }
        if(await this.FeatureView.count(viewQuery) === 0) this.FeatureView.insertOne(doc)
        else this.FeatureView.updateOne(viewQuery, { $inc : { "views": 1 } })

        if (!result) {
            return result;
        }
        if (result.createTime) {
            result.createTime = Math.floor(new Date(result.createTime).getTime() / 1000);
        }
        return result;
    }

    public getSimpleFeatureContent(featureName: string) {
        let query = {
            'Definition': featureName
        }
        console.log('query: ', query)
        return this.GameRefineryDefinition.findOne(query, { _id: 0 })
    }

    public async getGameNameList(queryData: GetGameNameListReq) {
        let projection = { '_id': 0, 'AppName': 1 };
        let query = {};
        if (queryData.Platform) {
          query['Platform'] = new RegExp(queryData.Platform, 'i');
        }
        if (queryData.Country) {
          query['Countries'] = {
            '$elemMatch': {
              '$regex': new RegExp(queryData.Country, 'i')
            }
          }
        }
        let res = await this.GameType.find(query, projection);
        let gameNameListSet: Set<string> = new Set();
        for (let gameData of res) {
            gameNameListSet.add(gameData['AppName']);
        }
        let gameNameList: Array<string> = Array.from(gameNameListSet);
        return gameNameList;
    }

    public async getFeatureEditHistoryFromDB(reqQueryData: GetFeatureEditHistoryReq) {
        let projection = { '_id': 0, 'createTime': 1, 'editVersion': 1, 'featureName': 1, 'editor': 1 };
        let query = {
            'appId': reqQueryData.appID,
            'version': reqQueryData.appVersion,
            'Id': reqQueryData.id
        }
        let featureDatas = await this.FeatureContentChangeHistory.find(query, projection);
        let result = {};
        for (let data of featureDatas) {
            let timestamp: number = Math.floor(new Date(data['createTime']).getTime() / 1000);
            let version: string = data['editVersion'].toString();
            result[version] = new VersionContent();
            result[version].FeatureName = data['featureName'];
            result[version].Editor = data['editor'];
            result[version].CreateTime = timestamp;
        }
        return result;
    }

    public async getSpecificVerFeatureContentFromDB(query: GetSpecificVerFeatureContentReq)
        : Promise<SpecificVerFeatureContent> {
        let projection = { '_id': 0 };
        return this.FeatureContentChangeHistory.findOne(query, projection);
    }

    public async revertFeatureContentByHistoryVer(revertInfo: SpecificVerFeatureContent, editor: string) {
        var objectID = new mongodb.ObjectID(revertInfo.Id);
        let query = {
            _id: objectID,
            appId: revertInfo.appId,
            version: revertInfo.version,
            editVersion: { '$ne': revertInfo.editVersion }
        }
        let updateData = { '$set': new SpecificVerFeatureContent() };
        revertInfo.editor = editor;
        revertInfo.createTime = new Date();
        revertInfo.newTag = [];
        delete revertInfo.editVersion;
        updateData.$set = revertInfo;
        updateData['$inc'] = { 'editVersion': 1 };
        let projection = { '_id': 0, 'editVersion': 1 };
        return await this.FeatureContent.findOneAndUpdate(query, updateData, projection, true);
    }

    public async createFeatureUseLogToDB(account: string, appID: string, appVer: string, feature: string, 
        editVer: number, api: string, featureID: string) {
      let getSnRes = await this.dbGetSN('FeatureUse');
      let sn: number = getSnRes['value']['SN'];
      let dt = new Date();
      let newData = {
        'SN': sn,
        'CreateTime': dt,
        'API': api,
        'Account': account,
        'AppID': appID,
        'AppVersion': appVer,
        'FeatureID': featureID,
        'FeatureDataVersion': editVer,
        'FeatureName': feature,
        'ExpireTime': dt
      };
      return this.FeatureDataUseLogColl.insertOne(newData);
    }

    private async dbGetSN(type: string) {
      let query = { 'Type': type };
      let doc = { '$inc': { 'SN': 1 } };
      let projection: { '_id': 0 };
      let returnOri = false;
      let upsert = true;
      return this.SnManageColl.findOneAndUpdate(query, doc, projection, returnOri, upsert);
    }
}
