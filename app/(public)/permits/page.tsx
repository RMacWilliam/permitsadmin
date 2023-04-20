"use client"

import { Inter } from 'next/font/google'

import { useContext, useEffect } from 'react'
import { AppContext } from '@/app/AppContext';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

export default function PermitsPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = 'permits' });
    }, [])

    if (!appContext.data.isAuthenticated) {
        return null;
    }

    return (
        <>
            <h4>Snowmobiles &amp; Permits</h4>

            <div className="card w-100">
                <h5 className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        2010 Yamaha RS Venture GT JWMN2340928424 2AB133
                    </div>
                    <div>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-success">Transfer / Replace Permit</button>
                        <button className="btn btn-danger">Remove</button>
                    </div>
                </h5>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <div>
                            <b>Permit:</b> Seasonal - K0265293
                            <br /><b>Purchased:</b> 2022-10-31
                            <br /><b>Tracking #:</b> 292980921743_C1-92987434
                        </div>
                    </li>
                </ul>
                <div className="card-footer">
                    <i className="fa-solid fa-circle-info me-2"></i>This vehicle cannot be modified as a Ministry of Transportation Ontario Snowmobile Trail Permit has been registered to it.
                </div>
            </div>

            <div className="card w-100 mt-2">
                <h5 className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        2005 Yamaha Some Model DRFF2122030493 3ZZ877
                    </div>
                    <div>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-danger">Remove</button>
                    </div>
                </h5>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <h5 className="card-title">Select a permit to purchase</h5>

                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                            <label className="form-check-label" htmlFor="flexRadioDefault1">
                                None Selected
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked />
                            <label className="form-check-label" htmlFor="flexRadioDefault2">
                                Classic - $190.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault3" />
                            <label className="form-check-label" htmlFor="flexRadioDefault3">
                                Multi Day 4 - $180.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault4" />
                            <label className="form-check-label" htmlFor="flexRadioDefault4">
                                Multi Day 3 - $135.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault5" />
                            <label className="form-check-label" htmlFor="flexRadioDefault5">
                                Multi Day 2 - $90.00
                            </label>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <h5 className="card-title">Select a club</h5>

                        <select className="form-select" aria-label="Default select example">
                            <option selected>Please select your club</option>
                            <option value="1">Arctic Riders Snow Club</option>
                            <option value="2">Ontario Snow Club</option>
                        </select>

                        <div className="mt-2">- OR -</div>

                        <div className="mt-2">Can&apos;t find your club? Use the Club Locator Map and enter the closest town name to get started.
                            <select className="form-select" aria-label="Default select example">
                                <option selected>Club Locator</option>
                                <option value="1">Arctic Riders Snow Club</option>
                                <option value="2">Ontario Snow Club</option>
                            </select>

                            <div className="mt-2 fw-bold">
                                By choosing a specific club when buying a permit, you&apos;re directly helping that club groom and maintain the trails you enjoy riding most often,
                                so please buy where you ride and make your selection above.
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="card w-100 mt-2">
                <h5 className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        2022 Yamaha Vmax MRT00038472984 7ZZ332
                    </div>
                    <div>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-danger">Remove</button>
                    </div>
                </h5>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <h5 className="card-title">Select a permit to purchase</h5>

                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault1x" checked />
                            <label className="form-check-label" htmlFor="flexRadioDefault1x">
                                None Selected
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault2x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault2x">
                                Seasonal - $280.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault3x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault3x">
                                Multi Day 6 - $270.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault4x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault4x">
                                Multi Day 5 - $225.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault5x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault5x">
                                Multi Day 4 - $180.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault6x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault6x">
                                Multi Day 3 - $135.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault7x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault7x">
                                Multi Day 2 - $90.00
                            </label>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <h5 className="card-title">Select a club</h5>

                        <select className="form-select" aria-label="Default select example">
                            <option selected>Please select a club</option>
                            <option value="1">Arctic Riders Snow Club</option>
                            <option value="2">Ontario Snow Club</option>
                        </select>

                        <div className="mt-2">- OR -</div>

                        <div className="mt-2">Can&apos;t find your club? Use the Club Locator Map and enter the closest town name to get started.
                            <select className="form-select" aria-label="Default select example">
                                <option selected>Club Locator</option>
                                <option value="1">Arctic Riders Snow Club</option>
                                <option value="2">Ontario Snow Club</option>
                            </select>

                            <div className="mt-2 fw-bold">
                                By choosing a specific club when buying a permit, you&apos;re directly helping that club groom and maintain the trails you enjoy riding most often,
                                so please buy where you ride and make your selection above.
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <button className="btn btn-primary mt-3">Add Vehicle</button>
        </>
    )
}
