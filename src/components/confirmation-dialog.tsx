import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ComponentProps, ElementType, ReactNode, forwardRef, useContext } from 'react';
import { AppContext } from '@/custom/app-context';
import classNames from 'classnames';

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
                <div className="row w-100">
                    <div className="col-12 d-flex justify-content-end align-items-center gap-1">
                        {(buttons == undefined || buttons === ConfirmationDialogButtons.Ok || buttons === ConfirmationDialogButtons.OkCancel) && (
                            <button type="button" className="btn btn-outline-dark btn-sm w-sm-100" onClick={() => dialogOkClick()}>{t("Common.Buttons.Ok")}</button>
                        )}

                        {buttons === ConfirmationDialogButtons.YesNo && (
                            <>
                                <button type="button" className="btn btn-outline-dark btn-sm w-sm-100" onClick={() => dialogYesClick()}>{t("Common.Buttons.Yes")}</button>
                                <button type="button" className="btn btn-outline-dark btn-sm w-sm-100" onClick={() => dialogNoClick()}>{t("Common.Buttons.No")}</button>
                            </>
                        )}

                        {(buttons === ConfirmationDialogButtons.OkCancel || buttons === ConfirmationDialogButtons.YesNoCancel) && (
                            <button type="button" className="btn btn-outline-dark btn-sm w-sm-100" onClick={() => dialogCancelClick()}>{t("Common.Buttons.Cancel")}</button>
                        )}

                        {buttons === ConfirmationDialogButtons.Close && (
                            <button type="button" className="btn btn-outline-dark btn-sm w-sm-100" onClick={() => dialogCloseClick()}>{t("Common.Buttons.Close")}</button>
                        )}
                    </div>
                </div>
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