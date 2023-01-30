import { ApiProperty } from "@nestjs/swagger";

export class RemoveItemFromNotificationListRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
}

export class RemoveItemFromNotificationListReqDTO {
  @ApiProperty({ example: 'Admin1@igs.com.tw', description: '辨識哪個用戶', required: true })
  account: String;
  @ApiProperty({ example: '586634331', description: '欲移除APP通知的id名稱' })
  appid: string;
}
