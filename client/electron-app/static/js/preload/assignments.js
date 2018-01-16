const { ipcRenderer } = require('electron')

function Assignments() {
    // To save creds
    this.getNotebooksList = (assignmentName, assignmentURL) => {

        ipcRenderer.send('getNotebooksList', 
                         assignmentName, 
                         assignmentURL)
        ipcRenderer.on('getNotebooksList-reply', function(event, arg) {
            console.log(arg); // prints "pong"
        });

        // return notebooksList
    }
}

global.assignments = new Assignments()