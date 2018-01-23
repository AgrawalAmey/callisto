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
            self.renderWebviewIndex(remoteServerURL)
        });
    }

    this.renderRemoteServerAddr = (message, remoteServerAddrPlaceholder) => {
        ejse.data('remoteServerAddrPlaceholder', remoteServerAddrPlaceholder);
        ejse.data('message', message);
        this.mainWindow.loadURL(path.join('file://', __dirname, '../views', 'remoteAddr.ejs'));
    }

    this.renderWebviewIndex = (remoteServerURL) => {
        ejse.data('remoteServerAddr', remoteServerURL);
        this.mainWindow.loadURL(path.join('file://', __dirname, '../views', 'webview.ejs'));
    }

    this.renderCondaInstaller = (message) => {
        ejse.data('condaInstallError', message)
        this.mainWindow.loadURL(path.join('file://', __dirname, '../views', 'condaInstaller.ejs'));
    }

    this.renderNotebookIndex = (assignment, notebook, score, attemptsRemaining, modalError) => {
        assignment = assignment.replace(/ /g, "%20")
        notebook = notebook.replace(/ /g, "%20")

        var jupyterAddr = config.jupyterAddr
        var notebookURL = "http://" + jupyterAddr + "/notebooks/" + assignment + "/" + notebook;

        tokenFile = path.join(app.getPath('temp'), config.appName, 'tokenFile.txt');

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
                var token = data;
                checkAndStartJupyter(token, assignment, notebook, score, attemptsRemaining, modalError, notebookURL)
            }
        });
    }

    checkAndStartJupyter = (token, assignment, notebook, score, attemptsRemaining, modalError, notebookURL) => {
        var jupyterAddr = config.jupyterAddr;
        var opts = {
            uri: 'http://' + jupyterAddr,
            qs: {
                token: token
            }
        }

        request.get(opts, (err, response, body) => {
            if (err) {
                var userPath = path.join(app.getPath('userData'), 'assignments');
                var notebookCmd = "jupyter notebook --NotebookApp.token='" + token + "' --notebook-dir='" + userPath + "' --no-browser"
                exec(notebookCmd, (error, stdout, stderr) => {
                    if(error) {
                        throw error;
                    } else {
                        console.log('stdout:', stdout);
                        console.log('stderr:', stderr);
                        loadNotebookURL(assignment, notebook, score, attemptsRemaining, modalError, notebookURL);
                    }
                });
            } else {
                loadNotebookURL(assignment, notebook, score, attemptsRemaining, modalError, notebookURL);
            }
        });
    }

    loadNotebookURL = (assignment, notebook, score, attemptsRemaining, modalError, notebookURL) => {
        ejse.data('modalError', modalError);
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

        this.renderWebviewIndex(remoteServerURL);
    }
}

module.exports = Renderer