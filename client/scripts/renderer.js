// Load vender scripts
const { app } = require('electron');
const crypto = require('crypto');
const ejse = require('ejs-electron');
const fs = require('fs');
const path = require('path');
const request = require('request');

// Load custom scripts
const condaInstaller = require('./condaInstaller')
const config = require('../config')
const { exec, execSync } = require('child_process')
const remoteServerAddrHandler = require('./remoteServerAddrHandler')

function Renderer(mainWindow){
    self = this

    this.mainWindow = mainWindow
    
    this.render = () => {
        var remoteServerAddr = remoteServerAddrHandler.getRemoteServerAddr();

        if (condaInstaller.isInstalled()) {
            this.checkRemoteServerAddressAndRender(remoteServerAddr)
        } else {
            this.renderCondaInstaller(undefined)
            condaInstaller.install((err) => {
                if (err) {
                    self.renderCondaInstaller("Installation failed.")
                    return;
                } else {
                    self.checkRemoteServerAddressAndRender(remoteServerAddr)
                }
            })
        }
    }

    this.checkRemoteServerAddressAndRender = (remoteServerAddr) => {

        var remoteServerURL = "http://" + remoteServerAddr + "/login";

        // For the first time case
        if (remoteServerAddr == '') {
            this.renderRemoteServerAddr('', '')
            return;
        }

        request.get(remoteServerURL, function (err, body, res) {
            if (err) {
                console.log(err);
                // Render retry page
                self.renderRemoteServerAddr('Cannot connect to remote server', remoteServerAddr)
                return;
            }
            // Save address
            remoteServerAddrHandler.saveRemoteServerAddr(remoteServerAddr);
            // Render webview
            self.renderWebview(remoteServerURL)
        });
    }

    this.renderRemoteServerAddr = (message, remoteServerAddrPlaceholder) => {
        ejse.data('remoteServerAddrPlaceholder', remoteServerAddrPlaceholder);
        ejse.data('message', message);
        this.mainWindow.loadURL(path.join('file://', __dirname, '../views', 'remoteAddr.ejs'));
    }

    this.renderWebview = (remoteServerURL) => {
        ejse.data('remoteServerAddr', remoteServerURL);
        this.mainWindow.loadURL(path.join('file://', __dirname, '../views', 'webview.ejs'));
    }

    this.renderCondaInstaller = (message) => {
        ejse.data('condaInstallError', message)
        this.mainWindow.loadURL(path.join('file://', __dirname, '../views', 'condaInstaller.ejs'));
    }

    this.renderAssignmentDownloader = (message) => {
        ejse.data('assignmentDownloadError', message)
        this.mainWindow.loadURL(path.join('file://', __dirname, '../views', 'assignmentDownloader.ejs'));
    }

    this.renderNotebookIndex = (assignment, notebook, score, attemptsRemaining, modalError) => {
        var assignmentName = assignment.name.replace(/ /g, "%20")
        notebook = notebook.replace(/ /g, "%20")

<<<<<<< HEAD
        var jupyterAddr = require('../config').jupyterAddr
        var notebookURL = "http://" + jupyterAddr + "/notebooks/" + assignmentName + "/" + notebook;
=======
        var jupyterAddr = config.jupyterAddr
        var notebookURL = "http://" + jupyterAddr + "/notebooks/" + assignment + "/" + notebook;
>>>>>>> e8515ac56c1936defbbff029aa42c526285c7b9e

        tokenFile = path.join(app.getPath('temp'), 'tokenFile.txt');

        fs.readFile(tokenFile, (err, data) => {
            if (err) {
                var token = crypto.randomBytes(20).toString('hex');
                fs.writeFile(tokenFile, token, (err) => {
                    if (err) {
                        throw err;
                    } else {
                        checkAndStartJupyter(token, assignment, notebook, score, attemptsRemaining, modalError, notebookURL)
                    }
                });
            } else {
                var token = data.toString();
                checkAndStartJupyter(token, assignment, notebook, score, attemptsRemaining, modalError, notebookURL)
            }
        });
    }

    checkAndStartJupyter = (token, assignment, notebook, score, attemptsRemaining, modalError, notebookURL) => {
        var jupyterAddr = config.jupyterAddr;
        notebookURL = notebookURL + '?token=' + token;
        var opts = {
            url: 'http://' + jupyterAddr,
            qs: {
                token: token
            }
        }

        let child;

        request(opts, (err, response, body) => {
            if (err) {
                console.log(err);
                var userDataPath = path.join(app.getPath('userData'), 'assignments', 'submitted', 'user')
                var jupyterPort = jupyterAddr.split(":")[1]
                var notebookCmd = path.join(condaInstaller.getInstallationPath(), 'bin', 'jupyter') + " notebook --NotebookApp.token='" + token + "' --notebook-dir='" + userDataPath + "' --no-browser --port=" + jupyterPort;
                console.log(notebookCmd);
                child = exec(notebookCmd);
                wrapper(assignment, notebook, score, attemptsRemaining, modalError, notebookURL, child);
            } else {
                loadNotebookURL(assignment, notebook, score, attemptsRemaining, modalError, notebookURL);
            }
        });
    }

    wrapper = (assignment, notebook, score, attemptsRemaining, modalError, notebookURL, child) => {
        var buffer = '';

        stdoutHandler = (data, cb) => {
            buffer = buffer + data;
            console.log(buffer)
            if(buffer.includes('The Jupyter Notebook is running at')) {
                loadNotebookURL(assignment, notebook, score, attemptsRemaining, modalError, notebookURL);
                buffer = '';
                child.stdout.removeListener('data', stdoutHandler);
            }
        }

        child.stderr.on('data', stdoutHandler);
    }

    loadNotebookURL = (assignment, notebook, score, attemptsRemaining, modalError, notebookURL) => {
        ejse.data('modalError', modalError);
        ejse.data('assignmentName', assignmentName);
        ejse.data('assignment', assignment);
        ejse.data('notebook', notebook);
        ejse.data('score', score);
        ejse.data('attemptsRemaining', attemptsRemaining);
        ejse.data('notebookURL', notebookURL);
        this.mainWindow.loadURL(path.join('file://', __dirname, '../views', 'notebook.ejs'));
    }

    this.renderAssignmentIndex = (assignment) => {
        assignment = assignment.replace(/ /g, "%20")
        var config = require('../config');
        var remoteServerAddr = config.remoteServerAddr;
        var remoteServerURL = "http://" + remoteServerAddr + '/assignment?name=' + assignment;

        this.renderWebview(remoteServerURL);
    }
}

module.exports = Renderer