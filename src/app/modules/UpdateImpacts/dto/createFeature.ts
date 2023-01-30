import { ApiProperty } from "@nestjs/swagger";

export class CreateFeatureReqDTO {
    @ApiProperty({ example: '', description: 'AppId (必填)' })
    readonly appId: string;
    @ApiProperty({ example: '', description: '版本號 (必填)' })
    readonly version: string;
    @ApiProperty({ example: '', description: '功能名稱 (必填)' })
    readonly featureName: string;
    @ApiProperty({ example: [], description: '特徵 Tag (必填)' })
    readonly tags: string[];
    @ApiProperty({ example: '', description: '流程 (必填)' })
    contentProgress: string;
    @ApiProperty({ example: '', description: '主要特色 (必填)' })
    contentFeature: string;
    @ApiProperty({ example: [], description: '新增特徵 Tag' })
    newTag: string[];
    @ApiProperty({ required: false, example: '', description: '改進建議' })
    readonly improveSuggestion: string;
    @ApiProperty({ required: false, example: '', description: '執行建議' })
    readonly implementSuggestion: string;
    @ApiProperty({ required: false, example: [], description: '其他連結' })
    readonly contentLink: string[];
}

export class EditFeatureReqDTO {
    @ApiProperty({ example: '', description: 'Id (必填)' })
    readonly Id: string;
    @ApiProperty({ example: '', description: 'AppId (必填)' })
    readonly appId: string;
    @ApiProperty({ example: '', description: '版本號 (必填)' })
    readonly version: string;
    @ApiProperty({ example: '', description: '功能名稱 (必填)' })
    readonly featureName: string;
    @ApiProperty({ example: [], description: '特徵 Tag (必填)' })
    readonly tags: string[];
    @ApiProperty({ example: '', description: '流程 (必填)' })
    contentProgress: string;
    @ApiProperty({ example: '', description: '主要特色 (必填)' })
    contentFeature: string;
    @ApiProperty({ example: [], description: '新增特徵 Tag' })
    newTag: string[];
    @ApiProperty({ required: false, example: '', description: '改進建議' })
    readonly improveSuggestion: string;
    @ApiProperty({ required: false, example: '', description: '執行建議' })
    readonly implementSuggestion: string;
    @ApiProperty({ required: false, example: [], description: '其他連結' })
    readonly contentLink: string[];
}

export class CreateFeatureRespDTO {
    @ApiProperty({description: '0 為正常, 1 為已有重複的功能名稱, -1 為其他錯誤'})
    Status: number;
}
