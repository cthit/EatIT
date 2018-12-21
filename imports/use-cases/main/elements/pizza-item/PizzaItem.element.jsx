import React, { Component } from "react";

export default class PizzaItem extends Component {
    render() {
        const {
            items,
            pizzaName,
            onClickPizza,
            onClickRemove,
            timerStarted
        } = this.props;

        return (
            <li className="pizza-item">
                <span className="pizza-item-count">{items.length}</span>
                <span
                    data-tooltip={timerStarted ? null : "Place same order"}
                    onClick={
                        timerStarted ? null : () => onClickPizza(pizzaName)
                    }
                    className={"name" + (timerStarted ? "" : " editable")}
                >
                    {pizzaName} <span>+</span>
                </span>
                {items.map(item => (
                    <small
                        key={item._id}
                        onClick={
                            timerStarted ? null : () => onClickRemove(item)
                        }
                        data-tooltip={timerStarted ? null : "Remove this order"}
                        className={
                            "pizza-item-user" +
                            (timerStarted ? "" : " deletable")
                        }
                    >
                        {item.nick} <span>&times;</span>
                    </small>
                ))}
            </li>
        );
    }
}
