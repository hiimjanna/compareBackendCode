import { ApiProperty } from "@nestjs/swagger";

export class PopularAdditionalInfo{
  @ApiProperty({ example: '586634331', description: 'App的id名稱' })
  appid: string;
  @ApiProperty({ example: '1.2.0', description: 'App的更新版本' })
  version: string;
  @ApiProperty({ example: 'iOS', description: '該遊戲發布平台' })
  platform: string;
  @ApiProperty({ example: 'Japan', description: '該遊戲發售國家' })
  country: string;
  @ApiProperty({ example: '限時活動_Board Trip', description: '版本標題名稱' })
  featureName: string;
  @ApiProperty({ example: '6333dd6f68fa93001cec40eb', description: '補充資料的ObjectID' })
  featureId: string;
  @ApiProperty({ example: 'jingyuhuang', description: '最後編輯者' })
  editor: string;
  @ApiProperty({ example: '2021-07-02T06:32:17.931Z', description: '最後編輯時間' })
  latestUpdateDate: string;
  @ApiProperty({ example: 1000, description: '瀏覽次數' })
  views: number;
}

export class GetPopularAdditionalInfoRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ type:PopularAdditionalInfo, description: 'Object包含appId、國家、平台、補充資料標題、編輯者、最後編輯時間(順序由瀏覽次數高至低)' })
  popularAdditionInfoList: Array<PopularAdditionalInfo>;
}

export class GetPopularAdditionalInfoReqDTO {
  @ApiProperty({ example: 5, description: '輸入獲取最近的幾筆資料(預設為5筆)', required: false })
  count: number;
  @ApiProperty({ example: 'yearly', description: '選擇瀏覽次數篩選區間: 預設(不填入)、yearly、lastQuarter、currentQuarter', required: false })
  filter: string;
}