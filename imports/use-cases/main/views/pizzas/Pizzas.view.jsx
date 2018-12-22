import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { groupBy, values } from "lodash";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faUndo from "@fortawesome/fontawesome-free-solid/faUndo";

import { OrderItems } from "../../../../api/order_items";

import PizzaItem from "../../elements/pizza-item/PizzaItem.element";

class Pizzas extends Component {
    state = { showUndoRemove: false };

    lastRemovedOrder = null;

    removeOrderItem = orderItem => {
        OrderItems.remove({ _id: orderItem._id });
        this.lastRemovedOrder = orderItem;

        this.setState({
            showUndoRemove: true
        });
        setTimeout(() => {
            this.setState({
                showUndoRemove: false
            });
            this.lastRemovedOrder = null;
        }, 10000);
    };

    undoRemoveOrderItem = () => {
        if (this.lastRemovedOrder) {
            const { nick, pizza, order } = this.lastRemovedOrder;

            OrderItems.insert({
                order,
                nick,
                pizza,
                createdAt: new Date()
            });
            this.removedOrder = null;
            this.setState({
                showUndoRemove: false
            });
        }
    };

    render() {
        const { error, orderItems, onClickPizza, timerStarted } = this.props;
        const { showUndoRemove } = this.state;

        const ordersByPizza = groupBy(orderItems, "pizza");

        console.log(this.props.orderItems);
        return (
            <>
                {(orderItems.length > 0 || showUndoRemove) && (
                    <div className="container-header">Order</div>
                )}
                {showUndoRemove && (
                    <div
                        className="button deletable"
                        onClick={this.undoRemoveOrderItem}
                    >
                        <FontAwesomeIcon icon={faUndo} /> Undo remove item!
                    </div>
                )}
                {orderItems.length > 0 && (
                    <ul className="pizzas">
                        {Object.keys(ordersByPizza).map(pizzaName => (
                            <PizzaItem
                                key={pizzaName}
                                timerStarted={timerStarted}
                                onClickPizza={onClickPizza}
                                onClickRemove={this.removeOrderItem}
                                pizzaName={pizzaName}
                                items={ordersByPizza[pizzaName]}
                            />
                        ))}
                        <li className="pizza-item" id="total-item-count">
                            <span>Total items: </span>
                            <span>{orderItems.length}</span>
                        </li>
                    </ul>
                )}
            </>
        );
    }
}

export default withTracker(({ orderId }) => {
    return {
        orderItems: OrderItems.find({ order: orderId }).fetch()
    };
})(Pizzas);
