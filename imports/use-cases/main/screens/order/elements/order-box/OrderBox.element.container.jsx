import { connect } from "react-redux";

import OrderBox from "./OrderBox.element";
import { DigitToastActions } from "@cthit/react-digit-components";

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
    openToast: toastData =>
        dispatch(DigitToastActions.digitToastOpen(toastData))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: true }
)(OrderBox);
