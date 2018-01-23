// Load vender scripts
const request = require('request');
const path = require('path');
const ejse = require('ejs-electron');

// Load custom scripts
const condaInstaller = require('./condaInstaller')
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

        var jupyterAddr = require('../config').jupyterAddr
        var notebookURL = "http://" + jupyterAddr + "/notebooks/" + assignmentName + "/" + notebook;

        // request.get('http://' + jupyterAddr, function(err, response, body) {
        //     if(err) {

        //     } else {
                
        //     }
        // });

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