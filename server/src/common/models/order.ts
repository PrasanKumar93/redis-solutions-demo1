import type {
  Product,
  Order,
  OrdersProduct,
  OrdersProductData,
} from '@prisma/client';
import { Document } from 'mongodb'; //to allow other dynamic props

import { DB_ROW_STATUS } from './misc';

enum ORDER_STATUS {
  PAYMENT_FAIL = -4,
  DRAFT = 0,
  CREATED = 1,
  PENDING = 2,
  PAYMENT_INITIATED = 3,
  PAYMENT_SUCCESS = 4,
}

interface IOrder extends Order, Document {

  paymentId?: string;
  sessionId?: string;
  orderAmount?: string;
}

export { ORDER_STATUS, DB_ROW_STATUS };
export type { IOrder, Order, OrdersProduct, OrdersProductData, Product };
