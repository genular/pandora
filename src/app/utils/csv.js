/*
* @Author: LogIN-
* @Date:   2018-03-02 16:01:09
* @Last Modified by:   LogIN-
* @Last Modified time: 2018-06-28 16:39:11
*/

/**
 * Exports Java-script array to CSV File
 *
 */
export function exportCSVString(JSONData) {
    var csvData = typeof JSONData != "object" ? JSON.parse(JSONData) : JSONData,
        csvHeaders,
        csvOutput = "",
        csvRows = [],
        BREAK = "\r\n",
        DELIMITER = ",";

    // Get and Write the headers
    csvHeaders = Object.keys(csvData[0]);
    csvOutput += csvHeaders.join(",") + BREAK;

    for (var i = 0; i < csvData.length; i++) {
        var rowElements = [];
        for (var k = 0; k < csvHeaders.length; k++) {
            rowElements.push(csvData[i][csvHeaders[k]]);
        } // Write the row array based on the headers
        csvRows.push(rowElements.join(DELIMITER));
    }

    csvOutput += csvRows.join(BREAK);

    return csvOutput;
}

export function roughSizeOfObject(object) {
    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
        var value = stack.pop();

        if (typeof value === "boolean") {
            bytes += 4;
        } else if (typeof value === "string") {
            bytes += value.length * 2;
        } else if (typeof value === "number") {
            bytes += 8;
        } else if (typeof value === "object" && objectList.indexOf(value) === -1) {
            objectList.push(value);

            for (var i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}

export function getSimonAnalysisCSVFileDetails(filepath, selectedFeatures, selectedOutcome, selectedClasses) {
    const headers = selectedFeatures.concat(selectedOutcome, selectedClasses);
    const outcome_and_classes = selectedOutcome.concat(selectedClasses);

    const r_data = {
        header: false,

        row_counter: 0,
        na_values: 0,
        invalid_samples: 0,

        headerTypes: {}
    };

    return new Promise((resolve, reject) => {
        const parser = csv
            .fromPath(filepath, { headers: true, ignoreEmpty: true, discardUnmappedColumns: true, trim: true })
            .on("data", function(data) {
                r_data.row_counter++;
                let is_valid = true;
                /** Save initial object keys as CSV Header Values */
                if (r_data.header === false) {
                    r_data.header = Object.keys(data);
                }
                /** Loop CSV Header and check if data is a valid number */
                for (let x = 0; x < r_data.header.length; x++) {
                    /* Do we need to Check this specific key */
                    if (headers.indexOf(r_data.header[x]) > -1) {
                        /** Value of a field */
                        let fieldValue = data[r_data.header[x]];

                        // Check if current field is outcome_and_classes field
                        if (outcome_and_classes.indexOf(r_data.header[x]) > -1) {
                            // Define header key if doesn't exist
                            if (typeof r_data.headerTypes[r_data.header[x]] === "undefined") {
                                r_data.headerTypes[r_data.header[x]] = [];
                            }
                            // Collect few column samples
                            if (r_data.headerTypes[r_data.header[x]].length <= 50) {
                                // Add current value to outcome array only if its not in array already
                                if (r_data.headerTypes[r_data.header[x]].indexOf(fieldValue) === -1) {
                                    r_data.headerTypes[r_data.header[x]].push(fieldValue);
                                }
                            }
                        } else {
                            /** Check if value is a number, since only numbers are supported in selected Features */
                            if (!isFinite(fieldValue) && isNaN(fieldValue)) {
                                r_data.na_values++;
                                is_valid = false;
                            }
                        }
                    }
                }
                if (is_valid === false) {
                    r_data.invalid_samples++;
                }
            })
            .on("end", function() {
                r_data.headerTypes = mapHeaderTypes(r_data.headerTypes, selectedOutcome);
                resolve(r_data);
            });
    });
}

/**
 * Remap outcome and Classes
 */
export function mapHeaderTypes(headerTypes, selectedOutcome) {
    const classesMap = [];
    Object.keys(headerTypes).map(function(key, index) {
        const type = !headerTypes[key].some(isNaN);
        classesMap.push({
            name: key,
            unique_length: headerTypes[key].length,
            data_type: type ? "numeric" : "string",
            type: selectedOutcome.indexOf(key) !== -1 ? "outcome" : "class"
        });
    });
    return classesMap;
}

/**
 * Converts CSV String to Array
 */
export function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = strDelimiter || ",";

    // Create a regular expression to parse the CSV values.
    const objPattern = new RegExp(
        // Delimiters.
        "(\\" +
            strDelimiter +
            "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            '(?:"([^"]*(?:""[^"]*)*)"|' +
            // Standard fields.
            '([^"\\' +
            strDelimiter +
            "\\r\\n]*))",
        "gi"
    );
    // Create an array to hold our data. Give the array
    // a default empty first row.
    const arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    let arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while ((arrMatches = objPattern.exec(strData))) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }
        var strMatchedValue;
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
        } else {
            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return arrData;
}
