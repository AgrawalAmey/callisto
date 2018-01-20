// Load vender scripts
const request = require('request');
const path = require('path');
const ejse = require('ejs-electron');

// Load custom scripts
const remoteServerAddrHandler = require('./remoteServerAddrHandler.js');

module.exports = {
    renderWebviewIndex: function (mainWindow, remoteServerAddr) {
        var remoteServerURL = "http://" + remoteServerAddr + "/login";
        
        // For the first time case
        if(remoteServerAddr == ''){
            ejse.data('remoteServerAddrPlaceholder', '');
            mainWindow.loadURL(path.join('file://', __dirname, '../views', 'remoteAddr.ejs'));
            return;
        }

        request.get(remoteServerURL, function (err, body, res) {
            if (err) {
                console.log(err);
                // Render retry page
                ejse.data('remoteServerAddrPlaceholder', remoteServerAddr);
                ejse.data('message', 'Cannot connect to remote server');
                mainWindow.loadURL(path.join('file://', __dirname, '../views', 'remoteAddr.ejs'));
                return;
            }
            // Save address
            remoteServerAddrHandler.saveRemoteServerAddr(remoteServerAddr);
            // Render webview
            ejse.data('remoteServerAddr', remoteServerURL);
            mainWindow.loadURL(path.join('file://', __dirname, '../views', 'webview.ejs'));
        });
    },

    renderNotebookIndex: function (mainWindow, assignement, notebook) {
        assignement = assignement.replace(/ /g, "%20");
        notebook = notebook.replace(/ /g, "%20");

        // var notebookURL = "http://localhost:8888/notebooks/" + assignement + "/" + notebook;
        var notebookURL = "http://localhost:8888";

        ejse.data('notebookURL', notebookURL);
        mainWindow.loadURL(path.join('file://', __dirname, '../views', 'notebook.ejs'));
    }
}