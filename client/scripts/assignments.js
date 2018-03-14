// Load vender scripts
const { app } = require('electron');
const fs = require('fs')
const mkdirp = require('mkdirp')
const ncp = require('ncp').ncp;
const path = require('path')
const unzip = require('unzip')

// Load custom scripts
const creds = require('./creds.js')
const sessionHandler = require('./sessionHandler.js')

function Assignments() {
    this.getProblemsDir = (assignmentName) => {
        var userDataPath = app.getPath('userData')
        return path.join(userDataPath, 'assignments', creds.getCreds().username, 'release', assignmentName)
    } 

    this.getSolutionsDir = (assignmentName) => {
        var userDataPath = app.getPath('userData')
        return path.join(userDataPath, 'assignments', creds.getCreds().username, 'source', assignmentName)
    }

    this.getSubmissionDir = (assignmentName) => {
        var userDataPath = app.getPath('userData')
        return path.join(userDataPath, 'assignments', creds.getCreds().username, 'submitted', 'user', assignmentName)
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
                        // mkdirp.sync(submissionsDir)
                        // ncp(problemsDir, submissionsDir, (err) => {
                        //     callback(err)
                        // })
                        callback()
                    })
                    .on('error', (err) => {
                        callback(err)
                    })
            } else {
                var body = ''
                resp.on('data', function (chunk) {
                    body += chunk
                })
                resp.on('end', function () {
                    callback(new Error(body))
                })
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

        var r = request(options)

        r.on('response', (resp) => {
            if (resp.statusCode == 200) {
                r.pipe(unzip.Extract({ path: solutionsDir }))
                    .on('close', () => {
                        callback()
                    })
                    .on('error', (err) => {
                        callback(err)
                    })
            } else {
                if (resp.statusCode === 404 || resp.statusCode === 401) {
                    callback()
                    return
                }
                var body = ''
                resp.on('data', function (chunk) {
                    body += chunk
                })
                resp.on('end', function () {
                    callback(new Error(body))
                })
            }
        })
    }
}

module.exports = new Assignments()