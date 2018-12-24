import {
    LOAD_RESTAURANT_FAILED,
    LOAD_RESTAURANT_SUCCESSFULLY
} from "./Menu.view.actions";

export default function menu(state = {}, action) {
    switch (action.type) {
        case LOAD_RESTAURANT_SUCCESSFULLY:
            return {
                restaurants: action.payload.restaurants,
                loadRestaurantsSuccessfully: true
            };
        case LOAD_RESTAURANT_FAILED:
            return {
                loadRestaurantsSuccessfully: false
            };
        default:
            return state;
    }
}
