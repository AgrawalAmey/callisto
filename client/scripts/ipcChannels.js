// Load vendor scripts
const {app, ipcMain} = require('electron');

// Load custom scripts
const assignments = require('./assignments')
const notebook = require('./notebook')
const practice = require('./practice')

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

    ipcMain.on('openNotebook', (event, assignment, notebook) => {
        renderer.renderNotebookIndex(assignment, notebook, undefined);
    });

    ipcMain.on('showAssignment', (event, assignment) => {
        renderer.renderAssignmentIndex(assignment)
    });

    ipcMain.on('submitNotebook', (event, assignment, notebook) => {
        notebook.submitNotebook(assignment, notebook)
    });

    ipcMain.on('practiceNBList', (event) => {
        practice.NBList((list) => {
            ipcMain.send('practiceNBList-reply', list);
        });
    });

    ipcMain.on('showPractice', (event) => {
        renderer.renderPracticeIndex()
    });

    ipcMain.on('showPracticeNB', (event, notebook) => {
        renderer.renderPracticeNBIndex(notebook);
    });
}

module.exports = { setChannels }