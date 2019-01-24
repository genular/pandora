/*
* @Author: LogIN-
* @Date:   2018-04-13 12:01:02
* @Last Modified by:   LogIN-
* @Last Modified time: 2018-04-13 12:13:25
*/
import { validateUsername, validateEmail, validatePassword } from "@/utils/validate";

export function isValidUsername(rule, value, cb) {
    if (!validateUsername(value)) {
        cb(new Error("Please enter valid user-name. Only number, letter and _, ., - characters are allowed."));
    } else {
        cb();
    }
}

export function isValidPassword(rule, value, cb) {
    if (!validatePassword(value)) {
        cb(new Error("The password can not be less than 8 digits and must contain at least one number, one lowercase and one uppercase letter."));
    } else {
        cb();
    }
}

export function isValidEmail(rule, value, cb) {
    if (!validateEmail(value)) {
        cb(new Error("Please enter valid email."));
    } else {
        cb();
    }
}
