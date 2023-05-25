import { IApiGetAvailableGiftCardsResult, IApiGetProcessingFeeResult, IApiGetRedeemableGiftCardsForUserResult, IApiGetShippingFeesResult, IApiGetUserDetailsResult, IApiGetUserPreferencesResult, IApiLoginRequest, IApiLoginResult, WebApiAppContextData, apiGetAvailableGiftCards, apiGetProcessingFee, apiGetRedeemableGiftCardsForUser, apiGetShippingFees, apiGetUserDetails, apiGetUserPreferences, apiLogin } from './api';
import { error } from "console";
import { Observable } from "rxjs";

const email: string = "sarveny@hotmail.com";
const password: string = "SnowTravel59!";

function getToken(): Promise<string> {
    return new Promise((resolve) => {
        apiLogin({ email: email, password: password }).subscribe({
            next: (result: IApiLoginResult) => {
                resolve(result?.token ?? "");
            },
            error: (error: any) => {
                resolve("");
            }
        });
    });
}

describe("Tested api response objects", () => {
    test("Test apiLogin()", async () => {
        let body: IApiLoginRequest = { email: email, password: password };

        await apiLogin(body).subscribe({
            next: (result: IApiLoginResult) => {
                expect(result).toBeTruthy();

                expect(result).toHaveProperty("email");
                expect(result).toHaveProperty("isFirstLoginOfSeason");
                expect(result).toHaveProperty("isValid");
                expect(result).toHaveProperty("token");

                expect(result.email).toBeTruthy();
                expect(result?.email?.length).toBeGreaterThan(0);

                expect(result?.isFirstLoginOfSeason).toEqual(false);

                expect(result?.isValid).toEqual(true);

                expect(result.token).toBeTruthy();
                expect(result?.token?.length).toBeGreaterThan(0);
            },
            error: (erro: any) => {
                //
            }
        });
    });

    test("Test apiLogout()", () => {

    });

    test("Test apiGetUserDetails()", async () => {
        WebApiAppContextData.token = await getToken();

        await apiGetUserDetails().subscribe({
            next: (result: IApiGetUserDetailsResult) => {
                expect(result).toBeTruthy();

                expect(result).toHaveProperty("addressLine1");
                expect(result).toHaveProperty("addressLine2");
                expect(result).toHaveProperty("adminUser");
                expect(result).toHaveProperty("city");
                expect(result).toHaveProperty("contactConsent");
                expect(result).toHaveProperty("country");
                expect(result).toHaveProperty("email");
                expect(result).toHaveProperty("firstName");
                expect(result).toHaveProperty("initial");
                expect(result).toHaveProperty("lastName");
                expect(result).toHaveProperty("personId");
                expect(result).toHaveProperty("postalCode");
                expect(result).toHaveProperty("province");
                expect(result).toHaveProperty("telephone");
                expect(result).toHaveProperty("verified");
                expect(result).toHaveProperty("volunteerStatus");
            },
            error: (erro: any) => {
                //
            }
        });
    });

    test("Test apiSaveUserDetails()", async () => {

    });

    test("Test apiGetUserPreferences()", async () => {
        WebApiAppContextData.token = await getToken();

        await apiGetUserPreferences().subscribe({
            next: (result: IApiGetUserPreferencesResult) => {
                expect(result).toBeTruthy();

                expect(result).toHaveProperty("ofscContactPermission");
                expect(result).toHaveProperty("riderAdvantage");
                expect(result).toHaveProperty("volunteering");

                // -1=Unset; 0=No; 1=Yes
                expect(result.ofscContactPermission).toBeGreaterThanOrEqual(-1);
                expect(result.ofscContactPermission).toBeLessThanOrEqual(1);

                // -1=Unset; 0=No; 1=Yes
                expect(result.riderAdvantage).toBeGreaterThanOrEqual(-1);
                expect(result.riderAdvantage).toBeLessThanOrEqual(1);

                // -1=Unset; 0=No; 1=Yes, I already volunteer; 2=Yes, I'd like to volunteer
                expect(result.volunteering).toBeGreaterThanOrEqual(-1);
                expect(result.volunteering).toBeLessThanOrEqual(2);
            },
            error: (erro: any) => {
                //
            }
        });
    });

    test("Test apiSaveUserPreferences()", async () => {

    });

    test("Test apiGetProvinces()", async () => {

    });

    test("Test apiGetCountries()", async () => {

    });

    test("Test apiGetClubs()", async () => {

    });

    test("Test apiGetVehiclesAndPermitsForUser()", async () => {

    });

    test("Test apiGetVehicleMakes()", async () => {

    });

    test("Test apiAddVehicleForUser()", async () => {

    });

    test("Test apiUpdateVehicle()", async () => {

    });

    test("Test apiDeleteVehicle()", async () => {

    });

    test("Test apiSavePermitSelectionForVehicle()", async () => {

    });

    test("Test apiGetGiftcardsForCurrentSeasonForUser()", async () => {

    });

    test("Test apiGetAvailableGiftCards()", async () => {
        WebApiAppContextData.token = await getToken();

        await apiGetAvailableGiftCards().subscribe({
            next: (result: IApiGetAvailableGiftCardsResult[]) => {
                expect(result).toBeTruthy();
                expect(result.length).toBeGreaterThan(0);

                result.forEach(x => {
                    expect(x).toHaveProperty("productId");
                    expect(x).toHaveProperty("name");
                    expect(x).toHaveProperty("displayName");
                    expect(x).toHaveProperty("frenchDisplayName");
                    expect(x).toHaveProperty("amount");
                    expect(x).toHaveProperty("testAmount");
                    expect(x).toHaveProperty("classic");
                    expect(x).toHaveProperty("multiDayUpgrade");
                    expect(x).toHaveProperty("isMultiDay");
                    expect(x).toHaveProperty("isSpecialEvent");
                    expect(x).toHaveProperty("eventDate");
                    expect(x).toHaveProperty("eventName");
                    expect(x).toHaveProperty("eventClubId");
                    expect(x).toHaveProperty("csrOnly");
                    expect(x).toHaveProperty("permitDays");
                    expect(x).toHaveProperty("canBuyGiftCard");
                });
            },
            error: (erro: any) => {
                //
            }
        });
    });

    test("Test apiGetRedeemableGiftCardsForUser()", async () => {
        WebApiAppContextData.token = await getToken();

        await apiGetRedeemableGiftCardsForUser().subscribe({
            next: (result: IApiGetRedeemableGiftCardsForUserResult) => {
                expect(result).toBeTruthy();

                expect(result).toHaveProperty("seasonalGiftCards");
                expect(result).toHaveProperty("classicGiftCards");

                expect(result.seasonalGiftCards).toBeGreaterThanOrEqual(0);

                expect(result.classicGiftCards).toBeGreaterThanOrEqual(0);
            },
            error: (erro: any) => {
                //
            }
        });
    });

    test("Test apiGetProcessingFee()", async () => {
        WebApiAppContextData.token = await getToken();

        await apiGetProcessingFee().subscribe({
            next: (result: IApiGetProcessingFeeResult) => {
                expect(result).toBeTruthy();

                expect(result.fee).toBeGreaterThanOrEqual(0);
            },
            error: (erro: any) => {
                //
            }
        });
    });

    test("Test apiGetShippingFees()", async () => {
        WebApiAppContextData.token = await getToken();

        await apiGetShippingFees().subscribe({
            next: (result: IApiGetShippingFeesResult[]) => {
                expect(result).toBeTruthy();
                expect(result.length).toBeGreaterThan(0);

                result.forEach(x => {
                    expect(x).toHaveProperty("id");
                    expect(x).toHaveProperty("name");
                    expect(x).toHaveProperty("price");
                    expect(x).toHaveProperty("showConfirmation");
                });
            },
            error: (erro: any) => {
                //
            }
        });
    });


});