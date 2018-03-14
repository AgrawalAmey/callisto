// Load vendor scripts
const {app, ipcMain} = require('electron');

// Load custom scripts
const assignments = require('./assignments')
const NotebookHandler = require('./notebookHandler')
const practice = require('./practice')

// Config
const config = require('../config')
const creds = require('./creds')

const setChannels = (renderer, session) => {
    this.notebookHandler = new NotebookHandler(renderer)

    // On submission of server address form
    ipcMain.on('serverBtn-click', function (event, remoteServerAddr) {
        renderer.checkRemoteServerAddressAndRender(remoteServerAddr)
    });
    
    // Delete user credentials on logout
    ipcMain.on('logout', function (event) {
        session.logout()
        event.sender.send('removeCreds')
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

    ipcMain.on('openNotebook', (event, assignment, notebook, type) => {
        renderer.renderNotebookIndex(assignment, notebook, type, undefined);
    });

    ipcMain.on('showAssignment', (event, assignment) => {
        renderer.renderAssignmentIndex(assignment)
    });

    ipcMain.on('submitNotebook', (event, assignment, notebook) => {
        this.notebookHandler.submitNotebook(assignment, notebook)
    });

    ipcMain.on('practiceNBList', (event) => {
        // practice.NBList((list) => {
        //     ipcMain.send('practiceNBList-reply', list);
        // });

        event.sender.send('practiceNBList-reply', creds.getCreds().username)
    });

    ipcMain.on('showPractice', (event) => {
        renderer.renderPracticeIndex()
    });

    ipcMain.on('showPracticeNB', (event, notebook) => {
        renderer.renderPracticeNBIndex(notebook);
    });
}

module.exports = { setChannels }