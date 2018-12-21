import React, { Component } from "react";

import CountDownView from "../count-down";

export default class Timer extends Component {
    state = { value: "" };

    onSubmit = event => {
        event.preventDefault();

        const minutesFromNow = parseInt(this.state.value.trim(), 10);

        if (!minutesFromNow) {
            return;
        } else if (confirm("Are you sure?")) {
            const timeEnd = new Date().valueOf() + minutesFromNow * 60000;
            this.props.setTimer(timeEnd);
        }
    };

    render() {
        const { timerStarted, timeEnd, onExpiry } = this.props;
        const { value } = this.state;

        if (timerStarted) {
            return (
                <div className="container-part">
                    <div className="container-content">
                        <h3 className="text-extra-style">
                            🕑 Time until food's ready:
                        </h3>
                        <CountDownView timeEnd={timeEnd} onExpiry={onExpiry} />
                    </div>
                </div>
            );
        } else {
            return (
                <div
                    className="timer-area container-part"
                    id="count-down-timer"
                >
                    <div className="container-content">
                        <h3>
                            <label id="timer-box-label">
                                🕑 Enter time until delivery
                            </label>
                        </h3>
                        <div className="timer-box">
                            <form
                                className="start-timer"
                                onSubmit={this.onSubmit}
                            >
                                <input
                                    type="integer"
                                    name="minutes"
                                    placeholder="Minutes"
                                    onInput={e =>
                                        this.setState({ value: e.target.value })
                                    }
                                    value={value}
                                />
                                <button className="button">Start</button>
                                <div className="clear" />
                            </form>
                        </div>
                    </div>
                </div>
            );
        }
    }
}
