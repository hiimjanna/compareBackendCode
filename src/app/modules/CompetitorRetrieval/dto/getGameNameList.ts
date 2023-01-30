import { ApiProperty } from "@nestjs/swagger";

export class GetGameNameListRespDTO {
  @ApiProperty({ example: ['Coin Master', 'Coin Pusher' , '滿貫大亨'], description: '所有遊戲名稱的名單' })
  gameNameList: Array<string>;
}