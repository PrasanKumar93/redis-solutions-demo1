import type { Product } from '@prisma/client';
import type { IProduct } from '../../../common/models/product';
import type { IZipCode } from '../../../common/models/zip-code';
import type { IStoreInventory, IStoreProduct } from '../../../common/models/store-inventory';

import { Prisma } from '@prisma/client';

import { DB_ROW_STATUS } from '../../../common/models/order';
import { getPrismaClient } from '../../../common/utils/prisma/prisma-wrapper';
import * as ProductRepo from '../../../common/models/product-repo';
import * as ZipCodeRepo from '../../../common/models/zip-code-repo';
import * as StoreInventoryRepo from '../../../common/models/store-inventory-repo';

import { getNodeRedisClient, AggregateSteps } from '../../../common/utils/redis/redis-wrapper';
import { Search, WhereField } from 'redis-om';

interface IGeoFilter {
  searchRadiusInMiles?: number;
  userLocation?: {
    latitude: number;
    longitude: number;
  }
}

interface IInventoryBodyFilter extends IGeoFilter {
  productDisplayName?: string;
}

interface IInventoryVectorGeoFilter extends IGeoFilter {
  question?: string;
}


const getProductsByFilter = async (productFilter: Product) => {
  const repository = ProductRepo.getRepository();
  let products: IProduct[] = [];
  if (repository) {
    let queryBuilder = repository
      .search()
      .and('statusCode')
      .eq(DB_ROW_STATUS.ACTIVE)
      .and('stockQty')
      .gt(0);

    if (productFilter?.productDisplayName) {
      queryBuilder = queryBuilder
        .and('productDisplayName')
        .matches(productFilter.productDisplayName)
    }

    products = <IProduct[]>await queryBuilder.sortAsc("productId").return.all();
  }

  return products;
};

async function getProductsByFilterFromDB(productFilter: Product) {
  const prisma = getPrismaClient();

  const whereQuery: Prisma.ProductWhereInput = {
    statusCode: DB_ROW_STATUS.ACTIVE,
    stockQty: {
      gt: 0
    }
  };

  if (productFilter && productFilter.productDisplayName) {
    whereQuery.productDisplayName = {
      contains: productFilter.productDisplayName,
      mode: 'insensitive',
    };
  }

  const products: Product[] = await prisma.product.findMany({
    where: whereQuery,
  });

  return products;
}

const triggerResetInventory = async () => {
  const redisClient = getNodeRedisClient();

  //@ts-ignore
  const result = await redisClient.sendCommand(["TFCALLASYNC", "ManualTriggers.resetInventory", "0"], {
    isolated: true
  });
  console.log(`triggerResetInventory :  `, result);

  return result;
}

const getZipCodes = async () => {
  const repository = ZipCodeRepo.getRepository();
  let zipCodes: IZipCode[] = [];
  if (repository) {
    let queryBuilder = repository
      .search()
      .and('statusCode')
      .eq(DB_ROW_STATUS.ACTIVE);

    console.log(queryBuilder.query);
    zipCodes = <IZipCode[]>await queryBuilder.sortAsc("zipCode").return.all();
  }

  return zipCodes;
};

const validateGeoFilter = (geo?: IGeoFilter) => {
  if (!geo) {
    return;
  }

  let radiusInMiles = geo.searchRadiusInMiles;
  const { latitude, longitude } = geo.userLocation ?? { latitude: undefined, longitude: undefined };

  if (!radiusInMiles) {
    radiusInMiles = geo.searchRadiusInMiles = 50;
  }

  if (radiusInMiles && latitude && longitude) {
    return geo as Required<IGeoFilter>;
  }
}

const queryForAvailableProducts = (geo?: IGeoFilter) => {
  const repository = StoreInventoryRepo.getRepository();

  let queryBuilder: Search = repository
    .search()
    .and('statusCode')
    .eq(DB_ROW_STATUS.ACTIVE)
    .and('stockQty')
    .gt(0);

  if (!!geo) {
    geo = validateGeoFilter(geo);

    if (!geo) {
      throw "Mandatory fields like userLocation latitude / longitude missing !"
    }

    const radiusInMiles = geo.searchRadiusInMiles;
    const { latitude, longitude } = geo.userLocation ?? { latitude: undefined, longitude: undefined };
    if (radiusInMiles && latitude && longitude) {
      queryBuilder = queryBuilder
        .and('storeLocation')
        .inRadius((circle) => {
          return circle
            .latitude(latitude)
            .longitude(longitude)
            .radius(radiusInMiles)
            .miles
        });
    }
  }

  return queryBuilder;
}

const performProductAggregateQueryByGeo = async (index: string, queryBuilder: Search, geo: Required<IGeoFilter>) => {
  const redisClient = getNodeRedisClient();
  let storeProducts: IStoreInventory[] = [];
  const trimmedStoreProducts: IStoreInventory[] = [] // similar item of other stores are removed
  const uniqueProductIds = {};
  const radiusInMiles = geo.searchRadiusInMiles;
  const { latitude, longitude } = geo.userLocation;
  const aggregator = await redisClient.ft.aggregate(
    index,
    queryBuilder.query,
    {
      LOAD: ["@storeId", '@storeName', "@storeLocation", "@productId", "@productDisplayName", "@stockQty"],
      STEPS: [{
        type: AggregateSteps.APPLY,
        expression: `geodistance(@storeLocation, ${longitude}, ${latitude})/${radiusInMiles}`,
        AS: 'distInMiles'
      }, {
        type: AggregateSteps.SORTBY,
        BY: ["@distInMiles", "@productId"]
      }, {
        type: AggregateSteps.LIMIT,
        from: 0,
        size: 1000, //must be > storeInventory count
      }]
    });

  /* Sample command to run on CLI
  FT.AGGREGATE "storeInventory:storeInventoryId:index"
    "( ( ( (@statusCode:[1 1]) (@stockQty:[(0 +inf]) ) (@storeLocation:[-73.968285 40.785091 1000 km]) ) (@productDisplayName:'puma') )"
    "LOAD" "5" "@storeId" "@storeName" "@storeLocation" "@productId" "@productDisplayName" "@stockQty"
    "APPLY" "geodistance(@storeLocation, -73.968285, 40.785091)/1000"
    "AS" "distInMiles"
    "SORTBY" "1" "@distInMiles"
    "LIMIT" "0" "100"
*/

  storeProducts = <IStoreInventory[]>aggregator.results;

  storeProducts?.forEach((storeProduct) => {
    if (storeProduct?.productId && !uniqueProductIds[storeProduct.productId]) {
      uniqueProductIds[storeProduct.productId] = true;

      if (typeof storeProduct.storeLocation == "string") {
        const location = storeProduct.storeLocation.split(",");
        storeProduct.storeLocation = {
          longitude: Number(location[0]),
          latitude: Number(location[1]),
        };
      }

      trimmedStoreProducts.push(storeProduct);
    }
  });

  return {
    storeProducts: trimmedStoreProducts,
    productIds: Object.keys(uniqueProductIds)
  };
}

const mergeProductDetails = async (inventory: IStoreInventory[], productIds: string[]) => {
  const repository = ProductRepo.getRepository();
  //products with details
  const generalProducts = <IProduct[]>await repository.fetch(...productIds);
  //mergedProducts
  return inventory.map(storeProd => {
    const matchingGeneralProd = generalProducts.find(generalProd => generalProd.productId === storeProd.productId);
    //@ts-ignore
    const mergedProd: IStoreProduct = { ...matchingGeneralProd, ...storeProd };
    return mergedProd;
  });
}

const searchStoreInventoryByGeoFilter = async (_inventoryFilter: IInventoryBodyFilter) => {
  let queryBuilder = queryForAvailableProducts(_inventoryFilter);

  if (_inventoryFilter.productDisplayName) {
    queryBuilder = queryBuilder
      .and('productDisplayName')
      .matches(_inventoryFilter.productDisplayName)
  }

  /* Sample queryBuilder.query to run on CLI
  FT.SEARCH "storeInventory:storeInventoryId:index" "( ( ( (@statusCode:[1 1]) (@stockQty:[(0 +inf]) ) (@storeLocation:[-73.968285 40.785091 50 mi]) ) (@productDisplayName:'puma') )"
          */

  return performProductAggregateQueryByGeo(`${StoreInventoryRepo.STORE_INVENTORY_KEY_PREFIX}:index`, queryBuilder, _inventoryFilter as Required<IGeoFilter>);
};

const getStoreProductsByGeoFilter = async (_inventoryFilter: IInventoryBodyFilter) => {
  let products: IStoreProduct[] = [];

  const { storeProducts, productIds } = await searchStoreInventoryByGeoFilter(_inventoryFilter);

  if (storeProducts?.length && productIds?.length) {
    products = await mergeProductDetails(storeProducts, productIds);
  }

  return products;
};


const getProductsByVectorAndGeo = async (filter: IInventoryVectorGeoFilter) => {
  let queryBuilder = queryForAvailableProducts(filter);
  let products: IStoreProduct[] = [];

  queryBuilder = queryBuilder
    .and('productDisplayName')
    .matches("men")
    .and('productDisplayName')
    .matches("John Miller")
    .or('productDisplayName')
    .matches("Chronograph");

  const { storeProducts, productIds } = await performProductAggregateQueryByGeo(`${StoreInventoryRepo.STORE_INVENTORY_KEY_PREFIX}:index`, queryBuilder, filter as Required<IGeoFilter>);

  if (storeProducts?.length && productIds?.length) {
    products = await mergeProductDetails(storeProducts, productIds);
  }

  return products;
}

export {
  getProductsByFilter,
  getProductsByFilterFromDB,
  triggerResetInventory,
  getZipCodes,
  getStoreProductsByGeoFilter,
  getProductsByVectorAndGeo
};
