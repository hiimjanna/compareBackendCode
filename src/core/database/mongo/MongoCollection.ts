import { IMongoClient } from './IMongoClient';

export interface IMongoCollection {
    createIndex(
        index,
        unique?: boolean,
        expireAfterSeconds?: number,
        background?: boolean,
    ): Promise<string>;
    insertOne(doc): Promise<any>;
    insertMany(docs: Array<any>, ordered?: boolean): Promise<any>;
    updateOne(query, doc, upsert?: boolean): Promise<any>;
    updateMany(query, doc, upsert?: boolean, multi?: boolean): Promise<any>;
    deleteOne(query): Promise<any>;
    deleteMany(query, multi?: boolean): Promise<any>;
    findOneAndUpdate(
        query,
        doc,
        projection?,
        returnOriginal?: boolean,
        upsert?: boolean,
        sort?,
    ): Promise<any>;
    findOneAndDelete(query, sort?): Promise<any>;
    findOne(query, projection?, sort?): Promise<any>;
    find(
        query,
        projection?,
        skip?: number,
        limit?: number,
        sort?,
    ): Promise<Array<any>>;
    count(query): Promise<number>;
    aggregate(data: Array<any>): Promise<any>;
    replaceOne(query, doc, optins?): Promise<Array<any>>;
}

export class MongoCollection implements IMongoCollection {
    constructor(public mongoClient: IMongoClient, public coll) { }

    public async createIndex(
        index,
        unique?: boolean,
        expireAfterSeconds?: number,
        background?: boolean,
    ) {
        const options = { unique, expireAfterSeconds, background };
        return this.coll.createIndex(index, options);
    }

    // https://mongodb.github.io/node-mongodb-native/3.5/tutorials/crud/
    public async insertOne(doc) {
        return this.coll.insertOne(doc);
    }

    public async insertMany(docs: Array<any>, ordered: boolean = false) {
        return this.coll.insertMany(docs, { ordered });
    }

    public async updateOne(query, doc, upsert: boolean = false) {
        const result = await this.coll.updateOne(query, doc, { upsert });
        if (upsert && result.upsertedId && result.upsertedId._id) {
            result.upsertedId = result.upsertedId._id;
        }
        return result;
    }

    public async updateMany(
        query,
        doc,
        upsert: boolean = false,
        multi: boolean = true,
    ) {
        const result = await this.coll.updateMany(query, doc, {
            upsert,
            multi,
        });
        if (upsert && result.upsertedId && result.upsertedId._id) {
            result.upsertedId = result.upsertedId._id;
        }
        return result;
    }

    public async deleteOne(query) {
        return this.coll.deleteOne(query);
    }

    public async deleteMany(query, multi: boolean = true) {
        return this.coll.deleteMany(query, { single: !multi });
    }

    public async findOneAndUpdate(
        query,
        doc,
        projection?,
        returnOriginal: boolean = true,
        upsert: boolean = false,
        sort?,
    ) {
        const result = await this.coll.findOneAndUpdate(query, doc, {
            projection,
            returnOriginal,
            upsert,
            sort,
        });
        if (
            upsert &&
            result &&
            result.lastErrorObject &&
            result.lastErrorObject.upserted
        ) {
            result.upsertedId = result.lastErrorObject.upserted;
        }
        return result;
    }

    public async findOneAndDelete(query, sort?) {
        return this.coll.findOneAndDelete(query, { sort });
    }

    public async findOne(query, projection?, sort?) {
        return this.coll.findOne(query, { projection, sort });
    }

    public async find(
        query,
        projection?,
        skip?: number,
        limit?: number,
        sort?,
        hint?,
    ): Promise<Array<any>> {
        let result = this.coll.find(query);
        if (projection) {
            result = result.project(projection);
        }
        if (skip !== undefined) {
            result = result.skip(skip);
        }
        if (limit !== undefined) {
            result = result.limit(limit);
        }
        if (sort !== undefined) {
            result = result.sort(sort);
        }
        if (hint !== undefined) {
            result = result.hint(hint);
        }
        return result.toArray();
    }

    public count(query): Promise<number> {
        return this.coll.find(query).count();
    }

    public replaceOne(query, doc, optins?): Promise<any> {
        return this.coll.replaceOne(query, doc, optins);
    }

    public aggregate(data: Array<any>): Promise<any> {
        return this.coll.aggregate(data)
    }
}
