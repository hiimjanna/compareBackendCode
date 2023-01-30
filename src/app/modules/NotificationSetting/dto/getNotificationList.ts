import { ApiProperty } from "@nestjs/swagger";

export class NotificationSettingObj {
    @ApiProperty({ example: true, description: '內容設定的項目選項，是否開啟整體通知' })
    enable: boolean;
    @ApiProperty({ example: false, description: '內容設定的項目選項，是否開啟Email通知' })
    enable_email: boolean;
    @ApiProperty({ example: false, description: '內容設定的通知方式選項，是否開啟網站通知' })
    enable_website: boolean;
}

export class NotificationNode {
    @ApiProperty({ example: 'House of Fun™ - Casino Slots', description: '遊戲名稱' })
    appName: string;
    @ApiProperty({ example: '586634331', description: '更新的app id' })
    appID: string;
    @ApiProperty({ example: ['卡牌', '博弈'], description: '標籤列表' })
    appType: Array<string>;
    @ApiProperty({ example: 'Playtika', description: '公司名稱' })
    companyName: string;
    @ApiProperty({ example: 'iOS', description: '發布平台' })
    platform: string;
    @ApiProperty({ example: 'Japan', description: '遊戲發布國家' })
    country: Array<string>;
    @ApiProperty({ example: true , description: '版本更新通知的設定有無' })
    versionUpdate: boolean;
    @ApiProperty({ example: [{day: 1, value: 10 }], description: '營收額通知列表，Object包含該通知是前後幾天以及提升幅度比例' })
    revenueList: Array<Object>;
    @ApiProperty({ example: [{day: 7, value: 15 }], description: '下載量通知列表，Object包含該通知是前後幾天以及提升幅度比例' })
    downloadList: Array<Object>;
    @ApiProperty({ type: NotificationSettingObj , description: '版本更新通知的通知開啟設定' })
    enable_versionUpdate: NotificationSettingObj;
    @ApiProperty({ type: NotificationSettingObj , description: '營收額通知的通知開啟設定' })
    enable_revenue: NotificationSettingObj;
    @ApiProperty({ type: NotificationSettingObj , description: '下載量通知的通知開啟設定' })
    enable_download: NotificationSettingObj;
}

export class GetNotificationListRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ example: true, description: '是否開啟該帳號的email通知' })
  enableEmailNotification: boolean;
  @ApiProperty({ example: "Country", description: '通知設定排序選項("Game"/"Country")與Email是否開啟' })
  notificationSortedBy: String;
  @ApiProperty({ type: NotificationNode , description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  notificationList: Array<NotificationNode>;
}

export class GetNotificationListReqDTO {
  @ApiProperty({ example: 'Admin1@igs.com.tw', description: '辨識哪個用戶', required: true })
  account: String;
  @ApiProperty({ example: 'idOnly', description: '取得資料的不同模式(模式共有: 預設、idOnly)', required: false })
  mode: String;
}