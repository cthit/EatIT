import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";

import App from "../imports/app/App.jsx";
import { Orders } from "../imports/api/orders";

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

  render(<App hash={hash} />, document.getElementById("root"));
});
