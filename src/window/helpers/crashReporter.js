const {
 crashReporter
} = require('electron');

import env from "env"

export default function initCrashReporter (){
    crashReporter.start({
        productName: env.developer.productName,
        companyName: env.developer.companyName,
        submitURL: env.developer.submitURL,
        uploadToServer: env.developer.uploadToServer
    });
}
