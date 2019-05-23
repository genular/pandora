/*
 * @Author: LogIN-
 * @Date:   2018-01-25 14:43:35
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-05-16 15:01:44
 */
const md5 = require("@/utils/3rdparty/md5.js");
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
/**
 * Sorts alphanumeric array You can use it in this way: array.sort(sortAlphaNum)
 * @param  {[type]} a Array item a
 * @param  {[type]} b Array item b
 * @return {boolean}   Returns boolean
 */
export function sortAlphaNum(a, b) {
    if (a === b) {
        return 0;
    }
    if (typeof a === typeof b) {
        return a < b ? -1 : 1;
    }
    return typeof a < typeof b ? -1 : 1;
}

/* Order-by function
 * Example: this.avaliablePackages = orderBy(allPackagesUnique, "internal_id")
 */
export function orderBy(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
    });
}

/**
 * [findMinMax description]
 * @param  {[type]} objectArray  [description]
 * @param  {[type]} objProp      [description]
 * @param  {[type]} decimalPoint [description]
 * @return {[type]}              [description]
 */
export function findMinMax(objectArray, objProp, decimalPoint) {
    let firstIndex = -1;

    for (let i = 0; i < objectArray.length; i += 1) {
        if (typeof objectArray[i][objProp] !== "undefined") {
            // Only process numeric entries
            if (isNumeric(objectArray[i][objProp])) {
                firstIndex = i;
                break;
            }
        }
    }

    if (firstIndex === -1) {
        return [0, 0, 0];
    }

    let min = objectArray[firstIndex][objProp],
        max = objectArray[firstIndex][objProp];

    for (let i = 1, len = objectArray.length; i < len; i++) {
        if (typeof objectArray[i][objProp] !== "undefined") {
            let v = objectArray[i][objProp];
            // Only process numeric entries
            if (isNumeric(v)) {
                min = v < min ? v : min;
                max = v > max ? v : max;
            }
        }
    }
    min = +min.toFixed(decimalPoint);
    max = +max.toFixed(decimalPoint);

    let step = (max - min) / 10;
    step = +step.toFixed(decimalPoint);

    if (!isNumeric(min)) {
        min = 0;
    }
    if (!isNumeric(max)) {
        max = 1;
    }
    if (!isNumeric(step)) {
        step = 0.01;
    }

    if(min === max){
        step = 0.01;
    }

    return [min, max, step];
}

/** Check if a string is a valid JSON string
 * @param  {string} String to check
 * @return {boolean}   Returns boolean
 */
export function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/** Created MD5 Hash from ID values contained in array
 * Example: const selectedFilesHash = createHashFromArrayID(this.selectedFiles)
 * @param  {array} Array of objects
 * @param  {string} ID of array key to use as key
 * @return {string} 32 character MD5 hash
 */
export function createHashFromArrayID(data, identifier = "id") {
    const IDs = data
        .map(function(value) {
            return value[identifier];
        })
        .sort(sortAlphaNum);

    return md5(JSON.stringify(IDs));
}

/**
 * find index of an object by key and value in an javascript dataArray
 * Example: const resampleIndex = findObjectIndexByKey(this.datasetResamples[index].data, "selected", true)
 */
export function findObjectIndexByKey(dataArray, key, value) {
    return dataArray.findIndex(obj => obj[key] === value);
}
/*
 * Removes duplicate array objects if their keys have same values
 * Example: const allPackagesUnique = removeDuplicateObjectsByKey(allPackages, "internal_id")
 */
export function removeDuplicateObjectsByKey(dataArray, objKey) {
    var trimmedArray = [];
    var values = [];
    var value;

    for (var i = 0; i < dataArray.length; i++) {
        value = dataArray[i][objKey];

        if (values.indexOf(value) === -1) {
            trimmedArray.push(dataArray[i]);
            values.push(value);
        }
    }

    return trimmedArray;
}

/**
 * Calculates intersection of arrays
 * Example: const selectionDifference = arrayIntersection(selected, this[selectors[i]]);
 */
export function arrayIntersection() {
    var result = [];
    var lists;

    if (arguments.length === 1) {
        lists = arguments[0];
    } else {
        lists = arguments;
    }

    for (var i = 0; i < lists.length; i++) {
        var currentList = lists[i];
        for (var y = 0; y < currentList.length; y++) {
            var currentValue = currentList[y];
            if (result.indexOf(currentValue) === -1) {
                var existsInAll = true;
                for (var x = 0; x < lists.length; x++) {
                    if (lists[x].indexOf(currentValue) === -1) {
                        existsInAll = false;
                        break;
                    }
                }
                if (existsInAll) {
                    result.push(currentValue);
                }
            }
        }
    }
    return result;
}
/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear'
 * that is a function which will clear the timer to prevent previously scheduled executions.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

export function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    if (null == wait) wait = 100;

    function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                context = args = null;
            }
        }
    }

    var debounced = function() {
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };

    debounced.clear = function() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    debounced.flush = function() {
        if (timeout) {
            result = func.apply(context, args);
            context = args = null;

            clearTimeout(timeout);
            timeout = null;
        }
    };

    return debounced;
}

/**
 * [tableSorting description]
 * @param  {[type]} v1        [description]
 * @param  {[type]} v2        [description]
 * @param  {[type]} columnIds [description]
 * @return {[type]}           [description]
 */
export function tableSorting(v1, v2, columnIds) {
    if (typeof v1[columnIds[0]] === "undefined") {
        v1[columnIds[0]] = {};
        v1[columnIds[0]][columnIds[1]] = 0;
    } else if (typeof v1[columnIds[0]][columnIds[1]] === "undefined") {
        v1[columnIds[0]][columnIds[1]] = 0;
    }

    if (typeof v2[columnIds[0]] === "undefined") {
        v2[columnIds[0]] = {};
        v2[columnIds[0]][columnIds[1]] = 0;
    } else if (typeof v2[columnIds[0]][columnIds[1]] === "undefined") {
        v2[columnIds[0]][columnIds[1]] = 0;
    }

    return v1[columnIds[0]][columnIds[1]] - v2[columnIds[0]][columnIds[1]];
}
