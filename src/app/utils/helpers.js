/*
* @Author: LogIN-
* @Date:   2018-01-25 14:43:35
* @Last Modified by:   LogIN-
* @Last Modified time: 2018-07-22 14:19:38
*/
const md5 = require("@/utils/3rdparty/md5.js");

export function sortAlphaNum(a, b) {
    if (a === b) {
        return 0;
    }
    if (typeof a === typeof b) {
        return a < b ? -1 : 1;
    }
    return typeof a < typeof b ? -1 : 1;
}

// asyncForEach(selectedHeaderFields, async feature => {
//     await ApiGetSimonPreAnalysisDetails(data)
//         .then(response => {
//         })
//         .catch(error => {
//         });
// });
export async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

export function levenshteinDistance(s, t) {
    var thisLength = s.length;
    var thatLength = t.length;

    //    if (Math.abs(thisLength - thatLength) > (limit || 32)) return limit || 32;
    if (thisLength === 0) return thatLength;
    if (thatLength === 0) return thisLength;
    if (thisLength == thatLength) return 0;

    var matrix = new Array(thisLength + 1);
    var i = thisLength;
    var j = thatLength;
    for (; i >= 0; i--) matrix[i] = [i];
    for (; j >= 0; j--) matrix[0][j] = j;

    // Calculate matrix.
    var this_i, that_j, cost, min, t, x, y;
    for (i = 1, x = 0; i <= thisLength; ++i, ++x) {
        // x = i - 1;
        this_i = s[x];

        // Step 4
        for (j = 1, y = 0; j <= thatLength; ++j, ++y) {
            // Check the jagged ld total so far
            if (i === j && matrix[i][j] > 4) return thisLength;

            // y = j - 1;
            that_j = t[y];
            cost = this_i === that_j ? 0 : 1; // Step 5
            // Calculate the minimum (much faster than Math.min(...)).
            min = matrix[x][j] + 1; // Deletion.
            if ((t = matrix[i][y] + 1) < min) min = t; // Insertion.
            if ((t = matrix[x][y] + cost) < min) min = t; // Substitution.

            matrix[i][j] = min; // Update matrix.
        }
    }

    return matrix[thisLength][thatLength];
}

/** Check if a string is a valid JSON string
 *
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
 *
 */
export function createHashFromArrayID(data, identifier = "id") {
    const IDs = data
        .map(function(value) {
            return value[identifier];
        })
        .sort(sortAlphaNum);

    return md5(JSON.stringify(IDs));
}

export function findObjectByKey(dataArray, key, value) {
    return dataArray.find(function(obj) {
        return obj[key] === value;
    });
}
/**
 * find index of an object by key and value in an javascript dataArray
 */
export function findObjectIndexByKey(dataArray, key, value) {
    return dataArray.findIndex(obj => obj[key] === value);
}
/*
 * removeDuplicates(arrayWithDuplicates, 'size');
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
 * intersection(array1, array2, array3, array4); //["Lorem"]
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

/* Orderby JavaScript function
 *
 */
export function orderBy(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
    });
}
