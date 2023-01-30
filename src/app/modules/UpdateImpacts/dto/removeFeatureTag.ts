import { ApiProperty } from "@nestjs/swagger";

export class RemoveFeatureTagReqDTO {
    @ApiProperty({ example: '', description: '欲刪除的 Tag 名稱' })
    tagName: string;
}

export class RemoveFeatureTagRespDTO {
    @ApiProperty({ example: 0, description: '執行結果' })
    Status: number;
}