import { createContext } from 'react'
import { Updater } from 'use-immer';
import { accountPreferencesData, cartItemsData, contactInfoData, giftCardsData, snowmobilesData } from './data';
import i18n from '@/localization/i18n';

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

export interface IPermitOption {
    id: string; // guid
    name: string;
    price: number;
    requiresDateRange: boolean;
    numberOfDays?: number;
}

export interface IPermit {
    id?: string; // guid
    name?: string;
    number?: string;
    purchaseDate?: Date;
    trackingNumber?: string;

    permitOptionId?: string; // guid
    dateStart?: Date;
    dateEnd?: Date;
    clubId?: string;
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
    isEditable: boolean;
}

export interface IGiftCardOption {
    id: string; // guid
    name: string;
    price: number;
}

export interface IGiftCard {
    id: string; // guid
    giftCardOptionId: string;
    lastName: string;
    postalCode: string;
    isEditable: boolean;
}

export interface ICartItem {
    id: string; // guid
    description: string;
    price: number;
    isPermit: boolean;
    isGiftCard: boolean;
    itemId?: string;
}

export interface IShippingMethod {
    id: string; // guid
    name: string;
    price: number;
}

export interface IAppContextData {
    // Authentication
    isAuthenticated: boolean;
    email?: string;
    token?: string;

    isContactInfoVerified: boolean;

    // Shopping Cart
    cartItems?: ICartItem[];

    // Navbar selection
    navbarPage: string; // home, contact, permits, giftcards; admin-home

    // Contact Information
    contactInfo?: IContactInfo;
    accountPreferences?: IAccountPreferences;

    // Snowmobiles & Permits
    snowmobiles?: ISnowmobile[];

    // Gift Cards
    giftCards?: IGiftCard[];
}

export interface ITranslation {
    t: any;
    i18n: any;
}

export interface IAppContextValues {
    data: IAppContextData;
    updater: Updater<IAppContextData>;
    translation: ITranslation;
}

export const initialAppContextValues: IAppContextValues = {
    data: {
        isAuthenticated: false,
        email: undefined,
        token: undefined,

        isContactInfoVerified: false,

        cartItems: undefined,

        navbarPage: "home",

        contactInfo: undefined,
        accountPreferences: undefined,

        snowmobiles: undefined,

        giftCards: undefined
    },
    updater: () => { },
    translation: {
        t: Function,
        i18n: i18n
    }
};

export const AppContext = createContext(initialAppContextValues);