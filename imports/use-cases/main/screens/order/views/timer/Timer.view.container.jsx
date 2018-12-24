import { connect } from "react-redux";

import {
    DigitToastActions,
    DigitDialogActions
} from "@cthit/react-digit-components";

import Timer from "./Timer.view";

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
)(Timer);
