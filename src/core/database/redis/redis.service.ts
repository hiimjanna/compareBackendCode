import { Inject } from '@nestjs/common';
import { LOG4JS_SYSTEM_LOGGER } from '../../constants/system.constant';
import { REDIS } from '../../../app/app.config';
import { IRedisClient, RedisClient } from './redisclient';

export class RedisService {
    public static RedisClientClass: any = RedisClient;
    private redisClients = {};
    constructor(@Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger) {
        for (const [key, _value] of Object.entries(REDIS)) {
            const value: any = _value;
            const redisClient = new RedisService.RedisClientClass(
                this.logger,
                value.host,
                value.port,
                value.db,
                value.options,
            );
            this.redisClients[key] = redisClient;
            this.connect(redisClient);
        }
    }

    private async connect(redisClient: IRedisClient) {
        try {
            await redisClient.connect();
        } catch (error) {
            this.logger.error(error + '(' + redisClient.url + ')');
            process.exit(-1);
        }
    }

    public getRedis(dbNameKey?: string): IRedisClient {
        dbNameKey = !dbNameKey ? 'default' : dbNameKey;
        return this.redisClients[dbNameKey];
    }
}
