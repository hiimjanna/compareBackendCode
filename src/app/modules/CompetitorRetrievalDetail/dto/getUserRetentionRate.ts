import { ApiProperty } from "@nestjs/swagger";

export class GetUserRetentionRateRespDTO {
  @ApiProperty({ example: [{ "date": 1654041600000, "retention_1": 34.6, "retention_3": 34.6, "retention_7": 34.6, "retention_14": 34.6, "retention_30": 34.6 },
                           { "date": 1651363200000, "retention_1": 31.58, "retention_3": 31.58, "retention_7": 31.58, "retention_14": 31.58, "retention_30": 31.58 },], description: '該遊戲的所有使用者留存率' })
  retentionRate: Array<Object>;
}

export class GetUserRetentionRateReqDTO {
  @ApiProperty({ example: '586634331', description: '欲取得預覽內容的App的id名稱', required: true })
  appid: string;
}