import React from "react";

import {
    DigitLayout,
    DigitButton,
    DigitDesign,
    DigitText
} from "@cthit/react-digit-components";
import styled from "styled-components";

const NoStyleLink = styled.a`
    text-decoration: None;
`;

const Error = ({ hash }) => (
    <DigitLayout.Center>
        <DigitDesign.Card>
            <DigitDesign.CardTitle text={"No session found"} />
            <DigitDesign.CardBody>
                <DigitLayout.Column>
                    <DigitText.Text text={"No session for the id: " + hash} />
                    <NoStyleLink href={"/"}>
                        <DigitButton
                            text={"Create new EatIT session"}
                            primary
                            raised
                        />
                    </NoStyleLink>
                </DigitLayout.Column>
            </DigitDesign.CardBody>
        </DigitDesign.Card>
    </DigitLayout.Center>
);

export default Error;
