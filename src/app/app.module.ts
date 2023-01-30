import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { RedisModule } from '../core/database/redis/redis.module';
import { MongoModule } from '../core/database/mongo/mongo.module';
import { LoggerModule } from '../core/logger/Logger.module';
import { UpdateImpactsModule } from './modules/UpdateImpacts/updateImpacts.module';
import { InfoModule } from './modules/Info/info.module';
import { LoginModule } from './modules/Login/login.module';
import { CheckTokenMiddleware } from './middleware/checktoken.middleware';
import { CheckPermissionMiddleware } from './middleware/checkPermission.middleware';

@Module({
    imports: [
        LoggerModule,
        RedisModule,
        MongoModule,
        InfoModule,
        UpdateImpactsModule,
        LoginModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CheckTokenMiddleware, CheckPermissionMiddleware)
            .forRoutes(
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
                { path: '/updateImpacts/RevertFeatureContent', method: RequestMethod.POST }
            );
    }
}
