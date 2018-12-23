import React, { Component } from "react";
import Main from "../use-cases/main";

import {
    DigitToast,
    DigitDialog,
    DigitText,
    DigitHeader,
    DigitLayout
} from "@cthit/react-digit-components";

class App extends Component {
    render() {
        return (
            <>
                <DigitDialog />
                <DigitToast />
                <DigitHeader
                    title="EatIT"
                    renderMain={() => <Main hash={this.props.hash} />}
                    renderHeader={() => (
                        <DigitLayout.Column centerVertical margin={"16px"}>
                            <DigitText.Text
                                white
                                text={
                                    "All data is deleted after 24 hours automatically"
                                }
                            />
                        </DigitLayout.Column>
                    )}
                />
            </>
        );
    }
}

export default App;
