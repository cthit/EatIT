import React, { Component } from "react";
import { OrderItems } from "./api/order_items";

export default class OrderBox extends Component {
  onSubmit = event => {
    event.preventDefault();

    let { pizza, nick } = this.props;

    pizza = pizza.trim();
    nick = nick.trim();

    if (!pizza || !nick) {
      return;
    }

    OrderItems.insert({
      order: this.props.orderId,
      pizza,
      nick,
      createdAt: new Date()
    });

    this.props.setPizza("");
  };

  setPizzaValue = event => {
    this.props.setPizza(event.target.value);
  };

  setNickValue = event => {
    this.props.setNick(event.target.value);
  };

  render() {
    const { pizza, nick, inputRef } = this.props;
    return (
      <div className="container-content">
        <h3>🍽 Place your order</h3>
        <form className="new-pizza" onSubmit={this.onSubmit}>
          <input
            type="text"
            name="pizza"
            placeholder="Order"
            value={pizza}
            onInput={this.setPizzaValue}
            id="order"
          />
          <input
            type="text"
            name="nick"
            ref={inputRef}
            placeholder="Nick"
            value={nick}
            onInput={this.setNickValue}
          />
          <button className="button add-order-button">Add</button>
          <div className="clear" />
        </form>
      </div>
    );
  }
}
