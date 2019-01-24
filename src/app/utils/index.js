const uuidv1 = require("uuid/v1");
const uuidv4 = require("uuid/v4");

const Sha3 = require("@/utils/3rdparty/sha3.js");
const md5 = require("@/utils/3rdparty/md5.js");

/**
 * Given an array of positive integers find all the duplicate elements.
 * https://js-algorithms.tutorialhorizon.com/2016/01/25/find-duplicates-in-an-array/
 */
export function findDuplicates(data) {
    const result = [];

    data.forEach(function(element, index) {
        // Find if there is a duplicate or not
        if (data.indexOf(element, index + 1) > -1) {
            // Find if the element is already in the result array or not
            if (result.indexOf(element) === -1) {
                result.push(element);
            }
        }
    });

    return result;
}

/**
 * Generates random SHA3-512 UUID string
 * @returns {string}
 */
export function getUUID() {
    const random01 = uuidv1();
    const random02 = uuidv4();

    const hash = Sha3.hash512(random01 + random02);
    return hash;
}

/**
 * Generates MD5 of a string
 * @returns {string}
 */
export function md5String(string) {
    return md5(string);
}

/**
 * Generates SHA3-512 of a string
 * @returns {string}
 */
export function sha3String(string) {
    return Sha3.hash512(string);
}

/**
 *
 *
 * @returns {string}
 */
export function getQueryObject(url) {
    url = url == null ? window.location.href : url;
    const search = url.substring(url.lastIndexOf("?") + 1);
    const obj = {};
    const reg = /([^?&=]+)=([^?&=]*)/g;
    search.replace(reg, (rs, $1, $2) => {
        const name = decodeURIComponent($1);
        let val = decodeURIComponent($2);
        val = String(val);
        obj[name] = val;
        return rs;
    });
    return obj;
}

/**
 *
 *
 * @returns {string}
 */
export function param2Obj(url) {
    const search = url.split("?")[1];
    if (!search) {
        return {};
    }
    return JSON.parse(
        '{"' +
            decodeURIComponent(search)
                .replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"') +
            '"}'
    );
}

/**
 *
 *
 * @returns null
 */
export function scrollTo(element, to, duration) {
    if (duration <= 0) return;
    const difference = to - element.scrollTop;
    const perTick = (difference / duration) * 10;
    setTimeout(() => {
        console.log(new Date());
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollTo(element, to, duration - 10);
    }, 10);
}

/**
 *
 *
 * @returns {string}
 */
export function parseTime(time, cFormat) {
    if (arguments.length === 0) {
        return null;
    }
    const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
    let date;
    if (typeof time === "object") {
        date = time;
    } else {
        if (("" + time).length === 10) time = parseInt(time) * 1000;
        date = new Date(time);
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    };
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        if (key === "a") return ["一", "二", "三", "四", "五", "六", "日"][value - 1];
        if (result.length > 0 && value < 10) {
            value = "0" + value;
        }
        return value || 0;
    });
    return time_str;
}
export function debounce(func, wait, immediate) {
    let timeout, args, context, timestamp, result;

    const later = function() {
        const last = +new Date() - timestamp;
        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function(...args) {
        context = this;
        timestamp = +new Date();
        const callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
}
