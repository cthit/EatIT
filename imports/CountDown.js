import React, { Component } from "react";

export default class CountDown extends Component {
  state = {
    timeLeft: null
  };

  componentDidMount() {
    const date = new Date();
    const seconds = parseInt((this.props.timeEnd - date) / 1000);
    this.expired = seconds <= 1;

    if (this.expired) {
      this.props.onExpiry();
    }

    setTimeout(this.updateTimer, 500);
  }

  updateTimer = () => {
    const date = new Date();
    let seconds = parseInt((this.props.timeEnd - date) / 1000);

    if (!this.expired && seconds <= 1) {
      this.expired = true;
      this.props.onExpiry();
    }

    const mins = parseInt(seconds / 60);
    seconds = seconds % 60;
    let time = [mins, seconds];

    let prefix = "";
    if (time[0] < 0 || time[1] < 0) {
      prefix = "-";
    }

    time = time.map(Math.abs).map(t => (t < 10 ? "0" + t : t));

    this.setState({ timeLeft: prefix + time.join(":") });

    setTimeout(this.updateTimer, 500);
  };

  render() {
    const { timeLeft } = this.state;
    return (
      <div className="timer-box">
        <span className="timer">{timeLeft}</span>
      </div>
    );
  }
}
