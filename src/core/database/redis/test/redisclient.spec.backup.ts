import { RedisClient } from '../redisclient';
import * as Promise from 'bluebird';
function sleep(t) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, t);
    });
}
describe('RedisClient', () => {
    let redisClient: RedisClient;
    beforeAll(async () => {
        redisClient = new RedisClient(console, 'localhost', 6379);
        await redisClient.connect();
    });

    it('should be ready', async () => {
        expect(redisClient.conn).not.toBe(null);
    });

    it('set get del', async () => {
        const key = 'redisclient:test:setgetdel';
        const value = 'TEST VALUE';
        await redisClient.set(key, value);
        const get_value = await redisClient.get(key);
        expect(get_value).toBe(value);
        await redisClient.del(key);
        const deleted_value2 = await redisClient.get(key);
        expect(deleted_value2).toBe(null);
    });

    it('setex get del', async () => {
        const key = 'redisclient:test:setexgetdel';
        const value = 'TEST VALUE';
        await redisClient.setex(key, 1, value);
        await sleep(1001);
        const get_value = await redisClient.get(key);
        expect(get_value).toBe(null);
    });

    it('set expire get del', async () => {
        const key = 'redisclient:test:setexpiregetdel';
        const value = 'TEST VALUE';
        await redisClient.set(key, value);
        await redisClient.expire(key, 1);
        await sleep(1001);
        const get_value = await redisClient.get(key);
        expect(get_value).toBe(null);
    });
});
