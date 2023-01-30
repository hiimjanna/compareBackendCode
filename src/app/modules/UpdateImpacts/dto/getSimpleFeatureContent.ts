import { ApiProperty } from "@nestjs/swagger";

export class GetSimpleFeatureContentReqDTO {
    @ApiProperty({ example: '特殊的PVE玩法/关卡', description: '功能描述名稱 (必填)' })
    readonly featureName: string;
}

export class GetSimpleFeatureContentRespDTO {
    @ApiProperty({ example: '', description: '功能描述內容' })
    content: string;
}