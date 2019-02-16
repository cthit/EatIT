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

    renderLinkToMenu = restaurant => {
        if (restaurant == null) {
            return (
                <>
                    <DigitText.Text text="Don't know what you want yet?" />
                    <DigitTooltip text="Mat vid campus Johanneberg">
                        <NoStyleLink
                            href="https://mat.chalmers.it"
                            target="_blank"
                        >
                            <DigitText.Text bold text="mat.chalmers.it" />
                        </NoStyleLink>
                    </DigitTooltip>
                </>
            );
        } else {
            if (!restaurant.linkToMenu.startsWith("http")) {
                restaurant.linkToMenu =
                    "https://mat.chalmers.it" + restaurant.linkToMenu;
            }
            return (
                <>
                    <DigitLayout.Row>
                        <DigitText.Text
                            text={"This EatIT are ordering from: "}
                        />
                        <DigitText.Text text={restaurant.restaurantName} bold />
                    </DigitLayout.Row>
                    <DigitLayout.Row>
                        <DigitText.Text text={"Link to menu: "} />
                        <NoStyleLink
                            href={restaurant.linkToMenu}
                            target="_blank"
                        >
                            <DigitText.Text bold text={restaurant.linkToMenu} />
                        </NoStyleLink>
                    </DigitLayout.Row>
                </>
            );
        }
    };

    render() {
        const { url, restaurant } = this.props;
        const { showQr } = this.state;

        return (
            <DigitDesign.Card minWidth="300px" maxWidth="600px" width={"100%"}>
                <DigitDesign.CardTitle text={"Share"} />
                <DigitDesign.CardBody>
                    <DigitLayout.Column centerVertical flexWrap={"wrap"}>
                        <DigitLayout.Row flexWrap={"wrap"}>
                            {this.renderLinkToMenu(restaurant)}
                        </DigitLayout.Row>
                        <DigitLayout.Row flexWrap={"wrap"}>
                            <DigitText.Text
                                text={"Share this link with your friends: "}
                            />
                            <DigitTooltip text="Click to copy link to clipboard ">
                                <NoStyleLink
                                    onClick={this.onClickCopyLink}
                                    href={url}
                                >
                                    <DigitText.Text bold text={url} />
                                </NoStyleLink>
                            </DigitTooltip>
                        </DigitLayout.Row>
                        <DigitButton
                            outlined
                            text={showQr ? "Hide QR code" : "Show QR code"}
                            onClick={() =>
                                this.setState(({ showQr }) => ({
                                    showQr: !showQr
                                }))
                            }
                        />
                        <DigitLayout.Row center>
                            <DigitLayout.Hide hidden={!showQr}>
                                <QRCode value={url} />
                            </DigitLayout.Hide>
                        </DigitLayout.Row>
                    </DigitLayout.Column>
                </DigitDesign.CardBody>
            </DigitDesign.Card>
        );
    }
}
