import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { RedisModule } from '../core/database/redis/redis.module';
import { MongoModule } from '../core/database/mongo/mongo.module';
import { LoggerModule } from '../core/logger/Logger.module';
import { UpdateImpactsModule } from './modules/UpdateImpacts/updateImpacts.module';
import { InfoModule } from './modules/Info/info.module';
import { LoginModule } from './modules/Login/login.module';
import { CheckTokenMiddleware } from './middleware/checktoken.middleware';
import { CheckPermissionMiddleware } from './middleware/checkPermission.middleware';
import { CompetitorRetrievalModule } from './modules/CompetitorRetrieval/competitorRetrieval.module';
import { CompetitorRetrievalDetailModule } from './modules/CompetitorRetrievalDetail/competitorRetrievalDetail.module';
import { HomePageModule } from './modules/HomePage/homePage.module';
import { NotificationSettingModule } from './modules/NotificationSetting/notificationSetting.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        LoggerModule,
        RedisModule,
        MongoModule,
        InfoModule,
        UpdateImpactsModule,
        CompetitorRetrievalModule,
        CompetitorRetrievalDetailModule,
        HomePageModule,
        NotificationSettingModule,
        LoginModule,
        ScheduleModule.forRoot()
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CheckTokenMiddleware, CheckPermissionMiddleware)
            .forRoutes(
                //Update Impact
                { path: '/updateImpacts', method: RequestMethod.POST },
                { path: '/updateImpacts/CreateFeature', method: RequestMethod.POST },
                { path: '/updateImpacts/EditFeature', method: RequestMethod.POST },
                { path: '/updateImpacts/RemoveFeature', method: RequestMethod.POST },
                { path: '/updateImpacts/getFeatureContent', method: RequestMethod.POST },
                { path: '/updateImpacts/GetFeatureTagList', method: RequestMethod.POST },
                { path: '/updateImpacts/RemoveFeatureTag', method: RequestMethod.POST },
                { path: '/updateImpacts/GetSimpleFeatureContent', method: RequestMethod.POST },
                { path: '/updateImpacts/GetFeatureEditHistory', method: RequestMethod.POST },
                { path: '/updateImpacts/GetSpecificVerFeatureContent', method: RequestMethod.POST },
                { path: '/updateImpacts/RevertFeatureContent', method: RequestMethod.POST },

                //Competitor Retrieval 
                { path: '/competitorRetrieval/getTrackingList', method: RequestMethod.POST},
                { path: '/competitorRetrieval/updateTrackingList', method: RequestMethod.POST},
                { path: '/competitorRetrieval/getAllList', method: RequestMethod.POST},
                { path: '/competitorRetrieval/removeItemFromList', method: RequestMethod.POST},
                { path: '/competitorRetrieval/getGameNameList', method: RequestMethod.POST},
                { path: '/competitorRetrieval/getSimpleFeatureContents', method: RequestMethod.POST},

                //CompetitorRetrievalDetail
                { path: '/competitorRetrievalDetail/getEvaluationData', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getComparisonData', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getGameBasicInfo', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getUserRetentionRate', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getVersionGameInfo', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getVersionInfo', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getVersionList', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getRevenueAndRank', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getFunctionList', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getAllFunctionName', method: RequestMethod.POST},
                { path: '/competitorRetrievalDetail/getDownloadAndRevenueData', method: RequestMethod.POST},

                //HomePage
                { path: '/homePage/getNewestAdditionalInfo', method: RequestMethod.POST},
                { path: '/homePage/getRevenueTop3', method: RequestMethod.POST},
                { path: '/homePage/getNewestVersionUpdate', method: RequestMethod.POST},
                { path: '/homePage/getPopularAdditionalInfo', method: RequestMethod.POST},
                { path: '/homePage/getNewestDiscourseArticle', method: RequestMethod.POST},
                //{ path: '/homePage/getNewestCloudFile', method: RequestMethod.POST} (無法由產學專案協助開發)

                //NotificationSetting
                { path: '/notificationSetting/getNotificationList', method: RequestMethod.POST},
                { path: '/notificationSetting/getNotificationSetting', method: RequestMethod.POST},
                { path: '/notificationSetting/removeItemFromNotificationList', method: RequestMethod.POST},
                { path: '/notificationSetting/setEmailNotification', method: RequestMethod.POST},
                { path: '/notificationSetting/updateNotificationList', method: RequestMethod.POST},
                { path: '/notificationSetting/updateNotificationSetting', method: RequestMethod.POST},
                { path: '/notificationSetting/readNotification', method: RequestMethod.POST},
                { path: '/notificationSetting/getNotificationContentList', method: RequestMethod.POST}
                

            );
    }
}
