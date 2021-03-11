/**
 * Convert milliseconds to human readable string
 * @param  {string} milliseconds
 * @return {string} "2:10" "20:30" "05:53:50"
 **/
export function millisecondsToStr(millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = hours >= 10 ? hours : "0" + hours;
        minutes = minutes - hours * 60;
        minutes = minutes >= 10 ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = seconds >= 10 ? seconds : "0" + seconds;
    if (hours != "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}

/**
 * parses date time string and returns it in desired format
 * Example: parseTime(time, "{y}-{m}-{d} {h}:{i}")
 * @param  {string} time
 * @param  {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
    if (arguments.length === 0) {
        return null;
    }

    if ((time + "").length === 10) {
        time = +time * 1000;
    }

    const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
    let date;
    if (typeof time == "object") {
        date = time;
    } else {
        date = new Date(Date.parse(time));
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay(),
    };
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        if (key === "a") return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][value - 1];
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
