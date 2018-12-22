import React, { Component } from "react";
import styled from "styled-components";
import QRCode from "qrcode.react";

import {
    DigitLayout,
    DigitText,
    DigitDesign,
    DigitTooltip,
    DigitButton
} from "@cthit/react-digit-components";

const NoStyleLink = styled.a`
    text-decoration: None;
`;

export default class Share extends Component {
    state = { showQr: false };

    onClickCopyLink = event => {
        const { openToast } = this.props;

        event.preventDefault();
        // Create an auxiliary hidden input
        const aux = document.createElement("input");
        // Get the text from the element passed into the input
        aux.setAttribute("value", this.props.url);
        // Append the aux input to the body
        document.body.appendChild(aux);
        // Highlight the content
        aux.select();
        // Execute the copy command
        document.execCommand("copy");
        // Remove the input from the body
        document.body.removeChild(aux);

        openToast({
            text: "Link copied!",
            duration: 3000
        });
    };

    render() {
        const { url } = this.props;
        const { showQr } = this.state;

        return (
            <>
                <DigitLayout.Spacing />
                <DigitDesign.Card maxWidth="800px">
                    <DigitDesign.CardBody>
                        <DigitLayout.Column
                            center
                            margin={"2px"}
                            padding={"2px"}
                        >
                            <DigitLayout.Row>
                                <DigitText.Title text="Don't know what you want yet? " />
                                <DigitLayout.Spacing />
                                <DigitTooltip text="Mat vid campus Johanneberg">
                                    <NoStyleLink
                                        href="https://mat.chalmers.it"
                                        target="_blank"
                                    >
                                        <DigitText.Title text="mat.chalmers.it" />
                                    </NoStyleLink>
                                </DigitTooltip>
                            </DigitLayout.Row>
                            <DigitLayout.Spacing />
                            <DigitLayout.Row>
                                <DigitText.Title
                                    text={"Share this link with your friends: "}
                                />
                                <DigitLayout.Spacing />
                                <DigitTooltip text="Click to copy link to clipboard ">
                                    <NoStyleLink
                                        onClick={this.onClickCopyLink}
                                        href={url}
                                    >
                                        <DigitText.Title text={url} />
                                    </NoStyleLink>
                                </DigitTooltip>
                            </DigitLayout.Row>
                            <DigitLayout.Spacing />
                            <DigitButton
                                outlined
                                text={showQr ? "Hide QR code" : "Show QR code"}
                                onClick={() =>
                                    this.setState(({ showQr }) => ({
                                        showQr: !showQr
                                    }))
                                }
                            />
                            <DigitLayout.Row>
                                <DigitLayout.Hide hidden={!showQr}>
                                    <QRCode value={url} />
                                </DigitLayout.Hide>
                            </DigitLayout.Row>
                        </DigitLayout.Column>
                    </DigitDesign.CardBody>
                </DigitDesign.Card>
            </>
        );
    }
}
