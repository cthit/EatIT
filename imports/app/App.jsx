import React, { Component } from "react";
import Main from "../use-cases/main";

import { DigitToast } from "@cthit/react-digit-components";

class App extends Component {
    render() {
        return (
            <>
                <DigitToast />
                <Main hash={this.props.hash} />
            </>
        );
    }
}

export default App;
