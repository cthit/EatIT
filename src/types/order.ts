import { ObjectId } from 'mongodb';

export interface Order {
  _id?: ObjectId | string;
  hash: string;
  createdAt: Date | string; // Date objects get serialized to strings
  timer_end?: number;
  playEatITSong?: boolean;
  swishNbr?: string;
  swishName?: string;
  restaurant?: {
    restaurantName: string;
    linkToMenu: string;
  };
}

export interface OrderItem {
  _id?: ObjectId | string;
  order: ObjectId | string;
  nick: string;
  pizza: string;
  createdAt: Date | string; // Date objects get serialized to strings
}

export interface Restaurant {
  restaurantName: string;
  linkToMenu: string;
}
