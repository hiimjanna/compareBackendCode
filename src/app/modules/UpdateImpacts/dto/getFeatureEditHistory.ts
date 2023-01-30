import { ApiProperty } from "@nestjs/swagger";

export class GetFeatureEditHistoryReq {
  @ApiProperty({ example: '20600005233076', description: 'APP ID' })
  appID: string;
  @ApiProperty({ example: '3.5.321', description: 'APP 的版本' })
  appVersion: string;
  @ApiProperty({ example: '60a385152d56647ad453f1b3', description: '補充資料的 ID' })
  id: string;
}

export class GetFeatureEditHistoryRes {
  @ApiProperty({
    example: {
      '0': {
        "FeatureName": "bar",
        "CreateTime": 1621329173,
        "Editor": "example"
      }
    }, description: '編輯歷程資料'
  })
  editHistory?: Object;
  @ApiProperty({ example: 0, description: '執行結果' })
  status: number;
  @ApiProperty({ example: 'Success', description: '訊息' })
  message: string;
}

export class VersionContent {
  FeatureName: string;
  Editor: string;
  CreateTime: number;
}
