import React, { Component } from "react";
import { OrderItems } from "../../../../../../api/order_items";

import {
    DigitDesign,
    DigitEditData,
    DigitLayout,
    DigitText,
    DigitTextField,
    DigitForm,
    DigitButton,
    DigitFormField
} from "@cthit/react-digit-components";

import * as yup from "yup";

const MAX_LENGTH_PIZZA = 150;
const MAX_LENGTH_NICK = 30;

class OrderBox extends Component {
    constructor(props) {
        super(props);
        this.formikFormRef = React.createRef();
    }

    setPizzaField = pizza => {
        this.formikFormRef.current.setFieldValue("pizza", pizza);
    };

    render() {
        const { openToast, orderId } = this.props;

        return (
            <DigitLayout.Size
                minWidth={"280px"}
                maxWidth={"600px"}
                width={"100%"}
            >
                <DigitForm
                    initialValues={{ pizza: "", nick: "" }}
                    validationSchema={yup.object().shape({
                        pizza: yup
                            .string()
                            .trim()
                            .max(
                                MAX_LENGTH_PIZZA,
                                "Food item can at most be 150 characters long"
                            )
                            .required("You have to enter what you want to eat"),
                        nick: yup
                            .string()
                            .trim()
                            .max(
                                MAX_LENGTH_NICK,
                                "Nick can at most be 30 characters long"
                            )
                            .required(
                                "You have to enter an identifiable name or nick"
                            )
                    })}
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
                                    actions.resetForm();
                                    actions.setSubmitting(false);
                                    openToast({
                                        text:
                                            "You have added " +
                                            pizza +
                                            " as " +
                                            nick,
                                        duration: 6000,
                                        actionText: "Undo",
                                        actionHandler: () => {
                                            OrderItems.remove(
                                                { _id: doc },
                                                () => {
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
                    render={props => (
                        <DigitDesign.Card>
                            <DigitDesign.CardTitle text={"Place your order"} />
                            <DigitDesign.CardBody>
                                <DigitLayout.Column>
                                    <FormikPropsHolder
                                        ref={this.formikFormRef}
                                        formik={props}
                                    />
                                    <DigitFormField
                                        name={"pizza"}
                                        component={DigitTextField}
                                        componentProps={{
                                            outlined: true,
                                            upperLabel: "Food item",
                                            lowerLabel:
                                                "Enter what you want to eat"
                                        }}
                                    />
                                    <DigitFormField
                                        name={"nick"}
                                        component={DigitTextField}
                                        componentProps={{
                                            outlined: true,
                                            upperLabel: "Nick",
                                            lowerLabel:
                                                "Enter an identifiable name or nick"
                                        }}
                                    />
                                </DigitLayout.Column>
                            </DigitDesign.CardBody>
                            <DigitDesign.CardButtons reverseDirection>
                                <DigitButton
                                    disabled={
                                        props.isSubmitting || !props.isValid
                                    }
                                    primary
                                    raised
                                    submit
                                    text={"Add order"}
                                />
                            </DigitDesign.CardButtons>
                        </DigitDesign.Card>
                    )}
                />
            </DigitLayout.Size>
        );
    }
}

export default OrderBox;

class FormikPropsHolder extends React.Component {
    state = {
        setFieldValue: null
    };

    constructor(props) {
        super(props);

        this.state = {
            setFieldValue: props.formik.setFieldValue
        };
    }

    setFieldValue = (field, value) => {
        this.state.setFieldValue(field, value);
    };

    render() {
        return null;
    }
}
