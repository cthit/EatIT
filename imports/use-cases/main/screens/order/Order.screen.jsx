import React from "react";
import { Orders } from "../../../../api/orders";
import Share from "./views/share";
import Pizzas from "./views/pizzas";
import OrderBox from "./elements/order-box";
import Timer from "./views/timer";
import Swish from "./views/swish";

import YouTube from "react-youtube";
import styled from "styled-components";

import { DigitLayout, DigitDesign } from "@cthit/react-digit-components";
import { withTracker } from "meteor/react-meteor-data";
import { OrderItems } from "../../../../api/order_items";

const StyledYoutube = styled(({ ...rest }) => <YouTube {...rest} />)`
    width: calc(100%);
`;

class Order extends React.Component {
    state = {
        expired: false
    };

    onClickPizza = pizza => {
        this.setPizza(pizza);
        this.nickInput.focus();
    };

    onPlayerReady = event => {
        this.player = event.target;

        this.tryPlayVideo();
    };

    tryPlayVideo = () => {
        if (
            this.player &&
            this.state.expired &&
            this.props.order.playEatITSong
        ) {
            this.player.seekTo(51);
        }
    };

    onTimerExpired = () => {
        this.setState({
            expired: true
        });
        this.tryPlayVideo();
    };

    setPlayEatITSong = playEatITSong => {
        Orders.update(this.props.order._id, {
            $set: { playEatITSong: playEatITSong }
        });
    };

    setTimer = timerEnd => {
        Orders.update(this.props.order._id, { $set: { timer_end: timerEnd } });
    };

    setSwishInfo = ({ swishName, swishNbr }) => {
        Orders.update(this.props.order._id, { $set: { swishName, swishNbr } });
    };

    render() {
        const { order, orderItems } = this.props;
        const { expired } = this.state;

        const timerStarted = Boolean(order && order.timer_end);

        return (
            <DigitLayout.Column centerHorizontal marginVertical={"4px"}>
                <Share url={window.location.href} />
                <Pizzas
                    timerStarted={timerStarted}
                    onClickPizza={this.onClickPizza}
                    orderId={order._id}
                    orderItems={orderItems}
                />
                {!timerStarted && (
                    <OrderBox
                        inputRef={nick => (this.nickInput = nick)}
                        orderId={order._id}
                    />
                )}
                <Timer
                    hasOrders={orderItems.length > 0}
                    onExpiry={this.onTimerExpired}
                    setTimer={this.setTimer}
                    setPlayEatITSong={this.setPlayEatITSong}
                    timeEnd={order.timer_end}
                    timerStarted={timerStarted}
                />
                <Swish order={order} submitSwishInfo={this.setSwishInfo} />

                {expired && order.playEatITSong && (
                    <DigitDesign.Card
                        minWidth="300px"
                        maxWidth="600px"
                        width={"100%"}
                    >
                        <DigitDesign.CardBody>
                            <StyledYoutube
                                opts={{
                                    playerVars: {
                                        controls: 0,
                                        disablekb: 0,
                                        loop: 1,
                                        modestbranding: 1
                                    }
                                }}
                                videoId="ZcJjMnHoIBI"
                                onReady={this.onPlayerReady}
                            />
                        </DigitDesign.CardBody>
                    </DigitDesign.Card>
                )}
            </DigitLayout.Column>
        );
    }
}

export default withTracker(({ order }) => {
    return {
        orderItems: OrderItems.find({ order: order._id }).fetch()
    };
})(Order);
