import { ApiProperty } from "@nestjs/swagger";

export class ChartData{
  // @ApiProperty({ example: '62bf5a6a3527b9524788bcf7', description: '顯示資料app的id' })
  // _id: String;
  @ApiProperty({ example: 1648339200000, description: '顯示資料的日期' })
  Date: number;
  @ApiProperty({ example: 3, description: '該日期當天的值' })
  Value: number;
  @ApiProperty({ example: true, description: '當天是否有版本更新' })
  isUpdated: boolean;
  @ApiProperty({ example: '1.2.1', description: '該遊戲的更新版本' })
  version: string;
}

export class GetEvaluationDataRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ example: '586634331', description: '預覽內容的app的id名稱' })
  appid: string;
  @ApiProperty({ example: 'House of Fun™ - Casino Slots', description: '遊戲名稱' })
  appName: string;
  @ApiProperty({ example: '[”卡牌”,”博弈”]', description: '遊戲發布公司名稱' })
  appType: Array<string>;
  @ApiProperty({ example: 'Playtika', description: '遊戲發布公司名稱' })
  companyName: string;
  @ApiProperty({ example: 'iOS', description: '遊戲發布平台' })
  platform: string;
  @ApiProperty({ example: '["Japan","United States", "Taiwan"]', description: '遊戲有發布的國家' })
  countries: Array<string>;
  @ApiProperty({ type: ChartData, description: '圖表資料' })
  chartData: Array<ChartData>;
  @ApiProperty({ type: ChartData, description: 'iOS平台的圖表資料(僅在傳入platform為All的時候回傳)' })
  chartData_iOS: Array<ChartData>;
  @ApiProperty({ type: ChartData, description: 'Android平台的圖表資料(僅在傳入platform為All的時候回傳)' })
  chartData_Android: Array<ChartData>;
  @ApiProperty({ description: '所有國家的圖表資料(僅在傳入country為All的時候回傳)' })
  chartData_AllCountries: Array<Object>;
}

export class GetEvaluationDataReqDTO {
  @ApiProperty({ example: '586634331', description: '欲取得預覽內容的App的id名稱', required: true })
  appid: string;
  @ApiProperty({ example: 'Taiwan', description: '欲取得預覽內容的國家', required: true })
  country: string;
  @ApiProperty({ example: 'iOS', description: '欲取得預覽內容的平台(可為iOS、Android、All)', required: false })
  platform: string;
  @ApiProperty({ example: '2022-03-27', description: '欲取得預覽內容的起始日期', required: true })
  startDate: any;
  @ApiProperty({ example: '2022-06-27', description: '欲取得預覽內容的結束日期', required: true })
  endDate: any;
  @ApiProperty({ example: 'Downloads', description: '欲取得預覽內容的類別 (Rank, Revenue, Downloads)', required: true })
  dataType: string;
}