const moment = require("moment");

function numberEnding(number) {
    return number > 1 ? "s" : "";
}
/**
 * Convert milliseconds to human readable string
 * @param  {string} milliseconds
 * @return {string}
 **/
export function millisecondsToStr(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + " year" + numberEnding(years);
    }
    // TODO: Months! Maybe weeks?
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + " day" + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + " hour" + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + " minute" + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + " second" + numberEnding(seconds);
    }
    return "less than a second";
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

/**
 * Truncates string and addds custom end to it
 * Example: {{feature.original | truncateString(10)}}
 * @param  {string} text 
 * @param  {string} stop 
 * @param  {string} clamp
 * @return {string}      
 */
export function truncateString(text, stop, clamp) {
    return text.slice(0, stop) + (stop < text.length ? clamp || "..." : "");
}