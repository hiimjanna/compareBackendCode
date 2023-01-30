import { ApiProperty } from "@nestjs/swagger";

export class VersionUpdate{
  @ApiProperty({ example: '2013-02-12T00:00:00.000Z', description: '版本更新日期' })
  versionDate: number;
  @ApiProperty({ example: '1.2.0', description: '更新版本' })
  version: string;
  @ApiProperty({ example: 'House of Fun™ - Casino Slots', description: 'app名稱' })
  appName: string;
  @ApiProperty({ example: '586634331', description: 'App的id名稱' })
  appid: string;
  @ApiProperty({ example: ['卡牌','博弈'], description: '遊戲類型' })
  appType: Array<string>;
  @ApiProperty({ example: 'Playtika', description: '遊戲開發商' })
  companyName: string;
  @ApiProperty({ example: 'iOS', description: '該遊戲發布平台' })
  platform: string;
  @ApiProperty({ example: 'Japan', description: '該遊戲發售國家' })
  country: string;
}

export class GetNewestVersionUpdateRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ type:VersionUpdate, description: 'Object包含版本更新日期、app名稱、appId、開發商、遊戲類型、國家、平台(順序由日期最近到最遠)' })
  versionUpdateList: Array<VersionUpdate>;
}

export class GetNewestVersionUpdateReqDTO {
  @ApiProperty({ example: 4, description: '輸入獲取最近的幾筆資料(預設為4筆)', required: false })
  count: number;
}