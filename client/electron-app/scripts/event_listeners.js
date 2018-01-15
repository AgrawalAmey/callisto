// Load vendor scripts
const {app, ipcMain} = require('electron');

// Load custom scripts
const helpers = require('./helpers.js');
const file_utils = require('./file_utils');

module.exports = {
    setEventListeners: (mainWindow) => {
        // On submission of server address form
        ipcMain.on('serverBtn-click', function (event, remoteServerAddr) {
            helpers.renderWebviewIndex(mainWindow, remoteServerAddr);
        });

        //test
        ipcMain.on('test', function (event, data) {
            console.log("Test:");
            console.log(data);
        });

        // Delete user credentials on logout
        ipcMain.on('removeUserCreds', function () {
            file_utils.removeCreds();
        });

        // Delete user credentials on closing all windows of app
        // app.on('window-all-closed', function() {
        //     file_utils.removeCreds();
        // });

        // Delete user credentials on closing main window
        mainWindow.on('closed', function() {
            file_utils.removeCreds();
        });

        // Save user credentials on login
        ipcMain.on('saveUserCreds', function (event, userCreds) {
            file_utils.saveCreds(userCreds.username, userCreds.password);
        });
    }
}
