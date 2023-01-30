import { ApiProperty } from "@nestjs/swagger";

export class GetNewestCloudFileRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
}

export class GetNewestCloudFileReqDTO {
  @ApiProperty({ example: 6, description: '輸入獲取最近的幾筆資料(預設為6筆)', required: false })
  count: number;
}