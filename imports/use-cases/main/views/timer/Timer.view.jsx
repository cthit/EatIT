import React from "react";
import CountDownView from "../count-down";
import * as yup from "yup";
import {
    DigitEditData,
    DigitTextField,
    DigitDesign
} from "@cthit/react-digit-components";

const Timer = ({
    timerStarted,
    timeEnd,
    onExpiry,
    openToast,
    openDialog,
    setTimer
}) => {
    if (timerStarted) {
        return (
            <DigitDesign.Card>
                <DigitDesign.CardTitle text={"Time until food's ready"} />
                <DigitDesign.CardBody>
                    <CountDownView timeEnd={timeEnd} />
                </DigitDesign.CardBody>
            </DigitDesign.Card>
        );
    } else {
        return (
            <DigitEditData
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
                            openToast({
                                text: "Timer has been started",
                                duration: 3000
                            });
                        }
                    });
                    actions.setSubmitting(false);
                }}
                initialValues={{}}
                validationSchema={yup.object().shape({
                    minutes: yup
                        .number()
                        .moreThan(0, "Must be a positive number")
                        .required("This field is required to start a timer")
                })}
                titleText="Enter time until delivery"
                submitText="Set timer"
                keysOrder={["minutes"]}
                keysComponentData={{
                    minutes: {
                        component: DigitTextField,
                        componentProps: {
                            outlined: true,
                            upperLabel: "Minutes",
                            numbersOnly: true
                        }
                    }
                }}
            />
        );
    }
};

export default Timer;
