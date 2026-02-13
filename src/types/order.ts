export interface Order {
  _id?: string;
  hash: string;
  createdAt: string;
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
  _id?: string;
  order: string;
  nick: string;
  pizza: string;
  createdAt: string;
}

export interface Restaurant {
  restaurantName: string;
  linkToMenu: string;
}
