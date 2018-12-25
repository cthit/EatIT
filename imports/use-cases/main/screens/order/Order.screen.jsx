import React from "react";
import { Orders } from "../../../../api/orders";
import Share from "./views/share";
import Pizzas from "./views/pizzas";
import OrderBox from "./elements/order-box";
import Timer from "./views/timer";
import Swish from "./views/swish";
import Menu from "./views/menu";

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

    constructor(props) {
        super(props);

        this.orderBoxRef = React.createRef();
    }

    onClickPizza = pizza => {
        this.orderBoxRef.setPizzaField(pizza);
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

    setMenu = (restaurantName, linkToMenu) => {
        Orders.update(this.props.order._id, {
            $set: { restaurant: { restaurantName, linkToMenu } }
        });
    };

    render() {
        const { order, orderItems } = this.props;
        const { expired } = this.state;

        const timerStarted = Boolean(order && order.timer_end);

        const hasMenu =
            order != null &&
            order.restaurant != null &&
            order.restaurant.restaurantName != null;

        return (
            <DigitLayout.Column centerHorizontal marginVertical={"4px"}>
                <Share
                    restaurant={order.restaurant}
                    url={window.location.href}
                />
                <Swish order={order} submitSwishInfo={this.setSwishInfo} />
                <Pizzas
                    timerStarted={timerStarted}
                    onClickPizza={this.onClickPizza}
                    orderId={order._id}
                    orderItems={orderItems}
                />
                {!timerStarted && (
                    <OrderBox
                        orderId={order._id}
                        ref={connectedComponent => {
                            if (connectedComponent == null) {
                                return;
                            }
                            this.orderBoxRef = connectedComponent.getWrappedInstance();
                        }}
                    />
                )}
                <Menu
                    hasOrders={orderItems.length > 0}
                    hasMenu={hasMenu}
                    setMenu={this.setMenu}
                />
                <Timer
                    hasOrders={orderItems.length > 0}
                    onExpiry={this.onTimerExpired}
                    setTimer={this.setTimer}
                    setPlayEatITSong={this.setPlayEatITSong}
                    timeEnd={order.timer_end}
                    timerStarted={timerStarted}
                />

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
