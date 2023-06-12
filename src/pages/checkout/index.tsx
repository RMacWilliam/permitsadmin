import AuthenticatedPageLayout from "@/components/layouts/authenticated-page";
import { AppContext, IAppContextValues } from "@/custom/app-context";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Constants, Images } from "../../../constants";
import { getImagePath } from "@/custom/utilities";

export default function CheckoutPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "checkout" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            <Checkout appContext={appContext} router={router} setShowAlert={setShowAlert}></Checkout>
        </AuthenticatedPageLayout>
    )
}

function Checkout({ appContext, router, setShowAlert }
    : {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [checkoutStep, setCheckoutStep] = useState(0);

    const [step1AcceptTerms, setStep1AcceptTerms] = useState(false);
    const [isStep1AcceptTermsValid, setIsStep1AcceptTermsValid] = useState(true);

    const [step2AcceptTerms1, setStep2AcceptTerms1] = useState(false);
    const [isStep2AcceptTerms1Valid, setIsStep2AcceptTerms1Valid] = useState(true);

    const [step2AcceptTerms2, setStep2AcceptTerms2] = useState(false);
    const [isStep2AcceptTerms2Valid, setIsStep2AcceptTerms2Valid] = useState(true);

    const [step2AcceptTerms3, setStep2AcceptTerms3] = useState(false);
    const [isStep2AcceptTerms3Valid, setIsStep2AcceptTerms3Valid] = useState(true);

    const t: Function = appContext.translation.t;

    if (checkoutStep === 0) {
        return (
            <>
                <Head>
                    <title>{t("Checkout.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h4>{t("Checkout.Title")}</h4>

                <div className="card mb-2">
                    <div className="card-body">
                        <div className="d-flex justify-content-center">
                            <a className="btn btn-outline-dark btn-sm w-100" href={`/${Constants.MtoWaiverPdf}`} target="_blank">Printable Version</a>
                        </div>

                        <div className="text-center">
                            <img className="img-fluid" src={Images.Ontario} alt="Ontario Logo" width="715" height="286" />
                        </div>

                        {appContext.translation.i18n.language === "en" && (
                            <>
                                <h5 className="text-center mb-4">Application for Trail Permit - Terms & Conditions</h5>

                                <p className="justify-text lh-sm">I understand that the trail permit for which I am applying is valid only for the motorized snow vehicle identified in this application and is valid only where the sticker (permit) issued under this application is permanently affixed in the required position on that motorized snow vehicle. I certify that the information contained in this application is true and acknowledge and accept the responsibilities imposed by law.</p>
                                <p className="justify-text lh-sm">Information in this form is collected under the authority of the Motorized Snow Vehicles Act and is used for administration and enforcement of the trail permit program only, unless consent to use this information for other purposes is otherwise provided by the person to whom this information relates. If you have any questions about the collection and use of your personal information collected on this form, please call the Supervisor, ServiceOntario, at 416-235-2999 or 1-800-387-3445 or write to the Supervisor, Ministry of Transportation, Licensing Administration Office, Main Floor, Building A, 1201 Wilson Ave., Downsview, Ontario, M3M 1J8. General Inquiries: Direct general inquiries to ServiceOntario, at 416-235-2999, 1-800387-3445 or visit www.ServiceOntario.ca</p>
                                <p className="justify-text lh-sm">Note: Name and address on this application form must be the same as the name and address of the registered owner.</p>
                                <p className="justify-text lh-sm">If the Trail Permit is lost, stolen or damaged and needs to be replaced, contact the OFSC. The fee for a replacement permit is $15.00. You must present the original trail permit receipt along with the original permit, or portion thereof. If not available, a police report or police incident # is required for stolen or lost permits.</p>
                                <p className="justify-text lh-sm">The Trail Permit is valid for the period shown on the Trail Permit and the Application for Trail Permit. A new Trail Permit must be purchased each season or after the expiration date.</p>
                                <p className="justify-text lh-sm">Trail Permit purchases are non-refundable; Trail Permits may only be transferred through the approved process (see www.ofsc.on.ca).</p>
                            </>
                        )}

                        {appContext.translation.i18n.language === "fr" && (
                            <>
                                <h5 className="text-center mb-4">Application for Trail Permit - Terms & Conditions</h5>

                                <p className="justify-text lh-sm">Je comprends que le permis de sentier pour lequel je fais une demande ne s'applique qu'à la motoneige indiquée dans la présente demande et n'est valide que lorsque l'autocollant (permis) émis conformément à la présente demande est appliqué de façon permanente à l'endroit requis sur cette motoneige. J'atteste que les renseignements contenus dans la présente demande sont exacts et je reconnais et j'accepte les responsabilités imposées par la loi.</p>
                                <p className="justify-text lh-sm">L'information figurant sur cette formule est recueillie en vertu de la Loi sur les motoneiges et sert uniquement à des fins administratives et pour l'exécution du programme d'aménagement des sentiers, à moins que le consentement d'utiliser cette information à d'autres fins ne soit accordé par la personne visée par l'information. Si vous avez des questions sur la collecte et l'utilisation des renseignements personnels fournis dans le présent formulaire, veuillez téléphoner au Superviseur, ServiceOntario au 416 235-2999 ou 1 800 387-3445 ou écrire au Superviseur, ministère des Transports, Bureau d'administration des permis, rez-de-chaussée, édifice A, 1201, avenue Wilson, Downsview ON M3M 1J8. Renseignements généraux: Veuillez communiquer avec ServiceOntario au 416 235-2999 ou 1 800 387-3445 ou vous rendre à www.ServiceOntario.ca</p>
                                <p className="justify-text lh-sm">Nota: Le nom et adresse indiqués sur la formule de demande doivent être les mêmes que ceux figurant sur les enregistrements du véhicule.</p>
                                <p className="justify-text lh-sm">Si le permis de sentier est perdu, volé ou endommagé et doit être remplacé, communiquez avec le club de motoneige vendeur. Le coût de remplacement est de 15,00$. Vous devez présenter le reçu original du permis de sentier ainsi que le permis original ou une partie de ce permis. S'il vous est impossible de le faire, un # de rapport d'incident, émis par la police provinciale, est nécessaire pour les permis volés ou perdus.</p>
                                <p className="justify-text lh-sm">Le permis de sentier est valide pour la période indiquée sur le permis de sentier et sur la demande pour un permis de sentier. Un nouveau permis de sentier doit être acheté à chaque saison ou suivant la date d'expiration. Les achats de permis de sentier ne sont pas remboursables.</p>
                                <p className="justify-text lh-sm">Les achats de permis de conduire sur une piste ne sont pas remboursables; ces permis peuvent seulement être transférés par l'entremise du processus approuvé. (voir www.ofsc.on.ca)</p>
                            </>
                        )}

                        <hr />

                        <div>
                            <div className="form-check">
                                <input className={`form-check-input ${isStep1AcceptTermsValid ? "" : "is-invalid"}`} type="checkbox" value="" id="checkout-step1-accept-terms" defaultChecked={step1AcceptTerms} onChange={(e: any) => setStep1AcceptTerms(e.target.checked)} />
                                <label className="form-check-label" htmlFor="checkout-step1-accept-terms">
                                    {t("Checkout.ReadAndAgree")}
                                </label>
                            </div>
                        </div>
                    </div>
                </div >

                <div className="card">
                    <div className="card-body d-flex justify-content-center flex-wrap gap-2">
                        <button className="btn btn-outline-dark" onClick={() => step1ContinueCheckoutClick()}>
                            {t("Common.Next")}
                            <i className="fa-solid fa-chevron-right fa-sm ms-2"></i>
                        </button>
                        <button className="btn btn-outline-dark" onClick={() => cancelCheckoutClick()}>Cancel Checkout</button>
                    </div>
                </div>
            </>
        )
    } else if (checkoutStep === 1) {
        return (
            <>
                <Head>
                    <title>{t("Checkout.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h4>{t("Checkout.Title")}</h4>

                <div className="card mb-2">
                    <div className="card-body">
                        {appContext.translation.i18n.language === "en" && (
                            <>
                                <div className="d-flex justify-content-center mb-2">
                                    <a className="btn btn-outline-dark btn-sm mb-2 w-100" href={`/${Constants.OfscWaiverPdfEn}`} target="_blank">Printable Version</a>
                                </div>

                                <p className="fw-bold">Please read and acknowledge all sections.</p>

                                <div className="card bg-warning-subtle mb-2">
                                    <div className="card-body">
                                        <h5 className="text-center fw-bold mb-4">RELEASE OF LIABILITY, WAIVER OF CLAIMS, ASSUMPTION OF RISKS AND INDEMNITY AGREEMENT ("Agreement") - PLEASE READ CAREFULLY!</h5>

                                        <h6 className="text-center">BY SIGNING THIS AGREEMENT, YOU WILL WAIVE CERTAIN LEGAL RIGHTS, <u>INCLUDING THE RIGHT TO SUE FOR NEGLIGENCE, BREACH OF CONTRACT OR BREACH OF THE OCCUPIERS' LIABILITY ACT, OR CLAIM COMPENSATION FOLLOWING AN ACCIDENT</u></h6>
                                    </div>
                                </div>

                                <p className="fw-bold">SECTION 1: ACKNOWLEDGMENT OF RISKS – PLEASE READ CAREFULLY!</p>
                                <p className="justify-text lh-sm">I am aware that snowmobiling involves many associated risks, dangers, and hazards that may cause serious injury, death, and loss or damage to personal property. These risks are inherent in snowmobiling and the use of the recreational Ontario Federation of Snowmobile Clubs (“OFSC”) Prescribed Trails, as defined in O. Reg. 185/01 (“Prescribed Trail”). These risks include, but are not limited to: changing weather and light conditions, collision with trees, changes in the terrain which may create blind spots or areas of reduced visibility, negligence of other trail users, and risks resulting from the <u>NEGLIGENCE, BREACH OF CONTRACT OR BREACH OF ANY STATUTORY DUTY OF CARE BY THE OFSC, ITS MEMBER CLUBS, DISTRICTS OR THEIR STAFF, TO SAFEGUARD ME OR INDIVIDUALS RIDING WITH ME FROM THE RISKS, DANGERS AND HAZARDS OF SNOWMOBILING.</u> I also understand that the other risks of snowmobiling include the snow conditions on or beneath the trails; changes or variations in the surface or subsurface, including due to trail grooming activities; variable or difficult snow conditions; exposed rock, earth, ice and other natural objects; exposed holes in the snow, road banks, snow-banks or cut-banks; absent or missing signage; collision with other snowmobiles, other vehicles, trail grooming equipment, fences, other equipment or structures; exposure to natural and/or people-made objects; exposure to infectious disease, bacteria, or virus, INCLUDING BUT NOT LIMITED TO COVID-19 ; loss of balance or control; failure to ride safely or within one's own ability or within the designated trail; speeding; and/or negligence of other snowmobilers or other vehicles.</p>

                                <p className="fw-bold">SECTION 2: ASSUMPTION OF RISK – PLEASE READ CAREFULLY!</p>

                                <div className="card bg-warning-subtle mb-2">
                                    <div className="card-body">
                                        <p className="justify-text fw-semibold lh-sm">I RECOGNIZE AND FREELY ACCEPT ALL ASSOCIATED RISKS WITH SNOWMOBILING AND THE USE OF THE RECREATIONAL PRESCRIBED TRAILS.</p>
                                        <p className="justify-text fw-semibold lh-sm">I FULLY ASSUME ANY AND ALL RISKS AND POSSIBILITY OF INJURY, DEATH OR PROPERTY DAMAGE TO ME WHILE ACCESSING THE RECREATIONAL PRESCRIBED TRAILS, AND WHILE ENGAGED IN OR AS A RESULT OF MY VOLUNTARY PARTICIPATION IN SNOWMOBILING AND THE USE OF THE RECREATIONAL PRESCRIBED TRAILS.</p>

                                        <hr />

                                        <div className="d-flex justify-content-end">
                                            <div className="form-check">
                                                <input className={`form-check-input ${isStep2AcceptTerms1Valid ? "" : "is-invalid"}`} type="checkbox" value="" id="checkout-step2-accept-terms1" defaultChecked={step2AcceptTerms1} onChange={(e: any) => setStep2AcceptTerms1(e.target.checked)} />
                                                <label className="form-check-label fw-semibold" htmlFor="checkout-step2-accept-terms1">
                                                    {t("Checkout.ClickToAgree")}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="fw-bold">SECTION 3: RELEASE OF LIABILITY, WAIVER OF CLAIMS AND INDEMNITY AGREEMENT. THESE CONDITIONS WILL AFFECT YOUR LEGAL RIGHTS - PLEASE READ CAREFULLY!</p>

                                <p className="justify-text lh-sm">In consideration of the OFSC parties (defined below) permitting me to use the recreational Prescribed Trails and providing me with the benefits outlined below, I agree as follows:</p>

                                <div className="card bg-warning-subtle mb-2">
                                    <div className="card-body">
                                        <ol className="ms-3 p-0">
                                            <li className="justify-text fw-semibold lh-sm mb-3">I acknowledge that I AM GIVING UP CERTAIN LEGAL RIGHTS, INCLUDING THE RIGHT TO SUE, that arise or result from in whole or in part, from my use of the recreational Prescribed Trails, participation in snowmobiling and, without limitation, claims arising out of or resulting from THE NEGLIGENCE, BREACH OF CONTRACT, BREACH OF ANY DUTY OF CARE OWED BY THE OFSC OR ITS MEMBER CLUBS, DISTRICTS, DIRECTORS, OFFICERS, EMPLOYEES, VOLUNTEERS, LANDOWNERS, INDEPENDENT CONTRACTORS, SUBCONTRACTORS, REPRESENTATIVES, SPONSORS, OR SUCCESSORS (“OFSC PARTIES”), UNDER THE OCCUPIERS' LIABILITY ACT;</li>
                                            <li className="justify-text fw-semibold lh-sm mb-3">WAIVE ANY AND ALL CLAIMS THAT I HAVE OR MAY HAVE IN THE FUTURE AGAINST THE OFSC PARTIES; and</li>
                                            <li className="justify-text fw-semibold lh-sm">RELEASE THE OFSC PARTIES from ANY AND ALL LIABILITY FOR ANY LOSS, DAMAGE, EXPENSE, INJURY AND DEATH, INCLUDING ANY CLAIM FOR CONTRIBUTION AND INDEMNITY, that I may suffer or that my next of kin may suffer resulting from my use or presence on the recreational Prescribed Trails or my traveling off such trails DUE TO ANY CAUSE WHATSOEVER, <u>INCLUDING NEGLIGENCE, BREACH OF CONTRACT OR BREACH OF ANY STATUTORY OR OTHER DUTY OF CARE, INCLUDING ANY DUTY OF CARE OWED UNDER THE OCCUPIERS' LIABILITY ACT,</u> AND INCLUDING THE OFSC PARTIES' FAILURE TO PROTECT ME FROM THE RISKS, DANGERS AND HAZARDS OF SNOWMOBILING.</li>
                                        </ol>

                                        <hr />

                                        <div className="d-flex justify-content-end">
                                            <div className="form-check">
                                                <input className={`form-check-input ${isStep2AcceptTerms2Valid ? "" : "is-invalid"}`} type="checkbox" value="" id="checkout-step2-accept-terms2" defaultChecked={step2AcceptTerms2} onChange={(e: any) => setStep2AcceptTerms2(e.target.checked)} />
                                                <label className="form-check-label fw-semibold" htmlFor="checkout-step2-accept-terms2">
                                                    {t("Checkout.ClickToAgree")}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ol className="ms-3 p-0" start={4}>
                                    <li className="justify-text lh-sm mb-3">I AGREE TO HOLD HARMLESS AND INDEMNIFY the OFSC PARTIES from any and all liability, including claims for contribution and indemnity, for any damage to property of or personal injury to any third party resulting from my, or my family member or next of kin, participation in snowmobiling and use of or presence on recreational Prescribed Trails or travel beyond such trails.</li>
                                    <li className="justify-text lh-sm mb-3">This agreement shall be effective and binding upon my heirs, next of kin, executors, administrators and representatives in the event of my death or incapacity.</li>
                                    <li className="justify-text lh-sm mb-3">I agree that any litigation involving the OFSC PARTIES shall be brought within the exclusive jurisdiction of the courts of the Province of Ontario and shall be brought within the Province of Ontario.</li>
                                    <li className="justify-text lh-sm mb-3">I further agree that these conditions and any rights, duties and obligations as between the OFSC PARTIES and the trail permit holder shall be governed by and interpreted solely in accordance with the laws of the Province of Ontario and no other jurisdiction. (Refer to www.ofsc.on.ca).</li>
                                    <li className="justify-text lh-sm mb-3">If any provision of this Agreement is determined by a court of competent jurisdiction to be invalid, illegal or unenforceable in any respect, I agree that such determination shall not impair or affect the validity, legality or enforceability of the remaining provisions hereof, and each provision is to considered separate, severable, and distinct.</li>
                                    <li className="justify-text lh-sm mb-3">In entering into this Agreement I am not relying on any oral or written representations or statements made by the OFSC PARTIES with respect to the safety of snowmobiling other than what is in this agreement.</li>
                                </ol>

                                <p className="justify-text fw-bold lh-sm">I ACKNOWLEDGE HAVING READ AND UNDERSTOOD THIS AGREEMENT AND I AM AWARE THAT BY SIGNING THIS AGREEMENT I AM WAIVING CERTAIN LEGAL RIGHTS WHICH I OR MY HEIRS, NEXT OF KIN, EXECUTORS, ADMINISTRATORS AND REPRESENTATIVES MAY HAVE AGAINST THE OFSC PARTIES. I AGREE TO THE TERMS AND CONDITIONS CONTAINED IN THIS AGREEMENT.</p>

                                <p>I acknowledge that:</p>

                                <ol className="ms-3 p-0" type="a">
                                    <li className="justify-text lh-sm mb-3">I have read and agree to the terms and conditions above together with the EXPECTATIONS FROM THE OPERATOR AS TO THE USE OF RECREATIONAL PRESCRIBED TRAILS (please see below).</li>
                                    <li className="justify-text lh-sm mb-3">I understand that I must complete Section I and Section II in order to access the recreational Prescribed Trails system.</li>
                                    <li className="justify-text lh-sm mb-3">I will ensure that all operators and/or passengers of the snowmobile to which this permit is affixed are made aware of these conditions before accessing any recreational Prescribed Trails.</li>
                                    <li className="justify-text lh-sm mb-3">Any representative of an OFSC affiliated club may deny access to recreational Prescribed Trails in the event of a failure to comply with OFSC Terms and Conditions or Bylaws by any operators and/or passengers of the snowmobile to which this permit is affixed.</li>
                                </ol>

                                <p><b>General enquiries:</b> Contact information for the Ontario Federation of Snowmobile Clubs can be found on the website: www.ofsc.on.ca.</p>

                                <div className="card">
                                    <div className="card-header text-center">
                                        <h6 className="fw-bold">EXPECTATIONS FROM THE OPERATOR AS TO THE USE OF RECREATIONAL PRESCRIBED TRAILS</h6>

                                        <p className="mb-0"><i>Snowmobiling is an inherently risky off-road activity that occurs in an unpredictable natural environment. Prior to entering onto a recreational Prescribed Trail, every snowmobiler must be familiar with the Expectations for recreational Prescribed Trail Use:</i></p>
                                    </div>
                                    <div className="card-body bg-warning-subtle">
                                        <div className="d-flex flex-wrap">
                                            <div className="px-4 w-100">
                                                <ol className="p-0">
                                                    <li className="justify-text lh-sm mb-3">All snowmobiles will be operated under a lawful trail use permit;</li>
                                                    <li className="justify-text lh-sm mb-3">All operators and passengers willingly use the trails at their own risk;</li>
                                                    <li className="justify-text lh-sm mb-3">Operators and passengers know and will obey all applicable laws, including, The Occupiers' Liability Act, The Motorized Snow Vehicles Act and the Trespass to Property Act;</li>
                                                    <li className="justify-text lh-sm mb-3">Snowmobile trails are not an engineered product, it is recognized and accepted that snowmobiling is essentially an off-road activity taking place in the natural environment;</li>
                                                    <li className="justify-text lh-sm mb-3">The operator understands that OFSC member clubs are volunteer-based organizations with finite resources and manpower;</li>
                                                    <li className="justify-text lh-sm mb-3">It is not practical, possible or desirable to maintain all trails uniformly or to remove all potential hazards;</li>
                                                </ol>
                                            </div>

                                            <div className="px-4 w-100">
                                                <ol className="p-0" start={7}>
                                                    <li className="justify-text lh-sm mb-3">Weather conditions affect trails, snowmobile operation and operator visibility and they may change without warning;</li>
                                                    <li className="justify-text lh-sm mb-3">The maximum legislated speed on trails is 50 km/h unless reduced by law and/or subject to conditions including weather, operator competency and terrain;</li>
                                                    <li className="justify-text lh-sm mb-3">Operators will stay to the right of the trail notwithstanding that there are no centre lines and operate their snowmobiles with care and control as there may be other users on the trail including non-snowmobilers and trail grooming equipment;</li>
                                                    <li className="justify-text lh-sm mb-3">Operators and passengers are aware that there are generally no legal requirements for signage on trails and, when provided, it is only for assistance and convenience;</li>
                                                    <li className="justify-text lh-sm mb-3">The privilege of trail access is provided without any guarantee of service or quality, grooming and maintenance of trails, when provided, is meant solely to enhance the comfort and enjoyment of the safe and prudent operators and passengers.</li>
                                                </ol>
                                            </div>
                                        </div>

                                        <hr />

                                        <div className="d-flex justify-content-end">
                                            <div className="form-check">
                                                <input className={`form-check-input ${isStep2AcceptTerms3Valid ? "" : "is-invalid"}`} type="checkbox" value="" id="checkout-step2-accept-terms3" defaultChecked={step2AcceptTerms3} onChange={(e: any) => setStep2AcceptTerms3(e.target.checked)} />
                                                <label className="form-check-label fw-semibold" htmlFor="checkout-step2-accept-terms3">
                                                    {t("Checkout.ClickToAgree")}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {appContext.translation.i18n.language === "fr" && (
                            <>
                                <div className="d-flex justify-content-center mb-2">
                                    <a className="btn btn-outline-dark btn-sm mb-2 w-100" href={`/${Constants.OfscWaiverPdfFr}`} target="_blank">Printable Version</a>
                                </div>

                                <p className="fw-bold">(fr)Please read and acknowledge all sections.</p>

                                <div className="card bg-warning-subtle mb-2">
                                    <div className="card-body">
                                        <h5 className="text-center fw-bold mb-4">RELEASE OF LIABILITY, WAIVER OF CLAIMS, ASSUMPTION OF RISKS AND INDEMNITY AGREEMENT ("Agreement") - PLEASE READ CAREFULLY!</h5>

                                        <h6 className="text-center">BY SIGNING THIS AGREEMENT, YOU WILL WAIVE CERTAIN LEGAL RIGHTS, <u>INCLUDING THE RIGHT TO SUE FOR NEGLIGENCE, BREACH OF CONTRACT OR BREACH OF THE OCCUPIERS' LIABILITY ACT, OR CLAIM COMPENSATION FOLLOWING AN ACCIDENT</u></h6>
                                    </div>
                                </div>

                                <p className="fw-bold">SECTION 1: ACKNOWLEDGMENT OF RISKS – PLEASE READ CAREFULLY!</p>
                                <p className="justify-text lh-sm">I am aware that snowmobiling involves many associated risks, dangers, and hazards that may cause serious injury, death, and loss or damage to personal property. These risks are inherent in snowmobiling and the use of the recreational Ontario Federation of Snowmobile Clubs (“OFSC”) Prescribed Trails, as defined in O. Reg. 185/01 (“Prescribed Trail”). These risks include, but are not limited to: changing weather and light conditions, collision with trees, changes in the terrain which may create blind spots or areas of reduced visibility, negligence of other trail users, and risks resulting from the <u>NEGLIGENCE, BREACH OF CONTRACT OR BREACH OF ANY STATUTORY DUTY OF CARE BY THE OFSC, ITS MEMBER CLUBS, DISTRICTS OR THEIR STAFF, TO SAFEGUARD ME OR INDIVIDUALS RIDING WITH ME FROM THE RISKS, DANGERS AND HAZARDS OF SNOWMOBILING.</u> I also understand that the other risks of snowmobiling include the snow conditions on or beneath the trails; changes or variations in the surface or subsurface, including due to trail grooming activities; variable or difficult snow conditions; exposed rock, earth, ice and other natural objects; exposed holes in the snow, road banks, snow-banks or cut-banks; absent or missing signage; collision with other snowmobiles, other vehicles, trail grooming equipment, fences, other equipment or structures; exposure to natural and/or people-made objects; exposure to infectious disease, bacteria, or virus, INCLUDING BUT NOT LIMITED TO COVID-19 ; loss of balance or control; failure to ride safely or within one's own ability or within the designated trail; speeding; and/or negligence of other snowmobilers or other vehicles.</p>

                                <p className="fw-bold">SECTION 2: ASSUMPTION OF RISK – PLEASE READ CAREFULLY!</p>

                                <div className="card bg-warning-subtle mb-2">
                                    <div className="card-body">
                                        <p className="justify-text fw-semibold lh-sm">I RECOGNIZE AND FREELY ACCEPT ALL ASSOCIATED RISKS WITH SNOWMOBILING AND THE USE OF THE RECREATIONAL PRESCRIBED TRAILS.</p>
                                        <p className="justify-text fw-semibold lh-sm">I FULLY ASSUME ANY AND ALL RISKS AND POSSIBILITY OF INJURY, DEATH OR PROPERTY DAMAGE TO ME WHILE ACCESSING THE RECREATIONAL PRESCRIBED TRAILS, AND WHILE ENGAGED IN OR AS A RESULT OF MY VOLUNTARY PARTICIPATION IN SNOWMOBILING AND THE USE OF THE RECREATIONAL PRESCRIBED TRAILS.</p>

                                        <hr />

                                        <div className="d-flex justify-content-end">
                                            <div className="form-check">
                                                <input className={`form-check-input ${isStep2AcceptTerms1Valid ? "" : "is-invalid"}`} type="checkbox" value="" id="checkout-step2-accept-terms1" defaultChecked={step2AcceptTerms1} onChange={(e: any) => setStep2AcceptTerms1(e.target.checked)} />
                                                <label className="form-check-label fw-semibold" htmlFor="checkout-step2-accept-terms1">
                                                    {t("Checkout.ClickToAgree")}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="fw-bold">SECTION 3: RELEASE OF LIABILITY, WAIVER OF CLAIMS AND INDEMNITY AGREEMENT. THESE CONDITIONS WILL AFFECT YOUR LEGAL RIGHTS - PLEASE READ CAREFULLY!</p>

                                <p className="justify-text lh-sm">In consideration of the OFSC parties (defined below) permitting me to use the recreational Prescribed Trails and providing me with the benefits outlined below, I agree as follows:</p>

                                <div className="card bg-warning-subtle mb-2">
                                    <div className="card-body">
                                        <ol className="ms-3 p-0">
                                            <li className="justify-text fw-semibold lh-sm mb-3">I acknowledge that I AM GIVING UP CERTAIN LEGAL RIGHTS, INCLUDING THE RIGHT TO SUE, that arise or result from in whole or in part, from my use of the recreational Prescribed Trails, participation in snowmobiling and, without limitation, claims arising out of or resulting from THE NEGLIGENCE, BREACH OF CONTRACT, BREACH OF ANY DUTY OF CARE OWED BY THE OFSC OR ITS MEMBER CLUBS, DISTRICTS, DIRECTORS, OFFICERS, EMPLOYEES, VOLUNTEERS, LANDOWNERS, INDEPENDENT CONTRACTORS, SUBCONTRACTORS, REPRESENTATIVES, SPONSORS, OR SUCCESSORS (“OFSC PARTIES”), UNDER THE OCCUPIERS' LIABILITY ACT;</li>
                                            <li className="justify-text fw-semibold lh-sm mb-3">WAIVE ANY AND ALL CLAIMS THAT I HAVE OR MAY HAVE IN THE FUTURE AGAINST THE OFSC PARTIES; and</li>
                                            <li className="justify-text fw-semibold lh-sm">RELEASE THE OFSC PARTIES from ANY AND ALL LIABILITY FOR ANY LOSS, DAMAGE, EXPENSE, INJURY AND DEATH, INCLUDING ANY CLAIM FOR CONTRIBUTION AND INDEMNITY, that I may suffer or that my next of kin may suffer resulting from my use or presence on the recreational Prescribed Trails or my traveling off such trails DUE TO ANY CAUSE WHATSOEVER, <u>INCLUDING NEGLIGENCE, BREACH OF CONTRACT OR BREACH OF ANY STATUTORY OR OTHER DUTY OF CARE, INCLUDING ANY DUTY OF CARE OWED UNDER THE OCCUPIERS' LIABILITY ACT,</u> AND INCLUDING THE OFSC PARTIES' FAILURE TO PROTECT ME FROM THE RISKS, DANGERS AND HAZARDS OF SNOWMOBILING.</li>
                                        </ol>

                                        <hr />

                                        <div className="d-flex justify-content-end">
                                            <div className="form-check">
                                                <input className={`form-check-input ${isStep2AcceptTerms2Valid ? "" : "is-invalid"}`} type="checkbox" value="" id="checkout-step2-accept-terms2" defaultChecked={step2AcceptTerms2} onChange={(e: any) => setStep2AcceptTerms2(e.target.checked)} />
                                                <label className="form-check-label fw-semibold" htmlFor="checkout-step2-accept-terms2">
                                                    {t("Checkout.ClickToAgree")}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ol className="ms-3 p-0" start={4}>
                                    <li className="justify-text lh-sm mb-3">I AGREE TO HOLD HARMLESS AND INDEMNIFY the OFSC PARTIES from any and all liability, including claims for contribution and indemnity, for any damage to property of or personal injury to any third party resulting from my, or my family member or next of kin, participation in snowmobiling and use of or presence on recreational Prescribed Trails or travel beyond such trails.</li>
                                    <li className="justify-text lh-sm mb-3">This agreement shall be effective and binding upon my heirs, next of kin, executors, administrators and representatives in the event of my death or incapacity.</li>
                                    <li className="justify-text lh-sm mb-3">I agree that any litigation involving the OFSC PARTIES shall be brought within the exclusive jurisdiction of the courts of the Province of Ontario and shall be brought within the Province of Ontario.</li>
                                    <li className="justify-text lh-sm mb-3">I further agree that these conditions and any rights, duties and obligations as between the OFSC PARTIES and the trail permit holder shall be governed by and interpreted solely in accordance with the laws of the Province of Ontario and no other jurisdiction. (Refer to www.ofsc.on.ca).</li>
                                    <li className="justify-text lh-sm mb-3">If any provision of this Agreement is determined by a court of competent jurisdiction to be invalid, illegal or unenforceable in any respect, I agree that such determination shall not impair or affect the validity, legality or enforceability of the remaining provisions hereof, and each provision is to considered separate, severable, and distinct.</li>
                                    <li className="justify-text lh-sm mb-3">In entering into this Agreement I am not relying on any oral or written representations or statements made by the OFSC PARTIES with respect to the safety of snowmobiling other than what is in this agreement.</li>
                                </ol>

                                <p className="justify-text fw-bold lh-sm">I ACKNOWLEDGE HAVING READ AND UNDERSTOOD THIS AGREEMENT AND I AM AWARE THAT BY SIGNING THIS AGREEMENT I AM WAIVING CERTAIN LEGAL RIGHTS WHICH I OR MY HEIRS, NEXT OF KIN, EXECUTORS, ADMINISTRATORS AND REPRESENTATIVES MAY HAVE AGAINST THE OFSC PARTIES. I AGREE TO THE TERMS AND CONDITIONS CONTAINED IN THIS AGREEMENT.</p>

                                <p>I acknowledge that:</p>

                                <ol className="ms-3 p-0" type="a">
                                    <li className="justify-text lh-sm mb-3">I have read and agree to the terms and conditions above together with the EXPECTATIONS FROM THE OPERATOR AS TO THE USE OF RECREATIONAL PRESCRIBED TRAILS (please see below).</li>
                                    <li className="justify-text lh-sm mb-3">I understand that I must complete Section I and Section II in order to access the recreational Prescribed Trails system.</li>
                                    <li className="justify-text lh-sm mb-3">I will ensure that all operators and/or passengers of the snowmobile to which this permit is affixed are made aware of these conditions before accessing any recreational Prescribed Trails.</li>
                                    <li className="justify-text lh-sm mb-3">Any representative of an OFSC affiliated club may deny access to recreational Prescribed Trails in the event of a failure to comply with OFSC Terms and Conditions or Bylaws by any operators and/or passengers of the snowmobile to which this permit is affixed.</li>
                                </ol>

                                <p><b>General enquiries:</b> Contact information for the Ontario Federation of Snowmobile Clubs can be found on the website: www.ofsc.on.ca.</p>

                                <div className="card">
                                    <div className="card-header text-center">
                                        <h6 className="fw-bold">EXPECTATIONS FROM THE OPERATOR AS TO THE USE OF RECREATIONAL PRESCRIBED TRAILS</h6>

                                        <p className="mb-0"><i>Snowmobiling is an inherently risky off-road activity that occurs in an unpredictable natural environment. Prior to entering onto a recreational Prescribed Trail, every snowmobiler must be familiar with the Expectations for recreational Prescribed Trail Use:</i></p>
                                    </div>
                                    <div className="card-body bg-warning-subtle">
                                        <div className="d-flex flex-wrap">
                                            <div className="px-4 w-100">
                                                <ol className="p-0">
                                                    <li className="justify-text lh-sm mb-3">All snowmobiles will be operated under a lawful trail use permit;</li>
                                                    <li className="justify-text lh-sm mb-3">All operators and passengers willingly use the trails at their own risk;</li>
                                                    <li className="justify-text lh-sm mb-3">Operators and passengers know and will obey all applicable laws, including, The Occupiers' Liability Act, The Motorized Snow Vehicles Act and the Trespass to Property Act;</li>
                                                    <li className="justify-text lh-sm mb-3">Snowmobile trails are not an engineered product, it is recognized and accepted that snowmobiling is essentially an off-road activity taking place in the natural environment;</li>
                                                    <li className="justify-text lh-sm mb-3">The operator understands that OFSC member clubs are volunteer-based organizations with finite resources and manpower;</li>
                                                    <li className="justify-text lh-sm mb-3">It is not practical, possible or desirable to maintain all trails uniformly or to remove all potential hazards;</li>
                                                </ol>
                                            </div>

                                            <div className="px-4 w-100">
                                                <ol className="p-0" start={7}>
                                                    <li className="justify-text lh-sm mb-3">Weather conditions affect trails, snowmobile operation and operator visibility and they may change without warning;</li>
                                                    <li className="justify-text lh-sm mb-3">The maximum legislated speed on trails is 50 km/h unless reduced by law and/or subject to conditions including weather, operator competency and terrain;</li>
                                                    <li className="justify-text lh-sm mb-3">Operators will stay to the right of the trail notwithstanding that there are no centre lines and operate their snowmobiles with care and control as there may be other users on the trail including non-snowmobilers and trail grooming equipment;</li>
                                                    <li className="justify-text lh-sm mb-3">Operators and passengers are aware that there are generally no legal requirements for signage on trails and, when provided, it is only for assistance and convenience;</li>
                                                    <li className="justify-text lh-sm mb-3">The privilege of trail access is provided without any guarantee of service or quality, grooming and maintenance of trails, when provided, is meant solely to enhance the comfort and enjoyment of the safe and prudent operators and passengers.</li>
                                                </ol>
                                            </div>
                                        </div>

                                        <hr />

                                        <div className="d-flex justify-content-end">
                                            <div className="form-check">
                                                <input className={`form-check-input ${isStep2AcceptTerms3Valid ? "" : "is-invalid"}`} type="checkbox" value="" id="checkout-step2-accept-terms3" defaultChecked={step2AcceptTerms3} onChange={(e: any) => setStep2AcceptTerms3(e.target.checked)} />
                                                <label className="form-check-label fw-semibold" htmlFor="checkout-step2-accept-terms3">
                                                    {t("Checkout.ClickToAgree")}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div >

                <div className="card">
                    <div className="card-body d-flex justify-content-center flex-wrap gap-2">
                        <button className="btn btn-outline-dark" onClick={() => step2GoBackClick()}>
                            <i className="fa-solid fa-chevron-left fa-sm me-2"></i>
                            {t("Common.Back")}
                        </button>
                        <button className="btn btn-outline-dark" onClick={() => step2ContinueCheckoutClick()}>
                            {t("Common.Next")}
                            <i className="fa-solid fa-chevron-right fa-sm ms-2"></i>
                        </button>
                        <button className="btn btn-outline-dark" onClick={() => cancelCheckoutClick()}>Cancel Checkout</button>
                    </div>
                </div>
            </>
        )
    }

    function step1GoBackClick(): void {
        setStep1AcceptTerms(false);

        router.push("/cart");
    }

    function step1ContinueCheckoutClick(): void {
        if (validateCheckoutStep1()) {
            setCheckoutStep(1);
        }
    }

    function validateCheckoutStep1(): boolean {
        let isValid: boolean = true;

        if (!step1AcceptTerms) {
            setIsStep1AcceptTermsValid(false);
            isValid = false;
        } else {
            setIsStep1AcceptTermsValid(true);
        }

        return isValid;
    }

    function cancelCheckoutClick(): void {
        router.push("/cart");
    }

    function step2GoBackClick(): void {
        setStep1AcceptTerms(false);
        setIsStep1AcceptTermsValid(true);

        setStep2AcceptTerms1(false);
        setIsStep2AcceptTerms1Valid(true);

        setStep2AcceptTerms2(false);
        setIsStep2AcceptTerms2Valid(true);

        setStep2AcceptTerms3(false);
        setIsStep2AcceptTerms3Valid(true);

        setCheckoutStep(0);
    }

    function step2ContinueCheckoutClick(): void {
        if (validateCheckoutStep2()) {
            router.push("/payment");
        }
    }

    function validateCheckoutStep2(): boolean {
        let isValid: boolean = true;

        if (!step2AcceptTerms1) {
            setIsStep2AcceptTerms1Valid(false);
            isValid = false;
        } else {
            setIsStep2AcceptTerms1Valid(true);
        }

        if (!step2AcceptTerms2) {
            setIsStep2AcceptTerms2Valid(false);
            isValid = false;
        } else {
            setIsStep2AcceptTerms2Valid(true);
        }

        if (!step2AcceptTerms3) {
            setIsStep2AcceptTerms3Valid(false);
            isValid = false;
        } else {
            setIsStep2AcceptTerms3Valid(true);
        }

        return isValid;
    }
}