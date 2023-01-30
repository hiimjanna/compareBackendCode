import { ApiProperty } from "@nestjs/swagger";

export class DownloadAndRevenue{
  @ApiProperty({ example: 'Japan', description: '該對應的國家' })
  country: string;
  @ApiProperty({ example: 8769252, description: '該對應國家的總收入量' })
  revenueSum: number;
  @ApiProperty({ example: 109615.65, description: '該對應國家的平均收入量' })
  revenueAvg: string;
  @ApiProperty({ example: 42756, description: '該對應國家的總下載量' })
  downloadSum: string;
  @ApiProperty({ example: 534.45, description: '該對應國家的平均下載量' })
  downloadAvg: string;
}

export class GetDownloadAndRevenueDataRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ type: [DownloadAndRevenue], description: 'Object包含國家及其對應的營收、均營收、下載、平均下載' })
  downloadAndRevenueList: Array<DownloadAndRevenue>;
}

export class GetDownloadAndRevenueDataReqDTO {
  @ApiProperty({ example: '586634331', description: '欲取得預覽內容的App的id名稱', required: true })
  appid: string;
  @ApiProperty({ example: 1649591918927, description: '欲取得預覽內容的篩選日期(開始)', required: true })
  startDate: number;
  @ApiProperty({ example: 1657367918927, description: '欲取得預覽內容的篩選日期(結尾)', required: true })
  endDate: number;
}