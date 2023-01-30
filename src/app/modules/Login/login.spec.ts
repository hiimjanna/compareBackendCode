import { Test } from '@nestjs/testing';
import { LoginService } from './login.service';

describe('=== Login Service Unit Test ===', () => {
  let loginService: LoginService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        LoginService,
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

    loginService = module.get<LoginService>(LoginService);
  });
  describe('----- LoginService -- getUserStatus -----', () => {
    it('一般流程', async () => {
      const dbGetUserFeatureDataUseStatus = jest.spyOn(loginService, <any>'dbGetUserFeatureDataUseStatus');
      dbGetUserFeatureDataUseStatus.mockImplementation(() => {
        return { 'value': { 'FirstEditFeatureContent': false } }
      });
      let res = await loginService.getUserStatus('123456');
      expect(res['status']).toBe(0);
    });
  });

  describe('----- LoginService -- setUserStatus -----', () => {
    it('一般流程', async () => {
      let userInfo = {
        'account': '123456',
        'first_edit_feature_content': false
      };
      const dbSetUserStatus = jest.spyOn(loginService, <any>'dbSetUserStatus');
      dbSetUserStatus.mockImplementation(() => {
        return { 'matchedCount': 1, 'modifiedCount': 1 };
      });
      let res = await loginService.setUserStatus(userInfo);
      expect(res['status']).toBe(0);
    });

    it('傳進來的\"first_edit_feature_content\"非布林值時, 是否會回傳正確的錯誤代碼(83)', async () => {
      let userInfo = {
        'account': '123456',
        'first_edit_feature_content': null
      };
      let res = await loginService.setUserStatus(userInfo);
      expect(res['status']).toBe(83);
    });

    it('沒有匹配的使用者資料時, 是否會回傳正確的錯誤代碼(83)', async () => {
      let userInfo = {
        'account': '123456',
        'first_edit_feature_content': false
      };
      const dbSetUserStatus = jest.spyOn(loginService, <any>'dbSetUserStatus');
      dbSetUserStatus.mockImplementation(() => {
        return { 'matchedCount': 0, 'modifiedCount': 0 };
      });
      let res = await loginService.setUserStatus(userInfo);
      expect(res['status']).toBe(83);
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
