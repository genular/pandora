export function validateUsername(str) {
    var validcharacters = "1234567890-_.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0, l = str.length; i < l; ++i) {
        if (validcharacters.indexOf(str.substr(i, 1)) == -1) {
            return false;
        }
        return true;
    }
}
export function validateEmail(str) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(str);
}

export function validatePassword(str) {
    if (str.length < 8) {
        return false;
    } else {
        return true;
    }
}

export function validateURL(textval) {
    const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
}

export function validateLowerCase(str) {
    const reg = /^[a-z]+$/;
    return reg.test(str);
}

export function validateUpperCase(str) {
    const reg = /^[A-Z]+$/;
    return reg.test(str);
}

export function validatAlphabets(str) {
    const reg = /^[A-Za-z]+$/;
    return reg.test(str);
}

/**
 *
 */
export function isAlphaNumeric(str) {
    let code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        // http://blogs.longwin.com.tw/lifetype/key_codes.html
        code = str.charCodeAt(i);
        if (
            !(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code >= 95 && code < 123) && // underscore and lower alpha (a-z)
            !(code >= 45 && code <= 46) // - and .
        ) {
            return false;
        }
    }
    return true;
}

/**
 * Loop through array of column names and check if they are in correct format
 */
export function validateFeatures(features) {
    const invalid_features = [];
    let i, len, check;

    for (i = 0, len = features.length; i < len; i++) {
        check = false;
        if (typeof features[i] !== "undefined") {

            check = isAlphaNumeric(features[i]);

        }
        if (check === false) {
            if (typeof features[i] !== "undefined" && invalid_features.indexOf(features[i]) === -1) {
                invalid_features.push(features[i]);
            } else {
                invalid_features.push("Column - " + i);
            }
        }
    }
    return invalid_features;
}
