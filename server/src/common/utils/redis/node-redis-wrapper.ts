import {
    createClient
} from "redis";

type NodeRedisClientType = ReturnType<typeof createClient>;

import { LoggerCls } from "../logger";

class RedisWrapperCls {
    connectionURL: string;
    nodeRedisClient: NodeRedisClientType | null;

    constructor(_connectionURL: string) {
        this.connectionURL = _connectionURL;
        this.nodeRedisClient = null;
    }

    async getConnection() {
        if (!this.nodeRedisClient && this.connectionURL) {
            this.nodeRedisClient = createClient({ url: this.connectionURL });

            this.nodeRedisClient.on('error', (err) => {
                LoggerCls.error("Redis Client Error", err)
            });

            await this.nodeRedisClient.connect();
            LoggerCls.info("node-redis-wrapper ", "Connected successfully to Redis");
        }
        return this.nodeRedisClient;
    }


    async closeConnection(): Promise<void> {
        if (this.nodeRedisClient) {
            await this.nodeRedisClient.disconnect();
        }
    }
}

let redisWrapperInst: RedisWrapperCls;

const setRedis = async (_connectionURL: string) => {
    redisWrapperInst = new RedisWrapperCls(_connectionURL);
    const client = await redisWrapperInst.getConnection();
    return client;
};

const getRedis = (): RedisWrapperCls => {
    return redisWrapperInst;
};
const getRedisClient = () => {
    return redisWrapperInst.nodeRedisClient;
};

export {
    setRedis,
    getRedis,
    getRedisClient
};

export type {
    RedisWrapperCls,
    NodeRedisClientType
};