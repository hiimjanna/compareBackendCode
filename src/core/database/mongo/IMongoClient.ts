import { MongoDB } from './MongoDB';

export interface IMongoClient {
    readonly conn;
    readonly url;
    connect(): Promise<any>;
    db(dbName?: string): Promise<MongoDB>;
}
