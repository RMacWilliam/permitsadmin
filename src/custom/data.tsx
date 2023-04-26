import moment from "moment";
import { IAccountPreferences, ICartItem, IContactInfo, IKeyValue, IPermitOption, IShippingMethod, ISnowmobile } from "./app-context";

export const contactInfoData: IContactInfo = {
    firstName: "John",
    middleName: "Ronald",
    lastName: "Smith",
    addressLine1: "555 Yonge Street",
    addressLine2: "Suite 258",
    city: "Toronto",
    province: { key: "ON", value: "Ontario" },
    postalCode: "M5W 1E6",
    country: { key: "CA", value: "Canada" },
    telephone: "416-555-1212",
    email: "john.smith@hotmail.com"
};

export const accountPreferencesData: IAccountPreferences = {
    ofscContactPermission: -1,
    riderAdvantage: -1,
    volunteering: -1
};

export const snowmobileMakesData: IKeyValue[] = [
    { key: "1", value: "Arctic Cat" },
    { key: "2", value: "Polaris" },
    { key: "3", value: "Ski-Doo" },
    { key: "4", value: "Yamaha" },
    { key: "1000", value: "Other" }
];

export const clubsData: IKeyValue[] = [
    { key: "1", value: "Arctic Riders Snow Club" },
    { key: "2", value: "Ontario Snow Club" }
];

export const permitOptionsData: IPermitOption[] = [
    {
        id: "0ed573cc-2e56-4f42-8ba3-b18b06cdb83f",
        name: "Classic",
        price: 190,
        requiresDateRange: false
    },
    {
        id: "cf0ffc0f-df83-4859-a91b-cd3bd0450685",
        name: "Multi Day 4",
        price: 180,
        requiresDateRange: true
    },
    {
        id: "6fef1835-4f88-4a0d-b076-5b305e18f6a8",
        name: "Multi Day 3",
        price: 135,
        requiresDateRange: true
    },
    {
        id: "32068505-5ff6-4e5d-9ae9-318dd6cca9de",
        name: "Multi Day 2",
        price: 90,
        requiresDateRange: true
    }
];

export const snowmobilesData: ISnowmobile[] = [
    {
        id: "fe71f3b9-a1a1-41f7-a2cc-69d84651e9f5",
        year: "2020",
        make: { key: "1", value: "Arctic Cat" },
        model: "Winter Warrior",
        vin: "2YPT377814V001214",
        licensePlate: "ABCD123",
        permitForThisSnowmobileOnly: true,
        registeredOwner: true,
        permit: {
            id: "582b3bda-efc7-4e2b-8bba-f893e9db3ea9",
            name: "Seasonal",
            number: "K0265293",
            purchaseDate: moment("2022-10-31T18:25:43.511Z").toDate(),
            trackingNumber: "292980921743_C1-92987434"
        },
        permitOptions: undefined,
        permitSelections: undefined,
        isEditable: false,
        isAddedToCart: false
    },
    {
        id: "dce627b3-d0ce-4b29-b56c-600a9191d545",
        year: "2018",
        make: { key: "2", value: "Polaris" },
        model: "Snowmaster 2000",
        vin: "2YPT377814V003589",
        licensePlate: "ADEE336",
        permitForThisSnowmobileOnly: true,
        registeredOwner: true,
        permit: undefined,
        permitOptions: permitOptionsData,
        permitSelections: undefined,
        isEditable: true,
        isAddedToCart: false
    }
];

export const cartItemsData: ICartItem[] = [
    // {
    //     id: "a7bb35b6-367e-4f4f-81ff-007ca9e4a1d7",
    //     description: "2005 Yamaha Some Model DRFF2122030493 Classic (Arctic Riders Snow Club)",
    //     price: 190,
    //     isPermit: true,
    //     isGiftCard: false,
    //     snowmobileId: ""
    // }
];

export const shippingMethodsData: IShippingMethod[] = [
    {
        id: "73cd7359-acc1-4c64-a691-6668586a4f27",
        name: "Standard",
        price: 0
    },
    {
        id: "3744e5d4-3012-4c05-809d-4d8db59c8fe8",
        name: "Tracked",
        price: 10
    }
];

export const transactionAndAdministrationFee: number = 7.5;