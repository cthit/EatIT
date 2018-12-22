import React, { Component } from "react";
import Share from "./views/share";
import Pizzas from "./views/pizzas";
import OrderBox from "./views/order-box";
import Timer from "./views/timer";
import Swish from "./views/swish";
import YouTube from "react-youtube";
import { Orders } from "../../api/orders";
import { withTracker } from "meteor/react-meteor-data";

import {
    DigitButton,
    DigitHeader,
    DigitLayout
} from "@cthit/react-digit-components";

class Main extends Component {
    onClickPizza = pizza => {
        this.setPizza(pizza);
        this.nickInput.focus();
    };

    onPlayerReady = event => {
        this.player = event.target;

        this.tryPlayVideo();
    };

    tryPlayVideo = () => {
        if (this.player && this.expired) {
            this.player.seekTo(51);
        }
    };

    onTimerExpired = () => {
        this.expired = true;
        this.tryPlayVideo();
    };

    setTimer = timerEnd => {
        Orders.update(this.props.order._id, { $set: { timer_end: timerEnd } });
    };

    setSwishInfo = ({ swishName, swishNbr }) => {
        Orders.update(this.props.order._id, { $set: { swishName, swishNbr } });
    };

    render() {
        const { orders, order } = this.props;

        const timerStarted = Boolean(order && order.timer_end);

        const error = !order;

        return (
            <DigitHeader
                title="EatIT"
                renderMain={() => (
                    <DigitLayout.Column centerHorizontal>
                        {!error && <Share url={window.location.href} />}
                        <div className="content centered-body">
                            {error ? (
                                <div className="container-part">
                                    <div className="container-content">
                                        No session for this id,
                                        <a href="/">create new?</a>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="container-part">
                                        <Pizzas
                                            timerStarted={timerStarted}
                                            onClickPizza={this.onClickPizza}
                                            orderId={order._id}
                                        />
                                    </div>
                                    <div className="order-box container-part">
                                        {!timerStarted && (
                                            <OrderBox
                                                inputRef={nick =>
                                                    (this.nickInput = nick)
                                                }
                                                orderId={order._id}
                                            />
                                        )}
                                    </div>
                                    <Timer
                                        onExpiry={this.onTimerExpired}
                                        setTimer={this.setTimer}
                                        timeEnd={order.timer_end}
                                        timerStarted={timerStarted}
                                    />
                                    <Swish
                                        order={order}
                                        submitSwishInfo={this.setSwishInfo}
                                    />
                                </>
                            )}
                        </div>
                        <YouTube
                            className="youtubevideo"
                            videoId="ZcJjMnHoIBI"
                            onReady={this.onPlayerReady}
                        />
                    </DigitLayout.Column>
                )}
            />
        );
    }
}

export default withTracker(({ hash }) => ({
    order: Orders.findOne({ hash })
}))(Main);
