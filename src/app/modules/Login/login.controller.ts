import {
  Controller,
  Post,
  Body,
  HttpCode,
  Headers,
  Logger,
  Inject,
  Header,
  Req
} from '@nestjs/common'
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginService } from './login.service';
import { LOG4JS_SYSTEM_LOGGER } from '../../../core/constants/system.constant';
import { LoginReqDTO, LoginResDTO } from './dto/login';
import { CheckUserTokenReqDTO, CheckUserTokenResDTO } from './dto/checkUserToken';
import { SetUserStatusReqDTO, SetUserStatusResDTO } from './dto/setUserStatus';

const PARAMETER_CHECK_TYPE = {
  'VALID': true,
  'INVALID': false
}

@Controller('login')
@ApiTags('Login - 登入')
export class LoginController {
  controllerName = 'login';

  constructor(private readonly loginService: LoginService,
    @Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger: Logger) {
  }

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ description: '使用者登入結果', type: LoginResDTO })
  @ApiBody({ description: '查詢參數', type: LoginReqDTO })
  async login(@Headers() header, @Req() req, @Body() body: LoginReqDTO) {
    let account = body.account;
    let pass = body.password;
    //! 檢查參數
    let checkParamRes = checkLoginParam(account, pass);
    if (checkParamRes.status !== 0) {
      return checkParamRes;
    }
    let ip: string = req['headers']['x-forwarded-for'] || req['connection']['remoteAddress'];
    let checkRes = await this.loginService.checkUser(account, pass, ip);
    let resp: LoginResDTO = new LoginResDTO();
    if (checkRes.status !== 0) {
      resp.status = 1;
      resp.message = checkRes['message'] ? checkRes['message'] : 'Fail';
      return resp;
    }
    //! 取得使用者資訊
    let firstEditFeatureContent: boolean = false;
    let userStatus = await this.loginService.getUserStatus(account);
    if (userStatus.FirstEditFeatureContent) {
      firstEditFeatureContent = userStatus.FirstEditFeatureContent;
    }
    resp.status = 0;
    resp.message = 'Success';
    resp.name = account.split('@')[0];
    resp.token = checkRes['token'] ? checkRes['token'] : '';
    resp.option_list = checkRes['option_list'] ? checkRes['option_list'] : {};
    resp.role_list = checkRes['role_list'] ? checkRes['role_list'] : [];
    resp.first_edit_feature_content = firstEditFeatureContent;
    return resp;
  }

  @Post('checktoken')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Token 的確認結果', type: CheckUserTokenResDTO })
  @ApiBody({ description: '查詢參數', type: CheckUserTokenReqDTO })
  async checkUserToken(@Headers() header, @Req() req, @Body() body: CheckUserTokenReqDTO) {
    let resp: CheckUserTokenResDTO = new CheckUserTokenResDTO();
    let token = body.token;
    let checkRes = await this.loginService.checkToken(token);
    if (checkRes['status'] !== 0) {
      resp.status = 1;
      resp.message = checkRes['message'] ? checkRes['message'] : 'Fail';
    } else {
      resp.status = 0;
      resp.message = 'Valid Token';
    }
    return resp;
  }

  @Post('setuserstatus')
  @HttpCode(200)
  @ApiOkResponse({ description: '設置結果', type: SetUserStatusResDTO })
  @ApiBody({ description: '查詢參數', type: SetUserStatusReqDTO })
  async setUserInfo(@Headers() header, @Req() req, @Body() body: SetUserStatusReqDTO) {
    let resp: SetUserStatusResDTO = new SetUserStatusResDTO();
    let setRes = await this.loginService.setUserStatus(body);
    if (setRes.status !== 0) {
      return { 'status': setRes.status, 'message': setRes.message };
    }
    resp.status = 0;
    resp.message = 'Success';
    return resp;
  }
}

function checkLoginParam(account: string, password: string) {
  //! 確認帳號
  if (checkAccount(account) === PARAMETER_CHECK_TYPE.INVALID) {
    let errMsg: string = 'The Account Has Exceptional Character';
    return { 'status': 3, 'message': errMsg };
  }
  //! 確認密碼
  if (checkPassword(password) === PARAMETER_CHECK_TYPE.INVALID) {
    let errMsg: string = 'The Password Has Exceptional Character';
    return { 'status': 3, 'message': errMsg };
  }
  return { 'status': 0, 'message': 'Success' };
}

function checkAccount(account: string) {
  let re = /[^A-Za-z0-9@.]/g;
  let matchRes: Array<string> = account.match(re);
  if (matchRes) {
    return PARAMETER_CHECK_TYPE.INVALID;
  }
  return PARAMETER_CHECK_TYPE.VALID;
}

function checkPassword(password: string) {
  let re = /[^A-Za-z0-9+\/=]/g;
  let matchRes: Array<string> = password.match(re);
  if (matchRes) {
    return PARAMETER_CHECK_TYPE.INVALID;
  }
  return PARAMETER_CHECK_TYPE.VALID;
}