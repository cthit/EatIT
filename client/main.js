import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";

import App from "../imports/app";
import { Orders } from "../imports/api/orders";

import { DigitProviders } from "@cthit/react-digit-components";

import menu from "../imports/use-cases/main/screens/order/views/menu/Menu.view.reducer";

function randomHash() {
    var hex = parseInt(Math.random() * 0xfff).toString(16);
    return ("000" + hex).slice(-3); // pad with 3 zeros
}

Meteor.startup(() => {
    let hash = null;

    let { pathname } = window.location;
    pathname = pathname.substring(1);

    if (pathname) {
        hash = pathname;
    } else {
        const order_id = Orders.insert({
            hash: randomHash(),
            createdAt: new Date()
        });
        const order = Orders.findOne({ _id: order_id });
        hash = order.hash;

        window.history.replaceState(null, null, `/${hash}`);
    }

    render(
        <DigitProviders rootReducer={{ menu }}>
            <App hash={hash} />
        </DigitProviders>,
        document.getElementById("root")
    );
});
