import { connect } from "react-redux";

import { createLoadRestaurants } from "./Menu.view.action-creator";

import Menu from "./Menu.view";

const mapStateToProps = state => ({
    loadRestaurantsSuccessfully: state.menu.loadRestaurantsSuccessfully,
    restaurants: state.menu.restaurants
});

const mapDispatchToProps = dispatch => ({
    loadRestaurants: () => dispatch(createLoadRestaurants())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Menu);
