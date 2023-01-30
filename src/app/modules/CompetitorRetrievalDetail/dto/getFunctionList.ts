import { ApiProperty } from "@nestjs/swagger";

export class FunctionNode{
  @ApiProperty({ example: '586634331', description: '預覽內容的app的id名稱' })
  appid: string;
  @ApiProperty({ example: '3.80', description: '遊戲版本' })
  version: string;
  @ApiProperty({ example: '[“限時活動”,”卡片”]', description: '遊戲活動標籤' })
  tags: Array<string>;
  @ApiProperty({ example: ' [“衝等活動”,"區域限定"]', description: '新增標籤' })
  newTag: Array<string>;
  @ApiProperty({ example: '"限時活動_Board Trip"', description: '特色名稱' })
  featureName: string;
  @ApiProperty({ example:  '"jingyuhuang"', description: '編輯者' })
  editor: string;
  @ApiProperty({ example: '2021-03-25T00:00:00.000Z', description: '版本發布日期' })
  versionDate: Date;
  @ApiProperty({ example: '2021-07-02T06:32:17.931Z', description: '上次更新日期' })
  lastUpdateDate: Date;
}

export class GetFunctionListRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ type: [FunctionNode], description: 'Object包含功能名稱、tags、編輯者、編輯時間、版本日期、主要特色、圖片、流程' })
  functionList: Array<FunctionNode>;
}

export class GetFunctionListReqDTO {
  @ApiProperty({ example: '586634331', description: '欲取得預覽內容的App的id名稱', required: true })
  appid: string;
}