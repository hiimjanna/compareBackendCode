import { ApiProperty } from "@nestjs/swagger";

export class RevenueTop{
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
  @ApiProperty({ example: 33.7, description: '該競品的營收數值(進步幅度%)' })
  revenueCount: number;
  @ApiProperty({ example: 1500, description: '該競品的營收數值(進步數值)' })
  revenueDiff: number;
}

export class GetRevenueTop3RespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ type:RevenueTop, description: 'Object包含app名稱、appId、開發商、遊戲類型、國家、平台、營收數值(順序由營收高到營收低)' })
  revenueTop3List: Array<RevenueTop>;
  @ApiProperty({ example: 16571520000000, description: '更新日期' })
  date: number;
  @ApiProperty({ example: 7, description: '選擇數據比對區間 7/14/30 天 (預設為 7 天)' })
  days: number;
}

export class GetRevenueTop3ReqDTO {
  @ApiProperty({ example: 3, description: '輸入獲取最近的幾筆資料(預設為3筆)', required: false })
  count: number;
}