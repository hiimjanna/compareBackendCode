import { ApiProperty } from "@nestjs/swagger";

export class GetFeatureTagListReqDTO {
    @ApiProperty({ example: '', description: '名稱 (模糊查詢)' })
    tagName: string;
}

export class FeatureTagContent {
    @ApiProperty({ example: '', description: '特徵 Tag' })
    tag: string;
    @ApiProperty({ example: '', description: 'Tag 類型' })
    type: string;
    @ApiProperty({ example: '', description: '建立時間' })
    createTime: string;
}

export class GetFeatureTagListRespDTO {
    @ApiProperty({ type: [FeatureTagContent], description: '特徵 Tag' })
    tags: FeatureTagContent[];
}