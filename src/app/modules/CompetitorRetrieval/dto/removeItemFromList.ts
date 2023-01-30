import { ApiProperty } from "@nestjs/swagger";
import internal = require("events");
import { TrackingNode } from "./getTrackingList";

export class RemoveItemFromListRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ example: 0, description: '已刪除幾個trackingNode，0個或1個，判別有沒有刪除成功' })
  removalCount: number;
}

export class RemoveItemFromListReqDTO {
  @ApiProperty({ example: 'username@igs.com.tw', description: '辨識是哪位用戶', required: true })
  account: string;
  @ApiProperty({ example: '586634331', description: '欲移除App的id名稱', required: true })
  appid: string;
}

export class RemoveItemFromAllUserTrackingListReqDTO {
  @ApiProperty({ example: '20600006313545', description: '欲移除的遊戲id (將從所有帳號的追蹤清單中移除)', required: true })
  appid: string;
  @ApiProperty({ example: '', description: '再次輸入欲移除的遊戲id (需與appid一模一樣才會進行移除)', required: true })
  confirmation: string;
}