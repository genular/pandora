/*
 * @Author: LogIN-
 * @Date:   2019-01-22 10:26:55
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2021-02-04 15:01:13
 */
import request from "@/utils/request";

const baseUrlPath = "/backend";

/**
 * Login user to back-end and create Auth Token in the database
 * @param {string} username - Username of the current user
 * @param {string} password - Password of the current user
 */
export function userLogin(username, password) {
    const data = {
        username,
        password,
    };
    return request({
        url: baseUrlPath + "/user/login",
        method: "POST",
        data,
    });
}
/**
 * @return {[type]}
 */
export function userLogout() {
    return request({
        url: baseUrlPath + "/user/logout",
        method: "POST",
    });
}

export function userRegister(userForm, planForm) {
    const data = {
        user: userForm,
        plan: planForm,
    };
    return request({
        url: baseUrlPath + "/user/register",
        method: "POST",
        data,
    });
}
export function userDetials() {
    return request({
        url: baseUrlPath + "/user/details",
        method: "GET",
    });
}

export function fetchServerLoad() {
    return request({
        url: baseUrlPath + "/system/serverload",
        method: "GET",
    });
}

/**
 * Checks if value is available in specific Database Table, like user-name, email address
 * Returns true or false. TRUE if record is available
 *
 * @param  {[string]} validationTable
 * @param  {[string]} validationField
 * @param  {[string]} validationValue
 * @return {[type]}
 */
export function checkDatabaseAvailability(validationTable, validationField, validationValue) {
    return request({
        url:
            baseUrlPath +
            "/system/validation/database/" +
            encodeURIComponent(window.btoa(validationTable)) +
            "/" +
            encodeURIComponent(window.btoa(validationField)) +
            "/" +
            encodeURIComponent(window.btoa(validationValue)),
        method: "GET",
    });
}
/**
 * Retrieves all plans for specific customer group with all details
 *
 */
export function retrieveAllActivePlans(customerType) {
    return request({
        url: baseUrlPath + "/system/plans/list/" + encodeURIComponent(window.btoa(customerType)),
        method: "GET",
    });
}
/**
 * @return {[type]}
 */
export function fetchServerStats() {
    return request({
        url: baseUrlPath + "/dashboard/stats",
        method: "GET",
    });
}

export function systemConfigure(newBaseURL) {
    return request({
        url: baseUrlPath + "/system/status/bb5dc8842ca31d4603d6aa11448d1654",
        method: "GET",
        baseURL: newBaseURL,
    });
}

export function searchCountry(input) {
    return request({
        url: "https://restcountries.eu/rest/v2/name/" + encodeURIComponent(input) + "?fields=name;alpha2Code",
        method: "GET",
    });
}

export function searchAddressSuggest(input, app_code, app_id) {
    return request({
        url: "http://places.cit.api.here.com/places/v1/suggest?app_code=" + app_code + "&app_id=" + app_id + "&pretty=true&q=" + encodeURIComponent(input),
        method: "GET",
        headers: { "X-Map-Viewport": "13.3704,52.5122,13.4194,52.5262" },
    });
}

export function searchAddressDetails(input, app_code, app_id) {
    return request({
        url:
            "https://geocoder.cit.api.here.com/6.2/geocode.json?searchtext=" +
            encodeURIComponent(input) +
            "&app_id=" +
            app_id +
            "&app_code=" +
            app_code +
            "&gen=9&jsonattributes=1&locationattributes=address&maxresults=1&addressattributes=country,city,postalCode,addressLines&language=en-US",
        method: "GET",
    });
}

/**
 * Returns all user queues and their details
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchQueueList(query) {
    return request({
        url: baseUrlPath + "/queue/list",
        method: "GET",
        params: query,
    });
}

/**
 * Updates queue specific field
 * @param  {[type]} submitData [description]
 * @return {[type]}            [description]
 */
export function updateQueueName(submitData) {
    const data = {
        submitData: encodeURIComponent(window.btoa(JSON.stringify(submitData))),
    };
    return request({
        url: baseUrlPath + "/queue/update",
        method: "POST",
        data,
    });
}

// Exploration => details
export function fetchQueueExplorationDetails(query) {
    return request({
        url: baseUrlPath + "/queue/exploration/list",
        method: "GET",
        params: query,
    });
}

// Dashboard => details
export function fetchQueueResamples(query) {
    return request({
        url: baseUrlPath + "/queue/details",
        method: "GET",
        params: query,
    });
}

export function fetchResampleModels(query) {
    return request({
        url: baseUrlPath + "/queue/resamples/details",
        method: "GET",
        params: query,
    });
}

/**
 * Retrives list of files fot the user uploaded in specific user directory
 * @param  {object} submitData Object containing one string variable: selectedDirectory that corresponds to upload_directory column in users_files table
 * @return {object}            JSON decoded API response object
 */
export function readFilesInUserDirectory(submitData) {
    return request({
        url: baseUrlPath + "/system/filesystem/list/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}

/**
 * Creates new directory in users upload directory
 * @param  {object} submitData Object containing one string variable: selectedDirectory that corresponds to upload_directory column in users_files table
 * @return {object}            JSON decoded API response object
 */
export function createDirectory(submitData) {
    return request({
        url: baseUrlPath + "/system/filesystem/directory-create/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}

/**
 * Moves file from temporary directory to users upload directory
 * @return {object}            JSON decoded API response object
 */
export function uploadTempToWorkspace(local_file_path, new_file_name) {
    const encodedFilePath = encodeURIComponent(window.btoa(local_file_path));
    const encodedFileName = encodeURIComponent(window.btoa(new_file_name));

    
    return request({
        url: `${baseUrlPath}/system/filesystem/local-upload/${encodedFilePath}/${encodedFileName}`,
        method: "GET",
    });
}

/**
 * Deletes file from database and from file system
 * @param  {int} fileID ID of the desired file to be deleted from users_files database table
 * @return {object}            JSON decoded API response object
 */
export function deleteFile(submitData) {
    return request({
        url: baseUrlPath + "/system/filesystem/delete/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}

export function fetchSimonAvailablePackages(selectedFiles) {
    const data = {
        selectedFiles: encodeURIComponent(window.btoa(JSON.stringify(selectedFiles))),
    };
    return request({
        url: baseUrlPath + "/system/pandora/available-packages",
        method: "POST",
        data,
    });
}

export function pandoraHeaderVerify(selectedFiles) {
    return request({
        url: baseUrlPath + "/system/pandora/header/" + encodeURIComponent(window.btoa(JSON.stringify(selectedFiles))) + "/verify",
        method: "GET",
    });
}
export function getSimonHeaderSuggest(selectedFiles, input) {
    return request({
        url: baseUrlPath + "/system/pandora/header/" + encodeURIComponent(window.btoa(JSON.stringify(selectedFiles))) + "/suggest/" + encodeURIComponent(window.btoa(input)),
        method: "GET",
    });
}

/**
 * Suggest features of requested re-sample ID
 * @param  {object} Containing 3 variables
 * resampleID: database ID of the resample, userInput: user inputed string, inputType: features, outcome, classes
 * @return {object}            JSON decoded API response object
 */
export function resamplesFeaturesSuggest(submitData) {
    return request({
        url: baseUrlPath + "/queue/resamples/features/suggest/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}

export function getSimonPreAnalysisDetails(submitData) {
    // URL Encode two times, since sometimes utf8 characters from column names are issue for JS btoa
    const data = {
        submitData: encodeURIComponent(window.btoa(encodeURIComponent(JSON.stringify(submitData)))),
    };

    return request({
        url: baseUrlPath + "/system/pandora/pre-analysis",
        method: "POST",
        data,
    });
}

export function submitDatasetQueueTask(submitData) {
    console.log("submitDatasetQueueTask encoding start:");
    // console.log(submitData);

    const data = {
        submitData: encodeURIComponent(window.btoa(JSON.stringify(submitData))),
    };

    console.log("submitDatasetQueueTask request start:");
    return request({
        url: baseUrlPath + "/system/pandora/dataset-queue",
        method: "POST",
        data,
    });
}

export function cancelDatasetQueueTask(submitData) {
    const data = {
        submitData: encodeURIComponent(window.btoa(JSON.stringify(submitData))),
    };
    return request({
        url: baseUrlPath + "/system/pandora/dataset-queue/cancel",
        method: "POST",
        data,
    });
}

/**
 * Deletes selected Queue from database with all associated data
 * @param  {[type]} submitData [description]
 * @return {[type]}            [description]
 */
export function deleteDatasetQueueTask(submitData) {
    const data = {
        submitData: encodeURIComponent(window.btoa(JSON.stringify(submitData))),
    };
    return request({
        url: baseUrlPath + "/system/pandora/dataset-queue/delete",
        method: "POST",
        data,
    });
}

/**
 * Deletes selected Queue Resample from database
 * @param  {[type]} submitData [description]
 * @return {[type]}            [description]
 */
export function deleteDatasetResampleTask(submitData) {
    return request({
        url: baseUrlPath + "/system/pandora/dataset-resample/delete/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}

/**
 * Generates publicly accessible download link for specific file ID
 * @param  {object} Containing two variables:
 * downloadType: (resample, queue)
 * recordID: main ID of the queue or resample
 * @return {object}            JSON decoded API response object
 */
export function genarateFileDownloadLink(submitData) {
    return request({
        url: baseUrlPath + "/system/filesystem/download/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}

export function getVariableImportance(query) {
    return request({
        url: baseUrlPath + "/queue/exploration/variableImportance",
        method: "GET",
        params: query,
    });
}

export function getPublicDatasets(submitData) {
    return request({
        url: baseUrlPath + "/dataset/import/public/list/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}

export function importPublicDatasets(submitData) {
    return request({
        url: baseUrlPath + "/dataset/import/public/import/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}

/**
 * Generates publicly accessible download link for specific file ID
 * @param  {object} Containing two variables:
 * downloadType: (resample, queue)
 * recordID: main ID of the queue or resample
 * @return {object}            JSON decoded API response object
 */
export function generateSystemLogFileDownloadLink(submitData) {
    return request({
        url: baseUrlPath + "/system/pandora/generate-log-file/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}

/**

*/
export function fetchSelectedFilesDetails(submitData) {
    return request({
        url: baseUrlPath + "/system/filesystem/file-details/" + encodeURIComponent(window.btoa(JSON.stringify(submitData))),
        method: "GET",
    });
}


/**
 * Calls openai API with input text as a parameter
 * @param  {[type]} submitData [description]
 * @return {[type]}            [description]
 */
export function openaiApi(submitData) {
    const data = {
        submitData: encodeURIComponent(window.btoa(JSON.stringify(submitData))),
    };
    return request({
        url: baseUrlPath + "/system/describe_ai",
        method: "POST",
        data,
    });
}

/**
 * Initiates a system update by sending a GET request to the system update endpoint.
 * This function calls the backend API to perform operations such as pulling the latest
 * changes for the project's frontend and backend from their respective git repositories
 * and rebuilding the frontend if necessary.
 * 
 * @returns {Promise} A Promise that resolves to the response of the system update request.
 */
export function systemUpdate() {
    return request({
        url: baseUrlPath + "/system/update",
        method: "GET",
    });
}
