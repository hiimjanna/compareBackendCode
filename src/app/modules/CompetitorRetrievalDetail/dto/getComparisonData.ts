import { ApiProperty } from "@nestjs/swagger";
import { ValueCangeObj } from "../../UpdateImpacts/dto/getUpdateImpactsList";

export class CustomFeatures{
  @ApiProperty({ example: '607cde229bd4321c07fc9e44', description: '該遊戲id' })
  id: string;
  @ApiProperty({ example: 'VIP系統_PLAYTIKA REWARDS', description: '該遊戲主要特色' })
  customFeatures: string;
}

export class Income_DownloadsObj{
  @ApiProperty({ example: 27.43, description: '該收入或下載值' })
  value: number;
  @ApiProperty({ example: 26.19, description: '該收入或下載變化量' })
  valueChange: number;
}

export class GetComparisonDataRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ example: '1626192000000', description: '版本更新日期' })
  VersionDate: string;
  @ApiProperty({ example: '3.80', description: '遊戲更新版本' })
  Version: string;
  @ApiProperty({ example: 'House of Fun™ - Casino Slots', description: '該款APP的名稱' })
  GameName: string;
  @ApiProperty({ example: 'Playtika', description: '遊戲發布公司名稱' })
  CompanyName: string;
  @ApiProperty({ example: '[”卡牌”,”博弈”]', description: '遊戲類別標籤' })
  GameType: Array<string>;
  @ApiProperty({ example: 'iOS', description: '遊戲發布裝置' })
  Device: string;
  @ApiProperty({ example: '586634331', description: '辨認該款遊戲的ID' })
  AppID: string;
  @ApiProperty({ type: ValueCangeObj, description: '收入及收入量更新' })
  Income: ValueCangeObj;
  @ApiProperty({ type: ValueCangeObj, description: '下載及下載量更新' })
  Downloads: ValueCangeObj;
  @ApiProperty({ type: ValueCangeObj, description: '收入下載及收入下載量更新' })
  Income_Downloads: ValueCangeObj
  @ApiProperty({ type: [CustomFeatures], description: '該遊戲主要特色' })
  CustomFeatures: CustomFeatures;

}

export class GetComparisonDataReqDTO {
  @ApiProperty({ example: '586634331', description: '欲取得預覽內容的App的id名稱', required: true })
  appid: string;
  @ApiProperty({ example: ['内容', '活动'], description: '篩選條件之標籤' })
  tags: Array<string>;
  @ApiProperty({ example: 'Taiwan', description: '篩選條件之國家' })
  country: string;
  @ApiProperty({ example: 7, description: '選擇數據比對區間 7/14/30 天 (預設為 7 天)' })
  days: number;
}