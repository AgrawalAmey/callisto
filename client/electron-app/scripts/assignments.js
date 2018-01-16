const { app } = require('electron');
const fs = require('fs')
const path = require('path')
const unzip = require('unzip')

function Assignments() {
    this.isAssignment = (assignmentName) => {
        // Get path to assignment
        var userDataPath = app.getPath('userData');
        var assignmentFilePath = path.join(userDataPath, 'assignments', assignmentName)
        // Check if file is present
        return fs.existsSync(assignmentFilePath)
    }

    this.listNotebooks = (assignmentName) => {
        var userDataPath = app.getPath('userData');
        var assignmentDir = path.join(userDataPath, 'assignments', assignmentName);

        return fs.readdirSync(assignmentDir).filter(file => file.endsWith('.ipynb'));
    }

    this.getNotebooksList = (assignmentName, assignmentURL) => {
        if (this.isAssignment(assignmentName)) {
            console.log(this.listPythonNotebooks(assignmentName));
            return this.listPythonNotebooks(assignmentName)
        } else {
            this.downloadAssignment(assignmentName, assignmentURL, () => {
                console.log("yo")
                console.log(this.listPythonNotebooks(assignmentName));
                return this.listPythonNotebooks(assignmentName)
            });
        }
    }

    this.downloadAssignment = (assignmentName, assignmentURL, callback) => {
        var userDataPath = app.getPath('userData');
        var assignmentDir = path.join(userDataPath, 'assignments', assignmentName);

        var assignmentURL = 'http://localhost:18350/'
        var options = {
            url: assignmentURL,
            encoding: null
        }

        request = sessionHandler.getRequestHandler()

        // request(options)            
        //     .pipe(fs.createWriteStream(assignmentDir + '.zip'))

        request(options)
            .pipe(unzip.Extract({ path: assignmentDir }))
            .on('end', callback)
    }
}

module.exports = new Assignments()