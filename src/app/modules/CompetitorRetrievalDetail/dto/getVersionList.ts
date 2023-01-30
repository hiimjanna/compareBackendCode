import { ApiProperty } from "@nestjs/swagger";

export class VersionAndDate{
  @ApiProperty({ example:'1.1', description: '該遊戲更新的版本' })
  version: string;
  @ApiProperty({ example:'2013-02-12T00:00:00.000Z', description: '該遊戲更新的日期' })
  date: Date;
}

export class GetVersionListRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ type: [VersionAndDate], description: '該遊戲更新所有的版本及對應日期' })
  versionAndDate: Array<VersionAndDate>;
}

export class GetVersionListReqDTO {
  @ApiProperty({ example: '586634331', description: '欲取得預覽內容的App的id名稱', required: true })
  appid: string;
}