import moment from "moment";
import { IKeyValue } from "../AppContext";

export function getKeyValueFromSelect(e: any): IKeyValue | null {
    let result: IKeyValue | null = null;

    let key: string = e?.target?.value;
    let value: string = e?.target?.selectedOptions[0]?.text;

    if (key != null && value != null) {
        result = { key, value };
    }

    return result;
}

export function formatShortDate(value: string | Date): string {
    let result: string = "";

    result = moment(value).format("D/M/YYYY");

    return result;
}