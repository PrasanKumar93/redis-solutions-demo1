import { createClient, commandOptions, AggregateSteps } from 'redis';
import {
  //types
  Entity as RedisEntity,
  RedisConnection,
  //values
  Schema as RedisSchema,
  Repository as RedisRepository,
  EntityId as RedisEntityId,
} from 'redis-om';

import { LoggerCls } from '../logger';

class RedisWrapperCls {
  connectionURL: string;
  nodeRedisClient: RedisConnection | null;

  constructor(_connectionURL: string) {
    this.connectionURL = _connectionURL;
    this.nodeRedisClient = null;
  }

  async getConnection() {
    if (!this.nodeRedisClient && this.connectionURL) {
      this.nodeRedisClient = createClient({ url: this.connectionURL });

      this.nodeRedisClient.on('error', (err) => {
        LoggerCls.error('Redis Client Error', err);
      });

      await this.nodeRedisClient.connect();
      LoggerCls.info('redis-wrapper ', 'Connected successfully to Redis');
    }
    return this.nodeRedisClient;
  }

  async closeConnection(): Promise<void> {
    if (this.nodeRedisClient) {
      await this.nodeRedisClient.disconnect();
    }
  }

  async addItemToList(_listName: string, _item: string) {
    await this.nodeRedisClient?.rPush(_listName, _item);
  }

  async getAllItemsFromList(_listName: string) {
    const result = await this.nodeRedisClient?.lRange(_listName, 0, -1);
    return result;
  }

  async getKeys(_pattern: string) {
    //@ts-ignore
    const result = await this.nodeRedisClient?.keys(_pattern);
    return result;
  }
}

let redisWrapperInst: RedisWrapperCls;

const setRedis = async (_connectionURL: string) => {
  redisWrapperInst = new RedisWrapperCls(_connectionURL);
  const nodeRedisClient = await redisWrapperInst.getConnection();
  return nodeRedisClient;
};

const getRedis = (): RedisWrapperCls => {
  return redisWrapperInst;
};
const getNodeRedisClient = () => {
  if (!redisWrapperInst.nodeRedisClient) {
    throw 'nodeRedisClient is not created!';
  }
  return redisWrapperInst.nodeRedisClient;
};

export {
  setRedis,
  getRedis,
  getNodeRedisClient,
  commandOptions,
  RedisSchema,
  RedisRepository,
  RedisEntityId,
  AggregateSteps,
};

export type { RedisWrapperCls, RedisEntity };
