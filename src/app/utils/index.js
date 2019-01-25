const uuidv1 = require("uuid/v1");
const uuidv4 = require("uuid/v4");
const moment = require("moment");

const md5 = require("@/utils/3rdparty/md5.js");

/**
 * Generates MD5 of a string
 * @returns {string}
 */
export function md5String(string) {
    return md5(string);
}

/**
 * Returns JS object of parameters from URL
 * Example:  const { pv } = param2Obj(config.url)
 * @param  {string} url URL String to be parsed
 * @return {boolean}   Returns boolean
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
 * parses date time string and returns it in desired format
 * Example: parseTime(time, "{y}-{m}-{d} {h}:{i}")
 * @param  {string} time
 * @param  {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
    time = moment(time).format("x");

    if (arguments.length === 0) {
        return null;
    }

    if ((time + "").length === 10) {
        time = +time * 1000;
    }

    const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
    let date;
    if (typeof time === "object") {
        date = time;
    } else {
        date = new Date(parseInt(time));
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
        if (result.length > 0 && value < 10) {
            value = "0" + value;
        }
        return value || 0;
    });
    return time_str;
}
