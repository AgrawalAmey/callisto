const { ipcRenderer } = require('electron')

function TimeSync() {
    // To save creds
    this.timeSync = (date) => {
        // ipcRenderer.send('downloadAssignment', assignmentName, callbackURL)
    }
}

global.assignments = new Assignments()