import React, { Component } from "react";

import QRCode from "qrcode.react";

export default class Swish extends Component {
    state = {
        swishNbr: "",
        swishName: "",
        showSwish: false
    };

    openSwish = () => {
        const { swishNbr, hash } = this.props.order;
        const jsonString = JSON.stringify({
            version: 1,
            payee: { value: swishNbr },
            message: { editable: true, value: "EatIT " + hash }
        });

        this.setState({
            showSwish: true
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
        const { swishName, swishNbr } = this.state;

        return (
            <form className="submit-swish" onSubmit={this.onSubmit}>
                <input
                    type="text"
                    name="swishName"
                    onInput={e => this.setState({ swishName: e.target.value })}
                    value={swishName}
                    placeholder="Name (optional)"
                />
                <input
                    type="text"
                    name="swishNbr"
                    onInput={e =>
                        this.setState({
                            swishNbr: e.target.value.replace(/[^\d]/g, "")
                        })
                    }
                    value={swishNbr}
                    placeholder="Swish number"
                />
                <button className="button">Submit</button>
                <div className="clear" />
            </form>
        );
    };

    renderSwishInfo = () => {
        const {
            order: { swishNbr, swishName }
        } = this.props;
        const { showSwish } = this.state;
        return (
            <React.Fragment>
                <label>{swishName}</label>
                <label>{swishNbr}</label>
                <div
                    className="button"
                    id="swish-button"
                    onClick={this.openSwish}
                >
                    <img src="img/swish.png" alt="Swish" width="32" /> Tap to
                    pay with Swish
                </div>
                {showSwish && (
                    <React.Fragment>
                        <p id="swish-notice">
                            Link only works on mobile devices with the Swish app
                            installed, alternatively you can scan this code with
                            the Swish app:
                        </p>
                        {this.renderSwishQrCode()}
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    };

    render() {
        const {
            order: { swishNbr }
        } = this.props;

        return (
            <div className="timer-area container-part" id="swish-container">
                <div className="container-content">
                    <h3>💸 Swish to:</h3>
                    <div className="swish-box">
                        {swishNbr
                            ? this.renderSwishInfo()
                            : this.renderSwishForm()}
                    </div>
                </div>
            </div>
        );
    }
}
