import { ApiProperty } from "@nestjs/swagger";

export class AdditionalInfo{
  @ApiProperty({ example: '586634331', description: 'App的id名稱' })
  appid: string;
  @ApiProperty({ example: '1.2.0', description: 'App的更新版本' })
  version: string;
  @ApiProperty({ example: 'https://static-s.aa-cdn.net/img/ios.....', description: '該版本的廣告圖片' })
  screenshot: string;
  @ApiProperty({ example: '限時活動_Board Trip', description: '版本標題名稱' })
  featureName: string;
  @ApiProperty({ example: '6333dd6f68fa93001cec40eb', description: '補充資料的ObjectID' })
  featureId: string;
  @ApiProperty({ example: 'jingyuhuang', description: '最後編輯者' })
  editor: string;
  @ApiProperty({ example: '2021-07-02T06:32:17.931Z', description: '最後編輯時間' })
  latestUpdateDate: string;
}

export class GetNewestAdditionalInfoRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ type: AdditionalInfo, description: 'Object包含appId、文章圖片、標題、最後編輯者、最後編輯時間(順序由日期最近到最遠)' })
  additionInfoList: Array<AdditionalInfo>;
}

export class GetNewestAdditionalInfoReqDTO {
  @ApiProperty({ example: 12, description: '輸入獲取最近的幾筆資料(預設為12筆)', required: false })
  count: number;
}