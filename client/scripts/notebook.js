// Load vender scripts
const { app } = require('electron');
const fs = require('fs')
const path = require('path')

// Load custom scripts
const assignments = require('./assignments')
const renderer = require('./renderer')
const sessionHandler = require('./sessionHandler.js')

function Notebook() {
    this.submitNotebook = (assignment, notebook) => {
        var assignmentDir = assignments.getPath(assignment)
        var remoteServerAddr = require('../config').remoteServerAddr
        request = sessionHandler.getRequestHandler()

        var filePath = path.join(assignmentDir, notebook)

        var options = { 
            method: 'POST',
            url: 'http://' + remoteServerAddr + '/assignment/upload/' + assignment.name + '/' + notebook.name,
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
                renderer.renderNotebookIndex(assignment, notebook, 'Oops! Something went wrong! Please try again')
            } else {
                renderer.renderNotebookIndex(assignment, notebook, undefined)
            }
        });
    }
}

module.exports = new Notebook()