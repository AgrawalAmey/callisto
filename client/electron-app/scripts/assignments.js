// Load vender scripts
const { app } = require('electron');
const fs = require('fs')
const path = require('path')
const unzip = require('unzip')

// Load custom scripts
const sessionHandler = require('./sessionHandler.js')

function Assignments() {
    this.getPath = (assignmentName) => {
        var userDataPath = app.getPath('userData');
        return path.join(userDataPath, 'assignments', assignmentName)
    } 

    this.isAssignment = (assignmentName) => {
        // Check if folder is present
        return fs.existsSync(this.getPath(assignmentName))
    }

    this.listNotebooks = (assignmentName) => {
        var assignmentDir = this.getPath(assignmentName)
        return fs.readdirSync(assignmentDir).filter(file => file.endsWith('.ipynb'));
    }

    this.getNotebooksList = (assignmentName, assignmentURL, callback) => {
        var returnNotebooksList = () => {
            var notebooksList = this.listNotebooks(assignmentName)
            callback(notebooksList)
        }

        if (this.isAssignment(assignmentName)) {
            returnNotebooksList()
        } else {
            this.downloadAssignment(assignmentName, assignmentURL, () => {
                returnNotebooksList()
            });
        }
    }

    this.downloadAssignment = (assignmentName, assignmentURL, callback) => {
        var assignmentDir = this.getPath(assignmentName)
        var remoteServerAddr = require('../config').remoteServerAddr
        var options = {
            url: remoteServerAddr + assignmentURL,
            encoding: null
        }

        request = sessionHandler.getRequestHandler()

        request(options)
            .pipe(unzip.Extract({ path: assignmentDir }))
            .on('close', () => {
                callback()
            })
    }
}

module.exports = new Assignments()