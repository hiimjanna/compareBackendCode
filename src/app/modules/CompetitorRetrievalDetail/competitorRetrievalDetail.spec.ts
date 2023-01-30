import { CompetitorRetrievalDetailService } from './competitorRetrievalDetail.service';
import { Test } from '@nestjs/testing';
import { async } from 'rxjs';

describe('CompetitorRetrievalServiceTest', () => {
    let competitorRetrievalDetailService: CompetitorRetrievalDetailService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
        imports: [],
        providers: [
            CompetitorRetrievalDetailService,
            { provide: 'LOG4JS_LOGGER', useValue: {} },
            {
            provide: MongoService,
            useValue: { getMongo: jest.fn(getMongo) }
            },
            {
            provide: RedisService,
            useValue: { getRedis: jest.fn(getRedis) }
            }
        ]
        }).compile();

        competitorRetrievalDetailService = module.get<CompetitorRetrievalDetailService>(CompetitorRetrievalDetailService);
    });

    describe('----- CompetitorRetrievalDetailService -- fetchComparisonData -----', () => {
        it('一般流程', async () => {
            let queryInfo = {
                appid: "586634331",
                tags: [],
                country: "Taiwan",
                days: 7
            }
            //Mocking database access
            const queryUpdateInfluenceWithFeatureContent = jest.spyOn(competitorRetrievalDetailService, <any>'queryUpdateInfluenceWithFeatureContent');
            queryUpdateInfluenceWithFeatureContent.mockImplementation(() => {
                return [{
                    AppID: '586634331',
                    Date: new Date('2013-06-13T00:00:00.000Z'),
                    Version: '1.4',
                    AppCategoryName: null,
                    AppName: 'Slots - House of Fun',
                    CompanyName: null,
                    Platform: 'iOS',
                    difference_Taiwan_7: {
                        downloads: -0.29,
                        revenue: -2.29,
                        downloads_share: -12.5,
                        revenue_share: -64,
                        average_revenue_before_7: 3.57,
                        average_revenue_after_7: 1.29
                    },
                    difference_Taiwan_14: {
                        downloads: -0.29,
                        revenue: NaN,
                        downloads_share: -12.12,
                        revenue_share: NaN,
                        average_revenue_before_14: 2.29,
                        average_revenue_after_14: NaN
                    },
                    difference_Taiwan_30: {
                        downloads: -0.13,
                        revenue: NaN,
                        downloads_share: -5.33,
                        revenue_share: NaN,
                        average_revenue_before_30: NaN,
                        average_revenue_after_30: NaN
                    },
                    custom_features: [],
                    CustomFeatures: []
                }]
            });
            const getAllGameTypes = jest.spyOn(competitorRetrievalDetailService, <any>'getAllGameTypes');
            getAllGameTypes.mockImplementation(() => {
                return {'AppType': {'586634331': ["街機", "競速"]}, 'CompanyName': {'586634331': 'Lingxi Games Inc.'}}
            });
            
            let res = await competitorRetrievalDetailService.fetchComparisonData(queryInfo);
            expect(res.Status).toBe(0);
        });
    });

    describe('----- CompetitorRetrievalDetailService -- fetchVersionGameInfo -----', () => {
        it('一般流程', async () => {
            let queryInfo = {
                "appid": "586634331",
                "country": "Taiwan",
                "version": "3.2",
                "versionDate": 1522108800000
            }
            //Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return {
                    AppName: "House of Fun™ - Casino Slots",
                    AppID: "586634331",
                    AppType: ["卡牌", "博弈"],
                    CompanyName: "Playtika",
                    Platform: "iOS",
                    Countries: ["Japan", "United States", "Taiwan"]
                }
            });
            const AppTimelineVersionFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'AppTimelineVersionFindOne');
            AppTimelineVersionFindOne.mockImplementation(() => {
                return { Date: new Date(), Description: "Introduction to the game." }
            });
            const UpdateInfluenceFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'UpdateInfluenceFindOne');
            UpdateInfluenceFindOne.mockImplementation(() => {
                return  { difference_Taiwan_7: {
                    downloads: -0.29,
                    revenue: -2.29,
                    downloads_share: -12.5,
                    revenue_share: -64,
                    average_revenue_before_7: 3.57,
                    average_revenue_after_7: 1.29
                }}
            });
            let res = await competitorRetrievalDetailService.fetchVersionGameInfo(queryInfo);
            expect(res.status).toBe(0);
        });

        it('傳入資料不完整(缺少appid)，是否正確回傳status = -1', async () => {
            let queryInfo = {
                "country": "Taiwan",
                "version": "3.2"
            }
            let res = await competitorRetrievalDetailService.fetchVersionGameInfo(queryInfo);
            expect(res.status).toBe(-1);
        });

        it('傳入資料不完整(缺少country)，是否正確回傳status = -1', async () => {
            let queryInfo = {
                "appid": "586634331",
                "version": "3.2"
            }
            let res = await competitorRetrievalDetailService.fetchVersionGameInfo(queryInfo);
            expect(res.status).toBe(-1);
        });

        it('傳入資料不完整(缺少version)，是否正確回傳status = -1', async () => {
            let queryInfo = {
                "appid": "586634331",
                "country": "Taiwan"
            }
            let res = await competitorRetrievalDetailService.fetchVersionGameInfo(queryInfo);
            expect(res.status).toBe(-1);
        });

        it('傳入AppID不再資料庫中，是否正確回傳status = -1', async () => {
            let queryInfo = {
                "appid": "123456789000",
                "country": "Taiwan",
                "version": "3.2"
            }
            //Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return null
            });
            let res = await competitorRetrievalDetailService.fetchVersionGameInfo(queryInfo);
            expect(res.status).toBe(-1);
        });

        it('在更新影響力中，若輸入的AppID和Version不存在此版本，是否能正常運作', async () => {
            let queryInfo = {
                "appid": "123456789000",
                "country": "Taiwan",
                "version": "3.2"
            }
            //Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return {
                    AppName: "House of Fun™ - Casino Slots",
                    AppID: "586634331",
                    AppType: ["卡牌", "博弈"],
                    CompanyName: "Playtika",
                    Platform: "iOS",
                    Countries: ["Japan", "United States", "Taiwan"]
                }
            });
            const AppTimelineVersionFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'AppTimelineVersionFindOne');
            AppTimelineVersionFindOne.mockImplementation(() => {
                return { Date: new Date(), Description: "Introduction to the game." }
            });
            const UpdateInfluenceFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'UpdateInfluenceFindOne');
            UpdateInfluenceFindOne.mockImplementation(() => {
                return null
            });
            let res = await competitorRetrievalDetailService.fetchVersionGameInfo(queryInfo);
            expect(res.status).toBe(0);
        });
    });

    describe('----- CompetitorRetrievalDetailService -- fetchEvaluationData -----', () => {
        it('一般流程', async () => {
            let queryInfo = {
                appid: "586634331",
                country: "Taiwan",
                startDate: "2022-03-27",
                endDate: "2022-06-27",
                dataType: "Downloads",
                platform: "iOS"
            }
            ///Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return {
                    AppName: "House of Fun™ - Casino Slots",
                    AppID: "586634331",
                    AppType: ["卡牌", "博弈"],
                    CompanyName: "Playtika",
                    Platform: "iOS",
                    Countries: ["Japan", "United States", "Taiwan"]
                }
            });
            const DownloadAndRevenueFind = jest.spyOn(competitorRetrievalDetailService, <any>'DownloadAndRevenueFind');
            DownloadAndRevenueFind.mockImplementation(() => {
                return [{Date: new Date(), Downloads: 150}, {Date: new Date(), Downloads: 300}, {Date: new Date(), Downloads: 500}]
            });
            const AppTimelineVersionFind = jest.spyOn(competitorRetrievalDetailService, <any>'AppTimelineVersionFind');
            AppTimelineVersionFind.mockImplementation(() => {
                return [{Date: new Date()}, {Date: new Date()}, {Date: new Date()}]
            });
            let res = await competitorRetrievalDetailService.fetchEvaluationData(queryInfo);
            expect(res.status).toBe(0);
        });

        it('傳入AppID不再資料庫中，是否正確回傳status = -1', async () => {
            let queryInfo = {
                appid: "123456789000",
                country: "Taiwan",
                startDate: "2022-03-27",
                endDate: "2022-06-27",
                dataType: "Downloads",
                platform: "iOS"
            }
            ///Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return null
            });
            let res = await competitorRetrievalDetailService.fetchEvaluationData(queryInfo);
            expect(res.status).toBe(-1);
        });
    });

    describe('----- CompetitorRetrievalDetailService -- fetchGameBasicInfo -----', () => {
        it('一般流程', async () => {
            ///Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return {
                    AppName: "House of Fun™ - Casino Slots",
                    AppID: "586634331",
                    AppType: ["卡牌", "博弈"],
                    CompanyName: "Playtika",
                    Platform: "iOS",
                    Countries: ["Japan", "United States", "Taiwan"]
                }
            });
            const AppSummaryAboutFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'AppSummaryAboutFindOne');
            AppSummaryAboutFindOne.mockImplementation(() => {
                return {
                    "Initial Release Date": new Date(),
                    "Last Updated Time": new Date(),
                    "Version": "4.12",
                    "Company HQ": "United Kingdom",
                    "Required Devices": "iPhone, iPad, Other iOS Device",
                    "Requirement": "Nécessite iOS 9.0 ou une version ultérieure. Compatible avec l’iPhone, l’iPad et l’iPod touch."
                }
            });
            let res = await competitorRetrievalDetailService.fetchGameBasicInfo('586634331');
            expect(res.status).toBe(0);
        });

        it('傳入AppID搜尋不到GameType資訊，是否正確回傳status = -1', async () => {
            ///Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return null
            });
            let res = await competitorRetrievalDetailService.fetchGameBasicInfo('586634331');
            expect(res.status).toBe(-1);
        });

        it('傳入AppID搜尋不到AppSummaryAbout資訊，是否正確回傳status = -1', async () => {
            ///Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return {
                    AppName: "House of Fun™ - Casino Slots",
                    AppID: "586634331",
                    AppType: ["卡牌", "博弈"],
                    CompanyName: "Playtika",
                    Platform: "iOS",
                    Countries: ["Japan", "United States", "Taiwan"]
                }
            });
            const AppSummaryAboutFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'AppSummaryAboutFindOne');
            AppSummaryAboutFindOne.mockImplementation(() => {
                return null
            });
            let res = await competitorRetrievalDetailService.fetchGameBasicInfo('586634331');
            expect(res.status).toBe(-1);
        });
    });

    describe('----- CompetitorRetrievalDetailService -- fetchUserRetentionRate -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return { ReleaseCountry: 'Worldwide' }
            });
            const UserRetentionFind = jest.spyOn(competitorRetrievalDetailService, <any>'UserRetentionFind');
            UserRetentionFind.mockImplementation(() => {
                return [{StartDate: new Date(), Retention1Days: 0.5, Retention3Days: 0.4, Retention7Days: 0.3, Retention14Days: 0.2, Retention30Days: 0.1},
                        {StartDate: new Date(), Retention1Days: 0.5, Retention3Days: 0.4, Retention7Days: 0.3, Retention14Days: 0.2, Retention30Days: 0.1}]
            });
            let res = await competitorRetrievalDetailService.fetchUserRetentionRate('1007924271');
            expect(res.retentionRate.length).toBeGreaterThan(0);
        });

        it('傳入AppID在資料庫中不存在，是否正確回傳空陣列', async () => {
            //Mocking database access
            const GameTypeFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return { ReleaseCountry: 'Worldwide' }
            });
            const UserRetentionFind = jest.spyOn(competitorRetrievalDetailService, <any>'UserRetentionFind');
            UserRetentionFind.mockImplementation(() => {
                return []
            });
            let res = await competitorRetrievalDetailService.fetchUserRetentionRate('1007924271');
            expect(res.retentionRate.length).toBe(0);
        });
    });

    describe('----- CompetitorRetrievalDetailService -- fetchVersionInfo -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const AppTimelineVersionFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'AppTimelineVersionFindOne');
            AppTimelineVersionFindOne.mockImplementation(() => {
                return {
                    "Content": "Welcome to new slots, new features and amazing graphics",
                    "Description": "180",
                    "File Size": "166.48 mb",
                    "Publisher": null,
                    "Screenshot": [
                      "https://static-s.aa-cdn.net/img/ios/586634331/dc70103e144307c7d7a7a64cd7a46948_h250",
                      "https://static-s.aa-cdn.net/img/ios/586634331/79715aad8e3b31e9fdf37f819d10ba84_h250"
                    ]
                  }
            });
            let res = await competitorRetrievalDetailService.fetchVersionInfo({appid: "586634331", version: "3.8"});
            expect(res.status).toBe(0);
        });

        it('傳入的遊戲AppID或版本號錯誤，是否正確回傳status = -1', async () => {
            //Mocking database access
            const AppTimelineVersionFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'AppTimelineVersionFindOne');
            AppTimelineVersionFindOne.mockImplementation(() => {
                return null
            });
            let res = await competitorRetrievalDetailService.fetchVersionInfo({appid: "586634331", version: "3.8"});
            expect(res.status).toBe(-1);
        });
    });

    describe('----- CompetitorRetrievalDetailService -- fetchVersionList -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const AppTimelineVersionFind = jest.spyOn(competitorRetrievalDetailService, <any>'AppTimelineVersionFind');
            AppTimelineVersionFind.mockImplementation(() => {
                return [{ AppID: "1007924271", Date: new Date(), Version: "1.1.2" }, { AppID: "1007924271", Date: new Date(), Version: "1.1.5" }]
            });
            let res = await competitorRetrievalDetailService.fetchVersionList('1007924271');
            expect(res.status).toBe(0);
        });
    });

    describe('----- CompetitorRetrievalDetailService -- fetchAllFeatures (API: getFunctionList) -----', () => {
        it('一般流程', async () => {  //to be done
            //Mocking database access
            const FeatureContentFind = jest.spyOn(competitorRetrievalDetailService, <any>'FeatureContentFind');
            FeatureContentFind.mockImplementation(() => {
                return [{'featureName': 'A'}, {'featureName': 'B'}, {'featureName': 'C'}]
            });
            const AppTimelineVersionFindOne = jest.spyOn(competitorRetrievalDetailService, <any>'AppTimelineVersionFindOne');
            AppTimelineVersionFindOne.mockImplementation(() => {
                return {Date: new Date()}
            });
            const FeatureContentChangeHistoryFind = jest.spyOn(competitorRetrievalDetailService, <any>'FeatureContentChangeHistoryFind');
            FeatureContentChangeHistoryFind.mockImplementation(() => {
                return [{createTime: new Date()}]
            });
            let res = await competitorRetrievalDetailService.fetchAllFeatures({appid: '1007924271'});
            expect(res.status).toBe(0);
        });
    });

    describe('----- CompetitorRetrievalDetailService -- fetchAllFeatureNames (API: getAllFunctionName) -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const FeatureContentFind = jest.spyOn(competitorRetrievalDetailService, <any>'FeatureContentFind');
            FeatureContentFind.mockImplementation(() => {
                return [{'featureName': 'A'}, {'featureName': 'B'}, {'featureName': 'C'}]
            });
            let res = await competitorRetrievalDetailService.fetchAllFeatureNames({appid: '1007924271'});
            expect(res.status).toBe(0);
        });
    });

    describe('----- CompetitorRetrievalDetailService -- fetchDownloadAndRevenueData -----', () => {
        it('一般流程', async () => {
            let queryInfo = {
                "appid": "586634331",
                "startDate": 1649591918927,
                "endDate": 1657367918927
            }
            //Mocking database access
            const DAR_downloadsAggregate = jest.spyOn(competitorRetrievalDetailService, <any>'DAR_downloadsAggregate');
            DAR_downloadsAggregate.mockImplementation(() => {
                return [{
                    "country": "Japan",
                    "downloadSum": 42756,
                    "downloadAvg": 534.45
                  }]
            });
            const DAR_revenueAggregate = jest.spyOn(competitorRetrievalDetailService, <any>'DAR_revenueAggregate');
            DAR_revenueAggregate.mockImplementation(() => {
                return [{
                    "country": "Japan",
                    "revenueSum": 8769252,
                    "revenueAvg": 109615.65,
                  }]
            });
            let res = await competitorRetrievalDetailService.fetchDownloadAndRevenueData(queryInfo);
            expect(res.status).toBe(0);
        });
    });
})

class MongoService {
    constructor() { }
  }
  
  function getMongo() {
    return {
      db: () => {
        return {
          collection: () => {
            return {
              createIndex: () => { }
            }
          }
        }
      }
    };
  }
  
  class RedisService {
    constructor() { }
  }
  
  function getRedis() {
    return {};
  }
  