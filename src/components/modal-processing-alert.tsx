import { AppContext } from '@/custom/app-context';
import { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';

export interface IShowAlert {
    showAlert?: boolean;
    message?: string;
}

export default function ModalProcessingAlert({ showAlert }: { showAlert?: boolean | IShowAlert }) {
    const appContext = useContext(AppContext);

    const t: Function = appContext.translation.t;

    let show: boolean | undefined = false;

    if (typeof showAlert === "boolean") {
        show = showAlert;
    } else {
        show = showAlert?.showAlert;
    }

    let message: string | undefined = undefined;

    if (typeof showAlert !== "boolean") {
        message = showAlert?.message;
    }

    return (
        <Modal show={show ?? false} backdrop="static" keyboard={false} centered>
            <Modal.Body>
                <div className="d-flex justify-content-center align-items-center m-3">
                    <div className="me-4">
                        <i className="fa-solid fa-spinner fa-spin fa-2xl"></i>
                    </div>
                    <div>
                        {message ?? t("ModalProcessingAlert.ProcessingRequestPleaseWait")}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}