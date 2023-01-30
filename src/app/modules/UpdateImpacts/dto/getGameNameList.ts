import { ApiProperty } from "@nestjs/swagger";

export class GetGameNameListRespDTO {
  @ApiProperty({ example: ['Coin Master', 'Coin Pusher'], description: '遊戲名稱的名單' })
  game_list: Array<string>;
}

export class GetGameNameListReq {
  @ApiProperty({ example: 'android', description: '要查詢的平台', required: false })
  Platform: string;
  @ApiProperty({ example: 'taiwan', description: '要查詢的國別', required: false })
  Country: string;
}
