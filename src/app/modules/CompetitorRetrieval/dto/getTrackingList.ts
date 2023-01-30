import { ApiProperty } from "@nestjs/swagger";


export class TrackingNode {
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
    @ApiProperty({ example: 'Japan', description: '發布上市國家' })
    Country: string;
    @ApiProperty({ example: [{'2022-05-13': 72, '2002-05-14': 81}], description: '該遊戲在不同日期的暢銷排名' })
    RankList: Array<Object>;
    @ApiProperty({ example: [{'2022-05-13': 114904, '2002-05-14': 14633}], description: '該遊戲在不同日期的下載量' })
    DownloadList: Array<Object>;
    @ApiProperty({ example: [{'2022-05-13': 256094, '2002-05-14': 295318}], description: '該遊戲在不同日期的營收' })
    RevenueList: Array<Object>;
    // @ApiProperty({ example:'United States', description: '排名表現資料的遊戲發布國家' })
    // country: string;
    @ApiProperty({ example: [{'Date': 16571520000000, 'Revenue': 295318}], description: '該遊戲在iOS平台上的營收列表' })
    ChartData_iOS: Array<Object>;
    @ApiProperty({ example: [{'Date': 16571520000000, 'Revenue': 295318}], description: '該遊戲在Android平台上的營收列表' })
    ChartData_Android: Array<Object>;
}


export class GetTrackingListRespDTO {
  @ApiProperty({ type: [TrackingNode], description: '已追蹤的遊戲資訊,Object包含遊戲id、遊戲名稱、公司名稱、tag string' })
  trackingList: Array<TrackingNode>;
}

export class GetTrackingListReqDTO {
  @ApiProperty({ example: 'username@igs.com.tw', description: '辨識是哪位用戶', required: true })
  account: string;
}