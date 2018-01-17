const { ipcRenderer } = require('electron')

function Assignments() {
    // To save creds
    this.getNotebooksList = (assignmentName, assignmentURL) => {

        ipcRenderer.send('getNotebooksList', 
                         assignmentName, 
                         assignmentURL)

        ipcRenderer.on('getNotebooksList-reply', (event, arg) => {
            console.log(arg);
        });
    }
}

global.assignments = new Assignments()