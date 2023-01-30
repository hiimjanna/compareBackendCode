import { ApiProperty } from "@nestjs/swagger";

export class RevertFeatureContentReq {
  @ApiProperty({ example: '20600005233076', description: 'APP ID' })
  appId: string;
  @ApiProperty({ example: '3.5.321', description: 'APP 的版本' })
  version: string;
  @ApiProperty({ example: '60a385152d56647ad453f1b3', description: '補充資料的 ID' })
  Id: string;
  @ApiProperty({ example: 11, description: '指定要復原的版號' })
  editVersion: number;
}

export class RevertFeatureContentRes {
  @ApiProperty({ example: 0, description: '狀態碼' })
  status: number;
  @ApiProperty({ example: 'Success', description: '訊息' })
  message: string;
}
