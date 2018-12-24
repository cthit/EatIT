import React, { Component } from "react";
import _ from "lodash";

import { OrderItems } from "../../../../../../api/order_items";

import PizzaItem from "./elements/pizza-item/PizzaItem.element";

import {
    DigitText,
    DigitLayout,
    DigitIfElseRendering,
    DigitDesign
} from "@cthit/react-digit-components";

class Pizzas extends Component {
    removeOrderItem = orderItem => {
        OrderItems.remove({ _id: orderItem._id });

        this.props.openToast({
            text:
                orderItem.pizza +
                " by " +
                orderItem.nick +
                " has been removed.",
            duration: 5000,
            actionText: "Undo",
            actionHandler: () => {
                this.undoRemoveOrderItem(orderItem);
                this.props.openToast({
                    text:
                        orderItem.pizza +
                        " by " +
                        orderItem.nick +
                        " has been added again.",
                    duration: 5000
                });
            }
        });
    };

    undoRemoveOrderItem = orderItem => {
        const { nick, pizza, order } = orderItem;

        OrderItems.insert({
            order,
            nick,
            pizza,
            createdAt: new Date()
        });
    };

    render() {
        const { error, orderItems, onClickPizza, timerStarted } = this.props;

        var pizzas = _.groupBy(orderItems, "pizza");

        pizzas = _.map(pizzas, (value, key) => {
            value = {
                name: key,
                items: value
            };
            return value;
        });

        pizzas = _.sortBy(pizzas, function(pizza) {
            return -pizza.items.length;
        });

        const pizzaElements = _.map(pizzas, value => (
            <PizzaItem
                key={value.name}
                timerStarted={timerStarted}
                onClickPizza={onClickPizza}
                onClickRemove={this.removeOrderItem}
                pizzaName={value.name}
                items={value.items}
            />
        ));

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
                                {pizzaElements}

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
