import { ApiProperty } from "@nestjs/swagger";

export class GetRevenueAndRankRespDTO {
    @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
    status: number;
    @ApiProperty({ example: {"mid_date": 1657756800000,"updateDate": 1658361600000,"difference": {"value": -2990.43,"valueChange": -20.72},"revenueWeek1": {"startDate": 1657152000000,"endDate": 1657670400000,"revenue": 14432.86},"revenueWeek2": {"startDate": 1657843200000,"endDate": 1658361600000,"revenue": 11442.43}}, description: '最近一次更新的營收資料' })
    revenue: Object;
    @ApiProperty({ example: {"updateDate": 1657756800000,"rank_Taiwan": 122,"rank_Taiwan_change": -28,"rank_United States": 411,"rank_United States_change": 50,"rank_Japan": 102,"rank_Japan_change": -78,"rank_China": null,"rank_China_change": null},description: '最近一次更新的排名資料、最近兩次更新的排名變化' })
    rank: Object;
}

export class GetRevenueAndRankReqDTO {
    @ApiProperty({ example: '1356980152', description: '欲搜尋遊戲的AppID', required: true })
    appid: string;
}