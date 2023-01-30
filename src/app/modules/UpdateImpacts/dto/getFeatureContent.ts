import { ApiProperty } from "@nestjs/swagger";

export class GetFeatureContentReqDTO {
    @ApiProperty({ example: '', description: 'AppId (必填)' })
    readonly appId: string;
    @ApiProperty({ example: '', description: '版本號 (必填)' })
    readonly version: string;
    @ApiProperty({ example: '', description: '功能名稱 (必填)' })
    readonly featureName: string;
}

export class GetFeatureContentRespDTO {
    @ApiProperty({ example: '', description: 'AppId' })
    appId: string;
    @ApiProperty({ example: '', description: '版本號' })
    version: string;
    @ApiProperty({ example: '', description: '功能名稱' })
    featureName: string;
    @ApiProperty({ example: [], description: '特徵 Tag' })
    tags: string[];
    @ApiProperty({ example: '', description: '流程' })
    contentProgress: string;
    @ApiProperty({ example: '', description: '主要特色' })
    contentFeature: string;
    @ApiProperty({ required: false, example: '', description: '改進建議' })
    improveSuggestion: string;
    @ApiProperty({ required: false, example: '', description: '執行建議' })
    implementSuggestion: string;
    @ApiProperty({ required: false, example: [], description: '其他連結' })
    contentLink: string[];
    @ApiProperty({ example: '', description: '建立日期' })
    createTime?: number;
    @ApiProperty({ example: 'hugo', description: '編輯者' })
    editor ?: string;
    @ApiProperty({ example: 1, description: '補充資料的版本' })
    editVersion: number;
}