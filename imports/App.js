import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Orders } from "./api/orders";
import { compose, branch, renderComponent } from "recompose";
import YouTube from "react-youtube";

import Share from "./Share";
import Pizzas from "./Pizzas";
import OrderBox from "./OrderBox";
import Timer from "./Timer";
import Swish from "./Swish";

class App extends Component {
  state = {
    pizza: "",
    nick: ""
  };

  setPizza = pizza => this.setState({ pizza });
  setNick = nick => this.setState({ nick });

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
    const { pizza, nick } = this.state;

    const timerStarted = Boolean(order && order.timer_end);

    const error = !order;
    return (
      <React.Fragment>
        <div id="header">
          <header className="centered-body">
            <h1 id="eatit-header-text">
              <a href="/">🍕 EatIT</a>
            </h1>
          </header>
        </div>
        {!error && <Share url={window.location.href} />}
        <div className="content centered-body">
          {error ? (
            <div className="container-part">
              <div className="container-content">
                No session for this id, <a href="/">create new?</a>
              </div>
            </div>
          ) : (
            <React.Fragment>
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
                    setNick={this.setNick}
                    setPizza={this.setPizza}
                    pizza={pizza}
                    nick={nick}
                    inputRef={nick => (this.nickInput = nick)}
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
              <Swish order={order} submitSwishInfo={this.setSwishInfo} />
            </React.Fragment>
          )}
        </div>
        <YouTube
          className="youtubevideo"
          videoId="ZcJjMnHoIBI"
          onReady={this.onPlayerReady}
        />
      </React.Fragment>
    );
  }
}

export default withTracker(({ hash }) => ({
  order: Orders.findOne({ hash })
}))(App);
