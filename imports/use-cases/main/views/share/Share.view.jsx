import React, { Component } from "react";
import QRCode from "qrcode.react";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faQrcode from "@fortawesome/fontawesome-free-solid/faQrcode";

export default class Share extends Component {
    state = { showQr: false };

    onClickCopyLink = event => {
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
    };

    render() {
        const { url } = this.props;
        const { showQr } = this.state;

        return (
            <div className="container-part" id="share-link-container">
                <h2 className="text-extra-style">
                    Share this link with your friends:{" "}
                    <a
                        className="text-extra-style"
                        id="share-link"
                        onClick={this.onClickCopyLink}
                        data-tooltip="Copy link to clipboard"
                        href={url}
                    >
                        {url}
                    </a>{" "}
                    <span
                        className="toggle-share-link-qr"
                        onClick={() =>
                            this.setState(({ showQr }) => ({ showQr: !showQr }))
                        }
                    >
                        <FontAwesomeIcon icon={faQrcode} />
                    </span>
                </h2>
                <h2 className="text-extra-style">
                    Don't know what you want yet?{" "}
                    <a
                        className="text-extra-style"
                        id="mat-link"
                        data-tooltip="Mat vid campus Johanneberg"
                        href="https://mat.chalmers.it"
                        target="_blank"
                    >
                        mat.chalmers.it
                    </a>
                </h2>
                <div
                    className="center-qr"
                    style={{ display: showQr ? "block" : "none" }}
                >
                    <QRCode value={url} />
                </div>
            </div>
        );
    }
}
