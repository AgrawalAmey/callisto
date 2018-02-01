// Load vender scripts
const { app } = require('electron');
const fs = require('fs')
const path = require('path')

// Load custom scripts
const assignments = require('./assignments')
const sessionHandler = require('./sessionHandler')

function NotebookHandler(renderer) {
    this.submitNotebook = (assignment, notebook) => {
        assignment = JSON.parse(assignment)
        notebook = JSON.parse(notebook)
        assignment.name = assignment.name.replace("%20", " ");
        notebook.name = notebook.name.replace("%20", " ");
        var assignmentDir = assignments.getProblemsDir(assignment.name)
        var remoteServerAddr = require('../config').remoteServerAddr
        request = sessionHandler.getRequestHandler()

        var filePath = path.join(assignmentDir, notebook.name)

        var options = { 
            method: 'POST',
            url: 'http://' + remoteServerAddr + '/assignment/upload/' + assignment.name + '/' + notebook.name,
            headers: {
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' 
            },
            timeout: 10000,
            formData: { 
                submissions: { 
                    value: fs.createReadStream(filePath),
                    options: { 
                        filename: filePath,
                        contentType: null 
                    } 
                } 
            } 
        };

        request(options, function (error, response, body) {
            if (error) {
                renderer.renderNotebookIndex(assignment, notebook, 'problems', 'Oops! Something went wrong! Please try again')
            } else {
                if (response.statusCode === 400) {
                    renderer.renderNotebookIndex(assignment, notebook, 'problems', body)
                } else {
                    body = JSON.parse(body)
                    notebook.score = body.score
                    notebook.attemptsRemaining = body.attemptsRemaining
                    notebook.isSubmitted = body.isSubmitted
                    renderer.renderNotebookIndex(assignment, notebook, 'problems', undefined)
                }
            }
        });
    }
}

module.exports = NotebookHandler