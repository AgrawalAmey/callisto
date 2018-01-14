// Load vendor scripts
const electron = require('electron');

// Load custom scripts
const helpers = require('./helpers.js');

// Module to communicate with UI
const ipc = electron.ipcMain;

module.exports = {
    setEventListerns: function (mainWindow){
        // On submission of server address form
        ipc.on('serverBtn-click', function (event, remoteServerAddr) {
            helpers.renderWebviewIndex(mainWindow, remoteServerAddr);
        });

        //test
        ipc.on('test', function (event) {
            console.log("yooooooooooooooo");
        });
    }
}
