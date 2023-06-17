import { ReactNode } from "react";

export default function Loading({ showLoading, children }: { showLoading?: boolean, children?: ReactNode }): any {
    if (showLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center m-3 p-3">
                <i className="fa-solid fa-spinner fa-spin fa-2xl"></i>
            </div>
        )
    } else {
        return children;
    }
}