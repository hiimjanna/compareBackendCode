import { ApiProperty } from "@nestjs/swagger";

export class GameBasicInfoNode {
  @ApiProperty({ example: '586634331', description: '更新的app id' })
  AppID: string;
  @ApiProperty({ example: 'House of Fun™ - Casino Slots', description: '遊戲名稱' })
  GameName: string;
  @ApiProperty({ example: 'Playtika', description: '公司名稱' })
  CompanyName: string;
  @ApiProperty({ example: ['卡牌', '博弈'], description: '標籤列表' })
  AppType: Array<string>;
  @ApiProperty({ example: 'iOS', description: '發布平台' })
  Platform: string;
  @ApiProperty({ example: ['Japan', 'United States', 'Taiwan'], description: '發布上市國家' })
  Countries: Array<string>;
}


export class GetAllListRespDTO {
  @ApiProperty({ type: [GameBasicInfoNode], description : 'Tracking list' })
  //@ApiProperty({ example: [{"AppName" : "Coin master", "AppID" : "123456789", "AppType" : ["Card", "Gamble"], "CompanyName" : "Playtika", "Platform" : "iOS", "Countries" : ["Japan", "United States", "Taiwan"]}], description: '所有的遊戲資訊,Object包含遊戲id、遊戲名稱、公司名稱、tag string' })
  trackingList: Array<GameBasicInfoNode>;
}