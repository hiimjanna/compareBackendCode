import { ApiProperty } from "@nestjs/swagger";

export class GetAllFunctionNameRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ example: ["限時活動_Board Trip", "功能_HOF Album"], description: '該遊戲的所有功能名稱' })
  functionName: Array<string>;
}

export class GetAllFunctionNameReqDTO {
  @ApiProperty({ example: '586634331', description: '欲取得預覽內容的App的id名稱', required: true })
  appid: string;
}