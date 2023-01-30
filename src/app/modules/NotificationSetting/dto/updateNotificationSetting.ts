import { ApiProperty } from "@nestjs/swagger";
import { NotificationSettingObj } from "./getNotificationList";

export class UpdateNotificationSettingRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
}

export class UpdateNotificationSettingReqDTO {
  @ApiProperty({ example: 'Admin1@igs.com.tw', description: '辨識哪個用戶' })
  account: String;
  @ApiProperty({ example: '586634331', description: '欲取得通知設定內容的遊戲AppID', required: true })
  appid: String;
  @ApiProperty({ example: true , description: '版本更新通知的設定有無' })
  versionUpdate: Boolean;
  @ApiProperty({ example: [{day: 1, value: 10 }], description: '營收額通知列表，Object包含該通知是前後幾天以及提升幅度比例' })
  revenueList: Array<Object>;
  @ApiProperty({ example: [{day: 7, value: 15 }], description: '下載量通知列表，Object包含該通知是前後幾天以及提升幅度比例' })
  downloadList: Array<Object>;
  @ApiProperty({ example: NotificationSettingObj , description: '版本更新通知的通知開啟設定' })
  enable_versionUpdate: NotificationSettingObj;
  @ApiProperty({ example: NotificationSettingObj , description: '營收額通知的通知開啟設定' })
  enable_revenue: NotificationSettingObj;
  @ApiProperty({ example: NotificationSettingObj , description: '下載量通知的通知開啟設定' })
  enable_download: NotificationSettingObj;
}