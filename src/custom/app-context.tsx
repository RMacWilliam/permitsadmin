import { createContext } from 'react'
import { Updater } from 'use-immer';
import { accountPreferencesData, cartItemsData, contactInfoData, snowmobilesData } from './data';

export interface IKeyValue {
    key: string;
    value: string;
}

export interface IContactInfo {
    firstName: string;
    middleName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: IKeyValue;
    postalCode: string;
    country: IKeyValue;
    telephone: string;
    email: string;
}

export interface IAccountPreferences {
    ofscContactPermission: number; // -1=Unset; 0=No; 1=Yes
    riderAdvantage: number; // -1=Unset; 0=No; 1=Yes
    volunteering: number; // -1=Unset; 0=No; 1=Yes, I already volunteer; 2=Yes, I'd like to volunteer
}

export interface IPermit {
    id: string; // guid
    name: string;
    number: string;
    purchaseDate: Date;
    trackingNumber: string;
}

export interface IPermitOption {
    id: string; // guid
    name: string;
    price: number;
    requiresDateRange: boolean;
}

export interface ISnowmobile {
    id: string; // guid
    year: string;
    make: IKeyValue;
    model: string;
    vin: string;
    licensePlate: string;
    permitForThisSnowmobileOnly: boolean;
    registeredOwner: boolean;
    permit?: IPermit;
    permitOptions?: IPermitOption[];
}

export interface ICartItem {
    id: string; // guid
    description: string;
    price: number;
}

export interface IAppContextData {
    // Authentication
    isAuthenticated: boolean;
    email?: string;
    token?: string;

    // Shopping Cart
    cartItems: ICartItem[];

    // Navbar selection
    navbarPage: string;

    // Contact Information
    contactInfo: IContactInfo;
    accountPreferences: IAccountPreferences;

    // Snowmobiles & Permits
    snowmobiles: ISnowmobile[];
}

export interface IAppContextValues {
    data: IAppContextData;
    updater: Updater<IAppContextData>;
}

export const appContextValues: IAppContextValues = {
    data: {
        isAuthenticated: false,
        email: undefined,
        token: undefined,

        cartItems: cartItemsData,

        navbarPage: "home", // home, contact, permits, giftcards; admin-home

        contactInfo: contactInfoData,
        accountPreferences: accountPreferencesData,

        snowmobiles: snowmobilesData
    },
    updater: () => { }
};

export const AppContext = createContext(appContextValues);