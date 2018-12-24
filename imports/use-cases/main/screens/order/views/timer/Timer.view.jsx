import React from "react";
import CountDownView from "../count-down";
import * as yup from "yup";
import {
    DigitEditData,
    DigitTextField,
    DigitDesign,
    DigitLayout,
    DigitText,
    DigitSwitch
} from "@cthit/react-digit-components";

const Timer = ({
    timerStarted,
    timeEnd,
    onExpiry,
    openToast,
    openDialog,
    setTimer,
    hasOrders,
    setPlayEatITSong
}) => {
    if (timerStarted) {
        return (
            <DigitDesign.Card
                width={"100%"}
                maxWidth={"600px"}
                minWidth={"300px"}
            >
                <DigitDesign.CardTitle text={"Time until food's ready"} />
                <DigitDesign.CardBody>
                    <DigitLayout.Center>
                        <CountDownView timeEnd={timeEnd} onExpiry={onExpiry} />
                    </DigitLayout.Center>
                </DigitDesign.CardBody>
            </DigitDesign.Card>
        );
    } else if (!hasOrders) {
        return (
            <DigitDesign.Card
                minHeight={"150px"}
                minWidth={"300px"}
                maxWidth={"600px"}
                width={"100%"}
            >
                <DigitDesign.CardTitle text={"Enter time until delivery"} />
                <DigitDesign.CardBody>
                    <DigitLayout.Center>
                        <DigitText.Title
                            text={
                                "There must exist orders to be able to set a timer"
                            }
                        />
                    </DigitLayout.Center>
                </DigitDesign.CardBody>
            </DigitDesign.Card>
        );
    } else {
        return (
            <DigitEditData
                width={"100%"}
                maxWidth={"600px"}
                minWidth={"300px"}
                onSubmit={(values, actions) => {
                    const minutesFromNow = parseInt(values.minutes, 10);

                    openDialog({
                        title: "Are you sure? ",
                        description: "You cannot reverse this step.",
                        cancelButtonText: "Cancel",
                        confirmButtonText: "Yes",
                        onConfirm: () => {
                            const timeEnd =
                                new Date().valueOf() + minutesFromNow * 60000;
                            setTimer(timeEnd);
                            setPlayEatITSong(values.playEatITSong);
                            openToast({
                                text: "Timer has been started",
                                duration: 3000
                            });
                        }
                    });
                    actions.setSubmitting(false);
                }}
                initialValues={{ playEatITSong: true }}
                validationSchema={yup.object().shape({
                    minutes: yup
                        .number()
                        .moreThan(0, "Must be a positive number")
                        .required("This field is required to start a timer"),
                    playEatITSong: yup.bool().required()
                })}
                titleText="Enter time until delivery"
                submitText="Set timer"
                keysOrder={["minutes", "playEatITSong"]}
                keysComponentData={{
                    minutes: {
                        component: DigitTextField,
                        componentProps: {
                            outlined: true,
                            upperLabel: "Minutes",
                            lowerLabel:
                                "The number of minutes until the food is here",
                            numbersOnly: true
                        }
                    },
                    playEatITSong: {
                        component: DigitSwitch,
                        componentProps: {
                            primary: true,
                            label: "Play EatIT video after the timer is done"
                        }
                    }
                }}
            />
        );
    }
};

export default Timer;
