import React from "react";

import _ from "lodash";

import {
    DigitEditData,
    DigitAutocompleteSelectSingle
} from "@cthit/react-digit-components";

class Menu extends React.Component {
    state = {
        hasTriedLoading: false
    };

    componentDidMount() {
        this.props
            .loadRestaurants()
            .then(response => {
                this.setState({
                    hasTriedLoading: true
                });
            })
            .catch(error => {
                this.setState({
                    hasTriedLoading: true
                });
            });
    }

    render() {
        const {
            hasOrders,
            hasMenu,
            loadRestaurantsSuccessfully,
            restaurants,
            setMenu
        } = this.props;
        const { hasTriedLoading } = this.state;

        if (
            !hasOrders &&
            !hasMenu &&
            hasTriedLoading &&
            loadRestaurantsSuccessfully
        ) {
            return (
                <DigitEditData
                    onSubmit={values => {
                        setMenu(
                            values.menu.label,
                            restaurants[values.menu.value].linkToMenu
                        );
                    }}
                    maxWidth={"600px"}
                    width={"100%"}
                    minWidth={"300px"}
                    titleText={"Set what menu from Chalmers"}
                    submitText={"Set menu"}
                    keysOrder={["menu"]}
                    keysComponentData={{
                        menu: {
                            component: DigitAutocompleteSelectSingle,
                            componentProps: {
                                upperLabel: "Restaurang",
                                lowerLabel:
                                    "Välj restaurang från vart ni ska köpa ifrån",
                                selectableValues: _.map(
                                    restaurants,
                                    (value, index) => ({
                                        label: value.restaurantName,
                                        value: index
                                    })
                                ),
                                outlined: true
                            }
                        }
                    }}
                />
            );
        } else if (hasTriedLoading && !hasOrders && !hasMenu) {
            return <div>hej</div>;
        } else {
            return null;
        }
    }
}

export default Menu;
