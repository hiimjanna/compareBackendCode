import { ApiProperty } from "@nestjs/swagger";

export class SetUserStatusReqDTO {
  @ApiProperty({ example: 'example@igs.com.tw', description: '使用者帳號' })
  readonly account: string;
  @ApiProperty({ example: false, description: '玩家是否是第一次使用補充資料的編輯功能? true=是, false=不是' })
  first_edit_feature_content?: boolean;
}

export class SetUserStatusResDTO {
  @ApiProperty({ example: 0, description: '狀態碼' })
  status: number;
  @ApiProperty({ example: 'Success', description: '訊息' })
  message: string;
}
