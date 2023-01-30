import * as mongodb from 'mongodb';
import * as util from 'util';
import { sleep } from '../../util/asyncTool';
import { IMongoClient } from './IMongoClient';
import { MongoDB } from './MongoDB';
import { IMongoCollection, MongoCollection } from './MongoCollection';

export { IMongoClient, MongoDB, IMongoCollection, MongoCollection };

export const OPS = {
    set: '$set',
    unset: '$unset',
    setOnInsert: '$setOnInsert',
    inc: '$inc',
    in: '$in',
    nin: '$nin',
    eq: '$eq',
    gt: '$gt',
    gte: '$gte',
    lt: '$lt',
    lte: '$lte',
    ne: '$ne',
    and: '$and',
    not: '$not',
    or: '$or',
    nor: '$nor',
    exists: '$exists',
};

export class MongoClient implements IMongoClient {
    private client = null;

    get conn() {
        return this.client;
    }

    get url() {
        if(this.customURL) {
            return this.host;
        } else {
            return util.format(
                'mongodb://%s:%s/%s',
                this.host,
                this.port,
                this.dbName,
            );
        }
    }

    constructor(
        private logger,
        private host: string,
        private port: number,
        private dbName: string,
        private customURL: boolean,
        private authName?: string,
        private authPassword?: string,
        private authSource: string = 'admin',
        private options = {},
    ) {
        this.options = Object.assign(
            {},
            {
                autoReconnect: true,
                poolSize: 10,
                reconnectTries: Infinity,
                reconnectInterval: 500,
                connectTimeoutMS: 1000,
                bufferMaxEntries: 0,
            },
            this.options,
        );
    }

    public async connect() {
        let url = this.url;
        if (this.authName && this.authPassword) {
            url = util.format(
                'mongodb://%s:%s@%s:%s/%s?authSource=%s',
                this.authName,
                this.authPassword,
                this.host,
                this.port,
                this.dbName,
                this.authSource,
            );
        }
        this.client = await mongodb.MongoClient.connect(url);

        this.logger.info('Mongo(%s) Connect Ok', this.url);
        return this.client;
    }

    public async db(dbName?: string): Promise<MongoDB> {
        if (dbName === undefined) {
            dbName = this.dbName;
        }
        while (this.client === null) {
            await sleep(1);
        }
        return new MongoDB(this, this.client.db(dbName));
    }
}
