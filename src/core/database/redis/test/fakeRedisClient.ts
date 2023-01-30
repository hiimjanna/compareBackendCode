import { IRedisClient } from '../redisclient';
import * as util from 'util';

export class FakeRedisClient implements IRedisClient {
    get conn() {
        return this;
    }

    get url() {
        return util.format(
            '%s:%s?database=%s',
            this.host,
            this.port,
            this.db,
        );
    }

    private dataCache = {};
    constructor(
        private logger,
        private host: string,
        private port: number,
        private db: number = null,
        private options = {},
    ) {
        this.logger.info('FakeRedisClient is being work.');
    }

    public async connect() {
        return this;
    }

    public async set(key: string, value): Promise<string> {
        this.dataCache[key] = String(value);
        return 'OK';
    }
    public async setex(key: string, seconds: number, value): Promise<string> {
        this.dataCache[key] = String(value);
        setTimeout(() => {
            delete this.dataCache[key];
        }, seconds * 1000);
        return 'OK';
    }
    public async get(key: string): Promise<any> {
        const value = this.dataCache[key];
        return value === undefined ? null : value;
    }

    public async del(key: string): Promise<number> {
        let ret = 0;
        if (this.dataCache.hasOwnProperty(key)) {
            ret = 1;
            delete this.dataCache[key];
        }
        return ret;
    }

    public async expire(key: string, seconds: number): Promise<string> {
        setTimeout(() => {
            delete this.dataCache[key];
        }, seconds * 1000);
        return 'OK';
    }

    public async incr(key: string, add: number): Promise<any> {
        if (this.dataCache.hasOwnProperty(key)) {
            this.dataCache[key] = parseInt(this.dataCache[key], 10) + 1;
        } else {
            this.dataCache[key] = 1;
        }
    }
}
