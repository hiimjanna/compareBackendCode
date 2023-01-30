import { IMongoClient } from './IMongoClient';
import { IMongoCollection, MongoCollection } from './MongoCollection';

export class MongoDB {
    constructor(public mongoClient: IMongoClient, public db) {}

    public collection(collName: string): IMongoCollection {
        return new MongoCollection(
            this.mongoClient,
            this.db.collection(collName),
        );
    }
}
