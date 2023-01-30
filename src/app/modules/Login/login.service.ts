import { Inject, Logger, Injectable } from '@nestjs/common';
import { MongoService } from '../../../core/database/mongo/mongo.service';
import { RedisService } from '../../../core/database/redis/redis.service';
import { IMongoClient, MongoDB, IMongoCollection } from '../../../core/database/mongo/mongoclient';
import { IRedisClient } from 'src/core/database/redis/redisclient';
import { LOG4JS_SYSTEM_LOGGER } from '../../../core/constants/system.constant';
import { APP, AUTH, PERMISSION } from '../../app.config';
import { I17Auth } from '../../../core/util/i17Auth';
import {
  PostOptions, Headers, PostPermissionDataObj, PostPermissionCmdDataObj, PostResult,
  AuthUserData, GetOptionPermissionDataRes, I17AuthRes, CheckUserRes, GetAuthTokenRes
} from './dto/login';
import { SetUserStatusReqDTO } from './dto/setUserStatus';
import axios from 'axios';
import { TEST_SETTING } from '../../test.config';

@Injectable()
export class LoginService {
  private mongoLogClient: IMongoClient;
  private mongoUserClient: IMongoClient;
  private LoginLogColl: IMongoCollection;
  private SnManageColl: IMongoCollection;
  private UserStatusColl: IMongoCollection;
  private redisClient: IRedisClient;

  constructor(@Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger: Logger,
    private readonly mongoService: MongoService,
    private readonly redisService: RedisService
  ) {
    this.mongoLogClient = this.mongoService.getMongo('log');
    this.mongoUserClient = this.mongoService.getMongo('user');
    this.redisClient = this.redisService.getRedis();
    this.initDB();
  }

  private async initDB() {
    const logDB: MongoDB = await this.mongoLogClient.db();
    const userDB: MongoDB = await this.mongoUserClient.db();
    this.LoginLogColl = logDB.collection('LoginLog');
    this.LoginLogColl.createIndex({ 'SN': 1 }, true);
    this.LoginLogColl.createIndex({ 'ExpireTime': 1 }, false, 60 * 60 * 24 * 90);
    this.SnManageColl = logDB.collection('SnManage');
    this.SnManageColl.createIndex({ 'Type': 1 }, true);
    this.UserStatusColl = userDB.collection('UserStatus');
    this.UserStatusColl.createIndex({ 'Account': 1 }, true);
  }

  public async checkUser(account: string, password: string, ip: string) {
    let result = new CheckUserRes();
    let remoteIP: string = this.ipAddressParser(ip);
    let getSnRes = await this.dbGetSN('Login');
    let sn = getSnRes['value']['SN'];
    let authRes;
    if (!TEST_SETTING.ENABLE){
      let authRes = await this.getAuthToken(account, password, remoteIP);
      if (authRes['status'] !== 0) {
        this.dbAddLoginLog(sn, account, authRes);
        result = { 'status': authRes.status, 'message': authRes.message };
        return result;
      }
    }
    let optionList: object = {};
    let roleList: Array<string> = [];
    if (PERMISSION.ENABLE) {
      let getRes = await this.getOptionPermissionData(account);
      if (getRes.status !== 0) {
        this.dbAddLoginLog(sn, account, getRes);
        result = { 'status': getRes.status, 'message': getRes.message };
        return result;
      }
      optionList = getRes.option_list;
      roleList = getRes.role_list;
    }
    let token: string = '';
    if (TEST_SETTING.ENABLE) {
      token = new Date().getTime().toString();
      this.dbAddLoginLog(sn, account, {'status': 0, 'message': 'test'});
      if(account === 'Admin1@igs.com.tw' || account === 'Admin2@igs.com.tw' || account === 'Admin3@igs.com.tw' || account === 'Tom@igs.com.tw') {
        optionList = TEST_SETTING.OPTION_LIST;
        roleList = TEST_SETTING.ROLE_LIST;
      } else {
        optionList = [];
        roleList = ['igs_normal'];
      }
    } else {
      token = authRes.token;
      this.dbAddLoginLog(sn, account, authRes);
    }
    await this.saveTokenInRedis(token, account);
    result = { 'status': 0, 'message': 'Auth Success', 'token': token, 'option_list': optionList, 'role_list': roleList };
    return result;
  }

  public async checkToken(token: string) {
    return await this.getTokenFromRedis(token);
  }

  public async getUserStatus(account: string) {
    let findRes = await this.dbGetUserFeatureDataUseStatus(account);
    let userStatus = findRes['value'];
    if (!userStatus) {
      return { 'status': 1, 'message': 'The Find Result is Empty' };
    }
    return { 'status': 0, 'message': 'Success', 'FirstEditFeatureContent': userStatus['FirstEditFeatureContent'] };
  }

  public async setUserStatus(body: SetUserStatusReqDTO) {
    try {
      let query = { 'Account': body.account };
      let update = { '$set': {} };
      if (typeof body.first_edit_feature_content === 'boolean') {
        update['$set']['FirstEditFeatureContent'] = body.first_edit_feature_content;
      }
      if (Object.keys(update['$set']).length === 0) {
        return { 'status': 83, 'message': `Need Value for Update` };
      }
      let updateRes = await this.dbSetUserStatus(query, update);
      if (updateRes['matchedCount'] === 0) {
        return { 'status': 83, 'message': `Can't Find The Account ${body.account} in DB` };
      }
      if (updateRes['modifiedCount'] === 0) {
        return { 'status': 0, 'message': `No Data be Changed` };
      }
      return { 'status': 0, 'message': 'Success' };
    } catch (err) {
      let expMsg = err.message;
      return { 'status': 99, 'message': `Get Exception: ${expMsg}` };
    }
  }

  private async getOptionPermissionData(account: string) {
    let funcPath = `[login.service.getOptionPermissionData]`;
    let result = new GetOptionPermissionDataRes();
    let url = `${PERMISSION.URL}/i17gamerightcenter/right/getoptionpower/${APP.APP_ID}`;
    let options = new PostOptions();
    options.headers = new Headers();
    options.headers["Content-Type"] = 'application/json';
    let data = new PostPermissionDataObj();
    data.cmd_data = new PostPermissionCmdDataObj();
    data.cmd_data.account = account;
    data.cmd_data.project = 'igs';
    let postRes: PostResult = await this.post(url, data, options);
    if (postRes.status !== 0) {
      result = postRes;
      return result;
    }
    let resStatusCode = postRes.result['data']['status'];
    if (resStatusCode !== 0) {
      let errMsg = 'Get Option Permission List Fail';
      this.logger.error(`${funcPath} ${errMsg}, Account: ${account}, Res Status Code: ${resStatusCode}`);
      result.status = 1;
      result.message = errMsg;
      return result;
    }
    result.status = 0;
    result.message = 'Success';
    result.option_list = postRes.result['data']['option_right_list'];
    result.role_list = postRes.result['data']['role_list'];
    return result;
  }

  private async getAuthToken(account: string, password: string, ip: string) {
    let funcPath = '[login.service.getAuthToken]';
    let result = new GetAuthTokenRes();
    let i17Auth = new I17Auth();
    let authUserData = new AuthUserData();
    authUserData.UserName = account;
    authUserData.AuthPwd = new Buffer(password, 'base64').toString();
    authUserData.LoginIP = ip;
    //! 使用單一簽入驗證使用者
    let getRes = await i17Auth.getI17AuthToken(authUserData);
    if (getRes['status'] !== 0) {
      result = { 'status': getRes['status'], 'message': getRes['message'] };
      return result;
    }
    let authRes: I17AuthRes = getRes['data'];
    let resCode: number = authRes.ResultCode;
    if (resCode !== 0) {
      let errMsg = authRes.ResultString;
      this.logger.error(`${funcPath}, Auth Fail, Account: ${account}, Result Code: ${resCode}, Msg: ${errMsg}`);
      result = { 'status': resCode, 'message': errMsg };
      return result;
    }
    result = { 'status': 0, 'message': 'Valid Account', 'token': authRes.AuthToken };
    return result;
  }

  private async post(url: string, data, options: PostOptions): Promise<PostResult> {
    let funcPath = '[login.service.post]';
    let postResult = new PostResult();
    return new Promise((resolve, reject) => {
      axios.post(url, data, options).then(res => {
        postResult.status = 0;
        postResult.message = 'Success';
        postResult.result = res;
        return resolve(postResult);
      }).catch(err => {
        let errMsg = 'Get Error When Send Request';
        this.logger.error(`${funcPath}, ${errMsg}, URL: ${url}, Err: ${JSON.stringify(err)}`);
        postResult.status = 1;
        postResult.message = errMsg;
        return resolve(postResult);
      })
    });
  }

  private ipAddressParser(ip: string = '') {
    if (ip.includes('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    return ip;
  }

  private async saveTokenInRedis(token: string, account: string) {
    let redisKey = `gamerefinery:login:${token}`;
    let redisVal = account;
    let expireTime = AUTH.LOGIN_TOKEN_EXPIRE_TIME;
    await this.redisClient.set(redisKey, redisVal);
    this.redisClient.expire(redisKey, expireTime);
  }

  private async getTokenFromRedis(token: string) {
    let funcPath = '[login.service.getTokenFromRedis]';
    let redisKey = `gamerefinery:login:${token}`;
    let getRes = await this.redisClient.get(redisKey);
    if (!getRes) {
      let errMsg = 'Invalid Token';
      this.logger.error(`${funcPath} ${errMsg}, Token: ${token}`);
      return { 'status': 1, 'message': errMsg };
    }
    return { 'status': 0, 'message': 'Valid Token' };
  }

  private async dbGetSN(type: string) {
    let query = { 'Type': type };
    let doc = { '$inc': { 'SN': 1 } };
    let projection: { '_id': 0 };
    let returnOri = false;
    let upsert = true;
    return this.SnManageColl.findOneAndUpdate(query, doc, projection, returnOri, upsert);
  }

  private async dbAddLoginLog(sn, account, res) {
    let dt = new Date();
    let doc = {
      'SN': sn,
      'CreateTime': dt,
      'Account': account,
      'Result': res,
      'ExpireTime': dt
    };
    return this.LoginLogColl.insertOne(doc);
  }

  private async dbGetUserFeatureDataUseStatus(account: string) {
    let query = { 'Account': account };
    let projection = { '_id': 0 };
    let update = { '$setOnInsert': { 'FirstEditFeatureContent': true } };
    let returnOri = false;
    let upsert = true;
    return this.UserStatusColl.findOneAndUpdate(query, update, projection, returnOri, upsert);
  }

  private async dbSetUserStatus(query: object, update: object) {
    return this.UserStatusColl.updateOne(query, update, false);
  }
}
