import { ApiProperty } from "@nestjs/swagger";

export class LoginReqDTO {
  @ApiProperty({ example: 'example@igs.com.tw', description: '使用者帳號' })
  readonly account: string;
  @ApiProperty({ example: 'SWdzKzEyMzQ1Ng==', description: '使用者密碼, 經Base64編碼過後的值' })
  readonly password: string;
}

export class LoginResDTO {
  @ApiProperty({ example: '6bd74050a65211eb949f6920e58f73cf', description: '系統所核發的Token' })
  token?: string;
  @ApiProperty({ example: 'hugochen', description: '使用者名稱' })
  name?: string;
  @ApiProperty({
    example: [
      {
        "name": "編輯",
        "key": "btn_create_feature",
        "value": 0,
        "path": "/influence"
      }
    ], description: '選項權限清單'
  })
  option_list?: object;
  @ApiProperty({ example: ['admin'], description: '使用者的角色清單' })
  role_list?: Array<string>;
  @ApiProperty({ example: 'Success', description: '訊息' })
  message: string;
  @ApiProperty({ example: 0, description: '狀態碼' })
  status: number;
  @ApiProperty({ example: false, description: '玩家是否是第一次使用補充資料的編輯功能? true=是, false=不是' })
  first_edit_feature_content: boolean;
}

export class GetOptionPermissionDataRes {
  status: number;
  message: string;
  option_list?: Object;
  role_list?: Array<string>
}

export class GetAuthTokenRes {
  status: number;
  message: string;
  token?: string;
}

export class CheckUserRes {
  status: number;
  message: string;
  token?: string;
  option_list?: object;
  role_list?: Array<string>;
}

export class AuthUserData {
  UserName: string;
  AuthPwd: string;
  LoginIP: string;
}

export class I17AuthRes {
  ResultCode: number;
  ResultString: string;
  ReturnUrl: string;
  AuthToken: string;
  AuthTokenExpireTimeTs: number;
  IsActive: boolean;
}

export class Headers {
  'Content-Type': string;
  'Content-Length'?: string;
  Host?: string;
}

export class PostOptions {
  headers: Headers;
}

export class PostPermissionCmdDataObj {
  project: string;
  account: string;
}

export class PostPermissionDataObj {
  cmd_data: PostPermissionCmdDataObj;
}

export class PostResult {
  status: number;
  message: string;
  result?: Object;
}
