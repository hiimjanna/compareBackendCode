import { ApiProperty } from "@nestjs/swagger";
import { Income_DownloadsObj } from "./getComparisonData";

export class GetVersionGameInfoRespDTO {
    @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
    status: number;
    @ApiProperty({ example: '586634331', description: '預覽內容的app的id名稱' })
    appid: string;
    @ApiProperty({ example: 'House of Fun™ - Casino Slots', description: '遊戲名稱' })
    appName: string;
    @ApiProperty({ example: ["卡牌", "博弈"], description: '遊戲類別' })
    appType: Array<string>;
    @ApiProperty({ example: 'Playtika', description: '公司名稱' })
    companyName: string;
    @ApiProperty({ example: 'iOS', description: '遊戲平台' })
    platform: string;
    @ApiProperty({ example:  ["Japan", "United States", "Taiwan"], description: '國家列表' })
    countries: Array<string>;
    @ApiProperty({ example: '1.3', description: '遊戲版本' })
    version: string;
    @ApiProperty({ example: 1656374400000, description: '遊戲版本日期' })
    versionDate: number;
    @ApiProperty({ example: '中了中了! 最強改版《關雲長》，赤壁模式登場! 中獎率激增破表!...' , description: '遊戲版本更新敘述' })
    description: string;
    @ApiProperty({ type: Income_DownloadsObj, description: '收入及收入量更新' })
    income: Income_DownloadsObj;
    @ApiProperty({ type: Income_DownloadsObj, description: '下載及下載量更新' })
    downloads: Income_DownloadsObj;
    @ApiProperty({ type: Income_DownloadsObj, description: '收入下載及收入下載量更新' })
    income_downloads: Income_DownloadsObj;
  }

  export class GetVersionGameInfoReqDTO {
    @ApiProperty({ example: '586634331', description: '欲取得遊戲內容的App的id名稱', required: true })
    appid: string;
    @ApiProperty({ example: 'Taiwan', description: '欲取得預覽內容的國家', required: true })
    country: string;
    @ApiProperty({ example: '3.2', description: '欲取得預覽內容的遊戲版本', required: true })
    version: string;
    @ApiProperty({ example: 1522108800000, description: '欲取得預覽內容的遊戲版本日期', required: false })
    versionDate: number;

  }