// Load vender scripts
const { app } = require('electron');
const fs = require('fs')
const ncp = require('ncp').ncp;
const path = require('path')
const unzip = require('unzip')

// Load custom scripts
const sessionHandler = require('./sessionHandler.js')

function Assignments() {
    this.getProblemsDir = (assignmentName) => {
        var userDataPath = app.getPath('userData')
        return path.join(userDataPath, 'assignments', 'release', assignmentName)
    } 

    this.getSolutionsDir = (assignmentName) => {
        var userDataPath = app.getPath('userData')
        return path.join(userDataPath, 'assignments', 'source', assignmentName)
    }

    this.getSubmissionDir = (assignmentName) => {
        var userDataPath = app.getPath('userData')
        return path.join(userDataPath, 'assignments', 'submitted', 'user', assignmentName)
    }

    this.isProblems = (assignmentName) => {
        // Check if folder is present
        return fs.existsSync(this.getProblemsDir(assignmentName))
    }

    this.isSolutions = (assignmentName) => {
        // Check if folder is present
        return fs.existsSync(this.getSolutionsDir(assignmentName))
    }

    this.downloadAssignment = (assignmentName, callback) => {
        this.downloadProblems(assignmentName, () => {
            this.downloadSolutions(assignmentName, callback)
        })
    }

    this.downloadProblems = (assignmentName, callback) => {
        if (this.isProblems(assignmentName)) {
            callback()
            return
        }

        var problemsDir = this.getProblemsDir(assignmentName)
        var submissionsDir = this.getSubmissionDir(assignmentName)

        var remoteServerAddr = require('../config').remoteServerAddr

        var options = {
            url: 'http://' + remoteServerAddr + '/assignment/problems/' + assignmentName,
            encoding: null
        }

        request = sessionHandler.getRequestHandler()

        var r = request(options)
        
        r.on('response', (resp) => {
            if (resp.statusCode == 200) {
                r.pipe(unzip.Extract({ path: problemsDir }))
                    .on('close', () => {
                        ncp(problemsDir, submissionsDir, (err) => {
                            callback(err)
                        })
                    })
                    .on('error', (err) => {
                        callback(err)
                    })
            } else {
                console.log(resp.body)
            }
        })
    }

    this.downloadSolutions = (assignmentName, callback) => {
        if (this.isSolutions(assignmentName)) {
            callback()
            return
        }

        var solutionsDir = this.getSolutionsDir(assignmentName)

        var remoteServerAddr = require('../config').remoteServerAddr

        var options = {
            url: 'http://' + remoteServerAddr + '/assignment/solutions/' + assignmentName,
            encoding: null
        }

        request = sessionHandler.getRequestHandler()

        request(options)
            .on('response', (resp) => {
                console.log(resp)
                console.log(resp.statusCode) // 200
            })
            .pipe(unzip.Extract({ path: solutionsDir }))
            .on('close', () => {
                callback()
            })
            .on('error', (err) => {
                callback(err)
            })
    }
}

module.exports = new Assignments()