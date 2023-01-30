import { ApiProperty } from "@nestjs/swagger";

export class GetSpecificVerFeatureContentReq {
  @ApiProperty({ example: '20600005233076', description: 'APP ID' })
  appId: string;
  @ApiProperty({ example: '3.5.321', description: 'APP 的版本' })
  version: string;
  @ApiProperty({ example: '60a385152d56647ad453f1b3', description: '補充資料的 ID' })
  Id: string;
  @ApiProperty({ example: 11, description: '補充資料的編輯版號' })
  editVersion: number;
}

export class SpecificVerFeatureContent {
  @ApiProperty({ example: '20600005233076', description: 'APP ID' })
  appId: string;
  @ApiProperty({ example: '', description: 'APP 的版本' })
  version: string;
  @ApiProperty({ example: '', description: '功能名稱' })
  featureName: string;
  @ApiProperty({ example: [], description: '特徵 Tag' })
  tags: string[];
  @ApiProperty({ example: [], description: '新增特徵 Tag' })
  newTag: string[];
  @ApiProperty({ example: '', description: '流程' })
  contentProgress: string;
  @ApiProperty({ example: '', description: '主要特色' })
  contentFeature: string;
  @ApiProperty({ example: '', description: '改進建議' })
  improveSuggestion: string;
  @ApiProperty({ example: '', description: '執行建議' })
  implementSuggestion: string;
  @ApiProperty({ example: [], description: '其他連結' })
  contentLink: string[];
  @ApiProperty({ example: '', description: '建立日期' })
  createTime: Date | number
  @ApiProperty({ example: 'hugo', description: '編輯者' })
  editor: string;
  @ApiProperty({ example: '60a5cd28719b3c30f15ddace', description: '補充資料的 ID' })
  Id: string;
  @ApiProperty({ example: 11, description: '補充資料的編輯版號' })
  editVersion: number;
}

export class GetSpecificVerFeatureContentRes {
  @ApiProperty({ example: 0, description: '狀態碼' })
  status: number;
  @ApiProperty({ example: 'Success', description: '訊息' })
  message: string;
  @ApiProperty({ example: {}, description: '特定版本補充資料' })
  featureContent: SpecificVerFeatureContent;
}
