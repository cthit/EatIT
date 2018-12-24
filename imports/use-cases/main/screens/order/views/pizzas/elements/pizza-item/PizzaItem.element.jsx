import React, { Component } from "react";
import styled from "styled-components";

import {
    DigitLayout,
    DigitChip,
    DigitButton,
    DigitText
} from "@cthit/react-digit-components";

const NumberOfItems = styled.span`
    display: inline-block;
    border: 2px solid #2196f3;
    padding: 5px;
    border-radius: 50%;
    margin-right: 5px;
    color: #2196f3;
    text-align: center;
    font-family: "Roboto";
    font-size: 20px;
    width: 36px;
    line-height: 36px;
    max-height: 36px;
`;

export default class PizzaItem extends Component {
    render() {
        const { items, pizzaName, onClickRemove, timerStarted } = this.props;

        return (
            <DigitLayout.Row centerVertical justifyContent={"space-between"}>
                <DigitLayout.Row centerVertical>
                    <NumberOfItems>{items.length}</NumberOfItems>
                    <DigitText.Title text={pizzaName} />
                    <DigitLayout.Size maxWidth={"300px"}>
                        <DigitLayout.Row
                            flexWrap={"wrap"}
                            marginHorizontal={"4px"}
                        >
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
                    </DigitLayout.Size>
                </DigitLayout.Row>
            </DigitLayout.Row>
        );
    }
}
