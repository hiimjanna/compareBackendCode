import { ApiProperty } from "@nestjs/swagger";

export class CheckUserTokenReqDTO {
  @ApiProperty({ example: '6bd74050a65211eb949f6920e58f73cf', description: '使用者的token' })
  readonly token: string;
}

export class CheckUserTokenResDTO {
  @ApiProperty({ example: 0, description: '狀態碼' })
  status: number;
  @ApiProperty({ example: 'Success', description: '訊息' })
  message: string;
}
