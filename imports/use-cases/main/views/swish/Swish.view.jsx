import React, { Component } from "react";

import {
    DigitEditData,
    DigitTextField,
    DigitLayout,
    DigitText,
    DigitDesign,
    DigitButton
} from "@cthit/react-digit-components";

import * as yup from "yup";

import QRCode from "qrcode.react";

export default class Swish extends Component {
    openSwish = () => {
        const { swishNbr, hash } = this.props.order;
        const jsonString = JSON.stringify({
            version: 1,
            payee: { value: swishNbr },
            message: { editable: true, value: "EatIT " + hash }
        });

        window.location = encodeURI("swish://payment?data=" + jsonString);
    };

    renderSwishQrCode = () => {
        const { swishNbr, hash } = this.props.order;

        const swishQrString = `C${swishNbr};;${"EatIT " + hash};6`;

        return (
            <div className="center-qr">
                <QRCode value={swishQrString} />
            </div>
        );
    };

    onSubmit = event => {
        event.preventDefault();

        let { swishName, swishNbr } = this.state;

        swishName = swishName.trim();
        swishNbr = swishNbr.trim();

        if (swishNbr) {
            this.props.submitSwishInfo({ swishNbr, swishName });
        }
    };

    renderSwishForm = () => {
        const { openToast, openDialog } = this.props;

        return (
            <DigitEditData
                onSubmit={(values, actions) => {
                    openDialog({
                        title: "Are you sure?",
                        description: "Settings swish options cannot be undone.",
                        confirmButtonText: "Yes",
                        cancelButtonText: "Cancel",
                        onConfirm: () => {
                            this.setState({
                                showSwish: true
                            });
                            this.props.submitSwishInfo(values);
                            openToast({
                                text: "Swish options has been set",
                                duration: 3000
                            });
                        }
                    });

                    actions.setSubmitting(false);
                }}
                initialValues={{ swishName: null, swishNbr: null }}
                validationSchema={yup.object().shape({
                    swishName: yup
                        .string()
                        .max(50, "Please enter a valid name")
                        .required(
                            "You have to enter a name so that people can confirm that they typed the phone number correctly."
                        ),
                    swishNbr: yup
                        .string()
                        .max(15, "Please enter a phone number")
                        .required()
                })}
                titleText="Swish"
                submitText="Submit"
                keysOrder={["swishName", "swishNbr"]}
                keysComponentData={{
                    swishName: {
                        component: DigitTextField,
                        componentProps: {
                            upperLabel: "Swish",
                            outlined: true
                        }
                    },
                    swishNbr: {
                        component: DigitTextField,
                        componentProps: {
                            upperLabel: "Phone number",
                            outlined: true
                        }
                    }
                }}
            />
        );
    };

    renderSwishInfo = () => {
        const {
            order: { swishNbr, swishName }
        } = this.props;
        return (
            <DigitDesign.Card maxWidth={"600px"} width={"600px"}>
                <DigitDesign.CardBody>
                    <DigitLayout.Column>
                        <DigitText.Title text={swishNbr + " - " + swishName} />
                        <DigitButton
                            text={"Tap to pay with Swish"}
                            onClick={this.openSwish}
                        />
                        {swishNbr && (
                            <>
                                <p id="swish-notice">
                                    Link only works on mobile devices with the
                                    Swish app installed, alternatively you can
                                    scan this code with the Swish app:
                                </p>
                                {this.renderSwishQrCode()}
                            </>
                        )}
                    </DigitLayout.Column>
                </DigitDesign.CardBody>
            </DigitDesign.Card>
        );
    };

    render() {
        const {
            order: { swishNbr }
        } = this.props;

        return swishNbr ? this.renderSwishInfo() : this.renderSwishForm();
    }
}
