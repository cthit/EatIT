import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { groupBy, values } from "lodash";

import { OrderItems } from "../../../../api/order_items";

import PizzaItem from "./elements/pizza-item/PizzaItem.element";

import {
    DigitText,
    DigitLayout,
    DigitIfElseRendering,
    DigitDesign
} from "@cthit/react-digit-components";

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

        return (
            <DigitDesign.Card
                minHeight={"150px"}
                minWidth={"300px"}
                maxWidth={"600px"}
                width={"100%"}
            >
                <DigitDesign.CardTitle text={"Orders"} />
                <DigitDesign.CardBody>
                    <DigitIfElseRendering
                        test={orderItems.length > 0}
                        ifRender={() => (
                            <DigitLayout.Column>
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

                                <hr />
                                <DigitLayout.Row>
                                    <DigitText.Text
                                        text={
                                            "Total items: " + orderItems.length
                                        }
                                    />
                                </DigitLayout.Row>
                            </DigitLayout.Column>
                        )}
                        elseRender={() => (
                            <DigitLayout.Center>
                                <DigitText.Title
                                    text={"No items has been added"}
                                />
                            </DigitLayout.Center>
                        )}
                    />
                </DigitDesign.CardBody>
            </DigitDesign.Card>
        );
    }
}

export default Pizzas;
