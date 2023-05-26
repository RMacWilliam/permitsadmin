import { createContext } from 'react'
import { Updater } from 'use-immer';
import { i18n } from 'i18next';

export interface IParentKeyValue {
    parent: string;
    key: string;
    value: string;
    valueFr?: string;
}

export interface IKeyValue {
    key: string;
    value: string;
    valueFr?: string;
}

export interface IContactInfo {
    personId?: string;
    firstName?: string;
    initial?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    province?: IParentKeyValue;
    postalCode?: string;
    country?: IKeyValue;
    telephone?: string;
    email?: string;
    adminUser?: boolean;
    verified?: boolean;
}

export interface IAccountPreferences {
    ofscContactPermission?: number; // -1=Unset; 0=No; 1=Yes
    riderAdvantage?: number; // -1=Unset; 0=No; 1=Yes
    volunteering?: number; // -1=Unset; 0=No; 1=Yes, I already volunteer; 2=Yes, I'd like to volunteer
}

export interface IPermitOption {
    productId?: number;
    name?: string;
    displayName?: string;
    frenchDisplayName?: string;
    amount?: number;
    testAmount?: number;
    classic?: boolean;
    multiDayUpgrade?: boolean;
    isMultiDay?: boolean;
    isSpecialEvent?: boolean;
    eventDate?: Date;
    eventName?: string; // TODO: Correct type?
    eventClubId?: number; // TODO: Correct type?
    csrOnly?: boolean;
    permitDays?: number;
    canBuyGiftCard?: boolean;
}

export interface IPermit {
    oPermitId?: string;
    permitType?: IKeyValue;
    ofscNumber?: number; // TODO: Correct type?
    linkedPermit?: string;
    seasonId?: number;
    purchaseDate?: Date;
    club?: IKeyValue;
    origPermitId?: string; // guid
    associationId?: number; // TODO: Correct type?
    trackingNumber?: string;
    isReplacement?: boolean;
    effectiveDate?: Date;
    tempPermitDownloaded?: boolean;
    refunded?: boolean;
    cancelled?: boolean;
    manualReset?: boolean;
    isaVoucher?: boolean;
    encryptedReference?: string;
    isMostRecent?: boolean;
    isExpired?: boolean;
}

export interface IPermitSelections {
    oPermitId?: string;
    permitOptionId?: number;
    dateStart?: Date;
    dateEnd?: Date;
    clubId?: number;
}

export interface ISnowmobile {
    oVehicleId?: string;
    vehicleMake?: IKeyValue;
    model?: string;
    vin?: string;
    licensePlate?: string;
    vehicleYear?: string;
    origVehicleId?: number; // TODO: Correct type?
    isClassic?: boolean;
    isEditable?: boolean;
    permits?: IPermit[];
    permitOptions?: IPermitOption[];
    permitSelections?: IPermitSelections;
}

export interface IGiftCardType {
    productId?: number;
    name?: string;
    displayName?: string;
    frenchDisplayName?: string;
    amount?: number;
    testAmount?: number;
    classic?: boolean;
    multiDayUpgrade?: boolean;
    isMultiDay?: boolean;
    isSpecialEvent?: boolean;
    isTrackedShipping?: boolean;
    trackedShippingAmount?: number;
    eventDate?: Date;
    eventName?: string;
    eventClubId?: number;
    csrOnly?: boolean;
    permitDays: number;
    canBuyGiftCard?: boolean;
}

export interface IGiftCard {
    oVoucherId?: string;
    orderId?: string;
    transactionDate?: Date;
    recipientLastName?: string;
    recipientPostal?: string;
    redemptionCode?: string;
    purchaserEmail?: string;
    productId?: number;
    redeemed?: boolean;
    useShippingAddress?: boolean;
    shippingOption?: string;
    clubId?: number;
    permitId?: number;
    isPurchased?: boolean;
    isRedeemed?: boolean;

    uiIsInEditMode?: boolean;
    uiRecipientLastName?: string;
    uiRecipientPostal?: string;
}

export interface IRedeemableGiftCards {
    seasonalGiftCards?: number;
    classicGiftCards?: number;
}

export interface ICartItem {
    id: string; // guid
    description: string;
    descriptionFr: string;
    price: number;
    isPermit: boolean;
    isGiftCard: boolean;
    itemId?: string;

    // TODO: Add gift card info here after lookup for use in cart.
    redemptionCode?: string;
    giftCardAmount?: number;
    giftCardTrackingShippingAmount?: number;

    uiRedemptionCode: string; // This is a controlled field. Cannot be undefined.
    uiShowRedemptionCodeNotFound?: boolean;
}

export interface IShippingFee {
    id?: string;
    name?: string;
    price?: number;
    showConfirmation?: boolean;
}

export interface IAppContextData {
    // Authentication
    isAuthenticated: boolean;
    email?: string;
    token?: string;

    language: string;

    isFirstLoginOfSeason?: boolean;
    isContactInfoVerified?: boolean;

    // Shopping Cart
    cartItems?: ICartItem[];

    // Navbar selection
    navbarPage?: "index" | "home" | "contact" | "permits" | "gift-cards" | "cart" | "checkout" | "admin-home";

    // Contact Information
    contactInfo?: IContactInfo;
    accountPreferences?: IAccountPreferences;

    // Snowmobiles & Permits
    snowmobiles?: ISnowmobile[];

    // Gift Cards
    giftCards?: IGiftCard[];
}

export interface ITranslation {
    t: Function;
    i18n: i18n;
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

        language: "en",

        isFirstLoginOfSeason: false,
        isContactInfoVerified: false,

        cartItems: undefined,

        navbarPage: undefined,

        contactInfo: undefined,
        accountPreferences: undefined,

        snowmobiles: undefined,

        giftCards: undefined
    },
    updater: () => { },
    translation: {} as ITranslation
};

export const AppContext = createContext(initialAppContextValues);
