import Modal from 'react-bootstrap/Modal';

export default function ModalProcessingAlert({ showAlert, message }: { showAlert?: boolean, message?: string }) {
    const defaultMessage: string = "Processing request. Please wait.";

    return (
        <Modal show={showAlert ?? false} backdrop="static" keyboard={false} centered>
            <Modal.Body>
                <div className="d-flex justify-content-center align-items-center m-3">
                    <div className="me-4">
                        <i className="fa-solid fa-spinner fa-spin fa-2xl"></i>
                    </div>
                    <div>
                        {message ?? defaultMessage}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}