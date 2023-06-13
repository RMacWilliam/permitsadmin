import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ReactNode, useContext } from 'react';
import { AppContext } from '@/custom/app-context';

export enum ConfirmationDialogButtons {
    Ok = 0,
    OkCancel = 1,
    YesNo = 2,
    YesNoCancel = 3,
    Close = 4
}

export enum ConfirmationDialogIcons {
    Question = 0,
    Warning = 1,
    Information = 2
}

export default function ConfirmationDialog({ showDialog, title, message, errorMessage, buttons, icon, width, okClick, cancelClick, yesClick, noClick, closeClick, children }
    : {
        showDialog: boolean, title?: string, message?: string, errorMessage?: string, buttons?: ConfirmationDialogButtons, icon?: ConfirmationDialogIcons, width?: string,
        okClick?: Function, cancelClick?: Function, yesClick?: Function, noClick?: Function, closeClick: Function, children?: ReactNode
    }) {

    const appContext = useContext(AppContext);

    const t: Function = appContext.translation.t;

    if (buttons != undefined && buttons !== ConfirmationDialogButtons.Ok && buttons !== ConfirmationDialogButtons.OkCancel
        && buttons !== ConfirmationDialogButtons.YesNo && buttons !== ConfirmationDialogButtons.YesNoCancel && buttons !== ConfirmationDialogButtons.Close) {

        buttons = ConfirmationDialogButtons.Ok;
    }

    if (icon != undefined && icon !== ConfirmationDialogIcons.Question && icon !== ConfirmationDialogIcons.Warning && icon !== ConfirmationDialogIcons.Information) {
        icon = undefined
    }

    return (
        <Modal show={showDialog} onHide={() => closeClick()} backdrop="static" keyboard={false} dialogClassName={getDialogClassName()} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="container-fluid px-0">
                    {errorMessage != undefined && errorMessage !== "" && (
                        <div className="row">
                            <div className="row">
                                <div className="col-12">
                                    <div className="alert alert-danger" role="alert">
                                        {errorMessage}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="row">
                        <div className="col-12">
                            <div className="d-flex align-items-center">
                                <div>
                                    {icon === ConfirmationDialogIcons.Question && (
                                        <i className="fa-solid fa-circle-question text-warning fa-2xl"></i>
                                    )}
                                    {icon === ConfirmationDialogIcons.Warning && (
                                        <i className="fa-solid fa-circle-exclamation text-warning fa-2xl"></i>
                                    )}
                                    {icon === ConfirmationDialogIcons.Information && (
                                        <i className="fa-solid fa-circle-info text-warning fa-2xl"></i>
                                    )}
                                </div>
                                <div className="ms-3">
                                    {message == undefined && (
                                        <>
                                            {children}
                                        </>
                                    )}
                                    {message != undefined && (
                                        <>
                                            {message}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                {(buttons == undefined || buttons === ConfirmationDialogButtons.Ok || buttons === ConfirmationDialogButtons.OkCancel) && (
                    <Button variant="outline-dark" onClick={() => dialogOkClick()}>{t("Common.Ok")}</Button>
                )}

                {buttons === ConfirmationDialogButtons.YesNo && (
                    <>
                        <Button variant="outline-dark" onClick={() => dialogYesClick()}>{t("Common.Yes")}</Button>
                        <Button variant="outline-dark" onClick={() => dialogNoClick()}>{t("Common.No")}</Button>
                    </>
                )}

                {(buttons === ConfirmationDialogButtons.OkCancel || buttons === ConfirmationDialogButtons.YesNoCancel) && (
                    <Button variant="outline-dark" onClick={() => dialogCancelClick()}>{t("Common.Cancel")}</Button>
                )}

                {buttons === ConfirmationDialogButtons.Close && (
                    <Button variant="outline-dark" onClick={() => dialogCloseClick()}>{t("Common.Close")}</Button>
                )}
            </Modal.Footer>
        </Modal>
    )

    function getDialogClassName(): string {
        let result: string = "";

        if (width != undefined) {
            if (width === "50") {
                result = "modal-width-50-percent";
            } else if (width === "75") {
                result = "modal-width-75-percent";
            } else if (width === "90") {
                result = "modal-width-90-percent";
            }
        }

        return result;
    }

    function dialogOkClick(): void {
        if (okClick != undefined) {
            okClick();
        }
    }

    function dialogCancelClick(): void {
        if (cancelClick != undefined) {
            cancelClick();
        }
    }

    function dialogYesClick(): void {
        if (yesClick != undefined) {
            yesClick();
        }
    }

    function dialogNoClick(): void {
        if (noClick != undefined) {
            noClick();
        }
    }

    function dialogCloseClick(): void {
        if (closeClick != undefined) {
            closeClick();
        }
    }
}