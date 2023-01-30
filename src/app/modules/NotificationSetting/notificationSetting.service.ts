import * as mongodb from 'mongodb';
import { Inject, Logger, Injectable } from '@nestjs/common';
import { MongoService } from '../../../core/database/mongo/mongo.service';
import {
    IMongoClient,
    MongoDB,
    IMongoCollection,
} from '../../../core/database/mongo/mongoclient';
import { LOG4JS_SYSTEM_LOGGER } from '../../../core/constants/system.constant';
//import schedule & mailer
import { Cron } from '@nestjs/schedule/dist';
import { MailerService } from '@nestjs-modules/mailer';

//import dtos
import { GetNotificationListReqDTO, GetNotificationListRespDTO, NotificationNode, NotificationSettingObj } from './dto/getNotificationList';
import { GetNotificationSettingReqDTO, GetNotificationSettingRespDTO } from './dto/getNotificationSetting';
import { RemoveItemFromNotificationListReqDTO,  RemoveItemFromNotificationListRespDTO } from './dto/removeItemFromNotificationList';
import { SetEmailNotificationReqDTO, SetEmailNotificationRespDTO } from './dto/setEmailNotification';
import { UpdateNotificationListReqDTO, UpdateNotificationListRespDTO } from './dto/updateNotificationList';
import { UpdateNotificationSettingReqDTO, UpdateNotificationSettingRespDTO } from './dto/updateNotificationSetting';
import { ReadNotificationReqDTO, ReadNotificationRespDTO } from './dto/readNotification';
import { GetNotificationContentListReqDTO, GetNotificationContentListRespDTO, NotificationContentObj } from './dto/getNotificationContentList';
import { Console } from 'console';
import { interval } from 'rxjs';
import { Contains } from 'class-validator';
import { months } from 'moment';
import { getMaxListeners } from 'process';

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: 'igsanalyzer@gmail.com',   // 輸入自己的 Gmail 帳號               帳號:igsanalyzer@gmail.com
    pass: 'fdsdudnxprzctdvl',        // 輸入從 Gmail 連線設定所取得的密碼    密碼:fdsdudnxprzctdvl
  },
});

@Injectable()
export class NotificationSettingService {
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
    private AppSummaryAbout: IMongoCollection;
    private AppTimelineVersion: IMongoCollection;
    private PlanningClubTopic: IMongoCollection;
    private Notification: IMongoCollection;

    // Initialization
    constructor(@Inject(LOG4JS_SYSTEM_LOGGER) 
                private readonly logger : Logger,
                private readonly mongoService: MongoService,
                // private readonly mailerService: MailerService
                ) {
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
        this.AppSummaryAbout = db.collection('AppSummaryAbout')
        this.AppTimelineVersion = db.collection('AppTimelineVersion')
        this.PlanningClubTopic = db.collection('PlanningClubTopic')
        this.Notification = db.collection('Notification')
        
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
        this.AppSummaryAbout.createIndex({ 'AppID': 1 })
        this.AppTimelineVersion.createIndex({ 'AppID': 1, 'Version': 1, 'Date': -1 })
        this.PlanningClubTopic.createIndex({ 'Date': -1 })
        this.Notification.createIndex({ 'account': 1, 'appid': 1 , 'version': 1, 'versionDate': 1, 'description': 1, 'country': 1}) //To Be Designed
    }

    public async fetchNotificationList(body) {
        let returnData = new GetNotificationListRespDTO()
        if(!body || !body.account) {
            returnData.status = -1
            return returnData
        }
        let userStatus = await this.UserStatusFindOne({Account: body.account}, {notificationList: 1, enableEmailNotification: 1, notificationSortedBy: 1})
        if(!userStatus) {
            returnData.status = -1
            return returnData
        }
        
        returnData.enableEmailNotification = userStatus.enableEmailNotification != undefined ? userStatus.enableEmailNotification : true //default is true
        returnData.notificationSortedBy = userStatus.notificationSortedBy != undefined ? userStatus.notificationSortedBy : 'Game' //default is 'Game'
        console.log(userStatus.notificationSortedBy)
        returnData.status = 0
        let notificationList = userStatus['notificationList'] ? userStatus['notificationList'] : []
        let list : Array<NotificationNode> = []
        for(let notification of notificationList) {
            let node = new NotificationNode()
            node.appID = notification.appid
            if(body.mode && body.mode === 'idOnly') {
                list.push(node)
                continue
            }
            let gameInfo = await this.GameTypeFindOne({AppID: notification.appid})
            node.appName = gameInfo.AppName
            node.appType = gameInfo.AppType
            node.companyName = gameInfo.CompanyName
            node.platform = gameInfo.Platform
            node.country = gameInfo.ReleaseCountry
            node.versionUpdate = notification.versionUpdate
            node.revenueList = notification.revenueList
            node.downloadList = notification.downloadList
            node.enable_versionUpdate = notification.enable_versionUpdate
            node.enable_revenue = notification.enable_revenue
            node.enable_download = notification.enable_download
            list.push(node)
        }
        returnData.notificationList = list
        return returnData
    }

    public async fetchNotificationSetting(body) {
        let returnData = new GetNotificationSettingRespDTO()
        returnData.status = -1
        const tartgetAppID = body.appid
        if(!body || !body.account || !tartgetAppID) {
            return returnData
        }
        let userStatus = await this.UserStatusFindOne({Account: body.account}, {notificationList: 1})
        if(!userStatus) {
            return returnData
        }
        let notificationList = userStatus['notificationList'] ? userStatus['notificationList'] : []
        for(let notification of notificationList) {
            if(notification.appid === tartgetAppID) {
                returnData.status = 0
                returnData.versionUpdate = notification.versionUpdate
                returnData.revenueList = notification.revenueList
                returnData.downloadList = notification.downloadList
                returnData.enable_versionUpdate = notification.enable_versionUpdate
                returnData.enable_revenue = notification.enable_revenue
                returnData.enable_download = notification.enable_download
                return returnData
            }
        }
        // target AppID is not found
        return returnData
    }

    public async removeItemFromNotificationList(body) {
        let returnData = new RemoveItemFromNotificationListRespDTO()
        const tartgetAppID = body.appid
        if(!body || !body.account || !tartgetAppID) {
            returnData.status = -1
            return returnData
        }
        let userStatus = await this.UserStatusFindOne({Account: body.account}, {notificationList: 1})
        if(!userStatus) {
            returnData.status = -1
            return returnData
        }
        let notificationList = userStatus['notificationList'] ? userStatus['notificationList'] : []
        let list : Array<NotificationNode> = []
        let removalCount = 0
        for(let notification of notificationList) {
            if(notification.appid !== tartgetAppID) {
                list.push(notification)
            } else {
                removalCount++
            }
        }
        
        if(removalCount === 1) this.UserStatusFindOneAndUpdate({Account : body.account}, {'$set': { notificationList: list }})
        returnData.status = removalCount === 1 ? 0 : -1
        return returnData
    }

    public async setEmailNotification(body) {
        let returnData = new SetEmailNotificationRespDTO()
        if(!body || !body.account || body.enableEmailNotification === null) {
            returnData.status = -1
            return returnData
        }
        let userStatus = await this.UserStatusFindOne({Account: body.account})
        if(!userStatus) {
            returnData.status = -1
            return returnData
        }
        returnData.status = 0
        let update = {}
        if(body.enableEmailNotification != null && body.enableEmailNotification != undefined) update['enableEmailNotification'] = body.enableEmailNotification
        if(body.notificationSortedBy != null && body.notificationSortedBy != undefined) update['notificationSortedBy'] = body.notificationSortedBy
        console.log(update)
        this.UserStatusFindOneAndUpdate({Account : body.account}, {'$set': update})
        return returnData
    }

    public async updateNotificationList(body) {
        let returnData = new UpdateNotificationListRespDTO()
        if(!body || !body.account || !body.appidList) {
            returnData.status = -1
            return returnData
        }
        returnData.status = 0
        let userStatus = await this.UserStatusFindOne({Account: body.account}, {notificationList: 1})
        if(!userStatus) {
            returnData.status = -1
            return returnData
        }
        let notificationList = userStatus['notificationList'] ? userStatus['notificationList'] : []
        let list = []
        for(let appid of body.appidList) {
            let found = false
            for(let notification of notificationList) {
                if(appid === notification.appid) {
                    found = true
                    list.push(notification)
                    break
                }
            }
            if(!found) {
                list.push({
                    appid: appid,
                    versionUpdate: true,
                    revenueList: [],
                    downloadList: [],
                    enable_versionUpdate: {enable: true, enable_email: true, enable_website: true},
                    enable_revenue: {enable: false, enable_email: true, enable_website: true},
                    enable_download: {enable: false, enable_email: true, enable_website: true}
                })
            }
        }
        this.UserStatusFindOneAndUpdate({Account : body.account}, {'$set': { notificationList: list }})
        return returnData
    }

    public async updateNotificationSetting(body) {
        let returnData = new UpdateNotificationSettingRespDTO()
        returnData.status = -1
        const tartgetAppID = body.appid
        if(!body || !body.account || !tartgetAppID) {
            return returnData
        }
        let userStatus = await this.UserStatusFindOne({Account: body.account}, {notificationList: 1})
        if(!userStatus) {
            return returnData
        }
        let notificationList = userStatus['notificationList'] ? userStatus['notificationList'] : []
        for(let notification of notificationList) {
            if(notification.appid === tartgetAppID) {
                notification['versionUpdate'] = body.versionUpdate ? body.versionUpdate : notification.versionUpdate
                notification['revenueList'] = body.revenueList ? body.revenueList : notification.revenueList
                notification['downloadList'] = body.downloadList ? body.downloadList : notification.downloadList
                notification['enable_versionUpdate'] = body.enable_versionUpdate ? body.enable_versionUpdate : notification.enable_versionUpdate
                notification['enable_revenue'] = body.enable_revenue ? body.enable_revenue : notification.enable_revenue
                notification['enable_download'] = body.enable_download ? body.enable_download : notification.enable_download
                this.UserStatusFindOneAndUpdate({Account : body.account}, {'$set': { notificationList: notificationList }})

                returnData.status = 0
                return returnData
            }
        }
        // target AppID is not found
        return returnData
    }

    public async fetchNotificationContentList(body) {
        let returnData = new GetNotificationContentListRespDTO()
        if(!body || !body.account) {
            returnData.status = -1
            return returnData
        }
        let data = await this.NotificationFind({account: body.account})
        let contentList : Array<NotificationContentObj> = []
        let count = 0
        for(let datum of data) {
            let node = new NotificationContentObj()
            node.appid = datum.appid
            node.platform = datum.platform
            node.content = datum.description
            node.creationTime = datum.creationTime.getTime()
            node.isRead = datum.expireTime ? true : false
            if(node.isRead === false) count += 1 
            node.tag = datum.tag
            contentList.push(node)
        }
        returnData.status = 0
        returnData.numberOfUnread = count
        returnData.notificationList = contentList
        return returnData
    }

    // Helper functions
    public async getText(input: string) {
        return input + 'test';
    }

    //實作競品通知的更新
    public async updateNotification(){
        // Clear all data (Dev tool, only used when developing this api)
        // await this.Notification.deleteMany({})

        // Fetching all users who has notification following list
        const countryList = ["Worldwide", "Taiwan", "United States", "Japan", "China", "Vietnam", "Thailand", "India"]
        let userList = await this.UserStatus.find({notificationList: {$exists: 1}}, {Account: 1, notificationList: 1, notificationLastUpdateTime: 1})
        for(let userData of userList) {
            //Testing, not sure if this method works
            const dayLength = 24 * 60 * 60 * 1000
            const LUTime = new Date((new Date()).getTime() - 30 * dayLength)
            let lastUpdateTime = LUTime
            //let lastUpdateTime = userData.notificationLastUpdateTime ? userData.notificationLastUpdateTime : new Date()

            for(let notificationSetting of userData.notificationList) {
                const appid = notificationSetting.appid
                const gameInfo = await this.GameType.findOne({AppID: appid})
                //Grabbing content from UpdateInfluence
                let data_UpdateInfluence = await this.UpdateInfluence.find({AppID: appid, Date: {$gte: lastUpdateTime}})
                let notificationTemplate = { account: userData.Account, appid: appid, appName: gameInfo.AppName, platform: gameInfo.Platform, creationTime: new Date() }
                let version_list = []
                let rev_dow_list = []
                for(let data of data_UpdateInfluence) {
                    let data_TimelineVerion = await this.AppTimelineVersion.findOne({AppID: appid, Version: data.Version})
                    let template = { ...notificationTemplate }
                    template['version'] = data_TimelineVerion['Version']
                    template['versionDate'] = data_TimelineVerion['Date']
                    //Version update
                    if(notificationSetting.enable_versionUpdate['enable'] === true) {
                        let obj = { ...template}
                        obj['tag'] = 'VersionUpdate'
                        obj['description'] = "遊戲" + gameInfo.AppName + "，更新版本:" + data.Version  //Not sure about the format here.
                        obj['countries'] = data['Country']
                        obj['content'] = data_TimelineVerion['Content']
                        version_list.push(obj)
                    }
                    //Revenue
                    if(notificationSetting.enable_revenue['enable'] === true) {
                        for(let revenueSetting of notificationSetting.revenueList) {
                            for(let country of countryList) {
                                const field_name = "difference_" + country + "_" + revenueSetting.day
                                if(data[field_name] && data[field_name]['revenue_share'] && data[field_name]['revenue_share'] > revenueSetting.value) {
                                    let obj = { ...template}
                                    obj['tag'] = 'Revenue'
                                    obj['description'] = revenueSetting.day + "天前後，營收額提升幅度大於" + revenueSetting.value + "%"
                                    obj['interval'] = revenueSetting.day
                                    obj['country'] = country
                                    obj['before'] = data[field_name]['average_revenue_before']
                                    obj['after'] = data[field_name]['average_revenue_after']
                                    obj['difference'] = data[field_name]['revenue']
                                    obj['difference_share'] = data[field_name]['revenue_share']
                                    rev_dow_list.push(obj)
                                }
                            }
                        }
                    }
                    //Downloads
                    if(notificationSetting.enable_download['enable'] === true) {
                        for(let downloadSetting of notificationSetting.downloadList) {
                            for(let country of countryList) {
                                const field_name = "difference_" + country + "_" + downloadSetting.day
                                if(data[field_name] && data[field_name]['downloads_share'] && data[field_name]['downloads_share'] > downloadSetting.value) {
                                    let obj = { ...template}
                                    obj['tag'] = 'Download'
                                    obj['description'] = downloadSetting.day + "天前後，下載量提升幅度大於" + downloadSetting.value + "%"
                                    obj['interval'] = downloadSetting.day
                                    obj['country'] = country
                                    obj['before'] = data[field_name]['average_download_before']
                                    obj['after'] = data[field_name]['average_download_after']
                                    obj['difference'] = data[field_name]['downloads']
                                    obj['difference_share'] = data[field_name]['downloads_share']
                                    rev_dow_list.push(obj)
                                }
                            }
                        }
                    }
                }
                this.Notification.insertMany(version_list)
                this.Notification.insertMany(rev_dow_list)
            }
        }
    }

    //Setting expiration date on notifications.
    public async readNotification(body) {
        let returnStatus = new ReadNotificationRespDTO()
        if(!body || !body.account) {
            returnStatus.status = -1
            return returnStatus
        }
        returnStatus.status = 0
        const dayLength = 24 * 60 * 60 * 1000
        const expTime = new Date((new Date()).getTime() + 30 * dayLength)  //Settign 30 days upon reading as default expiration date
        await this.NotificationUpdateMany({account: body.account, expireTime: {$exists: 0}}, {$set: {expireTime: expTime}})
        this.NotificationFlushing()
        return returnStatus
    }

    //Eradicating expired notification
    public async NotificationFlushing() {
        const cur = new Date()
        //this.Notification.deleteMany({$and: [{expireTime:{$exist: true}}, {expireTime:{$lte: cur}}]})
        this.Notification.deleteMany({expireTime:{$lte: cur}})
    }

    //Fetching Notification List (Not currently used and only used for testing pruposes)
    public async fetchNotifications(account: string) {
        let data_versionUpdate = await this.Notification.find({account: account, tag: "VersionUpdate"})
        console.log(data_versionUpdate)
        let data_revenue = await this.Notification.find({account: account, tag: "Revenue"})
        console.log(data_revenue)
        let data_download = await this.Notification.find({account: account, tag: "Download"})
        console.log(data_download)
    }

    //實作outlook信件發送
    public async sendOutlookMail(){
        //無遊戲更新通知
        //this.sendNoUpdateNotify()
        const user_list = await this.UserStatus.find({}, {_id: 0, Account: 1, enableEmailNotification: 1})
        for(let user of user_list) {
            const account = user.Account
            if(!account || user.enableEmailNotification == false) continue
            // 判斷該用戶是否有新的更新資料
            const today = new Date()
            var yesterday = new Date(today)
            yesterday.setDate(today.getDate() - 1)
            if(await this.Notification.count({account: account, creationTime: {$gte: yesterday}}) === 0) {
                // this.sendNoUpdateNotify(account)
                continue
            }
            //信件header資訊
            var content = '<meta charset="utf-8">\n'
            content += `<div style= "width: 1080px; height:12%; text-align: center; background-color: #d12249; border-bottom-right-radius: 80px;border-bottom-left-radius: 80px;">
                                <img style= "vertical-align: bottom; padding-right: 10px;padding-top: 20px; width: 50%;" src="https://storage.googleapis.com/game-analyzer/GameAnalyzer_Logo-white.svg" alt="GameAnalyze">
                        </div>`
            //版更通知email
            content += await this.sendVersionMail(account)
            //營收差異email
            content += await this.sendRevenueDiffMail(account)
            //下載
            content += await this.sendDownloadDiffMail(account)
    
            //信件footer資訊
            content += `<div style="margin-left: 5px; width: 1070px; height:60px; text-align: center; background-color: #4a4b69; border-radius: 16px;">
                            <p style="color: #b0b1cf; font-size: 18; font-family: Arial, sans-serif; padding-top:8px; margin-bottom: 3px;">遊戲分析平台IGS Game Analyzer</p>
                            <p style="coYlor: #696a89; font-size: 12; font-family: Arial, sans-serif; margin-top: 3px;">2021 © International Games System CO., LTD. All Rights Reserved.</p>
                        </div>`

            await this.sendEmailFunc([account],'競品更新通知信-遊戲分析平台IGS Game Analyzer', content)
        }
    }

    //無遊戲更新通知
    public async sendNoUpdateNotify(user: string){
        const today = new Date()
        var notify_content = `資料更新日期： ${today.getMonth() + 1}/${today.getDate()}<br>`
        notify_content += "無遊戲更新通知"
        //textfile writing

        await this.sendEmailFunc([user],'遊戲版更通知', notify_content)
    }

    //版更通知email
    public async sendVersionMail(user: string){
        const today = new Date()
        var yesterday = new Date(today)
        yesterday.setDate(today.getDate()-1)

        let data = await this.Notification.find({account: user, tag: "VersionUpdate", creationTime: {$gte: yesterday}})
        var notify_content = `<div style = "display: flex; justify-content: space-between; width: 1080px;">
                                    <p style = "margin-left: 5px; width: 70px; height: 24px; font-size:14px; font-weight:bold; color:#8ca98f; background-color:#dbf0de;  padding-top: 5px; border-radius: 25px; text-align:center;">版本更新</p>
                                    <p style = "margin-right: 5px; width: 165px; height: 24px; font-size:14px; font-weight:bold; color:#8d799c; background-color:#ebdcfc;  padding-top: 5px; border-radius: 25px; text-align:center;">資料更新日期： ${today.getMonth() + 1}/${today.getDate()}</p></div>`
        //判斷版本更新是否有資料
        if(data.length == 0){
            return
        }
        notify_content += this.version_email_title()

        notify_content += '<tbody>'
        var even = false
        data.sort((a, b) => (a.versionDate < b.versionDate) ? 1 : (a.versionDate === b.versionDate)? (a.appName > b.appName) ? 1 :(a.appName === b.appName)? (a.platform > b.platform)? 1 : (a.platform === b.platform)? (a.countries > b.countries)? 1 : -1 : -1 : -1 : -1)
        

        for (let today_game_data of data){
            // console.log(today_game_data.versionDate)
            if (even) notify_content += '<tr style = "background-color: #FAFFF9">'
            else notify_content += '<tr style = "background-color: #f4fbf3">'
            even = !even
            let tDate = today_game_data.versionDate 
            var month: any = parseInt(tDate.getMonth()) + 1 
            if(month <= 9 && month >= 1)
                month = '0' + month.toString() 
            else
                month = month.toString()
            notify_content += `<td style = "text-align : center; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ tDate.getFullYear() }/${ month }/${ tDate.getDate() }<br>${today_game_data.version}</td>`
            notify_content += `<td style = "text-align : left; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.appName } </td>`
            notify_content += `<td style = "text-align : center; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.platform }</td>`
            //show countries
            let country_list = today_game_data.countries
            var first = true
            notify_content += '<td style = "text-align : center; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"><p>'
            for(let country of country_list){
                if(first){
                    notify_content += `${ country }`
                    first = false
                }
                else
                {
                    notify_content += `, <br>
                    ${ country }`
                }
            }
            notify_content += '</p></td>'

            notify_content += `<td style = "text-align : left; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.content } </td>` 
        }
        notify_content += '</tbody></table>'
        notify_content += '<br>'
        
        return notify_content
    }

    //營收差異email
    public async sendRevenueDiffMail(user: string){
        const today = new Date()
        var yesterday = new Date(today)
        var middle = new Date(today)
        var start = new Date(today)
        yesterday.setDate(today.getDate()-1)
        middle.setDate(today.getDate()-7)
        start.setDate(today.getDate()-14)

        var notify_content = ''
        
        let data = await this.Notification.find({account: user, tag: "Revenue", creationTime: {$gte: yesterday}})
        //排序data的資料 排序情形: appid -> platform -> country
        data.sort((a, b) => (a.appid > b.appid) ? 1 : (a.appid === b.appid) ? ((a.platform > b.platform) ? 1 : (a.platform === b.platform) ? ((a.country >b.country)? 1 : -1) : -1) : -1 )
        let intervals = [1,7,14,30]
        var current_interval = 0
        var current_id = ""
        var current_platform = ""
        var firstCreating = true

        //console.log(data.length)
        for( let interval of intervals){
            var even = false
            for (let today_game_data of data){
                if(today_game_data.interval == interval){
                    //依照前後幾天的判斷創建table title
                    if(current_interval != interval){
                        current_interval = interval

                        if(!firstCreating){
                            //end table
                            notify_content += '</tbody></table>'
                            notify_content += '<br>'
                        }
                        else{
                            notify_content += '<p style="margin-left: 5px; width: 70px; height: 24px; font-size:14px; font-weight:bold; color:#6d889b; padding-top: 5px; text-align: center; border-radius: 25px; background-color: #cce8fe;">營收額</p>'
                            firstCreating = false
                        }

                        //create table
                        notify_content += this.revenueAndDownload_email_title(start,middle,today,true,interval)
                        current_id = ""
                        current_platform = ""
                        
                    }

                    notify_content += '<tbody>'
                    if (even) notify_content += '<tr style = "background-color: #FAFEFF">'
                    else notify_content += '<tr style = "background-color: #F3F8FC">'
                    even = !even
                    //判斷如果appid和platform與上筆資料相同，就不重複顯示
                    if(current_id === today_game_data.appid && current_platform === today_game_data.platform ){
                        notify_content += `<td style = "border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> </td>`
                        notify_content += `<td style = "border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> </td>`
                    }
                    else{
                        current_id = today_game_data.appid
                        current_platform = today_game_data.platform
                        notify_content += `<td style = "text-align : left; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.appName } </td>`
                        notify_content += `<td style = "text-align : center; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.platform }</td>`
                    }
                    
                    notify_content += `<td style = "text-align : center; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.country }</td>`
                    notify_content += `<td style = "text-align : right; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.before }</td>`
                    notify_content += `<td style = "text-align : right; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.after }</td>`
                    notify_content += `<td style = "text-align : right; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px; color: #c04b4c; border-color: #000000;"> ${ today_game_data.difference } (${ today_game_data.difference_share}%)</td>`
                    let tDate = today_game_data.versionDate 
                    var month: any = parseInt(tDate.getMonth()) + 1 
                    if(month <= 9 && month >= 1)
                        month = '0' + month.toString() 
                    else
                        month = month.toString()
                    notify_content += `<td style = "text-align : right; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.version } (${ tDate.getFullYear() }/${ month }/${ tDate.getDate() }) </td>`

                }
            }
        }
        
        //end table
        notify_content += '</tbody></table>'
        notify_content += '<br>'

        return notify_content
    }
    
    public async sendDownloadDiffMail(user: string){
        const today = new Date()
        var yesterday = new Date(today)
        var middle = new Date(today)
        var start = new Date(today)
        yesterday.setDate(today.getDate()-1)
        middle.setDate(today.getDate()-7)
        start.setDate(today.getDate()-14)

        var notify_content = ''
        
        let data = await this.Notification.find({account: user, tag: "Download", creationTime: {$gte: yesterday}})
        //排序data的資料 排序情形: appid -> platform -> country
        data.sort((a, b) => (a.appid > b.appid) ? 1 : (a.appid === b.appid) ? ((a.platform > b.platform) ? 1 : (a.platform === b.platform) ? ((a.country >b.country)? 1 : -1) : -1) : -1 )
        let intervals = [1,7,14,30]
        var current_interval = 0
        var current_id = ""
        var current_platform = ""
        var firstCreating = true

        //console.log(data.length)
        for( let interval of intervals){
            var even = false
            for (let today_game_data of data){
                if(today_game_data.interval == interval){
                    //依照前後幾天的判斷創建table title
                    if(current_interval != interval){
                        current_interval = interval

                        if(!firstCreating){
                            //end table
                            notify_content += '</tbody></table>'
                            notify_content += '<br>'
                        }
                        else{
                            notify_content += '<p style="margin-left: 5px; width: 70px; height: 24px; font-size:14px; font-weight:bold; color:#7e6553; padding-top: 5px; text-align: center; border-radius: 25px; background-color: #ffe4ce;">下載量</p>'
                            firstCreating = false
                        }

                        //create table
                        notify_content += this.revenueAndDownload_email_title(start,middle,today,false,interval)
                        current_id = ""
                        current_platform = ""
                    }

                    if (even) notify_content += '<tr style = "background-color: #FFFFFF">'
                    else notify_content += '<tr style = "background-color: #FAF7F2">'
                    even = !even

                    //判斷如果appid和platform與上筆資料相同，就不重複顯示
                    if(current_id === today_game_data.appid && current_platform === today_game_data.platform ){
                        notify_content += `<td style = "border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> </td>`
                        notify_content += `<td style = "border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> </td>`
                    }
                    else{
                        current_id = today_game_data.appid
                        current_platform = today_game_data.platform
                        notify_content += `<td style = "text-align : left; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.appName } </td>`
                        notify_content += `<td style = "text-align : center; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.platform }</td>`
                    }
                    
                    notify_content += `<td style = "text-align : center; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.country }</td>`
                    notify_content += `<td style = "text-align : right; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.before }</td>`
                    notify_content += `<td style = "text-align : right; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.after }</td>`
                    notify_content += `<td style = "text-align : right; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px; color: #c04b4c; border-color: #000000;"> ${ today_game_data.difference } (${ today_game_data.difference_share}%)</td>`
                    let tDate = today_game_data.versionDate 
                    var month: any = parseInt(tDate.getMonth()) + 1 
                    if(month <= 9 && month >= 1)
                        month = '0' + month.toString() 
                    else
                        month = month.toString()
                    notify_content += `<td style = "text-align : right; padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;"> ${ today_game_data.version } (${ tDate.getFullYear() }/${ month }/${ tDate.getDate() }) </td>`

                }
            }
        }

        //end table
        notify_content += '</tbody></table>'
        notify_content += '<br>'

        return notify_content
    }

    public revenueAndDownload_email_title(start: Date,middle: Date, today: Date, isRevenue: Boolean, inteval: number){
        /* for debug
        console.log('middle')
        console.log(middle.getMonth()+1)
        console.log(middle.getDate())
        */
        var RevenueOrDownloadString = ''
        var colorCode = ''
        if(isRevenue === true){
            RevenueOrDownloadString = '營收'
            colorCode = '#CCE8FE'
        }
        else{
            RevenueOrDownloadString = '下載'
            colorCode = '#ffe4cf'
        }

        var middle_l = new Date(middle)
        var middle_r = new Date(middle)
        middle_l.setDate(middle.getDate()-1)
        middle_r.setDate(middle.getDate()+1)
        
        var html = `
        <table style="background-color:${ colorCode }; font-weight:bold; table-layout: fixed; width: 1080px; border-right:none; border-left:none; border-collapse:collapse;border-color:#9b9b9b;border-spacing:0; text-align:left;vertical-align:top; border-width:1px; font-family:Arial, sans-serif; font-size:14px;padding:10px;">
        <colgroup>
        <col style="width: 22.2%">
        <col style="width: 11.1%">
        <col style="width: 11.1%">
        <col style="width: 11.1%">
        <col style="width: 11.1%">
        <col style="width: 16.7%">
        <col style="width: 16.7%">
        </colgroup>
        <thead>
        <tr>
        <th rowspan="2" style="width: 22.2%; text-align : center;">遊戲名稱</th>
        <th rowspan="2" style="width: 11.1%; text-align : center;">平台</th>
        <th rowspan="2" style="width: 11.1%; text-align : center;">國家</th>
        <th colspan="2" style="width: 22.2%; text-align : center;">日${ RevenueOrDownloadString }平均 (美元)</th>
        <th rowspan="2" style="width: 16.7%; text-align : center;">${middle.getMonth() + 1}/${middle.getDate()}<br>前後${ inteval }天${ RevenueOrDownloadString }差異<br>(美元)</th>
        <th rowspan="2" style="width: 16.7%; text-align : center;">更版日期/<br>版本號</th>
        </tr>
        <tr>
        <th class="center" style="width: 11.1%; text-align : center;">${start.getMonth() + 1}/${start.getDate()}~${middle_l.getMonth() + 1}/${middle_l.getDate()}</th>
        <th class="center" style="width: 11.1%; text-align : center;">${middle_r.getMonth() + 1}/${middle_r.getDate()}~${today.getMonth() + 1}/${today.getDate()}</th>
        </tr>
        </thead>`
        
        return html
    }

    public other_email_css(){
        return `<style type="text/css">
        /* 版本更新 */
        div { display: flex; justify-content: space-between; }
        p.ver {margin-left: 5px; width: 70px; height: 24px; font-size:14px; font-weight:bold; color:#8ca98f; background-color:#dbf0de;  padding-top: 5px; border-radius: 25px; text-align:center; }
        p.date {margin-right: 5px; width: 165px; height: 24px; font-size:14px; font-weight:bold; color:#8d799c; background-color:#ebdcfc;  padding-top: 5px; border-radius: 25px; text-align:center; }
        /* table style */
        .t {
        border-collapse:collapse;border-color:#9b9b9b;border-spacing:0;
        text-align:left;vertical-align:top;
        border-style:solid;border-width:1px;font-family:Arial, sans-serif;
        font-size:14px;padding:10px;
        }
        td,th {
        padding: 5px;border-style:solid;border-left:none;border-bottom:none;border-right:none;border-width:1px;
        }
        /* align center style */
        td.center {vertical-align:center;text-align: center;}
    
        /* 營收額 */
        tr:nth-child(odd) {
        background-color: #F3F8FC;
        }
        tr:nth-child(even) {
        background-color: #FAFEFF;
        }
    
        /* title style */
        .tg th {background-color:#DAEFDC;font-weight:bold;}
        .tb th {background-color:#CCE8FE;font-weight:bold;}
        .tr th {background-color:#ffe4cf;font-weight:bold;}
    
        /* Rows' background colors (intertwined) */
        tr.green:nth-child(odd) {
        background-color: #f4fbf3;
        }
        tr.green:nth-child(even) {
        background-color: #FAFFF9;
        }
        tr.blue:nth-child(odd) {
        background-color: #F3F8FC;
        }
        tr.blue:nth-child(even) {
        background-color: #FAFEFF;
        }
        tr.red:nth-child(odd) {
        background-color: #FAF7F2;
        }
        tr.red:nth-child(even) {
        background-color: #FFFFFF;
        }
    
        /* Country style */
        .tw {background-color:#eefdff;}
        .jp {background-color:#fff2f1;}
        .usa {background-color:#f2f3fe;}
        .chn {background-color:#ffffee;}
        .mas {background-color:#f5ffec;}

        /* text-align right style */
        tr .right {text-align:right;}
        tr .center {text-align:center;}
        tr .left {text-align:left;}
    
        td .right {text-align:right;}
        td .center {text-align:center;}
        td .left {text-align:left;}

        th {text-align:center;}
        /* number UP or DOWN style */
        tr .up {color:#cb0000;}
        tr .down {color:#009901;}
        </style>`
    }

    public version_email_title(){
        return `
        <table style="background-color:#DAEFDC; font-weight:bold; width: 1080px; border-right:none; border-left:none; border-collapse:collapse;border-color:#9b9b9b;border-spacing:0; text-align:left;vertical-align:top; border-width:1px;font-family:Arial, sans-serif; font-size:14px;padding:10px;">
        <colgroup>
        <col style="width: 10%">
        <col style="width: 25%">
        <col style="width: 10%">
        <col style="width: 10%">
        <col style="width: 45%">
        </colgroup>
        <thead>
        <tr>
        <th style="width: 10%; text-align : center;">更版日期/<br>版本號</th>
        <th style="width: 25%; text-align : center;">遊戲名稱</th>
        <th style="width: 10%; text-align : center;">平台</th>
        <th style="width: 10%; text-align : center;">國家</th>
        <th style="width: 45%; text-align : center;">更新重點</th>
        </tr>
        </thead>`
    }

    public sendEmailFunc(recipient: string[], title: string, content: string){
        transporter.sendMail({
            from: 'igsanalyzer@gmail.com',   //寄件人
            to: recipient,                          //收件人
            subject: title,                         //郵件標題
            html: content,                          //文件內容
        }).then(() => {})
        .catch((error) => {console.log(error)})
    }

    // Update notification & Send outlook email on 7am every morning
    @Cron('0 0 23 * * *') // Setting 23:00 to compensate for the different time zones (diff. 8 Hours)
    async UpdateNotificationAndSendOutlook(){
        console.log('開始發送outlook信件\n')
        await this.sendOutlookMail()
        console.log('發送完成outlook信件\n')

        console.log('開始更新已追蹤競品通知\n')
        this.updateNotification()
        console.log('更新完成已追蹤競品通知\n')
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
    
    public async AppSummaryAboutFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.AppSummaryAbout.find(query, projection, skip, limit, sort) } else if (projection) { return await this.AppSummaryAbout.find(query, projection) } else { return await this.AppSummaryAbout.find(query) } }
    public async AppSummaryAboutFindOne(query, projection = null) { if (projection) { return await this.AppSummaryAbout.findOne(query, projection) } else { return await this.AppSummaryAbout.findOne(query) } }
    
    public async AppTimelineVersionFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.AppTimelineVersion.find(query, projection, skip, limit, sort) } else if (projection) { return await this.AppTimelineVersion.find(query, projection) } else { return await this.AppTimelineVersion.find(query) } }
    public async AppTimelineVersionFindOne(query, projection = null) { if (projection) { return await this.AppTimelineVersion.findOne(query, projection) } else { return await this.AppTimelineVersion.findOne(query) } }
    
    public async UserRetentionFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.UserRetention.find(query, projection, skip, limit, sort) } else if (projection) { return await this.UserRetention.find(query, projection) } else { return await this.UserRetention.find(query) } }
    public async UserRetentionFindOne(query, projection = null) { if (projection) { return await this.UserRetention.findOne(query, projection) } else { return await this.GameType.findOne(query) } }
    
    public async UserStatusFind(query, projection = null, skip = null, limit = null, sort = null) { if(sort) { return await this.UserStatus.find(query, projection, skip, limit, sort) } else if (projection) { return await this.UserStatus.find(query, projection) } else { return await this.UserStatus.find(query) } }
    public async UserStatusFindOne(query, projection = null) { if (projection) { return await this.UserStatus.findOne(query, projection) } else { return await this.UserStatus.findOne(query) } }
    public async UserStatusFindOneAndUpdate(query, update) { return await this.UserStatus.findOneAndUpdate(query, update) }

    public async NotificationFind(query) { return await this.Notification.find(query) }
    public async NotificationUpdateMany(query, docs) { return await this.Notification.updateMany(query, docs) }
}