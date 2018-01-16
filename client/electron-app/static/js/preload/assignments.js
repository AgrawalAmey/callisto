const { ipcRenderer } = require('electron')

function Assignments() {
    // To save creds
    this.getNotebooksList = (assignmentName, assignmentURL) => {

        notebooksList = await ipcRenderer.send('getNotebooksList', 
                                                assignmentName, 
                                                assignmentURL)
        
        console.log(notebooksList)

        return notebooksList
    }
}

global.assignments = new Assignments()