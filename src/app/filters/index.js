const moment = require("moment");

function numberEnding(number) {
    return number > 1 ? "s" : "";
}
/**
 * Convert milliseconds to human readable string
 *
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
 * Format time
 *
 **/
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

export function toThousandslsFilter(num) {
    return (+num || 0).toString().replace(/^-?\d+/g, (m) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ","));
}

export function truncateString(text, stop, clamp) {
    return text.slice(0, stop) + (stop < text.length ? clamp || "..." : "");
}

/**
 * http://json2html.com/builder/#json-tab
 * {class_name: "outcome", feature_set_type: 1, measurement_type: 1, value: "high", result: 1880}
 */
export function proportionsToHTMLTableTrain(data) {
    const proportions_train = data.filter(function(e) {
        return e.feature_set_type === 1 && e.measurement_type === 1;
    });

    const transform_train = {
        "<>": "li",
        html: [
            { "<>": "span", style: "float: left;", html: "${class_name} (${value})" },
            { "<>": "span", style: "float: right;", html: "${result}" }
        ]
    };

    const html_train = json2html.transform(proportions_train, transform_train);

    return html_train;
}

export function proportionsToHTMLTableTest(data) {
    const proportions_test = data.filter(function(e) {
        return e.feature_set_type === 2 && e.measurement_type === 1;
    });

    const transform_test = {
        "<>": "li",
        html: [
            { "<>": "span", style: "float: left;", html: "${class_name} (${value})" },
            { "<>": "span", style: "float: right;", html: "${result}" }
        ]
    };

    const html_test = json2html.transform(proportions_test, transform_test);

    return html_test;
}
