import React, { Component } from "react";
import styled from "styled-components";

import AddIcon from "@material-ui/icons/Add";

import {
    DigitLayout,
    DigitChip,
    DigitText,
    DigitIconButton
} from "@cthit/react-digit-components";

const NumberOfItems = styled.span`
    display: inline-block;
    border: 2px solid #2196f3;
    border-radius: 50%;
    color: #2196f3;
    text-align: center;
    font-family: "Roboto";
    font-size: 20px;
    width: 36px;
    min-width: 36px;
    line-height: 36px;
    min-height: 36px;
    max-height: 36px;
    margin-left: 0px !important;
`;

export default class PizzaItem extends Component {
    render() {
        const {
            items,
            pizzaName,
            onClickRemove,
            onClickPizza,
            timerStarted
        } = this.props;

        return (
            <DigitLayout.Row
                centerVertical
                justifyContent={"space-between"}
                marginHorizontal={"0px"}
            >
                <DigitLayout.Row centerVertical marginHorizontal={"2px"}>
                    <NumberOfItems>{items.length}</NumberOfItems>
                    <DigitIconButton
                        icon={AddIcon}
                        onClick={
                            timerStarted ? null : () => onClickPizza(pizzaName)
                        }
                    />
                    <DigitText.Title text={pizzaName} />
                    <DigitLayout.Row marginHorizontal={"4px"}>
                        {items.map(item => (
                            <DigitChip
                                outlined
                                key={item._id}
                                label={item.nick}
                                onDelete={
                                    timerStarted
                                        ? null
                                        : () => onClickRemove(item)
                                }
                            />
                        ))}
                    </DigitLayout.Row>
                </DigitLayout.Row>
            </DigitLayout.Row>
        );
    }
}
