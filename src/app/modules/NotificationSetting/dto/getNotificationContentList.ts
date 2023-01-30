import { ApiProperty } from "@nestjs/swagger";

export class NotificationContentObj {
  @ApiProperty({ example: '586634331', description: '通知內容的app的id名稱' })
  appid: string;
  @ApiProperty({ example: 'iOS', description: '通知內容的平台(可為iOS、Android、All)' })
  platform: string;
  @ApiProperty({ example: 'Reveune', description: '通知類別，分為VersionUpdate、Revenue、Download這三類' })
  tag: string;
  @ApiProperty({ example: '7天前後，下載量提升幅度大於15%', description: '通知內容' })
  content: string;
  @ApiProperty({ example: 1361664000000, description: '通知內容產生的時間' })
  creationTime: number;
  @ApiProperty({ example: true, description: 'true表示已讀，false表示尚未讀取' })
  isRead: boolean;
}

export class GetNotificationContentListRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ example: 3, description: '未讀的通知信息數量' })
  numberOfUnread: number;
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  notificationList: Array<NotificationContentObj>;
}

export class GetNotificationContentListReqDTO {
  @ApiProperty({ example: 'Admin1@igs.com.tw', description: '辨識哪個用戶', required: true })
  account: String;
}