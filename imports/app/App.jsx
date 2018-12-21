import React, { Component } from "react";
import Main from "../use-cases/main";

class App extends Component {
    render() {
        return <Main hash={this.props.hash} />;
    }
}

export default App;
