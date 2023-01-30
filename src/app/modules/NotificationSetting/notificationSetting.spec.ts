import { NotificationSettingService } from './notificationSetting.service'
import { Test } from '@nestjs/testing';
import { async } from 'rxjs';

describe('NotificationSettingServiceTest', () => {
    let notificationSettingService: NotificationSettingService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
        imports: [],
        providers: [
            NotificationSettingService,
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

        notificationSettingService = module.get<NotificationSettingService>(NotificationSettingService);
    });

    describe('----- NotificationSettingService -- fetchNotificationList -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return {
                    notificationList: [{
                        appid: '123456',
                        versionUpdate: true,
                        revenueList: [],
                        downloadList: [],
                        enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                        enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                        enable_download: {enable: true, enalbe_email: true, enable_website: true},
                    }],
                    enableEmailNotification: true
                }
            });
            const GameTypeFindOne = jest.spyOn(notificationSettingService, <any>'GameTypeFindOne');
            GameTypeFindOne.mockImplementation(() => {
                return {
                    AppName: 'Coin master',
                    AppType: 'Leisure',
                    CompanyName: 'Company A',
                    Platform: 'iOS',
                    ReleaseCountry: 'Worldwide'
                }
            });
            let res = await notificationSettingService.fetchNotificationList({account: 'Tom@igs.com.tw'})
            expect(res.status).toBe(0);
        });
        it('傳進來的資料不完整時(沒傳入account的資料)，是否正確回傳status = -1', async () => {  
            let res = await notificationSettingService.fetchNotificationList({})
            expect(res.status).toBe(-1);
        });
        it('傳入的account不存在資料庫中時，是否正確回傳status = -1', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return null
            });
            let res = await notificationSettingService.fetchNotificationList({account: 'unknown@igs.com.tw'})
            expect(res.status).toBe(-1);
        });
    });

    describe('----- NotificationSettingService -- fetchNotificationSetting -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return {
                    notificationList: [{
                        appid: '123456',
                        versionUpdate: true,
                        revenueList: [],
                        downloadList: [],
                        enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                        enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                        enable_download: {enable: true, enalbe_email: true, enable_website: true},
                    }],
                    enableEmailNotification: true
                }
            });
            let res = await notificationSettingService.fetchNotificationSetting({account: 'Tom@igs.com.tw', appid: '123456'})
            expect(res.status).toBe(0);
        });
        it('傳進來的資料不完整時(沒傳入account的資料)，是否正確回傳status = -1', async () => {  
            let res = await notificationSettingService.fetchNotificationSetting({appid: '123456'})
            expect(res.status).toBe(-1);
        });
        it('傳入的account不存在資料庫中時，是否正確回傳status = -1', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return null
            });
            let res = await notificationSettingService.fetchNotificationList({account: 'unknown@igs.com.tw', appid: '123456'})
            expect(res.status).toBe(-1);
        });
        it('傳入的appid不在使用者的追蹤清單內時，是否正確回傳status = -1', async () => {  
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return {
                    notificationList: [{
                        appid: '123456',
                        versionUpdate: true,
                        revenueList: [],
                        downloadList: [],
                        enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                        enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                        enable_download: {enable: true, enalbe_email: true, enable_website: true},
                    }],
                    enableEmailNotification: true
                }
            });
            let res = await notificationSettingService.fetchNotificationSetting({account: 'Tom@igs.com.tw', appid: '234567'})
            expect(res.status).toBe(-1);
        });
    });

    describe('----- NotificationSettingService -- removeItemFromNotificationList -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return {
                    notificationList: [{
                        appid: '123456',
                        versionUpdate: true,
                        revenueList: [],
                        downloadList: [],
                        enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                        enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                        enable_download: {enable: true, enalbe_email: true, enable_website: true},
                    }],
                    enableEmailNotification: true
                }
            });
            const UserStatusFindOneAndUpdate = jest.spyOn(notificationSettingService, <any>'UserStatusFindOneAndUpdate');
            UserStatusFindOneAndUpdate.mockImplementation(() => {
                return { status: 0 }
            });
            let res = await notificationSettingService.removeItemFromNotificationList({account: 'Tom@igs.com.tw', appid: '123456'})
            expect(res.status).toBe(0);
        });
        it('傳進來的資料不完整時(沒傳入account的資料)，是否正確回傳status = -1', async () => {  
            let res = await notificationSettingService.removeItemFromNotificationList({appid: '123456'})
            expect(res.status).toBe(-1);
        });
        it('傳入的account不存在資料庫中時，是否正確回傳status = -1', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return null
            });
            let res = await notificationSettingService.removeItemFromNotificationList({account: 'unknown@igs.com.tw', appid: '123456'})
            expect(res.status).toBe(-1);
        });
        it('傳入的appid不在使用者的追蹤清單內時，是否正確回傳status = -1', async () => {  
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return {
                    notificationList: [{
                        appid: '123456',
                        versionUpdate: true,
                        revenueList: [],
                        downloadList: [],
                        enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                        enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                        enable_download: {enable: true, enalbe_email: true, enable_website: true},
                    }],
                    enableEmailNotification: true
                }
            });
            const UserStatusFindOneAndUpdate = jest.spyOn(notificationSettingService, <any>'UserStatusFindOneAndUpdate');
            UserStatusFindOneAndUpdate.mockImplementation(() => {
                return { status: 0 }
            });
            let res = await notificationSettingService.removeItemFromNotificationList({account: 'Tom@igs.com.tw', appid: '234567'})
            expect(res.status).toBe(-1);
        });
    });

    describe('----- NotificationSettingService -- setEmailNotification -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return {
                    account: 'Tom@igs.com.tw',
                    notificationList: [{
                        appid: '123456',
                        versionUpdate: true,
                        revenueList: [],
                        downloadList: [],
                        enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                        enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                        enable_download: {enable: true, enalbe_email: true, enable_website: true},
                    }],
                    enableEmailNotification: true,
                    notificationSortedBy: "Game"
                }
            });
            const UserStatusFindOneAndUpdate = jest.spyOn(notificationSettingService, <any>'UserStatusFindOneAndUpdate');
            UserStatusFindOneAndUpdate.mockImplementation(() => {
                return { status: 0 }
            });
            let res = await notificationSettingService.setEmailNotification({account: 'Tom@igs.com.tw', enableEmailNotification: true, notificationSortedBy: "Game"})
            expect(res.status).toBe(0);
        });
        it('傳進來的資料不完整時(沒傳入account的資料)，是否正確回傳status = -1', async () => {  
            let res = await notificationSettingService.setEmailNotification({enableEmailNotification: true, notificationSortedBy: "Game"})
            expect(res.status).toBe(-1);
        });
        it('傳入的account不存在資料庫中時，是否正確回傳status = -1', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return null
            });
            let res = await notificationSettingService.setEmailNotification({account: 'unknown@igs.com.tw', enableEmailNotification: true, notificationSortedBy: "Game"})
            expect(res.status).toBe(-1);
        });
    });

    describe('----- NotificationSettingService -- updateNotificationList -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return {
                    notificationList: [{
                        appid: '123456',
                        versionUpdate: true,
                        revenueList: [],
                        downloadList: [],
                        enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                        enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                        enable_download: {enable: true, enalbe_email: true, enable_website: true},
                    }],
                    enableEmailNotification: true
                }
            });
            const UserStatusFindOneAndUpdate = jest.spyOn(notificationSettingService, <any>'UserStatusFindOneAndUpdate');
            UserStatusFindOneAndUpdate.mockImplementation(() => {
                return { status: 0 }
            });
            let res = await notificationSettingService.updateNotificationList({account: 'Tom@igs.com.tw', appidList: ['123456', '234567', '345678']})
            expect(res.status).toBe(0);
        });
        it('傳進來的資料不完整時(沒傳入account的資料)，是否正確回傳status = -1', async () => {  
            let res = await notificationSettingService.updateNotificationList({appidList: ['123456', '234567', '345678']})
            expect(res.status).toBe(-1);
        });
        it('傳入的account不存在資料庫中時，是否正確回傳status = -1', async () => {
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return null
            });
            let res = await notificationSettingService.updateNotificationList({account: 'unknown@igs.com.tw', appidList: ['123456', '234567', '345678']})
            expect(res.status).toBe(-1);
        });
    });

    describe('----- NotificationSettingService -- updateNotificationSetting -----', () => {
        it('一般流程', async () => {
            let data = {
                account: 'Tom@igs.com.tw',
                appid: '123456',
                versionUpdate: true,
                revenueList: [],
                downloadList: [],
                enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                enable_download: {enable: true, enalbe_email: true, enable_website: true},
            }
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return {
                    notificationList: [{
                        appid: '123456',
                        versionUpdate: true,
                        revenueList: [],
                        downloadList: [],
                        enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                        enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                        enable_download: {enable: true, enalbe_email: true, enable_website: true},
                    }],
                    enableEmailNotification: true
                }
            });
            const UserStatusFindOneAndUpdate = jest.spyOn(notificationSettingService, <any>'UserStatusFindOneAndUpdate');
            UserStatusFindOneAndUpdate.mockImplementation(() => {
                return { status: 0 }
            });
            let res = await notificationSettingService.updateNotificationSetting(data)
            expect(res.status).toBe(0);
        });
        it('傳進來的資料不完整時(沒傳入任何參數的資料)，是否正確回傳status = -1', async () => {  
            let res = await notificationSettingService.updateNotificationSetting({})
            expect(res.status).toBe(-1);
        });
        it('傳入的account不存在資料庫中時，是否正確回傳status = -1', async () => {
            let data = {
                account: 'Unknown@igs.com.tw',
                appid: '123456',
                versionUpdate: true,
                revenueList: [],
                downloadList: [],
                enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                enable_download: {enable: true, enalbe_email: true, enable_website: true},
            }
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return null
            });
            let res = await notificationSettingService.updateNotificationSetting(data)
            expect(res.status).toBe(-1);
        });
        it('傳入的appid不在使用者的追蹤清單內時，是否正確回傳status = -1', async () => {
            let data = {
                account: 'Tom@igs.com.tw',
                appid: '234567',
                versionUpdate: true,
                revenueList: [],
                downloadList: [],
                enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                enable_download: {enable: true, enalbe_email: true, enable_website: true},
            }
            //Mocking database access
            const UserStatusFindOne = jest.spyOn(notificationSettingService, <any>'UserStatusFindOne');
            UserStatusFindOne.mockImplementation(() => {
                return {
                    notificationList: [{
                        appid: '123456',
                        versionUpdate: true,
                        revenueList: [],
                        downloadList: [],
                        enable_versionUpdate: {enable: true, enalbe_email: true, enable_website: true},
                        enable_revenue: {enable: true, enalbe_email: true, enable_website: true},
                        enable_download: {enable: true, enalbe_email: true, enable_website: true},
                    }],
                    enableEmailNotification: true
                }
            });
            const UserStatusFindOneAndUpdate = jest.spyOn(notificationSettingService, <any>'UserStatusFindOneAndUpdate');
            UserStatusFindOneAndUpdate.mockImplementation(() => {
                return { status: 0 }
            });
            let res = await notificationSettingService.updateNotificationSetting(data)
            expect(res.status).toBe(-1);
        });
    });

    describe('----- NotificationSettingService -- readNotification -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const NotificationUpdateMany = jest.spyOn(notificationSettingService, <any>'NotificationUpdateMany');
            NotificationUpdateMany.mockImplementation(() => {
                return {}
            });
            let res = await notificationSettingService.readNotification({account: 'Tom@igs.com.tw'})
            expect(res.status).toBe(0);
        });
        it('傳進來的資料不完整時(沒傳入account的資料)，是否正確回傳status = -1', async () => {  
            let res = await notificationSettingService.readNotification({})
            expect(res.status).toBe(-1);
        });
    });

    describe('----- NotificationSettingService -- getNotificationContentList -----', () => {
        it('一般流程', async () => {
            //Mocking database access
            const NotificationFind = jest.spyOn(notificationSettingService, <any>'NotificationFind');
            NotificationFind.mockImplementation(() => {
                return [{ appid: "12345", description: "description", creationTime: new Date(), tag: "VersionUpdate" },
                        { appid: "12345", description: "description", creationTime: new Date(), tag: "VersionUpdate" },
                        { appid: "12345", description: "description", creationTime: new Date(), tag: "VersionUpdate" }]
            });
            let res = await notificationSettingService.fetchNotificationContentList({account: 'Tom@igs.com.tw'})
            expect(res.status).toBe(0);
        });
        it('傳進來的資料不完整時(沒傳入account的資料)，是否正確回傳status = -1', async () => {  
            let res = await notificationSettingService.fetchNotificationContentList({})
            expect(res.status).toBe(-1);
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
