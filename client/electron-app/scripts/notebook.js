// Load vender scripts
const { app } = require('electron');
const fs = require('fs')
const path = require('path')

// Load custom scripts
const assignments = require('./assignments')
const sessionHandler = require('./sessionHandler.js')

function Notebook() {
    this.submitNotebook = (assignment, notebook) => {

    }

    this.downloadAssignment = (assignmentName, assignmentURL, callback) => {
        var assignmentDir = this.getPath(assignmentName)
        var remoteServerAddr = require('../config').remoteServerAddr
        var options = {
            url: 'http://' + remoteServerAddr + assignmentURL,
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

module.exports = new Notebook()