import { ApiProperty } from "@nestjs/swagger";

export class SetEmailNotificationRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
}

export class SetEmailNotificationReqDTO {
  @ApiProperty({ example: 'Admin1@igs.com.tw', description: '辨識哪個用戶', required: true })
  account: String;
  @ApiProperty({ example: true, description: '是否開啟該帳號的email通知' })
  enableEmailNotification: boolean;
  @ApiProperty({ example: "Country", description: '通知設定排序選項("Game"/"Country")與Email是否開啟' })
  notificationSortedBy: String;
}