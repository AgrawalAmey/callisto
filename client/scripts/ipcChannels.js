// Load vendor scripts
const {app, ipcMain} = require('electron');

// Load custom scripts
const assignments = require('./assignments')
const notebook = require('./notebook')

// Config
const config = require('../config')

const setChannels = (renderer, session) => {
    // On submission of server address form
    ipcMain.on('serverBtn-click', function (event, remoteServerAddr) {
        renderer.checkRemoteServerAddressAndRender(remoteServerAddr)
    });
    
    // Delete user credentials on logout
    ipcMain.on('logout', function () {
        session.logout()
    });

    // Save user credentials on login
    ipcMain.on('login', function (event, creds) {
        session.login(creds.username, creds.password)
    });

    ipcMain.on('downloadAssignment', (event, assignmentName, callbackURL) => {
        renderer.renderAssignmentDownloader()
        assignments.downloadAssignment(assignmentName, (err) => {
            if(err){
                console.log(err)
                renderer.renderAssignmentDownloader(err.message)
                return
            }
            renderer.renderWebview('http://' + config.remoteServerAddr + callbackURL)
        })
    });

    ipcMain.on('openNotebook', (event, assignment, notebook, score, attemptsRemaining) => {
        renderer.renderNotebookIndex(assignment, notebook, score, attemptsRemaining, undefined);
    });

    ipcMain.on('showAssignment', (event, assignment) => {
        renderer.renderAssignmentIndex(assignment)
    });

    ipcMain.on('submitNotebook', (event, assignment, notebook, score, attemptsRemaining) => {
        notebook.submitNotebook(assignment, notebook, score, attemptsRemaining)
    });
}

module.exports = { setChannels }