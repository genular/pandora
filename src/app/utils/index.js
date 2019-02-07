const uuidv1 = require("uuid/v1");
const uuidv4 = require("uuid/v4");
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