// Load vendor scripts
const {app, ipcMain} = require('electron');

// Load custom scripts
const assignments = require('./assignments')
const helpers = require('./helpers.js')
const session = require('./session')

const setChannels = (mainWindow) => {
    // On submission of server address form
    ipcMain.on('serverBtn-click', function (event, remoteServerAddr) {
        helpers.renderWebviewIndex(mainWindow, remoteServerAddr);
    });
    
    // Delete user credentials on logout
    ipcMain.on('logout', function () {
        session.logout()
    });

    // Delete user credentials on closing main window
    mainWindow.on('closed', function() {
        session.logout()
    });

    // Save user credentials on login
    ipcMain.on('login', function (event, creds) {
        session.login(creds.username, creds.password)
    });

    ipcMain.on('getNotebooksList', (event, assignmentName, assignmentURL) => {
        assignments.getNotebooksList(assignmentName, assignmentURL, (notebooksList) => {
            event.sender.send('getNotebooksList-reply', notebooksList)
        })
    })
}

module.exports = { setChannels }