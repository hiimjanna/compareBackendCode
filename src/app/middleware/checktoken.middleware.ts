import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../core/database/redis/redis.service';
import { IRedisClient } from '../../core/database/redis/redisclient';
import { Injectable, NestMiddleware, Inject, Logger, HttpStatus } from '@nestjs/common';
import { LOG4JS_SYSTEM_LOGGER } from '../../core/constants/system.constant';
import { I17Auth } from '../../core/util/i17Auth';
import { AUTH } from '../app.config';
import { TEST_SETTING } from '../test.config';

const VERIFY_AUTH_TOKEN_STATUS = {
  'VERIFY_SUCCESS': 80,
  'UNKNOWN_TOKEN': 81,
  'INVALID_TOKEN': 82,
  'EXCEPTION': 89
};

@Injectable()
export class CheckTokenMiddleware implements NestMiddleware {
  private redisClient: IRedisClient;

  constructor(@Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger: Logger,
    private readonly redisService: RedisService) {
    this.redisClient = this.redisService.getRedis();
  }

  async use(req: Request, res: Response, next: NextFunction) {
    let funcPath = `[checktoken.middleware]`;
    let token = req.header('token');
    //! 確認 Token 是否存在
    if (!token) {
      let errMsg = 'No Token in Header';
      this.logger.error(`${funcPath}, ${errMsg}`);
      return res.status(HttpStatus.OK).send({ 'status': 1, 'message': errMsg })
    }
    //! 取得使用者帳號
    let getRes = await this.getRedisVal(token);
    if (!getRes) {
      let errMsg = 'Invalid Token';
      this.logger.error(`${funcPath}, ${errMsg}`);
      return res.status(HttpStatus.OK).send({ 'status': 1, 'message': errMsg })
    }
    let account = getRes;
    req['i17_account'] = account;
    //! (異步) 驗證 i17Auth token 並延長時效
    if (!TEST_SETTING.ENABLE) {
      let i17Auth = new I17Auth();
      let verifyUserData = {
        'UserName': account,
        'AuthToken': token
      };
      i17Auth.verifyI17AuthToken(verifyUserData, (verifyRes) => {
        if (verifyRes['status'] !== 0) {
          this.logger.error(`${funcPath}, Get Wrong Status(${verifyRes['status']}), Account: ${account}, ` +
            `Msg: ${verifyRes['message']}`);
          if (verifyRes['status'] !== 11) {
            this.removeTokenInRedis(token);
          }
          return;
        }
        let resCode = verifyRes['data']['ResultCode'];
        if (resCode !== VERIFY_AUTH_TOKEN_STATUS.VERIFY_SUCCESS) {
          let errMsg = verifyRes['data']['ResultString'];
          this.logger.error(`${funcPath}, Verify Token Occur Error, Account: ${account}, Result Code: ${resCode}, ` +
            `Msg: ${errMsg}`);
          this.removeTokenInRedis(token);
          return;
        }
        //! 延長 Redis 的 token 時效
        this.setRedisExpire(token);
        return;
      });
    }
    next();
  }

  private async getRedisVal(token: string) {
    let redisKey = `gamerefinery:login:${token}`;
    let getRes = await this.redisClient.get(redisKey);
    return getRes
  }

  private async setRedisExpire(token: string) {
    let redisKey = `gamerefinery:login:${token}`;
    let expireTime = AUTH.LOGIN_TOKEN_EXPIRE_TIME;
    this.redisClient.expire(redisKey, expireTime);
  }

  private async removeTokenInRedis(token: string) {
    let funcPath: string = '[checktoken.middleware.removeTokenInRedis]';
    try {
      let redisKey = `gamerefinery:login:${token}`;
      this.redisClient.del(redisKey);
      return;
    } catch (err) {
      let errMsg = 'Get Exception';
      this.logger.error(`${funcPath} ${errMsg}, Token: ${token}, Eexception: ${err.message}`);
    }
  }
}
