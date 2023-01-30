import * as redis from 'redis';
import * as Promise from 'bluebird';
import * as util from 'util';

export interface IRedisClient {
    readonly conn;
    readonly url;
    connect(): Promise<any>;
    set(key: string, value): Promise<string>;
    setex(key: string, seconds: number, value): Promise<string>;
    get(key: string): Promise<any>;
    del(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<string>;
    incr(key: string, add: number): Promise<any>;
}

export class RedisClient implements IRedisClient {
    private client = null;

    get conn() {
        return this.client;
    }

    get url() {
        if(this.customURL) {
            return this.host
        }
        return util.format(
            '%s:%s?database=%s',
            this.host,
            this.port,
            this.db,
        );
    }

    constructor(
        private logger,
        private host: string,
        private port: number,
        private db: number = null,
        private customURL: boolean,
        private options = {},
    ) {}

    public async connect() {
        return new Promise(this.onConnecting.bind(this));
    }

    private onConnecting(resolve, reject) {
        let opt = Object.assign({}, this.options);
        opt = Object.assign(opt, {
            host: this.host,
            port: this.port,
            retry_strategy: this.onRetryConnect.bind(this, reject),
        });
        if (this.db != null) {
            opt = Object.assign(opt, { db: this.db });
        }

        this.client = redis.createClient(opt);
        this.client.on('error', this.onConnectError.bind(this, reject));
        this.client.on('connect', this.onConnected.bind(this, resolve));
        this.client = Promise.promisifyAll(this.client);
    }

    private onRetryConnect(reject, options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with a individual error
            this.logger.error(
                'Redis(%s:%s?database=%s) Connection Refused',
                this.host,
                this.port,
                this.db,
            );
            reject(options.error);
        }
        if (options.times_connected > Math.max(options.attempt * 100, 1000)) {
            this.logger.error(
                'Redis(%s:%s?database=%s) Recovery And Retry Connection More Than %s Times',
                this.host,
                this.port,
                this.db,
                options.times_connected.toString(),
            );
        }
        // reconnect after
        return Math.min(options.attempt * 100, 100);
    }

    private onConnectError(reject, err) {
        this.logger.error(
            'Redis(%s:%s?database=%s) Error:%s',
            this.host,
            this.port,
            this.db,
            err,
        );
        reject(err);
    }
    private onConnected(resolve) {
        this.logger.info(
            'Redis(%s:%s?database=%s) Connect Ok',
            this.host,
            this.port,
            this.db,
        );
        resolve(this.client);
    }

    public set(key: string, value): Promise<string> {
        return this.client.setAsync(key, value);
    }

    public setex(key: string, seconds: number, value): Promise<string> {
        return this.client.setexAsync(key, seconds, value);
    }

    public get(key: string): Promise<any> {
        return this.client.getAsync(key);
    }

    public del(key: string): Promise<number> {
        return this.client.delAsync(key);
    }

    public expire(key: string, seconds): Promise<string> {
        return this.client.expireAsync(key, seconds);
    }

    public incr(key: string, inc: number): Promise<any> {
        return this.client.incrAsync(key, inc);
    }
}
