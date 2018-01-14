const { app } = require('electron').remote;
const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

global.isAssignment = (assignmentName, url) => {
    // Get path to assignment
    var userDataPath = app.getPath('userData');
    var assignmentFilePath = path.join(userDataPath, 'assignments', assignmentName)
    // Check if file is present
    if (fs.existsSync(assignmentFilePath)) {
        console.log("Exists")
    } else {
        console.log("no")
    }
}