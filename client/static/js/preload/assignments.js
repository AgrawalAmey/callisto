const { ipcRenderer } = require('electron')

function Assignments() {
    // To save creds
    this.download = (assignmentName, callbackURL) => {
        ipcRenderer.send('downloadAssignment', assignmentName, callbackURL)
    }

    this.openNotebook = (assignment, notebook) => {
        ipcRenderer.send('openNotebook', JSON.parse(assignment), JSON.parse(notebook));
    }
}

global.assignments = new Assignments()