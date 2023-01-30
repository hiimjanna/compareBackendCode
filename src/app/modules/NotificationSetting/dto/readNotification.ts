import { ApiProperty } from "@nestjs/swagger";

export class ReadNotificationRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
}

export class ReadNotificationReqDTO {
  @ApiProperty({ example: 'Admin1@igs.com.tw', description: '辨識哪個用戶', required: true })
  account: String;
}