import { connect } from "react-redux";

import {
    DigitToastActions,
    DigitDialogActions
} from "@cthit/react-digit-components";

import Swish from "./Swish.view";

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
    openToast: toastData =>
        dispatch(DigitToastActions.digitToastOpen(toastData)),
    openDialog: dialogData =>
        dispatch(DigitDialogActions.digitDialogOpen(dialogData))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Swish);
