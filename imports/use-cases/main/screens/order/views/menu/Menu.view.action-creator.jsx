import axios from "axios";
import {
    LOAD_RESTAURANT_FAILED,
    LOAD_RESTAURANT_SUCCESSFULLY
} from "./Menu.view.actions";

export function createLoadRestaurants() {
    return dispatch => {
        return new Promise((resolve, reject) => {
            axios
                .get("https://mat.chalmers.it/api/mat.json")
                .then(response => {
                    dispatch(
                        createLoadRestaurantsSuccessfully(
                            _.map(response.data, value => ({
                                restaurantName: value.name,
                                linkToMenu: value.link_to_menu
                            }))
                        )
                    );
                    resolve(response.data);
                })
                .catch(error => {
                    dispatch(createLoadRestaurantsFailed());
                    reject(error);
                });
        });
    };
}

function createLoadRestaurantsSuccessfully(restaurants) {
    return {
        type: LOAD_RESTAURANT_SUCCESSFULLY,
        error: false,
        payload: {
            restaurants: restaurants
        }
    };
}

function createLoadRestaurantsFailed() {
    return {
        type: LOAD_RESTAURANT_FAILED,
        error: true
    };
}
