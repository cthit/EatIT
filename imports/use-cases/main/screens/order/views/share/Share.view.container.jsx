import { connect } from "react-redux";

import { DigitToastActions } from "@cthit/react-digit-components";

import Share from "./Share.view";

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
    openToast: toastData =>
        dispatch(DigitToastActions.digitToastOpen(toastData))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Share);
