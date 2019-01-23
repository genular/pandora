import { app, Tray, Menu, BrowserWindow } from "electron";

export default function setTryMenu(mainWindow) {
    const tray = new Tray(__dirname + "/static/icon.png");

    const trayMenuTemplate = [
        {
            label: "Show",
            click: function() {
                mainWindow.show();
            }
        },
        {
            label: "Reload",
            accelerator: "Command+R",
            click: function() {
                BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
            }
        },
        {
            label: "Quit",
            accelerator: "Command+Q",
            click: function() {
                app.isQuiting = true;
                app.quit();
            }
        },
        {
            label: "Toggle DevTools",
            accelerator: "Alt+Command+I",
            click: function() {
                BrowserWindow.getFocusedWindow().toggleDevTools();
            }
        }
    ];

    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

    tray.setToolTip("SIMON");
    tray.setContextMenu(contextMenu);

    return tray;
}
