import React, { Component } from "react";
import { Orders } from "../../api/orders";
import { withTracker } from "meteor/react-meteor-data";

import Error from "./screens/error";
import Order from "./screens/order";
import Loading from "./screens/loading";

import { DigitLayout } from "@cthit/react-digit-components";

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            oneSecondPassed: false
        };

        const self = this;

        setTimeout(() => {
            self.setState({
                oneSecondPassed: true
            });
        }, 1000);
    }

    render() {
        const { order, hash } = this.props;
        const { oneSecondPassed } = this.state;

        return (
            <DigitLayout.Padding>
                {!order && !oneSecondPassed && <Loading />}
                {!order && oneSecondPassed && <Error hash={hash} />}
                {order && <Order order={order} />}
            </DigitLayout.Padding>
        );
    }
}

export default withTracker(({ hash }) => ({
    order: Orders.findOne({ hash })
}))(Main);
