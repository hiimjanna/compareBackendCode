import { ApiProperty } from "@nestjs/swagger";

export class GetGameBasicInfoRespDTO {
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
    @ApiProperty({ example: 1361664000000, description: '初次發布日期' })
    publishDate: Date;
    @ApiProperty({ example: 1656374400000, description: '上次更新日期' })
    updateDate: Date;
    @ApiProperty({ example: '"United Kingdom"', description: '公司總部' })
    headquarter: string;
    @ApiProperty({ example: '', description: '所需設備' })
    equipment: string;
    @ApiProperty({ example: ' “Nécessite iOS 9.0 ou une version ultérieure. Compatible avec l’iPhone, l’iPad et l’iPod touch.”', description: '要求' })
    requirement: string;
    @ApiProperty({ example: '3.8', description: '遊戲現在版本' })
    version: string;
  }

  export class GetGameBasicInfoReqDTO {
    @ApiProperty({ example: '586634331', description: '欲取得遊戲內容的App的id名稱', required: true })
    appid: string;
  }