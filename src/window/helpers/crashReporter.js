const {
 crashReporter
} = require('electron');

import env_vars from "env_vars";

export default function initCrashReporter (){
    crashReporter.start({
        productName: env_vars.developer.productName,
        companyName: env_vars.developer.companyName,
        submitURL: env_vars.developer.submitURL,
        uploadToServer: env_vars.developer.uploadToServer
    });
}
