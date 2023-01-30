import { CompetitorRetrievalService } from './competitorRetrieval.service';
import { Test } from '@nestjs/testing';
import { async } from 'rxjs';

describe('=== Competitor Retrieval Service Unit Test ===', () => {
  let competitorRetrievalService: CompetitorRetrievalService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        CompetitorRetrievalService,
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

    competitorRetrievalService = module.get<CompetitorRetrievalService>(CompetitorRetrievalService);
  });

  describe('----- CompetitorRetrievalService -- getTrackingList -----', () => {
    it('一般流程', async () => {
      let userInfo = {
        'Account': "TestAccount@igs.com.tw"
      }
      //Mocking database access
      const GameRetrievalFind = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFind');
      GameRetrievalFind.mockImplementation(() => {
        return [{ AppID: '1434377838' }, { AppID: '1477923015' }]
      });
      const UserStatusFind = jest.spyOn(competitorRetrievalService, <any>'UserStatusFind');
      UserStatusFind.mockImplementation(() => {
        return [{ appidList: ['1434377838', '1477923015'] }]
      });
      const GameTypeFindOne = jest.spyOn(competitorRetrievalService, <any>'GameTypeFindOne');
      GameTypeFindOne.mockImplementation(() => {
        return { AppID: '1434377838', AppName: '狂野飙车9: 竞速传奇', Countries: ['Taiwan', 'China'] }
      });
      const UpdateInfluenceFind5Params = jest.spyOn(competitorRetrievalService, <any>'UpdateInfluenceFind5Params');
      UpdateInfluenceFind5Params.mockImplementation(() => {
        return [{Date: new Date(), difference_Taiwan_7: {downloads: 9.86, revenue: -119, downloads_share: 42.07, revenue_share: -65.64, average_revenue_before_7: 181.29, average_revenue_after_7: 62.29}}, 
                {Date: new Date(), difference_Taiwan_7: {downloads: 9.86, revenue: -119, downloads_share: 42.07, revenue_share: -65.64, average_revenue_before_7: 181.29, average_revenue_after_7: 62.29}}]
      });
      const DownloadAndRevenueFindProj = jest.spyOn(competitorRetrievalService, <any>'DownloadAndRevenueFindProj');
      DownloadAndRevenueFindProj.mockImplementation(() => {
        return [{Date: new Date(), Revenune: 1000}, {Date: new Date(), Revenune: 1000}, {Date: new Date(), Revenune: 1000}]
      });
      const UserRetentionFindOne = jest.spyOn(competitorRetrievalService, <any>'UserRetentionFindOne');
      UserRetentionFindOne.mockImplementation(() => {
        return {Retention1Days: 60, Retention3Days: 50, Retention7Days: 40, Retention14Days: 30, Retention30Days: 10}
      });
      const DownloadAndRevenueFindOneProj = jest.spyOn(competitorRetrievalService, <any>'DownloadAndRevenueFindOneProj');
      DownloadAndRevenueFindOneProj.mockImplementation(() => {
        return {Grossing_Games: 1}
      });
      const GameRetrievalFindOne = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFindOne');
      GameRetrievalFindOne.mockImplementation(() => { //Assume no cache
        return null
      });
      const GameRetrievalCount = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalCount');
      GameRetrievalCount.mockImplementation(() => {
        return 1
      });
      const GameRetrievalFindOneAndUpdate = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFindOneAndUpdate');
      GameRetrievalFindOneAndUpdate.mockImplementation(() => {
        return {}
      });
      let res = await competitorRetrievalService.getTrackingList(userInfo);
      expect(res.length).toEqual(2);
    });

    it('傳入的使用者帳號不在資料庫，是否正確回傳空陣列', async () => {
      let userInfo = {
        'Account': "NonExist@igs.com.tw"
      }
      //Mocking database access
      const GameRetrievalFind = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFind');
      GameRetrievalFind.mockImplementation(() => {
        return []
      });
      const UserStatusFind = jest.spyOn(competitorRetrievalService, <any>'UserStatusFind');
      UserStatusFind.mockImplementation(() => {
        return []
      });
      const GameRetrievalFindOne = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFindOne');
      GameRetrievalFindOne.mockImplementation(() => { //Assume no cache
        return null
      });
      let res = await competitorRetrievalService.getTrackingList(userInfo);
      expect(res).toEqual([]);
    })

    it('使用者無任何追蹤清單，是否正確回傳空陣列', async () => {
      let userInfo = {
        'Account': "NonExist@igs.com.tw"
      }
      //Mocking database access
      const GameRetrievalFind = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFind');
      GameRetrievalFind.mockImplementation(() => {
        return []
      });
      const UserStatusFind = jest.spyOn(competitorRetrievalService, <any>'UserStatusFind');
      UserStatusFind.mockImplementation(() => {
        return [{ appidList: [] }]
      });
      const GameRetrievalFindOne = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFindOne');
      GameRetrievalFindOne.mockImplementation(() => { //Assume no cache
        return null
      });
      let res = await competitorRetrievalService.getTrackingList(userInfo);
      expect(res).toEqual([]);
    })

    it('使用者追蹤的遊戲沒有任何版本更新，是否正確回傳null值', async () => {
      let userInfo = {
        'Account': "TestAccount@igs.com.tw"
      }
      //Mocking database access
      const GameRetrievalFind = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFind');
      GameRetrievalFind.mockImplementation(() => {
        return []
      });
      const UserStatusFind = jest.spyOn(competitorRetrievalService, <any>'UserStatusFind');
      UserStatusFind.mockImplementation(() => {
        return [{ appidList: ['1434377838', '1477923015'] }]
      });
      const GameTypeFindOne = jest.spyOn(competitorRetrievalService, <any>'GameTypeFindOne');
      GameTypeFindOne.mockImplementation(() => {
        return { AppID: '1434377838', AppName: '狂野飙车9: 竞速传奇', Countries: ['Taiwan', 'China'] }
      });
      const DownloadAndRevenueFindProj = jest.spyOn(competitorRetrievalService, <any>'DownloadAndRevenueFindProj');
      DownloadAndRevenueFindProj.mockImplementation(() => {
        return [{Date: new Date(), Revenue: 100}, {Date: new Date(), Revenue: 200}, {Date: new Date(), Revenue: 300}]
      });
      const UpdateInfluenceFind5Params = jest.spyOn(competitorRetrievalService, <any>'UpdateInfluenceFind5Params');
      UpdateInfluenceFind5Params.mockImplementation(() => {
        return []
      });
      const GameRetrievalFindOne = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFindOne');
      GameRetrievalFindOne.mockImplementation(() => { //Assume no cache
        return null
      });
      const GameRetrievalCount = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalCount');
      GameRetrievalCount.mockImplementation(() => { //Assume no cache
        return 1
      });
      const GameRetrievalFindOneAndUpdate = jest.spyOn(competitorRetrievalService, <any>'GameRetrievalFindOneAndUpdate');
      GameRetrievalFindOneAndUpdate.mockImplementation(() => { //Assume no cache
        return {}
      });
      let res = await competitorRetrievalService.getTrackingList(userInfo);
      expect(res.length).toEqual(2);
      expect(res[0]['Retention'].retention_1).toBe(null)
      expect(res[0]['Revenue']['difference']['value']).toBe(null)
    });
  });

  describe('----- CompetitorRetrievalService -- getAllList -----', () => {
    it('一般流程', async () => {
      //Mocking database access
      const GameTypeFind = jest.spyOn(competitorRetrievalService, <any>'GameTypeFind');
      GameTypeFind.mockImplementation(() => {
        return [{ AppID: "20600001320462", AppName: "House of Fun™️" }, { AppID: "20600009790511", AppName: "Jackpot World™" }]
      });
      let res = await competitorRetrievalService.getAllList();
      expect(res.length).toBeGreaterThan(0);
    });
  });

  describe('----- CompetitorRetrievalService -- updateTrackingList -----', () => {
    it('一般流程', async () => {
      let updateInfo = { account: "username@igs.com.tw", appidList: ["1339550728", "805603214", "586634331"]}
      //Mocking database access
      const UserStatusCount = jest.spyOn(competitorRetrievalService, <any>'UserStatusCount');
      UserStatusCount.mockImplementation(() => {
        return 1
      });
      const UserStatusFindOneAndUpdate = jest.spyOn(competitorRetrievalService, <any>'UserStatusFindOneAndUpdate');
      UserStatusFindOneAndUpdate.mockImplementation(() => {
        return { Account: "username@igs.com.tw", appidList: ["1339550728", "805603214", "586634331"]}
      });
      let res = await competitorRetrievalService.updateTrackingList(updateInfo);
      expect(res.status).toBe(0);
    });

    it('資料庫無使用者紀錄時，是否自動產生一筆資料', async () => {
      let updateInfo = { account: "username@igs.com.tw", appidList: ["1339550728", "805603214", "586634331"]}
      //Mocking database access
      const UserStatusCount = jest.spyOn(competitorRetrievalService, <any>'UserStatusCount');
      UserStatusCount.mockImplementation(() => {
        return 0
      });
      const UserStatusInsertOne = jest.spyOn(competitorRetrievalService, <any>'UserStatusInsertOne');
      UserStatusInsertOne.mockImplementation(() => {
        return { Account: "username@igs.com.tw", appidList: ["1339550728", "805603214", "586634331"]}
      });
      let res = await competitorRetrievalService.updateTrackingList(updateInfo);
      expect(res.status).toBe(0);
    });
  });
  
  describe('----- CompetitorRetrievalService -- removeItemFromList -----', () => {
    it('一般流程', async () => {
      //Mocking database access
      const UserStatusFind = jest.spyOn(competitorRetrievalService, <any>'UserStatusFind');
      UserStatusFind.mockImplementation(() => {
        return [{ Account: "username@igs.com.tw", appidList: ["1339550728", "805603214", "586634331"]}]
      });
      const UserStatusFindOneAndUpdate = jest.spyOn(competitorRetrievalService, <any>'UserStatusFindOneAndUpdate');
      UserStatusFindOneAndUpdate.mockImplementation(() => {
        return { Account: "username@igs.com.tw", appidList: ["805603214", "586634331"]}
      });
      let res = await competitorRetrievalService.removeItemFromList("username@igs.com.tw", "1339550728");
      expect(res.status).toBe(0);
      expect(res.removalCount).toBe(1);
    });

    it('欲移除的遊戲id不在使用者的追蹤清單中，是否正確回傳(Status = -1)以及(RemovalCount = 0)', async () => {
      //Mocking database access
      const UserStatusFind = jest.spyOn(competitorRetrievalService, <any>'UserStatusFind');
      UserStatusFind.mockImplementation(() => {
        return [{ Account: "username@igs.com.tw", appidList: ["1339550728", "805603214", "586634331"]}]
      });
      const UserStatusFindOneAndUpdate = jest.spyOn(competitorRetrievalService, <any>'UserStatusFindOneAndUpdate');
      UserStatusFindOneAndUpdate.mockImplementation(() => {
        return { Account: "username@igs.com.tw", appidList: ["1339550728", "805603214", "586634331"]}
      });
      let res = await competitorRetrievalService.removeItemFromList("username@igs.com.tw", "1234565464");
      expect(res.status).toBe(-1);
      expect(res.removalCount).toBe(0);
    });
  });

  describe('----- CompetitorRetrievalService -- getGameNameList -----', () => {
    it('一般流程', async () => {
      //Mocking database access
      const GameTypeFindProj = jest.spyOn(competitorRetrievalService, <any>'GameTypeFindProj');
      GameTypeFindProj.mockImplementation(() => {
        return [{ AppID: "20600001320462", AppName: "House of Fun™️" }, { AppID: "20600009790511", AppName: "Jackpot World™" }]
      });
      let res = await competitorRetrievalService.getGameNameList();
      expect(res.length).toBeGreaterThan(0);
    });
  });
});

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
