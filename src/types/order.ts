export interface Restaurant {
  restaurantName: string;
  linkToMenu: string;
}

export interface Order {
  hash: string;
  timer_end?: number;
  swishNbr?: string;
  swishName?: string;
  restaurant?: Restaurant;
}

export interface OrderItem {
  _id: string;
  nick: string;
  pizza: string;
}
