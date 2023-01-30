import { ApiProperty } from "@nestjs/swagger";

export class GetVersionInfoRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ example: '* New exciting game - Africa!\n\t* Improved stability\n\t* Reduced app size\n\t* Bug fixes', description: '該版本的更新內容' })
  content: string;
  @ApiProperty({ example: '180+ Free Slots. 100 Free Spins for new players. Multiple ways to get Free Coins - Welcome Bonus, hourly coin gifts ......', description: '更新描述' })
  description: string;
  @ApiProperty({ example: '166.48 mb', description: '檔案大小' })
  file_Size: string;
  @ApiProperty({ example: ["獅子科技","https://www.data.ai/apps/ios/publisher/1233117904"], description: '發售商及網址' })
  publisher: Array<string>;
  @ApiProperty({ example: ["https://static-s.aa-cdn.net/img/ios/586634331/dc70103e144307c7d7a7a64cd7a46948_h250"], description: '該版本的廣告圖片' })
  screenshot: Array<string>;
}

export class GetVersionInfoReqDTO {
  @ApiProperty({ example: '586634331', description: '欲取得預覽內容的App的id名稱', required: true })
  appid: string;
  @ApiProperty({ example: '3.8', description: '欲取得預覽內容的遊戲版本號', required: true })
  version: string;
}