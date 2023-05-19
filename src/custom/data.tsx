// import moment from "moment";
// import { IAccountPreferences, ICartItem, IContactInfo, IGiftCard, IGiftCardType, IKeyValue, IParentKeyValue, IPermitOption, IShippingMethod, ISnowmobile } from "./app-context";

// export const contactInfoData: IContactInfo = {
//     firstName: "John",
//     initial: "R",
//     lastName: "Smith",
//     addressLine1: "555 Yonge Street",
//     addressLine2: "Suite 258",
//     city: "Toronto",
//     province: { key: "ON", value: "Ontario" },
//     postalCode: "M5W 1E6",
//     country: { key: "CA", value: "Canada" },
//     telephone: "416-555-1212",
//     email: "john.smith@hotmail.com"
// };

// export const provincesData: IParentKeyValue[] = [
//     { parent: "CA", key: "ON", value: "Ontario"},
//     { parent: "CA", key: "QC", value: "Quebec" },
//     { parent: "US", key: "MI", value: "Michigan" },
//     { parent: "US", key: "CA", value: "California" },
//     { parent: "OT", key: "MX", value: "Mexico" },
// ];

// export const countriesData: IKeyValue[] = [
//     { key: "CA", value: "Canada" },
//     { key: "US", value: "United States"},
//     { key: "OT", value: "Other"}
// ];

// export const accountPreferencesData: IAccountPreferences = {
//     ofscContactPermission: -1,
//     riderAdvantage: -1,
//     volunteering: -1
// };

// export const snowmobileMakesData: IKeyValue[] = [
//     { key: "1", value: "Arctic Cat" },
//     { key: "2", value: "Polaris" },
//     { key: "3", value: "Ski-Doo" },
//     { key: "4", value: "Yamaha" },
//     { key: "1000", value: "Other" }
// ];

// export const clubsData: IKeyValue[] = [
//     { key: "1", value: "Arctic Riders Snow Club" },
//     { key: "2", value: "Ontario Snow Club" }
// ];

// export const permitOptionsData: IPermitOption[] = [
//     {
//         productId: "0ed573cc-2e56-4f42-8ba3-b18b06cdb83f",
//         name: "Seasonal",
//         amount: 280,
//         isMultiDay: false,
//         permitDays: undefined
//     },
//     {
//         productId: "e60c5c87-260d-4c79-91d8-52967200ab7a",
//         name: "Multi Day 6",
//         amount: 270,
//         isMultiDay: true,
//         permitDays: 6
//     },
//     {
//         productId: "46b64fcc-bf66-4d64-89ed-e958282b72cd",
//         name: "Multi Day 5",
//         amount: 225,
//         isMultiDay: true,
//         permitDays: 5
//     },
//     {
//         productId: "cf0ffc0f-df83-4859-a91b-cd3bd0450685",
//         name: "Multi Day 4",
//         amount: 180,
//         isMultiDay: true,
//         permitDays: 4
//     },
//     {
//         productId: "6fef1835-4f88-4a0d-b076-5b305e18f6a8",
//         name: "Multi Day 3",
//         amount: 135,
//         isMultiDay: true,
//         permitDays: 3
//     },
//     {
//         productId: "32068505-5ff6-4e5d-9ae9-318dd6cca9de",
//         name: "Multi Day 2",
//         amount: 90,
//         isMultiDay: true,
//         permitDays: 2
//     }
// ];

// export const snowmobilesData: ISnowmobile[] = [
//     {
//         oVehicleId: "fe71f3b9-a1a1-41f7-a2cc-69d84651e9f5",
//         vehicleYear: "2020",
//         vehicleMake: { key: "1", value: "Arctic Cat" },
//         model: "Winter Warrior",
//         vin: "2YPT377814V001214",
//         licensePlate: "ABCD123",
//         permitForThisSnowmobileOnly: true,
//         registeredOwner: true,
//         permit: {
//             permitId: "582b3bda-efc7-4e2b-8bba-f893e9db3ea9",
//             name: "Seasonal",
//             number: "K0265293",
//             purchaseDate: moment("2022-10-31T18:25:43.511Z").toDate(),
//             trackingNumber: "292980921743_C1-92987434",

//             permitOptionId: "0ed573cc-2e56-4f42-8ba3-b18b06cdb83f",
//             dateStart: undefined,
//             dateEnd: undefined,
//             clubId: "1", // Arctic Riders Snow Club
//             shipToRegisteredOwnerAddress: true,
//             alternateAddress: undefined
//         },
//         permitOptions: undefined,
//         isEditable: false
//     },
//     {
//         oVehicleId: "dce627b3-d0ce-4b29-b56c-600a9191d545",
//         vehicleYear: "2018",
//         vehicleMake: { key: "2", value: "Polaris" },
//         model: "Snowmaster 2000",
//         vin: "2YPT377814V003589",
//         licensePlate: "ADEE336",
//         permitForThisSnowmobileOnly: true,
//         registeredOwner: true,
//         permit: undefined,
//         permitOptions: permitOptionsData,
//         isEditable: true
//     }
// ];

// export const giftCardOptionsData: IGiftCardType[] = [
//     {
//         id: "f4305623-bd5c-4c5a-b624-7a82fb21a1b5",
//         name: "Seasonal",
//         price: 287.5
//     },
//     {
//         id: "b85f91f5-a633-450b-986a-9e2308a53e9f",
//         name: "Classic",
//         price: 197.5
//     }
// ];

// export const giftCardsData: IGiftCard[] = [
//     {
//         oVoucherId: "3347ddc6-b6cc-479e-ab26-920c42383d02",
//         productId: 3, // Seasonal
//         recipientLastName: "SMITH",
//         recipientPostal: "M5W 1E6",
//         isEditable: false
//     }
// ];

// export const cartItemsData: ICartItem[] = [
//     // {
//     //     id: "a7bb35b6-367e-4f4f-81ff-007ca9e4a1d7",
//     //     description: "2005 Yamaha Some Model DRFF2122030493 Classic (Arctic Riders Snow Club)",
//     //     price: 190,
//     //     isPermit: true,
//     //     isGiftCard: false,
//     //     snowmobileId: ""
//     // }
// ];

// export const shippingMethodsData: IShippingMethod[] = [
//     {
//         id: "73cd7359-acc1-4c64-a691-6668586a4f27",
//         name: "Standard",
//         price: 0,
//         showConfirmation: true
//     },
//     {
//         id: "3744e5d4-3012-4c05-809d-4d8db59c8fe8",
//         name: "Tracked",
//         price: 10,
//         showConfirmation: false
//     }
// ];

//export const transactionAndAdministrationFee: number = 7.5;