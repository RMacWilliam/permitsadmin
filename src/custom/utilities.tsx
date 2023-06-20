import moment from "moment";
import { IKeyValue, IParentKeyValue } from "./app-context";
import { v4 as uuidv4 } from "uuid";
import sortBy from "lodash/sortBy";
import { Constants, GlobalAppContext } from "../../constants";
import { logoutAndCleanupAppContext } from "./authentication";

export function getParentKeyValueFromSelect(e: any): IParentKeyValue | undefined {
    let result: IParentKeyValue | undefined = undefined;

    const splitValues: string[] | undefined = e?.target?.value?.split("|");

    if (splitValues != undefined) {
        const parent: string = splitValues[0];
        const key: string = splitValues[1];
        const value: string = e?.target?.selectedOptions[0]?.text;

        if (parent != undefined && key != undefined && value != undefined) {
            result = { parent: parent, key: key, value: value };
        }
    }

    return result;
}

export function getKeyValueFromSelect(e: any): IKeyValue | undefined {
    let result: IKeyValue | undefined = undefined;

    const key: string = e?.target?.value;
    const value: string = e?.target?.selectedOptions[0]?.text;

    if (key != undefined && value != undefined) {
        result = { key: key, value: value };
    }

    return result;
}

export function getDate(date?: string | Date): Date {
    if (date == undefined) {
        return moment().toDate();
    } else {
        return moment(date).toDate();
    }
}

export function parseDate(date?: string | Date): Date | undefined {
    let result: Date | undefined = undefined;

    if (date != undefined) {
        return moment(date).toDate();
    }

    return result;
}

export function getMoment(date?: string | Date): moment.Moment {
    if (date == undefined) {
        return moment();
    } else {
        return moment(date);
    }
}

export function formatShortDate(value: string | Date | undefined): string {
    let result: string = "";

    if (value != undefined && value !== "") {
        result = moment(value).format("D/M/YYYY");
    }

    return result;
}

export function getGuid(): string {
    return uuidv4();
}

export function formatCurrency(value: string | number | undefined = 0): string {
    let result: string = "";

    if (value != undefined && value !== "") {
        if (GlobalAppContext?.translation?.i18n?.language === "fr") {
            result = Number(value).toFixed(2).replace(".", ",") + "$";
        } else {
            result = "$" + Number(value).toFixed(2);
        }
    }

    return result;
}

export function sortArray(array: any[], sortByFields: string[]): any[] {
    return sortBy(array, sortByFields);
}

export function getApiErrorMessage(key: string | undefined): string | undefined {
    let result: string | undefined = undefined;

    if (key != undefined && key !== "") {
        const lookupKey: string = "API." + key;
        const message: string | undefined = GlobalAppContext?.translation?.i18n?.t(lookupKey);

        if (message !== lookupKey) {
            result = message;
        }
    }

    return result;
}

export function checkResponseStatus(error: any, redirectToLoginIf300OrGreater: boolean = true): string {
    let result: string = "";

    console.log(error);

    if (error != undefined && error instanceof Response) {
        const response: Response = error as Response;

        result = response.statusText;

        // Informational
        if (response.status >= 100 && response.status <= 199) {

        }
        // Successful
        else if (response.status >= 200 && response.status <= 299) {

        }
        // Redirection
        else if (response.status >= 300 && response.status <= 399) {
            if (redirectToLoginIf300OrGreater) {
                logoutAndCleanupAppContext();
            }
        }
        // Client error
        else if (response.status >= 400 && response.status <= 499) {
            if (redirectToLoginIf300OrGreater) {
                logoutAndCleanupAppContext();
            }
        }
        // Server error
        else if (response.status >= 500 && response.status <= 599) {
            if (redirectToLoginIf300OrGreater) {
                logoutAndCleanupAppContext();
            }
        }
    }

    return result;
}

export function getImagePath(filename: string): string {
    if (Constants.AppMode === "DEV") {
        return Constants.AppBasePath + filename;
    } else {
        return "./" + filename;
    }
}

// export function pseudoUnobfuscate(obfuscatedString?: string): number | undefined {
//     let result: number | undefined = undefined;

//     if (obfuscatedString != undefined && obfuscatedString !== "") {
//         let secretKey: string = "1111111111111111111111";
//         let obfuscatedBytes = Buffer.from(obfuscatedString, 'base64');
//         let key = Buffer.from(secretKey, 'ascii');
//         let bytes = new Uint8Array(obfuscatedBytes.length);

//         for (let i: number = 0; i < obfuscatedBytes.length; i++) {
//             bytes[i] = obfuscatedBytes[i] ^ key[i % key.length];
//         }

//         result = new DataView(bytes.buffer).getInt32(0, true);
//     }

//     return result;
// }