import type { NodeRedisClientType, IStore, IStoreInventory, IZipCode } from './config.js';

import { Prisma } from '@prisma/client';
import * as CONFIG from './config.js';


const deleteExistingKeysInRedis = async (_keyPrefix: string, redisClient: NodeRedisClientType) => {

    if (_keyPrefix) {
        const existingKeys = await redisClient?.keys(`${_keyPrefix}:*`);
        if (existingKeys?.length) {
            console.log(`deleting existing keys/ index starting with ${_keyPrefix}`);
            await redisClient?.del(existingKeys);
        }
    }
}

const addZipCodeDetailsInRedis = async (redisClient: NodeRedisClientType) => {

    await deleteExistingKeysInRedis(CONFIG.ZIP_CODE_KEY_PREFIX, redisClient);


    const zipCodeDetails: IZipCode[] = [
        {
            zipLocation: {
                latitude: 36.201051,
                longitude: -115.247882,
            },
            zipCode: 89128
        },
        {
            zipLocation: {
                latitude: 36.121149,
                longitude: -115.245988,
            },
            zipCode: 89147
        },
        {
            zipLocation: {
                latitude: 36.196385,
                longitude: -115.163960,
            },
            zipCode: 89106
        },
        {
            zipLocation: {
                latitude: 36.173475,
                longitude: -115.120923,
            },
            zipCode: 89101
        }
    ];

    for (let zipCodeData of zipCodeDetails) {
        zipCodeData.statusCode = 1;
        if (typeof zipCodeData?.zipLocation != "string") {
            //zipLocation = "-73.41512,40.79343"
            zipCodeData.zipLocation = zipCodeData.zipLocation?.longitude + "," + zipCodeData.zipLocation?.latitude;
        }
        const id = CONFIG.ZIP_CODE_KEY_PREFIX + ':' + zipCodeData.zipCode;
        //@ts-ignore
        await redisClient.json.set(id, '.', zipCodeData);
    }

}

const getStoreDetails = (): IStore[] => {
    //consider following sample stores in Vegas (USA)

    const stores: IStore[] = [{
        storeId: '01_RAINBOW_PROMENADE',
        storeName: 'Rainbow Promenade',
        storeLocation: {
            latitude: 36.201648,
            longitude: -115.243430,
        }
    },
    {
        storeId: '02_SPRING_VALLEY',
        storeName: 'Spring Valley',
        storeLocation: {
            latitude: 36.122794,
            longitude: -115.245510,
        }
    },
    {
        storeId: '03_WEST_VEGAS',
        storeName: 'West Vegas',
        storeLocation: {
            latitude: 36.194413,
            longitude: -115.162892,
        }
    },
    {
        storeId: '04_BONANZA_SQUARE',
        storeName: 'Bonanza Square',
        storeLocation: {
            latitude: 36.173264,
            longitude: -115.117103,
        }
    }];

    return stores;
}

const getRandomStores = (_count: number): IStore[] => {
    const stores = getStoreDetails();

    const shuffleArray = stores;
    for (let i = shuffleArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements
        [shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
    }

    return stores.slice(0, _count);
}

const addProductsToRandomStoresInRedis = async (_products: Prisma.ProductCreateInput[], _storeCount: number, redisClient: NodeRedisClientType) => {
    try {
        if (_products?.length && redisClient) {
            await deleteExistingKeysInRedis(CONFIG.STORE_INVENTORY_KEY_PREFIX, redisClient);

            for (let product of _products) {
                const randomStores = getRandomStores(_storeCount);
                for (let store of randomStores) {
                    if (typeof store?.storeLocation != "string") {
                        //"-73.41512,40.79343"
                        store.storeLocation = store.storeLocation?.longitude + "," + store.storeLocation?.latitude;
                    }
                    const storesInventory: IStoreInventory = {
                        storeId: store.storeId,
                        storeName: store.storeName,
                        storeLocation: store.storeLocation,
                        productId: product.productId,
                        productDisplayName: product.productDisplayName,
                        stockQty: CONFIG.MAX_PRODUCT_QTY_IN_STORE,
                        statusCode: 1
                    }
                    //id used in triggers too
                    const id = CONFIG.STORE_INVENTORY_KEY_PREFIX + ':' + store.storeId + "_" + product.productId;
                    //@ts-ignore
                    await redisClient.json.set(id, '.', storesInventory);
                    // console.log(id);
                }
            }
        }
    }
    catch (err) {
        console.log(`addProductToRandomStoresInRedis failed `, err);
    }
}



export {
    deleteExistingKeysInRedis,
    addProductsToRandomStoresInRedis,
    addZipCodeDetailsInRedis
}