import React from "react";
import { OrderItems } from "../../../../api/order_items";

import {
    DigitDesign,
    DigitEditData,
    DigitLayout,
    DigitText,
    DigitTextField
} from "@cthit/react-digit-components";

import * as yup from "yup";

const MAX_LENGTH_PIZZA = 100;
const MAX_LENGTH_NICK = 50;

const OrderBox = ({ openToast, orderId }) => (
    <DigitEditData
        minWidth={"280px"}
        maxWidth={"600px"}
        width={"100%"}
        initialValues={{ pizza: "", nick: "" }}
        onSubmit={(values, actions) => {
            let { pizza, nick } = values;

            OrderItems.insert(
                {
                    order: orderId,
                    pizza,
                    nick,
                    createdAt: new Date()
                },
                (error, doc) => {
                    if (!error) {
                        actions.setFieldValue("pizza", "");
                        actions.setSubmitting(false);
                        actions.setFieldError("pizza", false);
                        actions.setFieldError("nick", false);
                        openToast({
                            text: "You have added " + pizza + " as " + nick,
                            duration: 6000,
                            actionText: "Undo",
                            actionHandler: () => {
                                OrderItems.remove(
                                    { _id: doc },
                                    (error, doc) => {
                                        openToast({
                                            text:
                                                "You have undoed " +
                                                pizza +
                                                " as " +
                                                nick,
                                            duration: 6000
                                        });
                                    }
                                );
                            }
                        });
                    } else {
                        actions.setSubmitting(false);
                        openToast({
                            text: "Something went wrong...",
                            duration: 6000
                        });
                    }
                }
            );
        }}
        validationSchema={yup.object().shape({
            pizza: yup
                .string()
                .trim()
                .max(
                    MAX_LENGTH_PIZZA,
                    "Food item can at most be 50 characters long"
                )
                .required("You have to enter what you want to eat"),
            nick: yup
                .string()
                .trim()
                .max(MAX_LENGTH_NICK, "Nick can at most be 100 characters long")
                .required("You have to enter an identifiable name or nick")
        })}
        titleText={"Place your order"}
        submitText={"Add order"}
        keysOrder={["pizza", "nick"]}
        keysComponentData={{
            pizza: {
                component: DigitTextField,
                componentProps: {
                    outlined: true,
                    upperLabel: "Food item",
                    lowerLabel: "Enter what you want to eat"
                }
            },
            nick: {
                component: DigitTextField,
                componentProps: {
                    outlined: true,
                    upperLabel: "Nick",
                    lowerLabel: "Enter an identifiable name or nick"
                }
            }
        }}
    />
);

export default OrderBox;
