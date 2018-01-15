// Load vendor scripts
const electron = require('electron');

// Load app instance
const app = electron.remote;

// Load custom scripts
const helpers = require('./helpers.js');

// Module to communicate with UI
const ipc = electron.ipcMain;

// Utility functions
const utils = require('./utils');

module.exports = {
    setEventListerns: function (mainWindow){
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
            utils.removeCreds();
        });

        // Delete user credentials on closing all windows of app
        app.on('window-all-closed', function() {
            utils.removeCreds();
        });

        // Delete user credentials on closing main window
        mainWindow.on('closed', function() {
            utils.removeCreds();
        });

        // Save user credentials on login
        ipc.on('saveUserCreds', function (event, userCreds) {
            utils.saveCreds(userCreds.username, userCreds.password);
        });
    }
}
