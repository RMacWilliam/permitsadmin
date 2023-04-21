import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { createContext } from 'react'
import { Updater } from 'use-immer';

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
    ofscContactPermission?: boolean;
    riderAdvantage?: boolean;
    volunteering?: number; // 0=No; 1=Yes, I already volunteer; 2=Yes, I'd like to volunteer
}

export interface IAppContextData {
    // Authentication
    isAuthenticated: boolean;
    email?: string;
    token?: string;

    // Shopping Cart
    cartItems: number;

    // Navbar selection
    navbarPage: string;

    // Contact Information
    contactInfo: IContactInfo;
    accountPreferences: IAccountPreferences;
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

        cartItems: 0,

        navbarPage: 'home', // home, contact, permits, giftcards; admin-home

        contactInfo: {
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
        },
        accountPreferences: {
            ofscContactPermission: true,
            riderAdvantage: true,
            volunteering: 2
        }
    },
    updater: () => { }
};

export const AppContext = createContext(appContextValues);