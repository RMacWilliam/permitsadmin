import moment from "moment";
import { IKeyValue, IParentKeyValue } from "./app-context";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { Constants, GlobalAppContext } from "../../constants";

export function getParentKeyValueFromSelect(e: any): IParentKeyValue | undefined {
    let result: IParentKeyValue | undefined = undefined;

    let splitValues: string[] | undefined = e?.target?.value?.split("|");

    if (splitValues != undefined) {
        let parent: string = splitValues[0];
        let key: string = splitValues[1];
        let value: string = e?.target?.selectedOptions[0]?.text;

        if (parent != undefined && key != undefined && value != undefined) {
            result = { parent: parent, key: key, value: value };
        }
    }

    return result;
}

export function getKeyValueFromSelect(e: any): IKeyValue | undefined {
    let result: IKeyValue | undefined = undefined;

    let key: string = e?.target?.value;
    let value: string = e?.target?.selectedOptions[0]?.text;

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
        result = Number(value).toFixed(2);
    }

    return result;
}

export function sortArray(array: any[], sortBy: string[]): any[] {
    return _.sortBy(array, sortBy);
}

export function getApiErrorMessage(key: string | undefined): string | undefined {
    let result: string | undefined = undefined;

    if (key != undefined && key !== "") {
        let lookupKey: string = "API." + key;
        let message: string | undefined = GlobalAppContext.translation?.i18n?.t(lookupKey);

        if (message !== lookupKey) {
            result = message;
        }
    }

    return result;
}

export function getImagePath(filename: string): string {
    if (Constants.AppMode === "PROD") {
        return Constants.AppBasePath + filename;
    } else {
        return "/" + filename;
    }
}