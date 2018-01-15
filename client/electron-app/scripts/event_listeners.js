// Load vendor scripts
const electron = require('electron');

// Load app instance
const app = electron.remote;

// Load custom scripts
const helpers = require('./helpers.js');

// Module to communicate with UI
const ipc = electron.ipcMain;

// Utility functions
const file_utils = require('./file_utils');

module.exports = {
    setEventListerns: (mainWindow) => {
        // On submission of server address form
        ipc.on('serverBtn-click', function (event, remoteServerAddr) {
            helpers.renderWebviewIndex(mainWindow, remoteServerAddr);
        });

        //test
        ipc.on('test', function (event, data) {
            console.log("yooooooooooooooo");
            console.log(data);
        });

        // Delete user credentials on logout
        ipc.on('removeUserCreds', function () {
            file_utils.removeCreds();
        });

        // Delete user credentials on closing all windows of app
        app.on('window-all-closed', function() {
            file_utils.removeCreds();
        });

        // Delete user credentials on closing main window
        mainWindow.on('closed', function() {
            file_utils.removeCreds();
        });

        // Save user credentials on login
        ipc.on('saveUserCreds', function (event, userCreds) {
            file_utils.saveCreds(userCreds.username, userCreds.password);
        });
    }
}
