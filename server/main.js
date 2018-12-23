import { Meteor } from "meteor/meteor";

import { Orders } from  "../imports/api/orders";
import { OrderItems } from "../imports/api/order_items";

const TwentyFourHours = 60 * 60 * 24;

Meteor.startup(() => {
    Orders._ensureIndex({ createdAt:1 }, { expireAfterSeconds:TwentyFourHours });
    OrderItems._ensureIndex({ createdAt:1 }, { expireAfterSeconds:TwentyFourHours });
});


