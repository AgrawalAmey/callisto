// Load vender scripts
const { app } = require('electron');
const fs = require('fs')
const path = require('path')

// Load custom scripts
const assignments = require('./assignments')
const renderer = require('./renderer')
const sessionHandler = require('./sessionHandler.js')

function Notebook() {
    this.submitNotebook = (assignment, notebook, score, attemptsRemaining) => {
        var assignmentDir = assignments.getPath(assignment)
        var remoteServerAddr = require('../config').remoteServerAddr
        assignment = assignment.replace(/ /g, "%20")
        notebook = notebook.replace(/ /g, "%20")
        request = sessionHandler.getRequestHandler()

        var filePath = path.join(assignmentDir, notebook)

        var options = { 
            method: 'POST',
            url: 'http://' + remoteServerAddr + '/assignment/upload/' + assignment + '/' + notebook,
            headers: {
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' 
            },
            timeout: 10000,
            formData: { 
                submissions: { 
                    value: 'fs.createReadStream("' + filePath + '")',
                    options: { 
                        filename: filePath,
                        contentType: null 
                    } 
                } 
            } 
        };

        request(options, function (error, response, body) {
            if (error) {
                renderer.renderNotebookIndex(assignment, notebook, score, attemptsRemaining, 'Oops! Something went wrong! Please try again')
            } else {
                renderer.renderNotebookIndex(assignment, notebook, body.score, body.attemptsRemaining, undefined)
            }
        });
    }
}

module.exports = new Notebook()