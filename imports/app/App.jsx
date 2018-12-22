import React, { Component } from "react";
import Main from "../use-cases/main";

import { DigitToast, DigitDialog } from "@cthit/react-digit-components";

class App extends Component {
    render() {
        return (
            <>
                <DigitDialog />
                <DigitToast />
                <Main hash={this.props.hash} />
            </>
        );
    }
}

export default App;
