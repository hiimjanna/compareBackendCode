import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, Inject, Logger, HttpStatus } from '@nestjs/common';
import { LOG4JS_SYSTEM_LOGGER } from '../../core/constants/system.constant';
import { PERMISSION, APP } from '../app.config';
import axios from 'axios';

@Injectable()
export class CheckPermissionMiddleware implements NestMiddleware {

  constructor(@Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger: Logger) {
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (PERMISSION.ENABLE) {
      let routePath: string = req.originalUrl;
      let account = req['i17_account'];
      req['i17Account'] = account;
      let checkRes = await this.checkPermission(routePath, account);
      if (checkRes['status'] !== 0) {
        return res.status(HttpStatus.OK).send(checkRes)
      }
    }
    next();
  }

  private async checkPermission(api, account) {
    let funcPath = `checkPermission.middleware.checkPermission`;
    let appID = APP.APP_ID;
    let url = PERMISSION.URL + '/i17gamerightcenter/right/checkpower/' + appID;
    let options = {
      'headers': {
        'Content-Type': 'application/json',
      }
    };
    let data = {
      'cmd_data': {
        'project': 'igs',
        'route': api,
        'account': account
      }
    };
    let postRes = await this.post(url, data, options);
    if (postRes['status'] !== 0) {
      return postRes;
    }
    let resStatusCode = postRes['result']['data']['status'];
    let resMsg = postRes['result']['data']['msg'];
    if (resStatusCode !== 0) {
      let errMsg = 'No Permission Access';
      this.logger.error(`${funcPath} ${errMsg}, Account: ${account}, API: ${api}, ` +
        `Res Status Code: ${resStatusCode}, Res Msg: ${resMsg}`);
      return { 'status': 1, 'message': errMsg };
    }
    return { 'status': 0, 'message': 'Success' };
  }

  private async post(url: string, data: any, options: object = {}) {
    let funcPath = '[checkPermission.middleware.post]';
    return new Promise((resolve, reject) => {
      axios.post(url, data, options).then(res => {
        return resolve({ 'status': 0, 'result': res });
      }).catch(err => {
        let errMsg = 'Get Error When Send Request';
        this.logger.error(`${funcPath}, ${errMsg}, URL: ${url}, Err: ${JSON.stringify(err)}`);
        return resolve({ 'status': 1, 'message': errMsg });
      })
    });
  }
}
