import { IMongoClient, MongoDB, OPS, IMongoCollection } from '../mongoclient';
import * as util from 'util';

export class FakeMongoClient implements IMongoClient {
    get conn() {
        return this;
    }

    get url() {
        return util.format(
            'mongodb://%s:%s/%s',
            this.host,
            this.port,
            this.dbName,
        );
    }

    private dataCache = {};
    constructor(
        private logger,
        private host: string,
        private port: number,
        private dbName: string,
        private authName?: string,
        private authPassword?: string,
        private authSource: string = 'admin',
        private options = {},
    ) {
        this.logger.info('FakeMongoClient is being work.');
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
        return this;
    }

    public async db(dbName?: string): Promise<MongoDB> {
        return new FakeMongoDB(this, this);
    }
}
export class FakeMongoDB {
    constructor(public mongoClient: IMongoClient, public db) {}

    public collection(collName: string): IMongoCollection {
        return new FakeMongoCollection(this.mongoClient);
    }
}

export class FakeMongoCollection implements IMongoCollection {
    private fakeColl = [];
    private fakeID = 0;

    constructor(public mongoClient: IMongoClient) {}

    public async createIndex(
        index,
        unique?: boolean,
        expireAfterSeconds?: number,
        background?: boolean,
    ) {
        let indexName = '';
        for (const [key, value] of Object.entries(index)) {
            if (indexName.length > 0) indexName += '_';
            indexName += key + '_' + value;
        }
        return indexName;
    }

    public async insertOne(doc) {
        this.fakeID += 1;
        doc._id = this.fakeID;
        this.fakeColl.push(doc);
        return {
            insertedCount: 1,
            insertedId: doc._id,
        };
    }

    public async insertMany(docs: Array<any>, ordered: boolean = false) {
        const insertedIds = {};
        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            this.fakeID += 1;
            doc._id = this.fakeID;
            this.fakeColl.push(doc);
            insertedIds['' + i] = doc._id;
        }

        return {
            insertedCount: docs.length,
            insertedIds,
        };
    }

    public async updateOne(query, updateDoc, upsert: boolean = false) {
        let matchDoc;
        for (const doc of this.fakeColl) {
            let isFound = true;
            for (const [key, value] of Object.entries(query)) {
                if (doc[key] !== value) {
                    isFound = false;
                    break;
                }
            }
            if (isFound) {
                matchDoc = doc;
                break;
            }
        }

        let matchedCount = 0;
        let modifiedCount = 0;
        const setDoc = updateDoc[OPS.set];
        if (matchDoc) {
            matchedCount = 1;
            if (setDoc) {
                for (const [key, value] of Object.entries(setDoc)) {
                    if (matchDoc[key] !== value) {
                        modifiedCount = 1;
                        matchDoc[key] = value;
                    }
                }
            }
        }

        let upsertedCount = 0;
        let upsertedId = null;
        if (matchedCount === 0 && upsert) {
            const newDoc = Object.assign({}, query, setDoc);
            const upsertResult = await this.insertOne(newDoc);
            upsertedCount = upsertResult.insertedCount;
            upsertedId = upsertResult.insertedId;
        }

        return {
            matchedCount,
            modifiedCount,
            upsertedCount,
            upsertedId,
        };
    }

    public async updateMany(
        query,
        updateDoc,
        upsert: boolean = false,
        multi: boolean = true,
    ) {
        const matchDocs = [];
        for (const doc of this.fakeColl) {
            let isFound = true;
            for (const [key, value] of Object.entries(query)) {
                if (value[OPS.in]) {
                    if (!value[OPS.in].includes(doc[key])) {
                        isFound = false;
                        break;
                    }
                } else if (doc[key] !== value) {
                    isFound = false;
                    break;
                }
            }
            if (isFound) {
                matchDocs.push(doc);
            }
        }

        let matchedCount = 0;
        let modifiedCount = 0;
        const setDoc = updateDoc[OPS.set];
        for (const matchDoc of matchDocs) {
            if (matchDoc) {
                matchedCount += 1;
                if (setDoc) {
                    for (const [key, value] of Object.entries(setDoc)) {
                        if (matchDoc[key] !== value) {
                            modifiedCount += 1;
                            matchDoc[key] = value;
                        }
                    }
                }
            }
        }

        let upsertedCount = 0;
        let upsertedId = null;
        if (matchedCount === 0 && upsert) {
            const newDoc = Object.assign({}, query, setDoc);
            const upsertResult = await this.insertOne(newDoc);
            upsertedCount = upsertResult.insertedCount;
            upsertedId = upsertResult.insertedId;
        }

        return {
            matchedCount,
            modifiedCount,
            upsertedCount,
            upsertedId,
        };
    }

    public async deleteOne(query) {
        let deletedCount = 0;
        let i;
        let isFound;
        for (i = 0; i < this.fakeColl.length; i++) {
            const doc = this.fakeColl[i];
            isFound = true;
            for (const [key, value] of Object.entries(query)) {
                if (value[OPS.in]) {
                    if (!value[OPS.in].includes(doc[key])) {
                        isFound = false;
                        break;
                    }
                } else if (doc[key] !== value) {
                    isFound = false;
                    break;
                }
            }
            if (isFound) {
                break;
            }
        }
        if (isFound) {
            deletedCount += 1;
            this.fakeColl.splice(i, 1);
        }
        return {
            deletedCount,
        };
    }

    public async deleteMany(query, multi: boolean = true) {
        let deletedCount = 0;
        const deleteIndexies = [];
        let isFound;
        for (let i = 0; i < this.fakeColl.length; i++) {
            const doc = this.fakeColl[i];
            isFound = true;
            for (const [key, value] of Object.entries(query)) {
                if (value[OPS.in]) {
                    if (!value[OPS.in].includes(doc[key])) {
                        isFound = false;
                        break;
                    }
                } else if (doc[key] !== value) {
                    isFound = false;
                    break;
                }
            }
            if (isFound) {
                deleteIndexies.splice(0, 0, i);
            }
        }
        for (const index of deleteIndexies) {
            deletedCount += 1;
            this.fakeColl.splice(index, 1);
        }
        return {
            deletedCount,
        };
    }

    public async findOneAndUpdate(
        query,
        updateDoc,
        projection?,
        returnOriginal: boolean = true,
        upsert: boolean = false,
        sort?,
    ) {
        let matchDoc;
        for (const doc of this.fakeColl) {
            let isFound = true;
            for (const [key, value] of Object.entries(query)) {
                if (doc[key] !== value) {
                    isFound = false;
                    break;
                }
            }
            if (isFound) {
                matchDoc = doc;
                break;
            }
        }

        let returnDoc;
        let matchedCount = 0;
        // let modifiedCount = 0;
        const setDoc = updateDoc[OPS.set];
        if (matchDoc) {
            if (returnOriginal) returnDoc = Object.assign({}, matchDoc);
            matchedCount = 1;
            if (setDoc) {
                for (const [key, value] of Object.entries(setDoc)) {
                    if (matchDoc[key] !== value) {
                        // modifiedCount = 1;
                        matchDoc[key] = value;
                    }
                }
            }
            if (!returnOriginal) returnDoc = Object.assign({}, matchDoc);
        }

        // let upsertedCount = 0;
        let upsertedId = null;
        if (matchedCount === 0 && upsert) {
            const newDoc = Object.assign({}, query, setDoc);
            const upsertResult = await this.insertOne(newDoc);
            // upsertedCount = upsertResult.insertedCount;
            upsertedId = upsertResult.insertedId;

            if (!returnOriginal) returnDoc = Object.assign({}, newDoc);
        }
        returnDoc = this.checkPprojection(returnDoc, projection);
        return {
            value: returnDoc,
            upsertedId,
        };
    }

    public async findOneAndDelete(query, sort?) {
        let matchDoc;
        let i;
        let isFound;
        for (i = 0; i < this.fakeColl.length; i++) {
            const doc = this.fakeColl[i];
            isFound = true;
            for (const [key, value] of Object.entries(query)) {
                if (value[OPS.in]) {
                    if (!value[OPS.in].includes(doc[key])) {
                        isFound = false;
                        break;
                    }
                } else if (doc[key] !== value) {
                    isFound = false;
                    break;
                }
            }
            if (isFound) {
                matchDoc = doc;
                break;
            }
        }
        if (isFound) {
            this.fakeColl.splice(i, 1);
        }
        return {
            value: matchDoc,
        };
    }

    public async findOne(query, projection?, sort?) {
        let result;
        for (const doc of this.fakeColl) {
            let isFound = true;
            for (const [key, value] of Object.entries(query)) {
                if (value[OPS.in]) {
                    if (!value[OPS.in].includes(doc[key])) {
                        isFound = false;
                        break;
                    }
                } else if (doc[key] !== value) {
                    isFound = false;
                    break;
                }
            }
            if (isFound) {
                result = doc;
                break;
            }
        }
        result = this.checkPprojection(result, projection);
        return result;
    }

    private checkPprojection(doc, projection) {
        if (doc && projection) {
            const projDoc = Object.assign({}, doc);
            for (const [key, value] of Object.entries(projection)) {
                if (!value && projDoc[key] !== undefined) {
                    delete projDoc[key];
                }
            }
            doc = projDoc;
        }
        return doc;
    }

    public async find(
        query,
        projection?,
        skip?: number,
        limit?: number,
        sort?,
        hint?,
    ): Promise<Array<any>> {
        let result;
        for (const doc of this.fakeColl) {
            let isFound = true;
            for (const [key, value] of Object.entries(query)) {
                if (value[OPS.in]) {
                    if (!value[OPS.in].includes(doc[key])) {
                        isFound = false;
                        break;
                    }
                } else if (doc[key] !== value) {
                    isFound = false;
                    break;
                }
            }
            if (isFound) {
                if (!result) result = [];
                result.push(doc);
            }
        }
        if (result && projection) {
            const projResult = [];
            for (const doc of result) {
                const projDoc = this.checkPprojection(doc, projection);
                projResult.push(projDoc);
            }
            result = projResult;
        }
        return result;
    }

    public async count(query): Promise<number> {
        return this.fakeColl.find(query).count()
    }

    public async replaceOne(query, doc, optins): Promise<any> {
        console.log('replaceOne')    
    }
    
    public async aggregate(data: Array<any>): Promise<any> {
        console.log('aggregate')
    }
}
