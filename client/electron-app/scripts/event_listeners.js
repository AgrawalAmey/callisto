// Load vendor scripts
const electron = require('electron');

// Load custom scripts
const helpers = require('./helpers.js');

// Module to communicate with UI
const ipc = electron.ipcMain;

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
    },


}
