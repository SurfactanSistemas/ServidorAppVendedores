import {CustomError} from "./CustomError";
import {IError} from "./Types";

export const ProcessError = (error:any):CustomError => {
    if ((error as IError).originalError) return new CustomError((error as IError).originalError.info.message);
	return error;
}