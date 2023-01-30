import { HomePageService } from './homepage.service';
import { Test } from '@nestjs/testing';
import { async } from 'rxjs';

describe('HomePageServiceTest', () => {
    let homePageService: HomePageService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
        imports: [],
        providers: [
            HomePageService,
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

        homePageService = module.get<HomePageService>(HomePageService);
    });

    describe('----- HomePageService -- fetchNewestAdditionalInfo -----', () => {
        it('一般流程', async () => {
            ///Mocking database access
            const FeatureContentFind = jest.spyOn(homePageService, <any>'FeatureContentFind');
            FeatureContentFind.mockImplementation(() => {
                return [{ _id: "6333dd6f68fa93001cec40eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec41eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec42eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec43eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec44eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec45eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec46eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec47eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec48eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec49eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec50eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec51eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),}, ]});
            const AppTimelineVersionFindOne = jest.spyOn(homePageService, <any>'AppTimelineVersionFindOne');
            AppTimelineVersionFindOne.mockImplementation(() => {
                return {Screenshot: 'http://abc.com/def'}
            });

            let res = await homePageService.fetchNewestAdditionalInfo({count : 12})
            expect(res.status).toBe(0);
            expect((res.additionInfoList).length).toBe(12);
        });

        it('傳入的count為非12的數字時，是否正確回傳該指定數量', async () => {
            ///Mocking database access
            const FeatureContentFind = jest.spyOn(homePageService, <any>'FeatureContentFind');
            FeatureContentFind.mockImplementation(() => {
                return [{ _id: "6333dd6f68fa93001cec40eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec41eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec42eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec43eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),},
                        { _id: "6333dd6f68fa93001cec44eb", appId: "123456789", version: "1.1", featureName: "Hello", editor: "Doni su", createTime: new Date(),}, ]
            });
            const AppTimelineVersionFindOne = jest.spyOn(homePageService, <any>'AppTimelineVersionFindOne');
            AppTimelineVersionFindOne.mockImplementation(() => {
                return {Screenshot: 'http://abc.com/def'}
            });

            let res = await homePageService.fetchNewestAdditionalInfo({count : 5})
            expect(res.status).toBe(0);
            expect((res.additionInfoList).length).toBe(5);
        });
    });

    describe('----- HomePageService -- fetchRevenueTop3 -----', () => {
      it('一般流程', async () => {
          ///Mocking database access
          const formatUpdateInfluence = jest.spyOn(homePageService, <any>'formatUpdateInfluence');
          formatUpdateInfluence.mockImplementation(() => {
              return [{ country: 'Worldwide', list: [{revenue: 100, revenue_share: 20}, {revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
                      { country: 'Taiwan', list: [{revenue: 100, revenue_share: 20}, {revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
                      { country: 'United States', list: [{revenue: 100, revenue_share: 20}, {revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
                      { country: 'Japan', list: [{revenue: 100, revenue_share: 20}, {revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
                      { country: 'China', list: [{revenue: 100, revenue_share: 20}, {revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
                      { country: 'Vietnam', list: [{revenue: 100, revenue_share: 20}, {revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
                      { country: 'Thailand', list: [{revenue: 100, revenue_share: 20}, {revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
                      { country: 'India', list: [{revenue: 100, revenue_share: 20}, {revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0} ]});
          const GameTypeFindOne = jest.spyOn(homePageService, <any>'GameTypeFindOne');
          GameTypeFindOne.mockImplementation(() => {
              return {'AppType': {'586634331': ["街機", "競速"]}, 'AppName': 'Coin Pusher', 'CompanyName': {'586634331': 'Lingxi Games Inc.'}}
          });
          const TopThreeRevenueFindOne = jest.spyOn(homePageService, <any>'TopThreeRevenueFindOne');
          TopThreeRevenueFindOne.mockImplementation(() => {
              return [{ AppID: "406889139", Date: new Date(), Version: "3.5.930", difference_Japan_7: {revenue: 100, revenue_share: 10} },
                      { AppID: "406889139", Date: new Date(), Version: "3.5.930", difference_Japan_7: {revenue: 100, revenue_share: 10} },
                      { AppID: "406889139", Date: new Date(), Version: "3.5.930", difference_Japan_7: {revenue: 100, revenue_share: 10} }]
          });

          let res = await homePageService.fetchRevenueTop3({})
          expect(res.status).toBe(0);
          expect((res.revenueTop3List).length).toBe(3);
      });

    //   it('傳入的count為非3的數字時，是否正確回傳該指定數量', async () => {
    //       ///Mocking database access
    //       const formatUpdateInfluence = jest.spyOn(homePageService, <any>'formatUpdateInfluence');
    //       formatUpdateInfluence.mockImplementation(() => {
    //           return [{ country: 'Worldwide', list: [{revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
    //                   { country: 'Taiwan', list: [{revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
    //                   { country: 'United States', list: [{revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
    //                   { country: 'Japan', list: [{revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
    //                   { country: 'China', list: [{revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
    //                   { country: 'Vietnam', list: [{revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
    //                   { country: 'Thailand', list: [{revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0},
    //                   { country: 'India', list: [{revenue: 90, revenue_share: 20}, {revenue: 80, revenue_share: 20}], index: 0} ]});
    //       const GameTypeFindOne = jest.spyOn(homePageService, <any>'GameTypeFindOne');
    //       GameTypeFindOne.mockImplementation(() => {
    //           return {'AppType': {'586634331': ["街機", "競速"]}, 'AppName': 'Coin Pusher', 'CompanyName': {'586634331': 'Lingxi Games Inc.'}}
    //       });
    //       const TopThreeRevenueFindOne = jest.spyOn(homePageService, <any>'TopThreeRevenueFindOne');
    //       TopThreeRevenueFindOne.mockImplementation(() => {
    //           return [{ AppID: "406889139", Date: new Date(), Version: "3.5.930", difference_Japan_7: {revenue: 100, revenue_share: 10} },
    //                   { AppID: "406889139", Date: new Date(), Version: "3.5.930", difference_Japan_7: {revenue: 100, revenue_share: 10} }]
    //       });

    //       let res = await homePageService.fetchRevenueTop3({count: 2})
    //       expect(res.status).toBe(0);
    //       expect((res.revenueTop3List).length).toBe(2);
    //   });
    
  });

  describe('----- HomePageService -- fetchNewestVersionUpdate -----', () => {
    it('一般流程', async () => {
        ///Mocking database access
        const AppTimelineVersionFind = jest.spyOn(homePageService, <any>'AppTimelineVersionFind');
        AppTimelineVersionFind.mockImplementation(() => {
            return [{Date: new Date(), AppID: "123"}, 
                    {Date: new Date(), AppID: "234"}, 
                    {Date: new Date(), AppID: "345"}, 
                    {Date: new Date(), AppID: "567"},]});
        const GameTypeFindOne = jest.spyOn(homePageService, <any>'GameTypeFindOne');
        GameTypeFindOne.mockImplementation(() => {
            return {'AppType': {'586634331': ["街機", "競速"]}, 'AppName': 'Coin Pusher', 'CompanyName': {'586634331': 'Lingxi Games Inc.'}, 'Countries': ['Taiwan'], 'Platform': 'iOS'}
        });

        let res = await homePageService.fetchNewestVersionUpdate({})
        expect(res.status).toBe(0);
        expect((res.versionUpdateList).length).toBe(4);
    });

    it('傳入的count為非4的數字時，是否正確回傳該指定數量', async () => {
        ///Mocking database access
        const AppTimelineVersionFind = jest.spyOn(homePageService, <any>'AppTimelineVersionFind');
        AppTimelineVersionFind.mockImplementation(() => {
            return [{Date: new Date(), AppID: "123"}, 
                    {Date: new Date(), AppID: "234"}, 
                    {Date: new Date(), AppID: "345"}, 
                    {Date: new Date(), AppID: "567"},
                    {Date: new Date(), AppID: "678"},]});
        const GameTypeFindOne = jest.spyOn(homePageService, <any>'GameTypeFindOne');
        GameTypeFindOne.mockImplementation(() => {
            return {'AppType': {'586634331': ["街機", "競速"]}, 'AppName': 'Coin Pusher', 'CompanyName': {'586634331': 'Lingxi Games Inc.'}, 'Countries': ['Taiwan'], 'Platform': 'iOS'}
        });

        let res = await homePageService.fetchNewestVersionUpdate({count: 5})
        expect(res.status).toBe(0);
        expect((res.versionUpdateList).length).toBe(5);
    });
  });

  describe('----- HomePageService -- fetchPopularAdditionalInfo -----', () => {
    it('一般流程', async () => {
        ///Mocking database access
        const FeatureContentFind = jest.spyOn(homePageService, <any>'FeatureContentFind');
        FeatureContentFind.mockImplementation(() => {
            return [{appId: '123', version: '1.1', featureName: 'feature', editor: 'Doni', editVersion: 3},
                    {appId: '234', version: '1.2', featureName: 'feature', editor: 'Doni', editVersion: 3},
                    {appId: '345', version: '2.1', featureName: 'feature', editor: 'Doni', editVersion: 3},
                    {appId: '567', version: '3.1', featureName: 'feature', editor: 'Doni', editVersion: 3},
                    {appId: '678', version: '1.5', featureName: 'feature', editor: 'Doni', editVersion: 3}]});
        const GameTypeFindOne = jest.spyOn(homePageService, <any>'GameTypeFindOne');
        GameTypeFindOne.mockImplementation(() => {
            return {'AppType': {'586634331': ["街機", "競速"]}, 'AppName': 'Coin Pusher', 'CompanyName': {'586634331': 'Lingxi Games Inc.'}, 'Countries': ['Taiwan'], 'Platform': 'iOS'}
        });
        const FeatureContentChangeHistoryFindOneSort = jest.spyOn(homePageService, <any>'FeatureContentChangeHistoryFindOneSort');
        FeatureContentChangeHistoryFindOneSort.mockImplementation(() => {
            return {createTime: new Date()}
        });

        let res = await homePageService.fetchPopularAdditionalInfo({})
        expect(res.status).toBe(0);
        expect((res.popularAdditionInfoList).length).toBe(5);
    });

    it('傳入的count為非5的數字時，是否正確回傳該指定數量', async () => {
        ///Mocking database access
        const FeatureContentFind = jest.spyOn(homePageService, <any>'FeatureContentFind');
        FeatureContentFind.mockImplementation(() => {
            return [{appId: '123', version: '1.1', featureName: 'feature', editor: 'Doni', editVersion: 3},
                    {appId: '234', version: '1.2', featureName: 'feature', editor: 'Doni', editVersion: 3},
                    {appId: '345', version: '2.1', featureName: 'feature', editor: 'Doni', editVersion: 3},
                    {appId: '567', version: '3.1', featureName: 'feature', editor: 'Doni', editVersion: 3},
                    {appId: '678', version: '1.5', featureName: 'feature', editor: 'Doni', editVersion: 3},
                    {appId: '789', version: '2.5', featureName: 'feature', editor: 'Doni', editVersion: 3}]});
        const GameTypeFindOne = jest.spyOn(homePageService, <any>'GameTypeFindOne');
        GameTypeFindOne.mockImplementation(() => {
            return {'AppType': {'586634331': ["街機", "競速"]}, 'AppName': 'Coin Pusher', 'CompanyName': {'586634331': 'Lingxi Games Inc.'}, 'Countries': ['Taiwan'], 'Platform': 'iOS'}
        });
        const FeatureContentChangeHistoryFindOneSort = jest.spyOn(homePageService, <any>'FeatureContentChangeHistoryFindOneSort');
        FeatureContentChangeHistoryFindOneSort.mockImplementation(() => {
            return {createTime: new Date()}
        });

        let res = await homePageService.fetchPopularAdditionalInfo({count: 6})
        expect(res.status).toBe(0);
        expect((res.popularAdditionInfoList).length).toBe(6);
    });
  });

  describe('----- HomePageService -- fetchNewestDiscourseArticle -----', () => {
    it('一般流程', async () => {
        ///Mocking database access
        const PlanningClubTopicFindOneSort = jest.spyOn(homePageService, <any>'PlanningClubTopicFindOneSort');
        PlanningClubTopicFindOneSort.mockImplementation(() => {
            return { Topics: [{title: 'title1', poster_username: 'Tom1'},
                              {title: 'title2', poster_username: 'Tom2'},
                              {title: 'title3', poster_username: 'Tom3'},
                              {title: 'title4', poster_username: 'Tom4'},
                              {title: 'title5', poster_username: 'Tom5'},
                              {title: 'title6', poster_username: 'Tom6'},]}
        });
        
        let res = await homePageService.fetchNewestDiscourseArticle({})
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
  