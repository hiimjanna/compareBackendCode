import { ApiProperty } from "@nestjs/swagger";

export class RemoveFeatureReqDTO {
    @ApiProperty({ example: '', description: 'AppId (必填)' })
    readonly appId: string;
    @ApiProperty({ example: '', description: '版本號 (必填)' })
    readonly version: string;
    @ApiProperty({ example: '', description: '功能名稱 (必填)' })
    readonly featureName: string;
}

export class RemoveFeatureRespDTO {
    @ApiProperty({ example: 0, description: '執行結果' })
    Status: number;
}