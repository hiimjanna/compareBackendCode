import { Inject } from '@nestjs/common';
import { LOG4JS_SYSTEM_LOGGER } from '../../constants/system.constant';
import { MONGO } from '../../../app/app.config';
import { IMongoClient, MongoClient } from './mongoclient';

export class MongoService {
    public static MongoClientClass: any = MongoClient;
    private mongoClients = {};
    constructor(@Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger) {
        for (const [key, _value] of Object.entries(MONGO)) {
            const value: any = _value;
            const mongoClient = new MongoService.MongoClientClass(
                this.logger,
                value.host,
                value.port,
                value.dbName,
                value.authName,
                value.authPassword,
                value.authSource,
                value.options,
            );
            this.mongoClients[key] = mongoClient;
            this.connect(mongoClient);
        }
    }

    private async connect(mongoClient: IMongoClient) {
        try {
            await mongoClient.connect();
        } catch (error) {
            this.logger.error(error + '(' + mongoClient.url + ')');
            process.exit(-1);
        }
    }

    public getMongo(dbNameKey?: string): IMongoClient {
        dbNameKey = !dbNameKey ? 'default' : dbNameKey;
        return this.mongoClients[dbNameKey];
    }
}
