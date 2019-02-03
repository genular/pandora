import path from "path";
import url from "url";
import fs from "fs";

import { app, Menu, ipcMain } from "electron";
import createWindow from "./helpers/window";

// const { default: installExtension, VUEJS_DEVTOOLS} = require('electron-devtools-installer');

import initCrashReporter from "./helpers/crashReporter";
import setTryMenu from "./helpers/tray_menu";

// Special module holding environment variables in config/env_xxx.json file.
import env_vars from "env_vars";

// https://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
// require('events').EventEmitter.prototype._maxListeners = 20;

const isDevelopment = env_vars.name === "development";

let mainWindow = null;
let forceQuit = false;
let tray = null;

initCrashReporter();

// Save userData in separate folders for each environment.
if (env_vars.name === "development") {
    const userDataPath = app.getPath("userData");
    app.setPath("userData", `${userDataPath}_${env_vars.name}`);
}

// Create cache directory if it doesn't exist
const cacheDirectory = path.join(app.getPath("userData"), 'data_cache');
if (!fs.existsSync(cacheDirectory)) {
    fs.mkdirSync(cacheDirectory);
}

app.on("ready", async () => {

   // installExtension(VUEJS_DEVTOOLS)
        // .then((name) => console.log(`Added Extension: ${name}`))
        // .catch((err) => console.log('An error occurred: ', err));

    mainWindow = createWindow("simon-main", {
        title: "SIMON",
        titleBarStyle: "hidden-inset",
        backgroundColor: "#35224A",
        frame: false,
        center: true,
        textAreasAreResizable: false,
        plugins: true,
        icon: __dirname + "/static/icon.png",

        minHeight: 600,
        minWidth: 1000,
        width: 1000,
        height: 600,
        show: false
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true
        })
    );

    // show window once on first load
    mainWindow.webContents.once("did-finish-load", () => {
        mainWindow.show();
    });

    mainWindow.webContents.on("did-finish-load", () => {
        // Handle window logic properly on macOS:
        // 1. App should not terminate if window has been closed
        // 2. Click on icon in dock should re-open the window
        // 3. ⌘+Q should close the window and quit the app
        if (process.platform === "darwin") {
            mainWindow.on("close", function(e) {
                if (!forceQuit) {
                    e.preventDefault();
                    mainWindow.hide();
                }
            });

            app.on("activate", () => {
                mainWindow.show();
            });

            app.on("before-quit", () => {
                forceQuit = true;
            });
        } else {
            mainWindow.on("closed", () => {
                mainWindow = null;
            });
        }
    });

    mainWindow.on("minimize", function(event) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on("close", function(event) {
        if (!app.isQuiting && !isDevelopment) {
            event.preventDefault();
            mainWindow.hide();
        }

        return false;
    });

    tray = setTryMenu(mainWindow);

    if (isDevelopment) {
        // auto-open dev tools
        mainWindow.webContents.openDevTools({ mode: "bottom" });
    }
});
