// Load vendor scripts
const {app, ipcMain} = require('electron');

// Load custom scripts
const assignments = require('./assignments')
const session = require('./session')

const setChannels = (renderer) => {
    // On submission of server address form
    ipcMain.on('serverBtn-click', function (event, remoteServerAddr) {
        renderer.renderIndex(remoteServerAddr);
    });
    
    // Delete user credentials on logout
    ipcMain.on('logout', function () {
        renderer.renderLogout()
    });

    // Save user credentials on login
    ipcMain.on('login', function (event, creds) {
        console.log(2)
        renderer.renderLogin(creds)
    })

    ipcMain.on('getNotebooksList', (event, assignmentName, assignmentURL) => {
        assignments.getNotebooksList(assignmentName, assignmentURL, (notebooksList) => {
            event.sender.send('getNotebooksList-reply', notebooksList)
        })
    })
}

module.exports = { setChannels }