import React, { Component } from "react";
import _ from "lodash";
import styled from "styled-components";

import { OrderItems } from "../../../../../../api/order_items";

import PizzaItem from "./elements/pizza-item";

import {
    DigitText,
    DigitLayout,
    DigitIfElseRendering,
    DigitDesign,
    DigitButton,
    DigitTooltip
} from "@cthit/react-digit-components";

const ItemsContainer = styled.div`
    max-width: calc(100vw - 32px);
    width: 100%;
    overflow-x: auto;

    > * {
        margin-top: 8px;
        margin-bottom: 8px;
    }
`;

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

    copyNamesToClipboard = () => {
        const orderItems = this.props.orderItems;
        const nicks = orderItems.map(item => item.nick).join("\n");
        try {
            navigator.clipboard.writeText(nicks);
            this.props.openToast({
                text: "Copied to clipboard"
            });
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    }

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
        const { orderItems, onClickPizza, timerStarted } = this.props;

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
                            <DigitLayout.Column marginVertical={"16px"}>
                                <ItemsContainer>{pizzaElements}</ItemsContainer>
                                <hr />
                                <DigitLayout.Row justifyContent="space-between">
                                    <DigitText.Text
                                        text={
                                            "Total items: " + orderItems.length
                                        }
                                    />
                                    <DigitDesign.CardButtons reverseDirection>
                                        <DigitButton
                                            disabled={this.props.orderItems.length == 0}
                                            primary
                                            outlined
                                            text="Copy names to clipboard"
                                            onClick={this.copyNamesToClipboard}
                                        />
                                    </DigitDesign.CardButtons>
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
