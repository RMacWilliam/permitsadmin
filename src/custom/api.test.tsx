import { IApiGetAvailableGiftCardsResult, IApiGetClubsResult, IApiGetCountriesResult, IApiGetGiftcardsForCurrentSeasonForUserResult, IApiGetProcessingFeeResult, IApiGetProvincesResult, IApiGetRedeemableGiftCardsForUserResult, IApiGetShippingFeesResult, IApiGetUserDetailsResult, IApiGetUserPreferencesResult, IApiGetVehicleMakesResult, IApiGetVehiclesAndPermitsForUserResult, IApiLoginRequest, IApiLoginResult, apiGetAvailableGiftCards, apiGetClubs, apiGetCountries, apiGetGiftcardsForCurrentSeasonForUser, apiGetProcessingFee, apiGetProvinces, apiGetRedeemableGiftCardsForUser, apiGetShippingFees, apiGetUserDetails, apiGetUserPreferences, apiGetVehicleMakes, apiGetVehiclesAndPermitsForUser, apiLogin } from './api';
import { error } from "console";
import { GlobalAppContext } from '../../constants';

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

        apiLogin(body).subscribe({
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
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiLogout()", () => {

    });

    test("Test apiGetUserDetails()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetUserDetails().subscribe({
            next: (result: IApiGetUserDetailsResult) => {
                expect(result).toBeTruthy();

                expect(result).toHaveProperty("addressLine1");
                expect(result).toHaveProperty("addressLine2");
                expect(result).toHaveProperty("adminUser");
                expect(result).toHaveProperty("city");
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
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiSaveUserDetails()", async () => {

    });

    test("Test apiGetUserPreferences()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetUserPreferences().subscribe({
            next: (result: IApiGetUserPreferencesResult) => {
                expect(result).toBeTruthy();

                expect(result).toHaveProperty("ofscContactPermission");
                expect(result).toHaveProperty("riderAdvantage");
                expect(result).toHaveProperty("volunteering");

                // -1=Unset; 0=No; 1=Yes
                expect(result?.ofscContactPermission).toBeGreaterThanOrEqual(-1);
                expect(result?.ofscContactPermission).toBeLessThanOrEqual(1);

                // -1=Unset; 0=No; 1=Yes
                expect(result?.riderAdvantage).toBeGreaterThanOrEqual(-1);
                expect(result?.riderAdvantage).toBeLessThanOrEqual(1);

                // -1=Unset; 0=No; 1=Yes, I already volunteer; 2=Yes, I'd like to volunteer
                expect(result?.volunteering).toBeGreaterThanOrEqual(-1);
                expect(result?.volunteering).toBeLessThanOrEqual(2);
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiSaveUserPreferences()", async () => {

    });

    test("Test apiGetProvinces()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetProvinces().subscribe({
            next: (result: IApiGetProvincesResult[]) => {
                expect(result).toBeTruthy();
                expect(result.length).toBeGreaterThan(0);

                result.forEach(x => {
                    expect(x).toHaveProperty("parent");
                    expect(x).toHaveProperty("key");
                    expect(x).toHaveProperty("value");
                });
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiGetCountries()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetCountries().subscribe({
            next: (result: IApiGetCountriesResult[]) => {
                expect(result).toBeTruthy();
                expect(result.length).toBeGreaterThan(0);

                result.forEach(x => {
                    expect(x).toHaveProperty("key");
                    expect(x).toHaveProperty("value");
                });
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiGetClubs()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetClubs().subscribe({
            next: (result: IApiGetClubsResult[]) => {
                expect(result).toBeTruthy();
                expect(result.length).toBeGreaterThan(0);

                result.forEach(x => {
                    expect(x).toHaveProperty("key");
                    expect(x).toHaveProperty("value");
                });
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiGetVehiclesAndPermitsForUser()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetVehiclesAndPermitsForUser().subscribe({
            next: (result: IApiGetVehiclesAndPermitsForUserResult[]) => {
                expect(result).toBeTruthy();
                expect(result.length).toBeGreaterThan(0);

                result.forEach(x => {
                    expect(x).toHaveProperty("oVehicleId");

                    expect(x).toHaveProperty("vehicleMake");
                    expect(x?.vehicleMake).toHaveProperty("key");
                    expect(x?.vehicleMake).toHaveProperty("value");

                    expect(x).toHaveProperty("model");
                    expect(x).toHaveProperty("vin");
                    expect(x).toHaveProperty("licensePlate");
                    expect(x).toHaveProperty("vehicleYear");
                    expect(x).toHaveProperty("origVehicleId");
                    expect(x).toHaveProperty("isClassic");
                    expect(x).toHaveProperty("isEditable");

                    expect(x).toHaveProperty("permits");
                    expect(x?.permits?.length).toBeGreaterThanOrEqual(0);

                    x?.permits?.forEach(y => {
                        expect(y).toHaveProperty("oPermitId");

                        expect(y).toHaveProperty("permitType");
                        expect(y?.permitType).toHaveProperty("key");
                        expect(y?.permitType).toHaveProperty("value");
                        expect(y?.permitType).toHaveProperty("valueFr");

                        expect(y).toHaveProperty("ofscNumber");
                        expect(y).toHaveProperty("linkedPermit");
                        expect(y).toHaveProperty("seasonId");
                        expect(y).toHaveProperty("purchaseDate");

                        expect(y).toHaveProperty("club");
                        expect(y?.club).toHaveProperty("key");
                        expect(y?.club).toHaveProperty("value");

                        expect(y).toHaveProperty("origPermitId");
                        expect(y).toHaveProperty("associationId");
                        expect(y).toHaveProperty("trackingNumber");
                        expect(y).toHaveProperty("isReplacement");
                        expect(y).toHaveProperty("effectiveDate");
                        expect(y).toHaveProperty("tempPermitDownloaded");
                        expect(y).toHaveProperty("refunded");
                        expect(y).toHaveProperty("cancelled");
                        expect(y).toHaveProperty("manualReset");
                        expect(y).toHaveProperty("isaVoucher");
                        expect(y).toHaveProperty("encryptedReference");
                        expect(y).toHaveProperty("isMostRecent");
                        expect(y).toHaveProperty("isExpired");
                    });

                    expect(x).toHaveProperty("permitOptions");
                    expect(x?.permitOptions?.length).toBeGreaterThanOrEqual(0);

                    x?.permitOptions?.forEach(y => {
                        expect(y).toHaveProperty("productId");
                        expect(y).toHaveProperty("name");
                        expect(y).toHaveProperty("displayName");
                        expect(y).toHaveProperty("frenchDisplayName");
                        expect(y).toHaveProperty("amount");
                        expect(y).toHaveProperty("testAmount");
                        expect(y).toHaveProperty("classic");
                        expect(y).toHaveProperty("multiDayUpgrade");
                        expect(y).toHaveProperty("isMultiDay");
                        expect(y).toHaveProperty("isSpecialEvent");
                        expect(y).toHaveProperty("isTrackedShipping");
                        expect(y).toHaveProperty("trackedShippingAmount");
                        expect(y).toHaveProperty("eventDate");
                        expect(y).toHaveProperty("eventName");
                        expect(y).toHaveProperty("eventClubId");
                        expect(y).toHaveProperty("csrOnly");
                        expect(y).toHaveProperty("permitDays");
                        expect(y).toHaveProperty("canBuyGiftCard");
                    });

                    expect(x).toHaveProperty("permitSelections");
                    expect(x?.permitSelections).toHaveProperty("oPermitId");
                    expect(x?.permitSelections).toHaveProperty("permitOptionId");
                    expect(x?.permitSelections).toHaveProperty("dateStart");
                    expect(x?.permitSelections).toHaveProperty("dateEnd");
                    expect(x?.permitSelections).toHaveProperty("clubId");
                });
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiGetVehicleMakes()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetVehicleMakes().subscribe({
            next: (result: IApiGetVehicleMakesResult[]) => {
                expect(result).toBeTruthy();
                expect(result.length).toBeGreaterThan(0);

                result.forEach(x => {
                    expect(x).toHaveProperty("key");
                    expect(x).toHaveProperty("value");
                });
            },
            error: (error: any) => {
                //
            }
        });
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
        GlobalAppContext.token = await getToken();

        apiGetGiftcardsForCurrentSeasonForUser().subscribe({
            next: (result: IApiGetGiftcardsForCurrentSeasonForUserResult[]) => {
                expect(result).toBeTruthy();
                expect(result.length).toBeGreaterThan(0);

                result.forEach(x => {
                    expect(x).toHaveProperty("oVoucherId");
                    expect(x).toHaveProperty("orderId");
                    expect(x).toHaveProperty("transactionDate");
                    expect(x).toHaveProperty("recipientLastName");
                    expect(x).toHaveProperty("recipientPostal");
                    expect(x).toHaveProperty("redemptionCode");
                    expect(x).toHaveProperty("purchaserEmail");
                    expect(x).toHaveProperty("productId");
                    expect(x).toHaveProperty("isRedeemed");
                    expect(x).toHaveProperty("isPurchased");
                    expect(x).toHaveProperty("useShippingAddress");
                    expect(x).toHaveProperty("shippingOption");
                    expect(x).toHaveProperty("clubId");
                    expect(x).toHaveProperty("permitId");
                });
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiGetAvailableGiftCards()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetAvailableGiftCards().subscribe({
            next: (result: IApiGetAvailableGiftCardsResult[]) => {
                expect(result).toBeTruthy();
                expect(result.length).toBeGreaterThan(0);

                result.forEach(x => {
                    expect(x).toHaveProperty("giftcardId");
                    expect(x).toHaveProperty("productId");
                    expect(x).toHaveProperty("name");
                    expect(x).toHaveProperty("displayName");
                    expect(x).toHaveProperty("frenchDisplayName");
                    expect(x).toHaveProperty("amount");
                    expect(x).toHaveProperty("testAmount");
                    expect(x).toHaveProperty("classic");
                    expect(x).toHaveProperty("isTrackedShipping");
                    expect(x).toHaveProperty("trackedShippingAmount");
                });
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiGetRedeemableGiftCardsForUser()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetRedeemableGiftCardsForUser().subscribe({
            next: (result: IApiGetRedeemableGiftCardsForUserResult) => {
                expect(result).toBeTruthy();

                expect(result).toHaveProperty("seasonalGiftCards");
                expect(result).toHaveProperty("classicGiftCards");

                expect(result?.seasonalGiftCards).toBeGreaterThanOrEqual(0);

                expect(result?.classicGiftCards).toBeGreaterThanOrEqual(0);
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiGetProcessingFee()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetProcessingFee().subscribe({
            next: (result: IApiGetProcessingFeeResult) => {
                expect(result).toBeTruthy();

                expect(result).toHaveProperty("fee");
                expect(result?.fee).toBeGreaterThanOrEqual(0);
            },
            error: (error: any) => {
                //
            }
        });
    });

    test("Test apiGetShippingFees()", async () => {
        GlobalAppContext.token = await getToken();

        apiGetShippingFees().subscribe({
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
            error: (error: any) => {
                //
            }
        });
    });


});