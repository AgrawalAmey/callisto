const { ipcRenderer } = require('electron')

function Assignments() {
    // To save creds
    this.download = (assignmentName, callbackURL) => {
        ipcRenderer.send('downloadAssignment', assignmentName, callbackURL)
    }

    this.openNotebook = (assignment, notebook, score, attemptsRemaining) => {
        ipcRenderer.send('openNotebook', assignment, notebook, score, attemptsRemaining);
    }
}

global.assignments = new Assignments()