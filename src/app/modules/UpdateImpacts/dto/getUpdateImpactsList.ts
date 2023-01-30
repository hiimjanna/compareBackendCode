import { ApiProperty } from "@nestjs/swagger";

export class FeatureObj {
    @ApiProperty()
    Id: number;
    @ApiProperty()
    Title: string;
    @ApiProperty({description: '0 是更新過的特徵, 1 是特徵改變'})
    Classfication: number;
    @ApiProperty()
    BeforeUpdate: string;
    @ApiProperty()
    AfterUpdate: string;
}

export class ValueCangeObj {
    @ApiProperty()
    Value: number;
    @ApiProperty()
    ValueChange: number;
}

export class CustomFeatureObj {
    @ApiProperty({ type: String })
    Id: string;
    @ApiProperty({ type: String })
    CustomFeatures: string;
}

export class UpdateImpactsResultObj {
    @ApiProperty()
    VersionDate: number;
    @ApiProperty()
    Version: string;
    @ApiProperty({ type: [String] })
    UpdateType: string[];
    @ApiProperty()
    GameName: string;
    @ApiProperty()
    CompanyName: string;
    @ApiProperty({ type: [String] })
    GameType: string[];
    @ApiProperty()
    Device: string;
    @ApiProperty()
    Income: ValueCangeObj;
    @ApiProperty()
    Downloads: ValueCangeObj;
    @ApiProperty()
    Income_Downloads: ValueCangeObj;
    @ApiProperty({ type: [FeatureObj] })
    Features: FeatureObj[];
    @ApiProperty({ type: [CustomFeatureObj] })
    CustomFeatures: CustomFeatureObj[];
    @ApiProperty()
    AppID: string;
}

export class UpdateImpactsQueryResult {
    @ApiProperty()
    queryResult: Array<any>;
    @ApiProperty()
    totalCount: number;
}

export class GetUpdateImpactsListRespDTO {
    @ApiProperty()
    Status: number;

    @ApiProperty({ type: [UpdateImpactsResultObj] })
    Result: UpdateImpactsResultObj[];

    @ApiProperty()
    Total: number;
}

// Request Body 參數
export class GetUpdateImpactsListReqDTO {
    @ApiProperty({ example: 'Taiwan', description: '選擇國家 (Japan, Taiwan, United States, China, Malaysia) (必填)' })
    readonly country: string;
    @ApiProperty({ required: false, example: ['博弈'], description: '欲查詢的遊戲類型，不輸入即為全部' })
    readonly types: Array<string>;
    @ApiProperty({ required: false, example: 'iOS', description: '欲查詢的平台 (iOS or Google Play)，不輸入即為全部' })
    readonly platform: string;
    @ApiProperty({ required: false, example: 7, description: '選擇數據比對區間 7/14/30 天 (預設為 7 天)' })
    days: number;
    @ApiProperty({ required: false, example: 6, description: '選擇搜尋期間 6/12 個月 (預設為 6 個月)' })
    readonly monthOfRange: number;
    @ApiProperty({ required: false, example: 200, description: '限制回傳筆數 (預設為 200 筆)' })
    readonly limit: number;
    @ApiProperty({ required: false, example: 0, description: '選擇頁數 (預設為第 0 頁)' })
    readonly pages: number;
    @ApiProperty({ required: false, example: ['event'], description: '選擇分類 (預設為全部)' })
    readonly tags: string[];
    @ApiProperty({ required: false, example: 'coin', description: '遊戲名稱 (模糊查詢)' })
    readonly name: string;
    // @ApiProperty({ required: true, example: 'iOS' })
    // readonly game_type: string;
}