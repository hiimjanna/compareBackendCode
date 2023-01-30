import { ApiProperty } from "@nestjs/swagger";
import { TrackingNode } from "./getTrackingList";

export class UpdateTrackingListRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
}

export class UpdateTrackingListReqDTO {
  @ApiProperty({ example: 'username@igs.com.tw', description: '辨識是哪位用戶要更新', required: true })
  account: string;
  @ApiProperty({ example: ['1339550728','805603214','586634331'], description: '欲更改追蹤的名單(appid list)', required: true })
  appidList: Array<string>;
}